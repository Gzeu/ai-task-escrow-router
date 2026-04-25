#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

pub trait TaskEndpoints<M: ManagedTypeApi> {
    fn require_not_paused(&self);

    #[endpoint(createTask)]
    #[payable("*")]
    fn create_task(
        &self,
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
        x402_settlement_ref: OptionalValue<ManagedBuffer<M>>,
    );

    #[endpoint(refundExpiredTask)]
    fn refund_expired_task(&self, task_id: u64);

    #[endpoint(claimApproval)]
    fn claim_approval(&self, task_id: u64);

    #[endpoint(batchTaskOperations)]
    fn batch_task_operations(&self, operations: ManagedVec<M, BatchTaskOperation<M>>);
}

impl<M: ManagedTypeApi> TaskEndpoints<M> for RouterEscrow<M> {
    fn require_not_paused(&self) {
        let config = config::<M>().get();
        require!(!config.paused && !config.emergency_pause, "Contract is paused");
    }

    #[payable("*")]
    #[endpoint(createTask)]
    fn create_task(
        &self,
        metadata_uri: ManagedBuffer<M>,
        deadline: OptionalValue<u64>,
        review_timeout: OptionalValue<u64>,
        ap2_mandate_hash: OptionalValue<ManagedBuffer<M>>,
        priority_fee: OptionalValue<BigUint<M>>,
    ) -> u64 {
        self.require_not_paused();

        let payment = self.call_value().egld_or_single_esdt();
        let payment_amount = payment.amount.clone();
        let payment_token = payment.token_identifier.clone();
        let payment_nonce = payment.token_nonce;

        require!(payment_amount > 0u64, "Payment must be greater than 0");

        let task_id = task_counter::<M>().get();
        task_counter::<M>().set(&(task_id + 1));

        let config = config::<M>().get();
        let caller = self.blockchain().get_caller();

        let rep = agent_reputation::<M>(&caller).get();
        let reputation_snapshot = if rep.address == ManagedAddress::zero() {
            None
        } else {
            Some(rep.reputation_score)
        };

        let task = Task {
            task_id,
            creator: caller.clone(),
            assigned_agent: None,
            payment_token: payment_token.clone(),
            payment_amount: payment_amount.clone(),
            payment_nonce,
            protocol_fee_bps: config.fee_bps,
            created_at: self.blockchain().get_block_timestamp(),
            accepted_at: None,
            submitted_at: None,
            deadline: deadline.into_option(),
            review_timeout: review_timeout.into_option(),
            metadata_uri: metadata_uri.clone(),
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

        tasks::<M>(task_id).set(&task);

        let total = total_tasks_created::<M>().get();
        total_tasks_created::<M>().set(&(total + 1));

        task_created_event(
            self,
            task_id,
            &caller,
            &payment_amount,
            &payment_token,
            &metadata_uri,
        );

        task_id
    }

    #[endpoint(acceptTask)]
    fn accept_task(&self, task_id: u64) {
        self.require_not_paused();

        let mut task = tasks::<M>(task_id).get();
        let caller = self.blockchain().get_caller();
        let config = config::<M>().get();

        require!(task.state == TaskState::Open, "Task is not open");
        require!(task.creator != caller, "Creator cannot accept own task");
        require!(task.assigned_agent.is_none(), "Task already assigned");

        if let Some(deadline) = task.deadline {
            require!(
                self.blockchain().get_block_timestamp() < deadline,
                "Task deadline has passed"
            );
        }

        let rep = agent_reputation::<M>(&caller).get();
        if rep.address == ManagedAddress::zero() {
            // First time agent — initialize with neutral score
            let new_rep = AgentReputation {
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
            agent_reputation::<M>(&caller).set(&new_rep);
        } else {
            require!(
                rep.reputation_score >= config.min_reputation,
                "Agent reputation below minimum threshold"
            );

            let current_active = agent_active_tasks::<M>(&caller).get();
            require!(
                current_active < config.max_concurrent_tasks,
                "Agent has reached maximum concurrent tasks"
            );
        }

        // Increment active task counter
        let active = agent_active_tasks::<M>(&caller).get();
        agent_active_tasks::<M>(&caller).set(&(active + 1));

        task.assigned_agent = Some(caller.clone());
        task.accepted_at = Some(self.blockchain().get_block_timestamp());
        task.state = TaskState::Accepted;

        tasks::<M>(task_id).set(&task);
        task_accepted_event(self, task_id, &caller);
    }

    #[endpoint(submitResult)]
    fn submit_result(&self, task_id: u64, result_uri: ManagedBuffer<M>) {
        self.require_not_paused();

        let mut task = tasks::<M>(task_id).get();
        let caller = self.blockchain().get_caller();

        require!(task.state == TaskState::Accepted, "Task is not accepted");
        require!(
            task.assigned_agent.as_ref() == Some(&caller),
            "Only assigned agent can submit result"
        );

        if let Some(deadline) = task.deadline {
            require!(
                self.blockchain().get_block_timestamp() < deadline,
                "Task deadline has passed"
            );
        }

        task.result_uri = Some(result_uri.clone());
        task.submitted_at = Some(self.blockchain().get_block_timestamp());
        task.state = TaskState::Submitted;

        tasks::<M>(task_id).set(&task);
        result_submitted_event(self, task_id, &result_uri);
    }

    #[endpoint(approveTask)]
    fn approve_task(&self, task_id: u64) {
        self.require_not_paused();

        let mut task = tasks::<M>(task_id).get();
        let caller = self.blockchain().get_caller();

        require!(task.state == TaskState::Submitted, "Task is not submitted");
        require!(task.creator == caller, "Only creator can approve task");

        self.do_release_payment(task_id);

        task = tasks::<M>(task_id).get();
        task.state = TaskState::Approved;
        task.completion_time = Some(self.blockchain().get_block_timestamp());
        tasks::<M>(task_id).set(&task);

        let total = total_tasks_completed::<M>().get();
        total_tasks_completed::<M>().set(&(total + 1));
    }

    #[endpoint(cancelTask)]
    fn cancel_task(&self, task_id: u64) {
        self.require_not_paused();

        let mut task = tasks::<M>(task_id).get();
        let caller = self.blockchain().get_caller();

        require!(task.state == TaskState::Open, "Only open tasks can be cancelled");
        require!(task.creator == caller, "Only creator can cancel task");

        self.send().direct(
            &task.creator,
            &task.payment_token,
            task.payment_nonce,
            &task.payment_amount,
        );

        task.state = TaskState::Cancelled;
        tasks::<M>(task_id).set(&task);
        task_cancelled_event(self, task_id);
    }

    #[endpoint(openDispute)]
    fn open_dispute(&self, task_id: u64, reason_uri: ManagedBuffer<M>) {
        self.require_not_paused();

        let mut task = tasks::<M>(task_id).get();
        let caller = self.blockchain().get_caller();

        require!(
            task.state == TaskState::Submitted,
            "Only submitted tasks can be disputed"
        );
        require!(
            task.creator == caller || task.assigned_agent.as_ref() == Some(&caller),
            "Only creator or agent can open dispute"
        );

        task.state = TaskState::Disputed;
        task.dispute_metadata = Some(reason_uri.clone());
        tasks::<M>(task_id).set(&task);

        let total = total_tasks_disputed::<M>().get();
        total_tasks_disputed::<M>().set(&(total + 1));

        dispute_opened_event(self, task_id, &reason_uri);
    }

    #[endpoint(resolveDispute)]
    fn resolve_dispute(
        &self,
        task_id: u64,
        resolution: DisputeResolution,
        x402_settlement_ref: OptionalValue<ManagedBuffer<M>>,
    ) {
        let mut task = tasks::<M>(task_id).get();
        let config = config::<M>().get();
        let caller = self.blockchain().get_caller();

        require!(task.state == TaskState::Disputed, "Task is not disputed");

        // Resolver takes priority; falls back to owner if none configured
        let authorized = match &config.resolver {
            Some(resolver) => caller == *resolver,
            None => caller == config.owner,
        };
        require!(authorized, "Only resolver or owner can resolve dispute");

        let protocol_fee =
            &task.payment_amount * BigUint::from(config.fee_bps as u64) / BigUint::from(10000u64);

        match resolution {
            DisputeResolution::FullRefund => {
                self.send().direct(
                    &task.creator,
                    &task.payment_token,
                    task.payment_nonce,
                    &task.payment_amount,
                );
            }
            DisputeResolution::PartialRefund { agent_award_bps } => {
                require!(agent_award_bps <= 10000, "Invalid award percentage");

                let agent_award = &task.payment_amount
                    * BigUint::from(agent_award_bps as u64)
                    / BigUint::from(10000u64);
                // Protocol fee comes out of creator's portion
                let creator_refund = &task.payment_amount - &protocol_fee - &agent_award;

                self.send().direct(
                    &config.treasury,
                    &task.payment_token,
                    task.payment_nonce,
                    &protocol_fee,
                );

                if let Some(agent) = &task.assigned_agent {
                    self.send().direct(
                        agent,
                        &task.payment_token,
                        task.payment_nonce,
                        &agent_award,
                    );

                    let mut rep = agent_reputation::<M>(agent).get();
                    rep.disputed_tasks += 1;
                    rep.last_active = self.blockchain().get_block_timestamp();
                    agent_reputation::<M>(agent).set(&rep);

                    // Decrement active tasks
                    let active = agent_active_tasks::<M>(agent).get();
                    if active > 0 {
                        agent_active_tasks::<M>(agent).set(&(active - 1));
                    }
                }

                self.send().direct(
                    &task.creator,
                    &task.payment_token,
                    task.payment_nonce,
                    &creator_refund,
                );
            }
            DisputeResolution::FullPayment => {
                let agent_payment = &task.payment_amount - &protocol_fee;

                self.send().direct(
                    &config.treasury,
                    &task.payment_token,
                    task.payment_nonce,
                    &protocol_fee,
                );

                if let Some(agent) = &task.assigned_agent {
                    self.send().direct(
                        agent,
                        &task.payment_token,
                        task.payment_nonce,
                        &agent_payment,
                    );

                    let mut rep = agent_reputation::<M>(agent).get();
                    rep.completed_tasks += 1;
                    rep.total_tasks += 1;
                    rep.total_earned += &agent_payment;
                    rep.last_active = self.blockchain().get_block_timestamp();
                    agent_reputation::<M>(agent).set(&rep);

                    let active = agent_active_tasks::<M>(agent).get();
                    if active > 0 {
                        agent_active_tasks::<M>(agent).set(&(active - 1));
                    }
                }
            }
        }

        task.state = TaskState::Resolved;
        if let Some(ref_) = x402_settlement_ref.into_option() {
            task.x402_settlement_ref = Some(ref_);
        }
        dispute_resolved::<M>(task_id).set(&true);
        tasks::<M>(task_id).set(&task);
        dispute_resolved_event(self, task_id, &resolution);
    }

    #[endpoint(refundExpiredTask)]
    fn refund_expired_task(&self, task_id: u64) {
        self.require_not_paused();

        let mut task = tasks::<M>(task_id).get();

        // Allow refund for both Open (no one accepted) and Accepted (agent abandoned)
        require!(
            task.state == TaskState::Open || task.state == TaskState::Accepted,
            "Task cannot be refunded in current state"
        );
        require!(task.deadline.is_some(), "Task has no deadline set");

        let deadline = task.deadline.unwrap();
        require!(
            self.blockchain().get_block_timestamp() > deadline,
            "Task deadline has not passed"
        );

        // Decrement agent active tasks if there was an assigned agent
        if let Some(ref agent) = task.assigned_agent {
            let active = agent_active_tasks::<M>(agent).get();
            if active > 0 {
                agent_active_tasks::<M>(agent).set(&(active - 1));
            }
            // Penalize agent for abandonment
            let mut rep = agent_reputation::<M>(agent).get();
            rep.cancelled_tasks += 1;
            rep.last_active = self.blockchain().get_block_timestamp();
            agent_reputation::<M>(agent).set(&rep);
        }

        self.send().direct(
            &task.creator,
            &task.payment_token,
            task.payment_nonce,
            &task.payment_amount,
        );

        task.state = TaskState::Refunded;
        tasks::<M>(task_id).set(&task);
        task_refunded_event(self, task_id);
    }

    #[endpoint(claimApproval)]
    fn claim_approval(&self, task_id: u64) {
        self.require_not_paused();

        let task = tasks::<M>(task_id).get();

        require!(task.state == TaskState::Submitted, "Task not submitted");

        // Use submitted_at for accurate review window; fall back to accepted_at
        let review_start = task
            .submitted_at
            .or(task.accepted_at)
            .unwrap_or(task.created_at);
        let review_window = task.review_timeout.unwrap_or(86400u64); // 24h default

        require!(
            self.blockchain().get_block_timestamp() > review_start + review_window,
            "Review timeout not reached"
        );

        self.do_release_payment(task_id);

        let mut task = tasks::<M>(task_id).get();
        task.state = TaskState::Approved;
        task.completion_time = Some(self.blockchain().get_block_timestamp());
        tasks::<M>(task_id).set(&task);

        let total = total_tasks_completed::<M>().get();
        total_tasks_completed::<M>().set(&(total + 1));
    }

    #[endpoint(batchTaskOperations)]
    fn batch_task_operations(&self, operations: ManagedVec<M, BatchTaskOperation<M>>) {
        self.require_not_paused();

        let config = config::<M>().get();
        // Only owner can run batch ops (prevents abuse)
        require!(
            self.blockchain().get_caller() == config.owner,
            "Only owner can run batch operations"
        );

        for operation in &operations {
            match operation.operation_type {
                BatchOperationType::BatchCancel => {
                    for task_id in &operation.task_ids {
                        let mut task = tasks::<M>(task_id).get();
                        if task.state == TaskState::Open || task.state == TaskState::Accepted {
                            if let Some(ref agent) = task.assigned_agent {
                                let active = agent_active_tasks::<M>(agent).get();
                                if active > 0 {
                                    agent_active_tasks::<M>(agent).set(&(active - 1));
                                }
                            }
                            self.send().direct(
                                &task.creator,
                                &task.payment_token,
                                task.payment_nonce,
                                &task.payment_amount,
                            );
                            task.state = TaskState::Cancelled;
                            tasks::<M>(task_id).set(&task);
                            task_cancelled_event(self, task_id);
                        }
                    }
                }
                BatchOperationType::BatchApprove => {
                    for task_id in &operation.task_ids {
                        let task = tasks::<M>(task_id).get();
                        if task.state == TaskState::Submitted {
                            self.do_release_payment(task_id);
                            let mut task = tasks::<M>(task_id).get();
                            task.state = TaskState::Approved;
                            task.completion_time =
                                Some(self.blockchain().get_block_timestamp());
                            tasks::<M>(task_id).set(&task);
                            let total = total_tasks_completed::<M>().get();
                            total_tasks_completed::<M>().set(&(total + 1));
                        }
                    }
                }
                BatchOperationType::BatchRefund => {
                    for task_id in &operation.task_ids {
                        let mut task = tasks::<M>(task_id).get();
                        if task.state == TaskState::Accepted
                            || task.state == TaskState::Submitted
                        {
                            if let Some(ref agent) = task.assigned_agent {
                                let active = agent_active_tasks::<M>(agent).get();
                                if active > 0 {
                                    agent_active_tasks::<M>(agent).set(&(active - 1));
                                }
                            }
                            self.send().direct(
                                &task.creator,
                                &task.payment_token,
                                task.payment_nonce,
                                &task.payment_amount,
                            );
                            task.state = TaskState::Refunded;
                            tasks::<M>(task_id).set(&task);
                            task_refunded_event(self, task_id);
                        }
                    }
                }
            }
        }
    }

    /// Internal helper: release escrow payment to agent with protocol fee split.
    /// Reusable by approveTask, claimApproval, batchApprove.
    fn do_release_payment(&self, task_id: u64) {
        let config = config::<M>().get();
        let task = tasks::<M>(task_id).get();

        let protocol_fee =
            &task.payment_amount * BigUint::from(config.fee_bps as u64) / BigUint::from(10000u64);
        let agent_payment = &task.payment_amount - &protocol_fee;

        self.send().direct(
            &config.treasury,
            &task.payment_token,
            task.payment_nonce,
            &protocol_fee,
        );

        if let Some(ref agent) = task.assigned_agent {
            self.send().direct(
                agent,
                &task.payment_token,
                task.payment_nonce,
                &agent_payment,
            );

            let mut rep = agent_reputation::<M>(agent).get();
            rep.completed_tasks += 1;
            rep.total_tasks += 1;
            rep.total_earned += &agent_payment;
            rep.last_active = self.blockchain().get_block_timestamp();
            agent_reputation::<M>(agent).set(&rep);

            // Decrement concurrent task counter
            let active = agent_active_tasks::<M>(agent).get();
            if active > 0 {
                agent_active_tasks::<M>(agent).set(&(active - 1));
            }

            // Update global analytics
            let vol = total_volume::<M>().get();
            total_volume::<M>().set(&(vol + &agent_payment));
            let fees = total_fees_collected::<M>().get();
            total_fees_collected::<M>().set(&(fees + &protocol_fee));

            task_approved_event(self, task_id, agent, &agent_payment, &task.payment_token);
        }
    }
}
