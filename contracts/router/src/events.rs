#![no_std]

multiversx_sc::imports!();

use crate::types::*;

/// All contract events in a dedicated module.
/// mx-sdk-rs requires events to be defined inside a #[multiversx_sc::module] trait.
#[multiversx_sc::module]
pub trait EventsModule {
    #[event("taskCreated")]
    fn task_created_event(
        &self,
        #[indexed] task_id: u64,
        #[indexed] creator: &ManagedAddress,
        #[indexed] payment_amount: &BigUint,
        #[indexed] payment_token: &EgldOrEsdtTokenIdentifier,
        metadata_uri: &ManagedBuffer,
    );

    #[event("taskAccepted")]
    fn task_accepted_event(
        &self,
        #[indexed] task_id: u64,
        #[indexed] agent: &ManagedAddress,
    );

    #[event("resultSubmitted")]
    fn result_submitted_event(
        &self,
        #[indexed] task_id: u64,
        result_uri: &ManagedBuffer,
    );

    #[event("taskApproved")]
    fn task_approved_event(
        &self,
        #[indexed] task_id: u64,
        #[indexed] agent: &ManagedAddress,
        #[indexed] agent_payment: &BigUint,
        #[indexed] payment_token: &EgldOrEsdtTokenIdentifier,
    );

    #[event("taskCancelled")]
    fn task_cancelled_event(
        &self,
        #[indexed] task_id: u64,
    );

    #[event("taskRefunded")]
    fn task_refunded_event(
        &self,
        #[indexed] task_id: u64,
    );

    #[event("disputeOpened")]
    fn dispute_opened_event(
        &self,
        #[indexed] task_id: u64,
        reason_uri: &ManagedBuffer,
    );

    #[event("disputeResolved")]
    fn dispute_resolved_event(
        &self,
        #[indexed] task_id: u64,
        #[indexed] resolution: &DisputeResolution,
    );

    #[event("agentVerified")]
    fn agent_verified_event(
        &self,
        #[indexed] agent: &ManagedAddress,
        #[indexed] status: &VerificationStatus,
    );

    #[event("specializationAdded")]
    fn specialization_added_event(
        &self,
        #[indexed] agent: &ManagedAddress,
        specialization: &ManagedBuffer,
    );

    #[event("reputationUpdated")]
    fn reputation_updated_event(
        &self,
        #[indexed] agent: &ManagedAddress,
        #[indexed] new_score: u32,
        #[indexed] old_score: u32,
    );

    #[event("contractInitialized")]
    fn contract_initialized_event(
        &self,
        #[indexed] owner: &ManagedAddress,
        #[indexed] treasury: &ManagedAddress,
        #[indexed] fee_bps: u16,
    );

    #[event("configChanged")]
    fn config_changed_event(
        &self,
        #[indexed] changed_by: &ManagedAddress,
    );

    #[event("tokenWhitelistUpdated")]
    fn token_whitelist_updated_event(
        &self,
        #[indexed] token_identifier: &EgldOrEsdtTokenIdentifier,
        #[indexed] is_enabled: bool,
    );
}
