#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

pub trait DisputeEndpoints<M: ManagedTypeApi> {
    #[endpoint(openDispute)]
    fn open_dispute(&self, task_id: u64, reason_uri: ManagedBuffer<M>);

    #[endpoint(resolveDispute)]
    fn resolve_dispute(
        &self,
        task_id: u64,
        resolution: DisputeResolution,
        x402_settlement_ref: OptionalValue<ManagedBuffer>,
    );
}

pub struct DisputeEndpoints<M: ManagedTypeApi> {}

impl<M: ManagedTypeApi> DisputeEndpoints<M> for RouterEscrow<M> {
    fn require_not_paused(&self) {
        let config = config().get();
        require!(!config.paused && !config.emergency_pause, "Contract is paused");
    }

    #[endpoint(openDispute)]
    fn open_dispute(&self, task_id: u64, reason_uri: ManagedBuffer<M>) {
        self.require_not_paused();
        
        let mut task = tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Submitted, "Only submitted tasks can be disputed");
        require!(
            task.creator == caller || task.assigned_agent.as_ref() == Some(&caller),
            "Only creator or agent can open dispute"
        );
        
        task.state = TaskState::Disputed;
        task.dispute_metadata = Some(reason_uri.clone());
        
        tasks(task_id).set(&task);
        dispute_opened_event(self, task_id, &reason_uri);
    }

    #[endpoint(resolveDispute)]
    fn resolve_dispute(
        &self,
        task_id: u64,
        resolution: DisputeResolution,
        x402_settlement_ref: OptionalValue<ManagedBuffer>,
    ) {
        let mut task = tasks(task_id).get();
        let config = config().get();
        
        require!(task.state == TaskState::Disputed, "Task is not disputed");
        
        // Check if caller is resolver
        if let Some(resolver) = &config.resolver {
            require!(
                self.blockchain().get_caller() == resolver,
                "Only resolver can call this"
            );
        }
        
        match resolution {
            DisputeResolution::FullRefund => {
                // Refund full payment to creator
                self.send().direct(
                    &task.creator,
                    &task.payment_token,
                    task.payment_nonce,
                    &task.payment_amount,
                );
            }
            DisputeResolution::PartialRefund { agent_award_bps } => {
                require!(agent_award_bps <= 10000, "Invalid award percentage");
                
                let protocol_fee = &task.payment_amount * BigUint::from(config.fee_bps) / BigUint::from(10000u64);
                let agent_award = &task.payment_amount * BigUint::from(agent_award_bps) / BigUint::from(10000u64);
                let creator_refund = &task.payment_amount - &protocol_fee - &agent_award;
                
                // Transfer protocol fee to treasury
                self.send().direct(
                    &config.treasury,
                    &task.payment_token,
                    task.payment_nonce,
                    &protocol_fee,
                );
                
                // Transfer award to agent
                if let Some(agent) = &task.assigned_agent {
                    self.send().direct(
                        agent,
                        &task.payment_token,
                        task.payment_nonce,
                        &agent_award,
                    );
                }
                
                // Transfer refund to creator
                self.send().direct(
                    &task.creator,
                    &task.payment_token,
                    task.payment_nonce,
                    &creator_refund,
                );
            }
            DisputeResolution::FullPayment => {
                let protocol_fee = &task.payment_amount * BigUint::from(config.fee_bps) / BigUint::from(10000u64);
                let agent_payment = &task.payment_amount - &protocol_fee;
                
                // Transfer protocol fee to treasury
                self.send().direct(
                    &config.treasury,
                    &task.payment_token,
                    task.payment_nonce,
                    &protocol_fee,
                );
                
                // Transfer full payment to agent
                if let Some(agent) = &task.assigned_agent {
                    self.send().direct(
                        agent,
                        &task.payment_token,
                        task.payment_nonce,
                        &agent_payment,
                    );
                }
            }
        }
        
        task.state = TaskState::Resolved;
        if let Some(ref_) = x402_settlement_ref.into_option() {
            task.x402_settlement_ref = Some(ref_);
        }
        
        tasks(task_id).set(&task);
        dispute_resolved_event(self, task_id, &resolution);
    }
}
