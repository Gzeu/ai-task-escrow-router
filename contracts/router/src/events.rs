#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::RouterEscrow;

#[event("taskCreated")]
pub fn task_created_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] _task_id: u64,
    #[indexed] _creator: &ManagedAddress<M>,
    #[indexed] _payment_amount: &BigUint<M>,
    #[indexed] _payment_token: &EgldOrEsdtTokenIdentifier<M>,
    _metadata_uri: &ManagedBuffer<M>,
) {
}

#[event("taskAccepted")]
pub fn task_accepted_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] task_id: u64,
    #[indexed] agent: &ManagedAddress<M>,
) {
}

#[event("resultSubmitted")]
pub fn result_submitted_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] task_id: u64,
    #[indexed] result_uri: &ManagedBuffer<M>,
) {
}

#[event("taskApproved")]
pub fn task_approved_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] task_id: u64,
    #[indexed] agent: &ManagedAddress<M>,
    #[indexed] agent_payment: &BigUint<M>,
    #[indexed] payment_token: &EgldOrEsdtTokenIdentifier<M>,
) {
}

#[event("taskCancelled")]
pub fn task_cancelled_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] task_id: u64,
) {
}

#[event("disputeOpened")]
pub fn dispute_opened_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] task_id: u64,
    #[indexed] reason_uri: &ManagedBuffer<M>,
) {
}

#[event("disputeResolved")]
pub fn dispute_resolved_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] task_id: u64,
    #[indexed] resolution: &DisputeResolution,
) {
}

#[event("taskRefunded")]
pub fn task_refunded_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] task_id: u64,
) {
}

#[event("batchOperationCompleted")]
pub fn batch_operation_completed_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] operation_count: usize,
    #[indexed] gas_used: u64,
) {
}

#[event("upgradeProposed")]
pub fn upgrade_proposed_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] proposal_hash: &ManagedBuffer<M>,
    #[indexed] voting_period: u64,
    #[indexed] execution_delay: u64,
) {
}

#[event("agentVerified")]
pub fn agent_verified_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] agent: &ManagedAddress<M>,
    #[indexed] verification_status: &VerificationStatus,
) {
}

#[event("specializationAdded")]
pub fn specialization_added_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] agent: &ManagedAddress<M>,
    #[indexed] specialization: &ManagedBuffer<M>,
) {
}

#[event("configChanged")]
pub fn config_changed_event<M: ManagedTypeApi>(self: &RouterEscrow<M>) {
}

#[event("tokenWhitelistUpdated")]
pub fn token_whitelist_updated_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] token_identifier: &EgldOrEsdtTokenIdentifier<M>,
    #[indexed] is_enabled: bool,
) {
}

#[event("reputationUpdated")]
pub fn reputation_updated_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] agent: &ManagedAddress<M>,
    #[indexed] new_score: u32,
    #[indexed] old_score: u32,
) {
}

#[event("contractInitialized")]
pub fn contract_initialized_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] owner: &ManagedAddress<M>,
    #[indexed] treasury: &ManagedAddress<M>,
    #[indexed] fee_bps: u16,
) {
}
