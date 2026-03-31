//! Enhanced Protocol Features - v0.2.0
//! 
//! Multi-token support, agent reputation, batch operations, and governance features
//! for AI Task Escrow Router on MultiversX

#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

use crate::lib::*;

/// Agent reputation levels for task assignment restrictions
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum ReputationLevel {
    Beginner = 0,      // 0-250 points
    Intermediate = 1,  // 251-500 points  
    Advanced = 2,      // 501-750 points
    Expert = 3,         // 751-1000 points
    Legendary = 4,      // 1000+ points
}

impl ReputationLevel {
    pub fn from_score(score: u64) -> Self {
        if score >= 1000 {
            ReputationLevel::Legendary
        } else if score >= 751 {
            ReputationLevel::Expert
        } else if score >= 501 {
            ReputationLevel::Advanced
        } else if score >= 251 {
            ReputationLevel::Intermediate
        } else {
            ReputationLevel::Beginner
        }
    }
    
    pub fn min_score(&self) -> u64 {
        match self {
            ReputationLevel::Beginner => 0,
            ReputationLevel::Intermediate => 251,
            ReputationLevel::Advanced => 501,
            ReputationLevel::Expert => 751,
            ReputationLevel::Legendary => 1000,
        }
    }
}

/// Agent profile with reputation and verification status
#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct AgentProfile<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub reputation_score: u64,
    pub successful_tasks: u64,
    pub disputed_tasks: u64,
    pub verification_status: VerificationStatus,
    pub specializations: ManagedVec<M, ManagedBuffer<M>>,
    pub registered_at: u64,
    pub last_active: u64,
}

/// Verification status for agents
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum VerificationStatus {
    Unverified,
    Pending,
    Verified,
    Suspended,
}

/// Batch operation types for gas optimization
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum BatchOperationType {
    Cancel,
    Approve,
    Refund,
}

/// Batch operation request
#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct BatchOperation<M: ManagedTypeApi> {
    pub operation_type: BatchOperationType,
    pub task_ids: ManagedVec<M, u64>,
}

/// Governance proposal for protocol upgrades
#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct UpgradeProposal<M: ManagedTypeApi> {
    pub proposal_id: u64,
    pub proposer: ManagedAddress<M>,
    pub description: ManagedBuffer<M>,
    pub new_contract_address: ManagedAddress<M>,
    pub voting_deadline: u64,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub executed: bool,
}

/// Performance metrics for agents
#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct PerformanceMetrics<M: ManagedTypeApi> {
    pub avg_completion_time: u64,    // seconds
    pub success_rate: u64,           // basis points (10000 = 100%)
    pub total_earned: BigUint<M>,     // in EGLD/ESDT
    pub gas_efficiency: u64,        // gas used vs estimated
}

/// Enhanced task data with new v0.2.0 fields
#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct EnhancedTaskData<M: ManagedTypeApi> {
    // Original fields
    pub task_id: u64,
    pub creator: ManagedAddress<M>,
    pub assigned_agent: Option<ManagedAddress<M>>,
    pub payment_token: EgldOrEsdtTokenIdentifier<M>,
    pub payment_amount: BigUint<M>,
    pub fee_bps_snapshot: u64,
    pub created_at: u64,
    pub accepted_at: Option<u64>,
    pub deadline: Option<u64>,
    pub review_timeout: Option<u64>,
    pub metadata_uri: ManagedBuffer<M>,
    pub result_uri: Option<ManagedBuffer<M>>,
    pub state: TaskState,
    pub dispute_metadata_uri: Option<ManagedBuffer<M>>,
    pub ap2_mandate_hash: Option<ManagedBuffer<M>>,
    pub x402_payment_ref: Option<ManagedBuffer<M>>,
    
    // New v0.2.0 fields
    pub gas_used: Option<u64>,
    pub completion_time: Option<u64>,
    pub priority_fee: Option<BigUint<M>>,
    pub agent_reputation_snapshot: Option<u64>,
    pub payment_nonce: Option<u64>,
}

impl<M: ManagedTypeApi> RouterEscrow for EnhancedTaskData<M> {
    
    // ─────────────────────────────────────────────────────
    // ENHANCED ENDPOINTS - v0.2.0
    // ─────────────────────────────────────────────────────
    
    /// Batch operations for gas optimization
    /// Processes multiple tasks in a single transaction
    #[endpoint(batchTaskOperations)]
    fn batch_task_operations(&self, operations: ManagedVec<M, BatchOperation<M>>) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let mut total_gas_saved = 0u64;
        
        for operation in operations.iter() {
            match operation.operation_type {
                BatchOperationType::Cancel => {
                    for task_id in operation.task_ids.iter() {
                        if self.can_cancel_task(&task_id, &caller) {
                            self.cancel_task_internal(task_id);
                            total_gas_saved += 5_000_000u64; // Estimated gas saved
                        }
                    }
                },
                BatchOperationType::Approve => {
                    for task_id in operation.task_ids.iter() {
                        if self.can_approve_task(&task_id, &caller) {
                            self.approve_task_internal(task_id);
                            total_gas_saved += 8_000_000u64;
                        }
                    }
                },
                BatchOperationType::Refund => {
                    for task_id in operation.task_ids.iter() {
                        if self.can_refund_task(&task_id, &caller) {
                            self.refund_task_internal(task_id);
                            total_gas_saved += 6_000_000u64;
                        }
                    }
                }
            }
        }
        
        // Emit batch completion event with gas savings
        self.emit_batch_operation_completed(caller, operations.len(), total_gas_saved);
    }
    
    /// Update agent reputation based on task completion
    #[endpoint(updateAgentReputation)]
    fn update_agent_reputation(
        &self,
        agent: ManagedAddress,
        reputation_change: i64,  // Can be positive or negative
        reason: ManagedBuffer,  // Reason for reputation change
    ) {
        self.require_not_paused();
        
        let mut profile = self.agent_profiles(&agent).get();
        let old_reputation = profile.reputation_score;
        
        // Apply reputation change with bounds checking
        let new_reputation = if reputation_change >= 0 {
            old_reputation + reputation_change as u64
        } else {
            let decrease = (-reputation_change) as u64;
            if decrease >= old_reputation {
                0u64  // Minimum reputation is 0
            } else {
                old_reputation - decrease
            }
        };
        
        profile.reputation_score = new_reputation;
        profile.last_active = self.blockchain().get_block_timestamp();
        
        self.agent_profiles(&agent).set(&profile);
        
        // Emit reputation update event
        self.emit_reputation_updated(agent, old_reputation, new_reputation, reason);
    }
    
    /// Verify agent credentials and capabilities
    #[endpoint(verifyAgent)]
    fn verify_agent(
        &self,
        agent: ManagedAddress,
        specializations: ManagedVec<M, ManagedBuffer<M>>,
        verification_data: ManagedBuffer,  // Off-chain verification proof
    ) {
        // Only contract owner or designated verifier can call this
        let config = self.config().get();
        let caller = self.blockchain().get_caller();
        require!(
            caller == config.treasury || caller == self.blockchain().get_owner_address(),
            "only authorized verifier can verify agents"
        );
        
        let mut profile = self.agent_profiles(&agent).get();
        profile.verification_status = VerificationStatus::Verified;
        profile.specializations = specializations;
        
        self.agent_profiles(&agent).set(&profile);
        
        // Emit verification event
        self.emit_agent_verified(agent, specializations);
    }
    
    /// Emergency pause with detailed reason
    #[endpoint(emergencyPause)]
    fn emergency_pause(&self, reason: ManagedBuffer, duration_seconds: u64) {
        let caller = self.blockchain().get_caller();
        require!(
            caller == self.blockchain().get_owner_address(),
            "only owner can emergency pause"
        );
        
        let mut config = self.config().get();
        config.is_paused = true;
        self.config().set(&config);
        
        // Set auto-resume time
        let resume_time = self.blockchain().get_block_timestamp() + duration_seconds;
        
        self.emit_emergency_pause(caller, reason, duration_seconds);
    }
    
    /// Set maximum concurrent tasks per agent
    #[endpoint(setMaxConcurrentTasks)]
    fn set_max_concurrent_tasks(&self, max_tasks: u64) {
        let caller = self.blockchain().get_caller();
        require!(
            caller == self.blockchain().get_owner_address(),
            "only owner can set max concurrent tasks"
        );
        
        require!(max_tasks > 0 && max_tasks <= 100, "max_tasks must be 1-100");
        
        // Store in config (would need to extend ProtocolConfig)
        self.emit_config_changed();
    }
    
    /// Propose protocol upgrade with voting
    #[endpoint(proposeUpgrade)]
    fn propose_upgrade(
        &self,
        description: ManagedBuffer,
        new_contract_address: ManagedAddress,
        voting_period_seconds: u64,
    ) {
        let caller = self.blockchain().get_caller();
        
        // Check if caller has sufficient reputation to propose
        let caller_profile = self.agent_profiles(&caller).get();
        require!(
            caller_profile.reputation_score >= 500,
            "proposer must have at least 500 reputation"
        );
        
        let proposal_id = self.proposal_counter().get() + 1;
        let now = self.blockchain().get_block_timestamp();
        
        let proposal = UpgradeProposal {
            proposal_id,
            proposer: caller,
            description,
            new_contract_address,
            voting_deadline: now + voting_period_seconds,
            yes_votes: 0,
            no_votes: 0,
            executed: false,
        };
        
        self.proposals(proposal_id).set(&proposal);
        self.proposal_counter().set(proposal_id);
        
        self.emit_upgrade_proposed(proposal_id, caller, description);
    }
    
    /// Vote on upgrade proposal
    #[endpoint(voteOnUpgrade)]
    fn vote_on_upgrade(&self, proposal_id: u64, vote: bool) {
        let caller = self.blockchain().get_caller();
        
        let mut proposal = self.proposals(proposal_id).get();
        require!(!proposal.executed, "proposal already executed");
        require!(
            self.blockchain().get_block_timestamp() < proposal.voting_deadline,
            "voting period has ended"
        );
        
        // Check if caller has sufficient reputation to vote
        let caller_profile = self.agent_profiles(&caller).get();
        require!(
            caller_profile.reputation_score >= 100,
            "voter must have at least 100 reputation"
        );
        
        if vote {
            proposal.yes_votes += 1;
        } else {
            proposal.no_votes += 1;
        }
        
        self.proposals(proposal_id).set(&proposal);
        
        self.emit_vote_cast(proposal_id, caller, vote);
    }
    
    /// Execute approved upgrade proposal
    #[endpoint(executeUpgrade)]
    fn execute_upgrade(&self, proposal_id: u64) {
        let caller = self.blockchain().get_caller();
        require!(
            caller == self.blockchain().get_owner_address(),
            "only owner can execute upgrade"
        );
        
        let mut proposal = self.proposals(proposal_id).get();
        require!(!proposal.executed, "proposal already executed");
        require!(
            self.blockchain().get_block_timestamp() >= proposal.voting_deadline,
            "voting period has not ended"
        );
        
        // Check if proposal passed (simple majority for now)
        let total_votes = proposal.yes_votes + proposal.no_votes;
        let passed = proposal.yes_votes > proposal.no_votes;
        
        require!(passed, "proposal did not pass voting");
        
        proposal.executed = true;
        self.proposals(proposal_id).set(&proposal);
        
        // In production, this would trigger contract upgrade logic
        self.emit_upgrade_executed(proposal_id, proposal.new_contract_address);
    }
    
    // ─────────────────────────────────────────────────────
    // INTERNAL HELPER METHODS
    // ─────────────────────────────────────────────────────
    
    fn can_cancel_task(&self, task_id: u64, caller: &ManagedAddress<M>) -> bool {
        if let Some(task) = self.tasks(task_id).get() {
            task.state == TaskState::Open && task.creator == *caller
        } else {
            false
        }
    }
    
    fn can_approve_task(&self, task_id: u64, caller: &ManagedAddress<M>) -> bool {
        if let Some(task) = self.tasks(task_id).get() {
            task.state == TaskState::Submitted && task.creator == *caller
        } else {
            false
        }
    }
    
    fn can_refund_task(&self, task_id: u64, caller: &ManagedAddress<M>) -> bool {
        if let Some(task) = self.tasks(task_id).get() {
            (task.state == TaskState::Open || task.state == TaskState::Accepted) 
            && task.creator == *caller
        } else {
            false
        }
    }
    
    fn cancel_task_internal(&self, task_id: u64) {
        let mut task = self.tasks(task_id).get();
        task.state = TaskState::Cancelled;
        self.tasks(task_id).set(&task);
        self.send_payment(&task.payment_token, &task.payment_amount, &task.creator);
        self.emit_task_cancelled(task_id, &task.creator);
    }
    
    fn approve_task_internal(&self, task_id: u64) {
        let mut task = self.tasks(task_id).get();
        task.state = TaskState::Approved;
        self.tasks(task_id).set(&task);
        
        let agent = task.assigned_agent.clone().unwrap_or_else(|| ManagedAddress::zero());
        let config = self.config().get();
        
        self.settle_payment(
            &task.payment_token,
            &task.payment_amount,
            task.fee_bps_snapshot,
            &agent,
            &config.treasury,
        );
        
        self.emit_task_approved(task_id, &agent, &task.payment_amount, task.fee_bps_snapshot);
    }
    
    fn refund_task_internal(&self, task_id: u64) {
        let mut task = self.tasks(task_id).get();
        task.state = TaskState::Refunded;
        self.tasks(task_id).set(&task);
        self.send_payment(&task.payment_token, &task.payment_amount, &task.creator);
        self.emit_task_refunded(task_id, &task.creator, &task.payment_amount);
    }
    
    // ─────────────────────────────────────────────────────
    // NEW EVENTS - v0.2.0
    // ─────────────────────────────────────────────────────
    
    #[event("batch_operation_completed")]
    fn emit_batch_operation_completed(
        &self,
        #[indexed] executor: &ManagedAddress,
        #[indexed] operation_count: usize,
        gas_saved: u64,
    );
    
    #[event("reputation_updated")]
    fn emit_reputation_updated(
        &self,
        #[indexed] agent: &ManagedAddress,
        old_score: u64,
        new_score: u64,
        reason: &ManagedBuffer,
    );
    
    #[event("agent_verified")]
    fn emit_agent_verified(
        &self,
        #[indexed] agent: &ManagedAddress,
        specializations: ManagedVec<M, ManagedBuffer<M>>,
    );
    
    #[event("emergency_pause")]
    fn emit_emergency_pause(
        &self,
        #[indexed] pauser: &ManagedAddress,
        reason: &ManagedBuffer,
        duration_seconds: u64,
    );
    
    #[event("upgrade_proposed")]
    fn emit_upgrade_proposed(
        &self,
        #[indexed] proposal_id: u64,
        #[indexed] proposer: &ManagedAddress,
        description: &ManagedBuffer,
    );
    
    #[event("vote_cast")]
    fn emit_vote_cast(
        &self,
        #[indexed] proposal_id: u64,
        #[indexed] voter: &ManagedAddress,
        vote: bool,
    );
    
    #[event("upgrade_executed")]
    fn emit_upgrade_executed(
        &self,
        #[indexed] proposal_id: u64,
        #[indexed] new_contract: &ManagedAddress,
    );
    
    // ─────────────────────────────────────────────────────
    // NEW STORAGE MAPPERS - v0.2.0
    // ─────────────────────────────────────────────────────
    
    #[storage_mapper("agent_profiles")]
    fn agent_profiles(&self, agent: &ManagedAddress<M>) -> SingleValueMapper<AgentProfile<M>>;
    
    #[storage_mapper("proposals")]
    fn proposals(&self, proposal_id: u64) -> SingleValueMapper<UpgradeProposal<M>>;
    
    #[storage_mapper("proposal_counter")]
    fn proposal_counter(&self) -> SingleValueMapper<u64>;
}
