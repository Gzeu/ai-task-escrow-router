#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

// Include gas optimization utilities
mod gas_optimization;
use gas_optimization::*;

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum TaskState {
    Open,
    Accepted,
    Submitted,
    Approved,
    Cancelled,
    Disputed,
    Resolved,
    Refunded,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct Task<M: ManagedTypeApi> {
    pub task_id: u64,
    pub creator: ManagedAddress<M>,
    pub assigned_agent: Option<ManagedAddress<M>>,
    pub payment_token: EgldOrEsdtTokenIdentifier<M>,
    pub payment_amount: BigUint<M>,
    pub payment_nonce: u64, // For NFT/ESDT payments
    pub protocol_fee_bps: u16,
    pub created_at: u64,
    pub accepted_at: Option<u64>,
    pub deadline: Option<u64>,
    pub review_timeout: Option<u64>,
    pub metadata_uri: ManagedBuffer<M>,
    pub result_uri: Option<ManagedBuffer<M>>,
    pub state: TaskState,
    pub dispute_metadata: Option<ManagedBuffer<M>>,
    pub ap2_mandate_hash: Option<ManagedBuffer<M>>, // Future AP2 integration
    pub x402_settlement_ref: Option<ManagedBuffer<M>>, // Future x402 integration
    pub agent_reputation_snapshot: Option<u32>, // Agent reputation at task creation
    pub priority_fee: Option<BigUint<M>>, // Optional priority fee for faster execution
    pub gas_used: Option<u64>, // Track gas usage for optimization
    pub completion_time: Option<u64>, // Track task completion time
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct AgentReputation<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub total_tasks: u64,
    pub completed_tasks: u64,
    pub cancelled_tasks: u64,
    pub disputed_tasks: u64,
    pub total_earned: BigUint<M>,
    pub reputation_score: u32, // 0-1000 score
    pub average_rating: u32, // 0-100 rating * 10
    pub last_active: u64,
    pub created_at: u64,
    pub specialization: ManagedVec<ManagedBuffer<M>>, // Agent specialization areas
    pub verification_status: VerificationStatus, // KYC/verification status
    pub performance_metrics: PerformanceMetrics<M>, // Detailed performance data
}

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum VerificationStatus {
    Unverified,
    Pending,
    Verified,
    Suspended,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct PerformanceMetrics<M: ManagedTypeApi> {
    pub average_completion_time: u64,
    pub success_rate: u16, // basis points
    pub dispute_rate: u16, // basis points
    pub total_earned_last_30d: BigUint<M>,
    pub tasks_completed_last_30d: u64,
}

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum DisputeResolution {
    FullRefund,
    PartialRefund { agent_award_bps: u16 },
    FullPayment,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct Config<M: ManagedTypeApi> {
    pub owner: ManagedAddress<M>,
    pub treasury: ManagedAddress<M>,
    pub fee_bps: u16,
    pub resolver: Option<ManagedAddress<M>>,
    pub paused: bool,
    pub min_reputation: u32, // Minimum reputation to accept tasks
    pub max_task_value: Option<BigUint<M>>, // Maximum task value for new agents
    pub reputation_decay_rate: u16, // Reputation decay per month (bps)
    pub emergency_pause: bool, // Emergency pause mechanism
    pub upgrade_proposal_threshold: u16, // Threshold for upgrade proposals
    pub max_concurrent_tasks: u32, // Max concurrent tasks per agent
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct DisputeVote<M: ManagedTypeApi> {
    pub resolver: ManagedAddress<M>,
    pub task_id: u64,
    pub resolution: DisputeResolution,
    pub reasoning: ManagedBuffer<M>,
    pub voted_at: u64,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct BatchTaskOperation<M: ManagedTypeApi> {
    pub operation_type: BatchOperationType,
    pub task_ids: ManagedVec<u64, M>,
    pub parameters: ManagedVec<ManagedBuffer<M>>,
}

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum BatchOperationType {
    BatchCancel,
    BatchApprove,
    BatchRefund,
}

#[multiversx_sc::contract]
pub trait RouterEscrow {
    #[init]
    fn init(
        &self,
        owner: ManagedAddress,
        treasury: ManagedAddress,
        fee_bps: u16,
        min_reputation: u32,
        max_concurrent_tasks: u32,
    ) {
        require!(fee_bps <= 1000, "Fee cannot exceed 1000 bps (10%)");
        require!(min_reputation <= 1000, "Min reputation cannot exceed 1000");
        require!(max_concurrent_tasks <= 100, "Max concurrent tasks cannot exceed 100");
        
        let config = Config {
            owner,
            treasury,
            fee_bps,
            resolver: None,
            paused: false,
            min_reputation,
            max_task_value: None,
            reputation_decay_rate: 50, // 0.5% per month
            emergency_pause: false,
            upgrade_proposal_threshold: 1000, // 10% of total supply
            max_concurrent_tasks,
        };
        
        self.config().set(&config);
        self.task_counter().set(&1u64);
        
        // Initialize batch operation tracking
        self.batch_operations().clear();
    }

    // Admin endpoints
    
    #[only_owner]
    #[endpoint(setFeeBps)]
    fn set_fee_bps(&self, fee_bps: u16) {
        require!(fee_bps <= 1000, "Fee cannot exceed 1000 bps (10%)");
        let mut config = self.config().get();
        config.fee_bps = fee_bps;
        self.config().set(&config);
        
        self.emit_config_changed_event();
    }

    #[only_owner]
    #[endpoint(setTreasury)]
    fn set_treasury(&self, treasury: ManagedAddress) {
        let mut config = self.config().get();
        config.treasury = treasury;
        self.config().set(&config);
        
        self.emit_config_changed_event();
    }

    #[only_owner]
    #[endpoint(setResolver)]
    fn set_resolver(&self, resolver: OptionalValue<ManagedAddress>) {
        let mut config = self.config().get();
        config.resolver = resolver.into_option();
        self.config().set(&config);
        
        self.emit_config_changed_event();
    }

    #[only_owner]
    #[endpoint(setPaused)]
    fn set_paused(&self, paused: bool) {
        let mut config = self.config().get();
        config.paused = paused;
        self.config().set(&config);
        
        self.emit_config_changed_event();
    }

    // Task lifecycle endpoints
    
    #[payable("*")]
    #[endpoint(createTask)]
    fn create_task(
        &self,
        metadata_uri: ManagedBuffer,
        deadline: OptionalValue<u64>,
        review_timeout: OptionalValue<u64>,
        ap2_mandate_hash: OptionalValue<ManagedBuffer>, // Future AP2 integration
        priority_fee: OptionalValue<BigUint<Self::Api>>,
    ) -> u64 {
        self.require_not_paused();
        
        let (payment_token, payment_amount, payment_nonce) = self.call_value()
            .payment_token()
            .into_nonzero()
            .map(|(token, nonce)| (token.into(), nonce.value))
            .unwrap_or_else(|| (EgldOrEsdtTokenIdentifier::egld(), self.call_value().egld_value().clone_value(), 0u64));
        
        require!(payment_amount > 0, "Payment must be greater than 0");
        
        let task_id = self.task_counter().get();
        self.task_counter().set(&(task_id + 1));
        
        let config = self.config().get();
        let caller = self.blockchain().get_caller();
        
        // Check if caller is an agent with reputation
        let agent_reputation = self.agent_reputation(&caller).get();
        let reputation_snapshot = if agent_reputation.address == ManagedAddress::zero() {
            None
        } else {
            Some(agent_reputation.reputation_score)
        };
        
        let task = Task {
            task_id,
            creator: caller,
            assigned_agent: None,
            payment_token,
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
        };
        
        self.tasks(task_id).set(&task);
        self.emit_task_created_event(&task);
        
        task_id
    }

    #[endpoint(acceptTask)]
    fn accept_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        let config = self.config().get();
        
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
        let agent_reputation = self.agent_reputation(&caller).get();
        if agent_reputation.address == ManagedAddress::zero() {
            // Initialize new agent reputation
            let new_reputation = AgentReputation {
                address: caller.clone(),
                total_tasks: 0,
                completed_tasks: 0,
                cancelled_tasks: 0,
                disputed_tasks: 0,
                total_earned: BigUint::zero(),
                reputation_score: 500, // Start with neutral reputation
                average_rating: 500, // Start with neutral rating
                last_active: self.blockchain().get_block_timestamp(),
                created_at: self.blockchain().get_block_timestamp(),
            };
            self.agent_reputation(&caller).set(&new_reputation);
        } else {
            require!(
                agent_reputation.reputation_score >= config.min_reputation,
                "Agent reputation below minimum threshold"
            );
            
            // Check max task value for new agents
            if let Some(max_value) = &config.max_task_value {
                if agent_reputation.total_tasks < 10 {
                    require!(
                        &task.payment_amount <= max_value,
                        "Task value exceeds maximum for new agents"
                    );
                }
            }
        }
        
        task.assigned_agent = Some(caller.clone());
        task.accepted_at = Some(self.blockchain().get_block_timestamp());
        task.state = TaskState::Accepted;
        
        self.tasks(task_id).set(&task);
        self.emit_task_accepted_event(&task, &caller);
    }

    #[endpoint(submitResult)]
    fn submit_result(&self, task_id: u64, result_uri: ManagedBuffer) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
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
        
        self.tasks(task_id).set(&task);
        self.emit_result_submitted_event(&task, &result_uri);
    }

    #[endpoint(approveTask)]
    fn approve_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Submitted, "Task is not submitted");
        require!(task.creator == caller, "Only creator can approve task");
        
        let config = self.config().get();
        let protocol_fee = &task.payment_amount * BigUint::from(config.fee_bps) / BigUint::from(10000u64);
        let agent_payment = &task.payment_amount - &protocol_fee;
        
        // Transfer protocol fee to treasury
        self.send().direct_egld(&config.treasury, &protocol_fee);
        
        // Transfer payment to agent
        if let Some(agent) = &task.assigned_agent {
            self.send().direct_egld(agent, &agent_payment);
        }
        
        task.state = TaskState::Approved;
        self.tasks(task_id).set(&task);
        self.emit_task_approved_event(&task, &protocol_fee, &agent_payment);
    }

    #[endpoint(cancelTask)]
    fn cancel_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Open, "Only open tasks can be cancelled");
        require!(task.creator == caller, "Only creator can cancel task");
        
        // Refund full payment to creator
        self.send().direct_egld(&task.creator, &task.payment_amount);
        
        task.state = TaskState::Cancelled;
        self.tasks(task_id).set(&task);
        self.emit_task_cancelled_event(&task);
    }

    #[endpoint(openDispute)]
    fn open_dispute(&self, task_id: u64, reason_uri: ManagedBuffer) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Submitted, "Only submitted tasks can be disputed");
        require!(
            task.creator == caller || task.assigned_agent.as_ref() == Some(&caller),
            "Only creator or agent can open dispute"
        );
        
        task.state = TaskState::Disputed;
        task.dispute_metadata = Some(reason_uri.clone());
        
        self.tasks(task_id).set(&task);
        self.emit_dispute_opened_event(&task, &reason_uri);
    }

    #[only_resolver]
    #[endpoint(resolveDispute)]
    fn resolve_dispute(
        &self,
        task_id: u64,
        resolution: DisputeResolution,
        x402_settlement_ref: OptionalValue<ManagedBuffer>, // Future x402 integration
    ) {
        let mut task = self.tasks(task_id).get();
        require!(task.state == TaskState::Disputed, "Task is not disputed");
        
        let config = self.config().get();
        
        match resolution {
            DisputeResolution::FullRefund => {
                // Refund full payment to creator
                self.send().direct_egld(&task.creator, &task.payment_amount);
            }
            DisputeResolution::PartialRefund { agent_award_bps } => {
                require!(agent_award_bps <= 10000, "Invalid award percentage");
                
                let protocol_fee = &task.payment_amount * BigUint::from(config.fee_bps) / BigUint::from(10000u64);
                let agent_award = &task.payment_amount * BigUint::from(agent_award_bps) / BigUint::from(10000u64);
                let creator_refund = &task.payment_amount - &protocol_fee - &agent_award;
                
                // Transfer protocol fee to treasury
                self.send().direct_egld(&config.treasury, &protocol_fee);
                
                // Transfer award to agent
                if let Some(agent) = &task.assigned_agent {
                    self.send().direct_egld(agent, &agent_award);
                }
                
                // Transfer refund to creator
                self.send().direct_egld(&task.creator, &creator_refund);
            }
            DisputeResolution::FullPayment => {
                let protocol_fee = &task.payment_amount * BigUint::from(config.fee_bps) / BigUint::from(10000u64);
                let agent_payment = &task.payment_amount - &protocol_fee;
                
                // Transfer protocol fee to treasury
                self.send().direct_egld(&config.treasury, &protocol_fee);
                
                // Transfer full payment to agent
                if let Some(agent) = &task.assigned_agent {
                    self.send().direct_egld(agent, &agent_payment);
                }
            }
        }
        
        task.state = TaskState::Resolved;
        if let Some(ref_) = x402_settlement_ref.into_option() {
            task.x402_settlement_ref = Some(ref_);
        }
        
        self.tasks(task_id).set(&task);
        self.emit_dispute_resolved_event(&task, &resolution);
    }

    #[endpoint(refundExpiredTask)]
    fn refund_expired_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let config = self.config().get();
        
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
        self.send().direct_egld(&task.creator, &task.payment_amount);
        
        task.state = TaskState::Refunded;
        self.tasks(task_id).set(&task);
        self.emit_task_refunded_event(&task);
    }

    // Batch operations for gas optimization
    #[endpoint(batchTaskOperations)]
    fn batch_task_operations(&self, operations: BatchTaskOperation<Self::Api>) {
        self.require_not_paused();
        
        let gas_before = self.blockchain().get_gas_left();
        
        for operation in operations {
            match operation.operation_type {
                BatchOperationType::BatchCancel => {
                    self.batch_cancel_tasks(&operation.task_ids);
                }
                BatchOperationType::BatchApprove => {
                    self.batch_approve_tasks(&operation.task_ids);
                }
                BatchOperationType::BatchRefund => {
                    self.batch_refund_tasks(&operation.task_ids);
                }
            }
        }
        
        // Track gas usage for optimization
        let gas_used = gas_before - self.blockchain().get_gas_left();
        self.emit_batch_operation_completed_event(&operations, gas_used);
    }

    fn batch_cancel_tasks(&self, task_ids: &ManagedVec<u64, Self::Api>) {
        for &task_id in task_ids {
            let mut task = self.tasks(task_id).get();
            
            if task.state == TaskState::Open || task.state == TaskState::Accepted {
                // Refund payment to creator
                self.send().direct_egld(&task.creator, &task.payment_amount);
                task.state = TaskState::Cancelled;
                self.tasks(task_id).set(&task);
                self.emit_task_cancelled_event(&task);
            }
        }
    }

    fn batch_approve_tasks(&self, task_ids: &ManagedVec<u64, Self::Api>) {
        let config = self.config().get();
        
        for &task_id in task_ids {
            let mut task = self.tasks(task_id).get();
            
            if task.state == TaskState::Submitted {
                require!(task.assigned_agent.is_some(), "Task has no assigned agent");
                
                let agent_address = task.assigned_agent.unwrap();
                let protocol_fee = &task.payment_amount * BigUint::from(config.fee_bps) / BigUint::from(10000u64);
                let agent_payment = &task.payment_amount - &protocol_fee;
                
                // Transfer protocol fee to treasury
                self.send().direct_egld(&config.treasury, &protocol_fee);
                
                // Transfer payment to agent
                self.send().direct_egld(&agent_address, &agent_payment);
                
                task.state = TaskState::Approved;
                self.tasks(task_id).set(&task);
                self.emit_task_approved_event(&task, &protocol_fee, &agent_payment);
            }
        }
    }

    fn batch_refund_tasks(&self, task_ids: &ManagedVec<u64, Self::Api>) {
        for &task_id in task_ids {
            let mut task = self.tasks(task_id).get();
            
            if task.state == TaskState::Accepted || task.state == TaskState::Submitted {
                // Refund payment to creator
                self.send().direct_egld(&task.creator, &task.payment_amount);
                task.state = TaskState::Refunded;
                self.tasks(task_id).set(&task);
                self.emit_task_refunded_event(&task);
            }
        }
    }

    // Enhanced agent reputation management
    #[endpoint(updateAgentReputation)]
    fn update_agent_reputation(&self, updates: ManagedVec<AgentReputationUpdate<Self::Api>>) {
        let config = self.config().get();
        
        for update in updates {
            let mut reputation = self.agent_reputation(&update.address).get();
            
            if let Some(new_total_tasks) = update.total_tasks {
                reputation.total_tasks = new_total_tasks;
            }
            
            if let Some(new_completed_tasks) = update.completed_tasks {
                reputation.completed_tasks = new_completed_tasks;
            }
            
            if let Some(new_reputation_score) = update.reputation_score {
                reputation.reputation_score = new_reputation_score;
            }
            
            if let Some(new_average_rating) = update.average_rating {
                reputation.average_rating = new_average_rating;
            }
            
            // Update last active timestamp
            reputation.last_active = self.blockchain().get_block_timestamp();
            
            self.agent_reputation(&update.address).set(&reputation);
        }
    }

    // Agent verification and specialization
    #[endpoint(verifyAgent)]
    fn verify_agent(&self, specialization: ManagedBuffer<M>) {
        let caller = self.blockchain().get_caller();
        let mut reputation = self.agent_reputation(&caller).get();
        
        // Check if agent is already verified
        require!(
            reputation.verification_status != VerificationStatus::Suspended,
            "Agent is suspended"
        );
        
        // Add specialization
        reputation.specializations.insert(specialization);
        
        // Mark as verified (in real implementation, this would require off-chain verification)
        reputation.verification_status = VerificationStatus::Pending;
        
        self.agent_reputation(&caller).set(&reputation);
    }

    // Emergency controls
    #[only_owner]
    #[endpoint(emergencyPause)]
    fn emergency_pause(&self) {
        let mut config = self.config().get();
        config.emergency_pause = true;
        self.config().set(&config);
        self.emit_config_changed_event();
    }

    #[only_owner]
    #[endpoint(setMaxConcurrentTasks)]
    fn set_max_concurrent_tasks(&self, max_tasks: u32) {
        require!(max_tasks <= 100, "Max concurrent tasks cannot exceed 100");
        
        let mut config = self.config().get();
        config.max_concurrent_tasks = max_tasks;
        self.config().set(&config);
        self.emit_config_changed_event();
    }

    // Upgrade proposal system
    #[only_owner]
    #[endpoint(proposeUpgrade)]
    fn propose_upgrade(
        &self,
        proposal_hash: ManagedBuffer<M>,
        voting_period: u64,
        execution_delay: u64,
    ) {
        let config = self.config().get();
        
        // In a real implementation, this would create a governance proposal
        // For now, we just emit an event
        self.emit_upgrade_proposed_event(proposal_hash, voting_period, execution_delay);
    }

    // Event emitters for batch operations
    fn emit_batch_operation_completed_event(
        &self,
        operations: &BatchTaskOperation<Self::Api>,
        gas_used: u64,
    ) {
        // Emit batch operation summary
        // Implementation would depend on framework capabilities
    }

    fn emit_upgrade_proposed_event(
        &self,
        proposal_hash: &ManagedBuffer<Self::Api>,
        voting_period: u64,
        execution_delay: u64,
    ) {
        // Emit upgrade proposal event
        // Implementation would depend on framework capabilities
    }

    // View endpoints
    
    #[endpoint(getTask)]
    fn get_task(&self, task_id: u64) -> Task<Self::Api> {
        self.tasks(task_id).get()
    }

    #[endpoint(getTaskCount)]
    fn get_task_count(&self) -> u64 {
        self.task_counter().get()
    }

    #[endpoint(getConfig)]
    fn get_config(&self) -> Config<Self::Api> {
        self.config().get()
    }

    // Private helper functions
    
    fn require_not_paused(&self) {
        let config = self.config().get();
        require!(!config.paused, "Contract is paused");
    }

    // Event emitters
    
    fn emit_task_created_event(&self, task: &Task<Self::Api>) {
        self.emit(TaskCreatedEvent {
            task_id: task.task_id,
            creator: &task.creator,
            payment_amount: &task.payment_amount,
            metadata_uri: &task.metadata_uri,
        });
    }

    fn emit_task_accepted_event(&self, task: &Task<Self::Api>, agent: &ManagedAddress) {
        self.emit(TaskAcceptedEvent {
            task_id: task.task_id,
            agent,
        });
    }

    fn emit_result_submitted_event(&self, task: &Task<Self::Api>, result_uri: &ManagedBuffer) {
        self.emit(ResultSubmittedEvent {
            task_id: task.task_id,
            result_uri,
        });
    }

    fn emit_task_approved_event(&self, task: &Task<Self::Api>, protocol_fee: &BigUint, agent_payment: &BigUint) {
        self.emit(TaskApprovedEvent {
            task_id: task.task_id,
            protocol_fee,
            agent_payment,
        });
    }

    fn emit_task_cancelled_event(&self, task: &Task<Self::Api>) {
        self.emit(TaskCancelledEvent {
            task_id: task.task_id,
        });
    }

    fn emit_dispute_opened_event(&self, task: &Task<Self::Api>, reason_uri: &ManagedBuffer) {
        self.emit(DisputeOpenedEvent {
            task_id: task.task_id,
            reason_uri,
        });
    }

    fn emit_dispute_resolved_event(&self, task: &Task<Self::Api>, resolution: &DisputeResolution) {
        self.emit(DisputeResolvedEvent {
            task_id: task.task_id,
            resolution,
        });
    }

    fn emit_task_refunded_event(&self, task: &Task<Self::Api>) {
        self.emit(TaskRefundedEvent {
            task_id: task.task_id,
        });
    }

    fn emit_batch_operation_completed_event(
        &self,
        operations: &BatchTaskOperation<Self::Api>,
        gas_used: u64,
    ) {
        self.emit(BatchOperationCompletedEvent {
            operation_count: operations.len(),
            gas_used,
        });
    }

    fn emit_upgrade_proposed_event(
        &self,
        proposal_hash: &ManagedBuffer<Self::Api>,
        voting_period: u64,
        execution_delay: u64,
    ) {
        self.emit(UpgradeProposedEvent {
            proposal_hash,
            voting_period,
            execution_delay,
        });
    }

    fn emit_agent_verification_event(
        &self,
        agent: &ManagedAddress<Self::Api>,
        verification_status: VerificationStatus,
    ) {
        self.emit(AgentVerificationEvent {
            agent,
            verification_status,
        });
    }

    fn emit_specialization_added_event(
        &self,
        agent: &ManagedAddress<Self::Api>,
        specialization: &ManagedBuffer<Self::Api>,
    ) {
        self.emit(SpecializationAddedEvent {
            agent,
            specialization,
        });
    }

    fn emit_config_changed_event(&self) {
        self.emit(ConfigChangedEvent {});
    }

    // Storage
    
    #[storage_mapper("config")]
    fn config(&self) -> SingleValueMapper<Config<Self::Api>>;

    #[storage_mapper("task_counter")]
    fn task_counter(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("tasks")]
    fn tasks(&self, task_id: u64) -> SingleValueMapper<Task<Self::Api>>;

    #[storage_mapper("agent_reputation")]
    fn agent_reputation(&self, address: &ManagedAddress<Self::Api>) -> SingleValueMapper<AgentReputation<Self::Api>>;

    #[storage_mapper("resolver_panel")]
    fn resolver_panel(&self) -> SetMapper<ManagedAddress<Self::Api>>;

    #[storage_mapper("dispute_votes")]
    fn dispute_votes(&self, task_id: u64) -> MapMapper<ManagedAddress<Self::Api>, bool>;

    #[storage_mapper("batch_operations")]
    fn batch_operations(&self) -> VecMapper<BatchTaskOperation<Self::Api>>;

    #[storage_mapper("agent_specializations")]
    fn agent_specializations(&self, address: &ManagedAddress<Self::Api>) -> SetMapper<ManagedBuffer<Self::Api>>;
}

// Modifiers

#[allow(dead_code)]
pub trait RouterEscrowAbi {
    #[endpoint(getTask)]
    fn get_task(&self, task_id: u64) -> Task<Self::Api>;

    #[endpoint(getTaskCount)]
    fn get_task_count(&self) -> u64;

    #[endpoint(getConfig)]
    fn get_config(&self) -> Config<Self::Api>;
}

// Events

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct BatchOperationCompletedEvent {
    pub operation_count: usize,
    pub gas_used: u64,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct UpgradeProposedEvent<M: ManagedTypeApi> {
    pub proposal_hash: &ManagedBuffer<M>,
    pub voting_period: u64,
    pub execution_delay: u64,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct AgentVerificationEvent<M: ManagedTypeApi> {
    pub agent: &ManagedAddress<M>,
    pub verification_status: VerificationStatus,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct SpecializationAddedEvent<M: ManagedTypeApi> {
    pub agent: &ManagedAddress<M>,
    pub specialization: &ManagedBuffer<M>,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct TaskCreatedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub creator: &ManagedAddress<M>,
    pub payment_amount: &BigUint<M>,
    pub metadata_uri: &ManagedBuffer<M>,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct TaskAcceptedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub agent: &ManagedAddress<M>,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct ResultSubmittedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub result_uri: &ManagedBuffer<M>,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct TaskApprovedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub protocol_fee: &BigUint<M>,
    pub agent_payment: &BigUint<M>,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct TaskCancelledEvent {
    pub task_id: u64,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct DisputeOpenedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub reason_uri: &ManagedBuffer<M>,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct DisputeResolvedEvent {
    pub task_id: u64,
    pub resolution: &DisputeResolution,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct TaskRefundedEvent {
    pub task_id: u64,
}

#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi, Clone, Debug)]
pub struct ConfigChangedEvent {}

// Helper trait for owner and resolver checks
pub trait RouterEscrowModifiers {
    fn only_owner<SA>(&self, api: SA) -> SA where SA: ManagedTypeApi;
    fn only_resolver<SA>(&self, api: SA) -> SA where SA: ManagedTypeApi;
}

#[allow(dead_code)]
pub struct RouterEscrowImpl;

impl RouterEscrowModifiers for RouterEscrowImpl {
    fn only_owner<SA>(&self, api: SA) -> SA where SA: ManagedTypeApi {
        // This would be implemented with the actual framework's modifier mechanism
        api
    }

    fn only_resolver<SA>(&self, api: SA) -> SA where SA: ManagedTypeApi {
        // This would be implemented with the actual framework's modifier mechanism
        api
    }
}
