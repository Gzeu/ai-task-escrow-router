#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;

#[multiversx_sc::module]
pub trait AnalyticsModule: crate::storage::StorageModule {
    /// Returns protocol-wide task counters and volume.
    /// Counters are maintained incrementally by tasks.rs on every state transition.
    #[view(getAnalyticsSummary)]
    fn get_analytics_summary(
        &self,
    ) -> MultiValue5<u64, u64, u64, BigUint, BigUint> {
        (
            self.total_tasks_created().get(),
            self.total_tasks_completed().get(),
            self.total_tasks_disputed().get(),
            self.total_volume().get(),
            self.total_fees_collected().get(),
        )
            .into()
    }

    /// Returns lightweight performance data for a single agent.
    #[view(getAgentAnalytics)]
    fn get_agent_analytics(
        &self,
        agent: ManagedAddress,
    ) -> MultiValue6<u64, u64, u64, u32, u32, BigUint> {
        let rep = self.agent_reputation(&agent).get();
        (
            rep.total_tasks,
            rep.completed_tasks,
            rep.disputed_tasks,
            rep.reputation_score,
            rep.performance_metrics.success_rate as u32,
            rep.total_earned,
        )
            .into()
    }

    /// Dispute rate across all tasks (basis points, 0-10000).
    #[view(getProtocolDisputeRate)]
    fn get_protocol_dispute_rate(&self) -> u64 {
        let total = self.total_tasks_created().get();
        let disputed = self.total_tasks_disputed().get();
        if total == 0 {
            return 0;
        }
        (disputed * 10000) / total
    }

    /// Completion rate across all tasks (basis points, 0-10000).
    #[view(getProtocolCompletionRate)]
    fn get_protocol_completion_rate(&self) -> u64 {
        let total = self.total_tasks_created().get();
        let completed = self.total_tasks_completed().get();
        if total == 0 {
            return 0;
        }
        (completed * 10000) / total
    }

    /// Average fee collected per completed task (in raw token units).
    #[view(getAverageFeePerTask)]
    fn get_average_fee_per_task(&self) -> BigUint {
        let completed = self.total_tasks_completed().get();
        let fees = self.total_fees_collected().get();
        if completed == 0 {
            return BigUint::zero();
        }
        fees / completed
    }
}
