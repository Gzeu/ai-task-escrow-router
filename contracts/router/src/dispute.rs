#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;

/// Dispute query module — read-only views for dispute state.
/// Write endpoints (openDispute, resolveDispute) live in tasks.rs
/// to avoid duplicate endpoint name conflicts at compile time.
#[multiversx_sc::module]
pub trait DisputeModule: crate::storage::StorageModule {
    /// Returns true if a dispute for this task_id has been resolved.
    #[view(isDisputeResolved)]
    fn is_dispute_resolved(&self, task_id: u64) -> bool {
        self.dispute_resolved(task_id).get()
    }

    /// Returns the dispute metadata URI stored on the task.
    #[view(getDisputeMetadata)]
    fn get_dispute_metadata(&self, task_id: u64) -> OptionalValue<ManagedBuffer> {
        let task = self.tasks(task_id).get();
        OptionalValue::from(task.dispute_metadata)
    }

    /// Returns the x402 settlement reference if present.
    #[view(getSettlementRef)]
    fn get_settlement_ref(&self, task_id: u64) -> OptionalValue<ManagedBuffer> {
        let task = self.tasks(task_id).get();
        OptionalValue::from(task.x402_settlement_ref)
    }
}
