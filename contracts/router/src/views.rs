#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;

#[multiversx_sc::module]
pub trait ViewsModule: crate::storage::StorageModule {
    /// Get full task data by ID.
    #[view(getTask)]
    fn get_task(&self, task_id: u64) -> Task<Self::Api> {
        self.tasks(task_id).get()
    }

    /// Total tasks ever created (task_counter - 1).
    #[view(getTaskCount)]
    fn get_task_count(&self) -> u64 {
        let counter = self.task_counter().get();
        if counter > 0 { counter - 1 } else { 0 }
    }

    /// Current task state only — cheaper than fetching full Task.
    #[view(getTaskState)]
    fn get_task_state(&self, task_id: u64) -> TaskState {
        self.tasks(task_id).get().state
    }

    /// Full protocol config.
    #[view(getConfig)]
    fn get_config(&self) -> Config<Self::Api> {
        self.config().get()
    }

    /// Agent reputation profile.
    #[view(getAgentReputation)]
    fn get_agent_reputation(&self, address: ManagedAddress) -> AgentReputation<Self::Api> {
        self.agent_reputation(&address).get()
    }

    /// How many concurrent tasks an agent is currently running.
    #[view(getAgentActiveTasks)]
    fn get_agent_active_tasks(&self, address: ManagedAddress) -> u32 {
        self.agent_active_tasks(&address).get()
    }

    /// Agent staked amount.
    #[view(getAgentStake)]
    fn get_agent_stake(&self, address: ManagedAddress) -> BigUint {
        self.agent_stake(&address).get()
    }

    /// Protocol-wide stats derived from analytics storage.
    #[view(getProtocolStats)]
    fn get_protocol_stats(&self) -> MultiValue5<u64, u64, u64, BigUint, BigUint> {
        (
            self.total_tasks_created().get(),
            self.total_tasks_completed().get(),
            self.total_tasks_disputed().get(),
            self.total_volume().get(),
            self.total_fees_collected().get(),
        )
            .into()
    }

    /// x402 settlement ref for a task.
    #[view(getX402Ref)]
    fn get_x402_ref(&self, task_id: u64) -> OptionalValue<ManagedBuffer> {
        OptionalValue::from(self.tasks(task_id).get().x402_settlement_ref)
    }

    /// Check if a task deadline has passed (useful for bots/agents polling).
    #[view(isTaskExpired)]
    fn is_task_expired(&self, task_id: u64) -> bool {
        let task = self.tasks(task_id).get();
        match task.deadline {
            Some(deadline) => self.blockchain().get_block_timestamp() > deadline,
            None => false,
        }
    }

    /// Check if review window has passed for a submitted task.
    #[view(isReviewWindowExpired)]
    fn is_review_window_expired(&self, task_id: u64) -> bool {
        let task = self.tasks(task_id).get();
        if task.state != TaskState::Submitted {
            return false;
        }
        let review_start = task
            .submitted_at
            .or(task.accepted_at)
            .unwrap_or(task.created_at);
        let window = task.review_timeout.unwrap_or(86400u64);
        self.blockchain().get_block_timestamp() > review_start + window
    }
}
