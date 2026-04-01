#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

pub trait TaskEndpoints<M: ManagedTypeApi> {
    #[endpoint(createTask)]
    #[payable("*")]
    fn create_task(
        &self,
        #[payment_amount] payment_amount: BigUint<M>,
        #[payment_token] payment_token: EgldOrEsdtTokenIdentifier<M>,
        #[payment_nonce] payment_nonce: u64,
        metadata_uri: ManagedBuffer<M>,
        deadline: OptionalValue<u64>,
        review_timeout: OptionalValue<u64>,
        ap2_mandate_hash: OptionalValue<ManagedBuffer<M>>,
        priority_fee: OptionalValue<BigUint<M>>,
    ) -> u64;

    #[endpoint(acceptTask)]
    fn accept_task(&self, task_id: u64);

    #[endpoint(submitResult)]
    fn submit_result(&self, task_id: u64, result_uri: ManagedBuffer<M>);

    #[endpoint(approveTask)]
    fn approve_task(&self, task_id: u64);

    #[endpoint(cancelTask)]
    fn cancel_task(&self, task_id: u64);

    #[endpoint(openDispute)]
    fn open_dispute(&self, task_id: u64, reason_uri: ManagedBuffer<M>);

    #[endpoint(resolveDispute)]
    fn resolve_dispute(
        &self,
        task_id: u64,
        resolution: DisputeResolution,
        x402_settlement_ref: OptionalValue<ManagedBuffer>,
    );

    #[endpoint(refundExpiredTask)]
    fn refund_expired_task(&self, task_id: u64);

    #[endpoint(claimApproval)]
    fn claim_approval(&self, task_id: u64);

    #[endpoint(batchTaskOperations)]
    fn batch_task_operations(&self, operations: ManagedVec<BatchTaskOperation<M>>);
}

pub struct TaskEndpoints<M: ManagedTypeApi> {}

impl<M: ManagedTypeApi> TaskEndpoints<M> for RouterEscrow<M> {
    fn require_not_paused(&self) {
        let config = config().get();
        require!(!config.paused && !config.emergency_pause, "Contract is paused");
    }

    #[payable("*")]
    #[endpoint(createTask)]
    fn create_task(
        &self,
        #[payment_amount] payment_amount: BigUint<M>,
        #[payment_token] payment_token: EgldOrEsdtTokenIdentifier<M>,
        #[payment_nonce] payment_nonce: u64,
        metadata_uri: ManagedBuffer<M>,
        deadline: OptionalValue<u64>,
        review_timeout: OptionalValue<u64>,
        ap2_mandate_hash: OptionalValue<ManagedBuffer<M>>,
        priority_fee: OptionalValue<BigUint<M>>,
    ) -> u64 {
        self.require_not_paused();
        
        require!(payment_amount > 0, "Payment must be greater than 0");
        
        // Check if token is whitelisted
        let whitelist = token_whitelist();
        let is_whitelisted = whitelist.iter().any(|entry| {
            entry.token_identifier == payment_token && entry.is_enabled
        });
        require!(is_whitelisted, "Token is not whitelisted");
        
        let task_id = task_counter().get();
        task_counter().set(&(task_id + 1));
        
        let config = config().get();
        let caller = self.blockchain().get_caller();
        
        // Check if caller is an agent with reputation
        let agent_reputation = agent_reputation(&caller).get();
        let reputation_snapshot = if agent_reputation.address == ManagedAddress::zero() {
            None
        } else {
            Some(agent_reputation.reputation_score)
        };
        
        let task = Task {
            task_id,
            creator: caller,
            assigned_agent: None,
            payment_token: payment_token.clone(),
            payment_amount: payment_amount.clone(),
            payment_nonce,
            protocol_fee_bps: config.fee_bps,
            created_at: self.blockchain().get_block_timestamp(),
            accepted_at: None,
            deadline: deadline.into_option(),
            review_timeout: review_timeout.into_option(),
            metadata_uri,
            result_uri: None,
            state: TaskState::Open,
            dispute_metadata: None,
            ap2_mandate_hash: ap2_mandate_hash.into_option(),
            x402_settlement_ref: None,
            agent_reputation_snapshot: reputation_snapshot,
            priority_fee: priority_fee.into_option(),
            gas_used: None,
            completion_time: None,
        };
        
        tasks(task_id).set(&task);
        task_created_event(self, task_id, &task.creator, &task.payment_amount, &task.payment_token, &task.metadata_uri);
        
        task_id
    }

    #[endpoint(acceptTask)]
    fn accept_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        let config = config().get();
        
        require!(task.state == TaskState::Open, "Task is not open");
        require!(task.creator != caller, "Creator cannot accept own task");
        require!(task.assigned_agent.is_none(), "Task already assigned");
        
        // Check deadline if set
        if let Some(deadline) = task.deadline {
            require!(
                self.blockchain().get_block_timestamp() < deadline,
                "Task deadline has passed"
            );
        }
        
        // Check agent reputation
        let agent_reputation = agent_reputation(&caller).get();
        if agent_reputation.address == ManagedAddress::zero() {
            // Initialize new agent reputation
            let new_reputation = AgentReputation {
                address: caller.clone(),
                total_tasks: 0,
                completed_tasks: 0,
                cancelled_tasks: 0,
                disputed_tasks: 0,
                total_earned: BigUint::zero(),
                reputation_score: 500,
                average_rating: 500,
                last_active: self.blockchain().get_block_timestamp(),
                created_at: self.blockchain().get_block_timestamp(),
                specialization: ManagedVec::new(),
                verification_status: VerificationStatus::Unverified,
                performance_metrics: PerformanceMetrics {
                    average_completion_time: 0,
                    success_rate: 10000,
                    dispute_rate: 0,
                    total_earned_last_30d: BigUint::zero(),
                    tasks_completed_last_30d: 0,
                },
            };
            agent_reputation(&caller).set(&new_reputation);
        } else {
            require!(
                agent_reputation.reputation_score >= config.min_reputation,
                "Agent reputation below minimum threshold"
            );
            
            // Check max concurrent tasks
            let current_active = agent_active_tasks(&caller).get();
            require!(
                current_active < config.max_concurrent_tasks,
                "Agent has reached maximum concurrent tasks"
            );
        }
        
        task.assigned_agent = Some(caller.clone());
        task.accepted_at = Some(self.blockchain().get_block_timestamp());
        task.state = TaskState::Accepted;
        
        tasks(task_id).set(&task);
        task_accepted_event(self, task_id, &caller);
    }

    #[endpoint(submitResult)]
    fn submit_result(&self, task_id: u64, result_uri: ManagedBuffer<M>) {
        self.require_not_paused();
        
        let mut task = tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Accepted, "Task is not accepted");
        require!(
            task.assigned_agent.as_ref() == Some(&caller),
            "Only assigned agent can submit result"
        );
        
        // Check deadline if set
        if let Some(deadline) = task.deadline {
            require!(
                self.blockchain().get_block_timestamp() < deadline,
                "Task deadline has passed"
            );
        }
        
        task.result_uri = Some(result_uri.clone());
        task.state = TaskState::Submitted;
        
        tasks(task_id).set(&task);
        result_submitted_event(self, task_id, &result_uri);
    }

    #[endpoint(approveTask)]
    fn approve_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Submitted, "Task is not submitted");
        require!(task.creator == caller, "Only creator can approve task");
        
        let config = config().get();
        let protocol_fee = &task.payment_amount * BigUint::from(config.fee_bps) / BigUint::from(10000u64);
        let agent_payment = &task.payment_amount - &protocol_fee;
        
        // Transfer protocol fee to treasury
        self.send().direct(
            &config.treasury,
            &task.payment_token,
            task.payment_nonce,
            &protocol_fee,
            "Protocol fee"
        );
        
        // Transfer payment to agent with correct token
        if let Some(agent) = &task.assigned_agent {
            self.send().direct(
                agent,
                &task.payment_token,
                task.payment_nonce,
                &agent_payment,
                "Task payment"
            );
        }
        
        task.state = TaskState::Approved;
        tasks(task_id).set(&task);
        
        // Transfer payment to agent
        if let Some(agent) = &task.assigned_agent {
            self.send().direct(
                agent,
                &task.payment_token,
                task.payment_nonce,
                &agent_payment,
            );
            
            // Update agent reputation
            let mut reputation = agent_reputation(agent).get();
            reputation.completed_tasks += 1;
            reputation.total_tasks += 1;
            reputation.total_earned += &agent_payment;
            reputation.last_active = self.blockchain().get_block_timestamp();
            agent_reputation(agent).set(&reputation);
            
            // Decrement active tasks
            let current_active = agent_active_tasks(agent).get();
            agent_active_tasks(agent).set(current_active - 1);
        }
        
        task_approved_event(self, task_id, &protocol_fee, &agent_payment);
    }

    #[endpoint(cancelTask)]
    fn cancel_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Open, "Only open tasks can be cancelled");
        require!(task.creator == caller, "Only creator can cancel task");
        
        // Refund full payment to creator with correct token
        self.send().direct(
            &task.creator,
            &task.payment_token,
            task.payment_nonce,
            &task.payment_amount,
            "Task cancelled - refund"
        );
        
        task.state = TaskState::Cancelled;
        tasks(task_id).set(&task);
        task_cancelled_event(self, task_id);
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

    #[endpoint(refundExpiredTask)]
    fn refund_expired_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = tasks(task_id).get();
        
        require!(task.state == TaskState::Accepted, "Only accepted tasks can be refunded");
        require!(
            task.deadline.is_some(),
            "Task has no deadline set"
        );
        
        let deadline = task.deadline.unwrap();
        require!(
            self.blockchain().get_block_timestamp() > deadline,
            "Task deadline has not passed"
        );
        
        // Refund full payment to creator
        self.send().direct(
            &task.creator,
            &task.payment_token,
            task.payment_nonce,
            &task.payment_amount,
        );
        
        task.state = TaskState::Refunded;
        tasks(task_id).set(&task);
        task_refunded_event(self, task_id);
    }

    #[endpoint(claimApproval)]
    fn claim_approval(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = tasks(task_id).get();
        
        require!(task.state == TaskState::Submitted, "Task not submitted");
        let review_timeout = task.review_timeout.unwrap_or(86400);
        let submitted_at = task.accepted_at.unwrap_or(task.created_at);
        require!(
            self.blockchain().get_block_timestamp() > submitted_at + review_timeout,
            "Review timeout not reached"
        );
        
        // Auto-approve the task
        self.approve_task(task_id);
    }

    #[endpoint(batchTaskOperations)]
    fn batch_task_operations(&self, operations: ManagedVec<BatchTaskOperation<M>>) {
        self.require_not_paused();
        
        let gas_before = self.blockchain().get_gas_left();
        
        for operation in operations {
            match operation.operation_type {
                BatchOperationType::BatchCancel => {
                    for &task_id in &operation.task_ids {
                        let mut task = tasks(task_id).get();
                        
                        if task.state == TaskState::Open || task.state == TaskState::Accepted {
                            // Refund payment to creator
                            self.send().direct(
                                &task.creator,
                                &task.payment_token,
                                task.payment_nonce,
                                &task.payment_amount,
                            );
                            task.state = TaskState::Cancelled;
                            tasks(task_id).set(&task);
                            task_cancelled_event(self, task_id);
                        }
                    }
                }
                BatchOperationType::BatchApprove => {
                    for &task_id in &operation.task_ids {
                        let mut task = tasks(task_id).get();
                        
                        if task.state == TaskState::Submitted {
                            require!(task.assigned_agent.is_some(), "Task has no assigned agent");
                            
                            let agent_address = task.assigned_agent.unwrap();
                            let config = config().get();
                            let protocol_fee = &task.payment_amount * BigUint::from(config.fee_bps) / BigUint::from(10000u64);
                            let agent_payment = &task.payment_amount - &protocol_fee;
                            
                            // Transfer protocol fee to treasury
                            self.send().direct(
                                &config.treasury,
                                &task.payment_token,
                                task.payment_nonce,
                                &protocol_fee,
                            );
                            
                            // Transfer payment to agent
                            self.send().direct(
                                &agent_address,
                                &task.payment_token,
                                task.payment_nonce,
                                &agent_payment,
                            );
                            
                            task.state = TaskState::Approved;
                            tasks(task_id).set(&task);
                            task_approved_event(self, task_id, &protocol_fee, &agent_payment);
                        }
                    }
                }
                BatchOperationType::BatchRefund => {
                    for &task_id in &operation.task_ids {
                        let mut task = tasks(task_id).get();
                        
                        if task.state == TaskState::Accepted || task.state == TaskState::Submitted {
                            // Refund payment to creator
                            self.send().direct(
                                &task.creator,
                                &task.payment_token,
                                task.payment_nonce,
                                &task.payment_amount,
                            );
                            task.state = TaskState::Refunded;
                            tasks(task_id).set(&task);
                            task_refunded_event(self, task_id);
                        }
                    }
                }
            }
        }
        
        // Track gas usage for optimization
        let gas_used = gas_before - self.blockchain().get_gas_left();
        
        // Emit batch operation summary
        // Note: In a real implementation, this would depend on framework capabilities
    }
}
