#![no_std]

multiversx_sc::derive_imports!();
multiversx_sc::imports!();

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

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum VerificationStatus {
    Unverified,
    Pending,
    Verified,
    Suspended,
}

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum DisputeResolution {
    FullRefund,
    PartialRefund { agent_award_bps: u16 },
    FullPayment,
}

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum BatchOperationType {
    BatchCancel,
    BatchApprove,
    BatchRefund,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct Task<M: ManagedTypeApi> {
    pub task_id: u64,
    pub creator: ManagedAddress<M>,
    pub assigned_agent: Option<ManagedAddress<M>>,
    pub payment_token: EgldOrEsdtTokenIdentifier<M>,
    pub payment_amount: BigUint<M>,
    pub payment_nonce: u64,
    pub protocol_fee_bps: u16,
    pub created_at: u64,
    pub accepted_at: Option<u64>,
    pub deadline: Option<u64>,
    pub review_timeout: Option<u64>,
    pub metadata_uri: ManagedBuffer<M>,
    pub result_uri: Option<ManagedBuffer<M>>,
    pub state: TaskState,
    pub dispute_metadata: Option<ManagedBuffer<M>>,
    pub ap2_mandate_hash: Option<ManagedBuffer<M>>,
    pub x402_settlement_ref: Option<ManagedBuffer<M>>,
    pub agent_reputation_snapshot: Option<u32>,
    pub priority_fee: Option<BigUint<M>>,
    pub gas_used: Option<u64>,
    pub completion_time: Option<u64>,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct AgentReputation<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub total_tasks: u64,
    pub completed_tasks: u64,
    pub cancelled_tasks: u64,
    pub disputed_tasks: u64,
    pub total_earned: BigUint<M>,
    pub reputation_score: u32,
    pub average_rating: u32,
    pub last_active: u64,
    pub created_at: u64,
    pub specialization: ManagedVec<ManagedBuffer<M>>,
    pub verification_status: VerificationStatus,
    pub performance_metrics: PerformanceMetrics<M>,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct PerformanceMetrics<M: ManagedTypeApi> {
    pub average_completion_time: u64,
    pub success_rate: u16,
    pub dispute_rate: u16,
    pub total_earned_last_30d: BigUint<M>,
    pub tasks_completed_last_30d: u64,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct Config<M: ManagedTypeApi> {
    pub owner: ManagedAddress<M>,
    pub treasury: ManagedAddress<M>,
    pub fee_bps: u16,
    pub resolver: Option<ManagedAddress<M>>,
    pub paused: bool,
    pub min_reputation: u32,
    pub max_task_value: Option<BigUint<M>>,
    pub reputation_decay_rate: u16,
    pub emergency_pause: bool,
    pub upgrade_proposal_threshold: u16,
    pub max_concurrent_tasks: u32,
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
    pub task_ids: ManagedVec<M, u64>,
    pub parameters: ManagedVec<M, ManagedBuffer<M>>,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct AgentReputationUpdate<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub total_tasks: Option<u64>,
    pub completed_tasks: Option<u64>,
    pub reputation_score: Option<u32>,
    pub average_rating: Option<u32>,
}
