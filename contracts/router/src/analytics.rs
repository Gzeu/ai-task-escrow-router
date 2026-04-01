#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct TaskStatistics {
    pub total_tasks: u64,
    pub completed_tasks: u64,
    pub cancelled_tasks: u64,
    pub disputed_tasks: u64,
    pub total_volume: BigUint<u32>, // Using u32 for simplicity
    pub average_task_value: BigUint<u32>,
    pub most_active_agent: Option<ManagedAddress<u32>>,
    pub peak_daily_tasks: u64,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct AgentPerformance {
    pub address: ManagedAddress<u32>,
    pub reputation_score: u32,
    pub success_rate: u16,
    pub average_completion_time: u64,
    pub total_earned: BigUint<u32>,
    pub tasks_completed_last_30d: u64,
    pub specialization_count: u32,
}

pub trait AnalyticsEndpoints<M: ManagedTypeApi> {
    #[endpoint(getTaskStatistics)]
    fn get_task_statistics(&self) -> TaskStatistics;

    #[endpoint(getAgentPerformance)]
    fn get_agent_performance(&self, agent: ManagedAddress<M>) -> AgentPerformance;

    #[endpoint(getTopPerformingAgents)]
    fn get_top_performing_agents(&self, count: u32) -> ManagedVec<M, AgentPerformance>;

    #[endpoint(getRevenueMetrics)]
    fn get_revenue_metrics(&self, period_days: u32) -> ManagedVec<M, ManagedBuffer<M>>;

    #[endpoint(updateTaskStatistics)]
    fn update_task_statistics(&self, task_id: u64, old_state: TaskState, new_state: TaskState);
}

impl<M: ManagedTypeApi> AnalyticsEndpoints<M> for RouterEscrow<M> {
    fn require_not_paused(&self) {
        let config = config().get();
        require!(!config.paused && !config.emergency_pause, "Contract is paused");
    }

    #[endpoint(getTaskStatistics)]
    fn get_task_statistics(&self) -> TaskStatistics {
        self.require_not_paused();
        
        // This would need to aggregate data from storage
        // For now, return default statistics
        TaskStatistics {
            total_tasks: task_counter().get() - 1, // Subtract 1 for init
            completed_tasks: 0,
            cancelled_tasks: 0,
            disputed_tasks: 0,
            total_volume: BigUint::from(0u64),
            average_task_value: BigUint::from(0u64),
            most_active_agent: None,
            peak_daily_tasks: 0,
        }
    }

    #[endpoint(getAgentPerformance)]
    fn get_agent_performance(&self, agent: ManagedAddress<M>) -> AgentPerformance {
        self.require_not_paused();
        
        let reputation = agent_reputation(&agent).get();
        let stake = agent_stake(&agent).get();
        
        AgentPerformance {
            address: agent,
            reputation_score: reputation.reputation_score,
            success_rate: reputation.performance_metrics.success_rate,
            average_completion_time: reputation.performance_metrics.average_completion_time,
            total_earned: reputation.total_earned,
            tasks_completed_last_30d: reputation.performance_metrics.tasks_completed_last_30d,
            specialization_count: reputation.specialization.len() as u32,
        }
    }

    #[endpoint(getTopPerformingAgents)]
    fn get_top_performing_agents(&self, count: u32) -> ManagedVec<M, AgentPerformance> {
        self.require_not_paused();
        
        let mut top_agents = ManagedVec::new();
        
        // This would need to iterate through all agents and sort by performance
        // For now, return empty vector
        top_agents
    }

    #[endpoint(getRevenueMetrics)]
    fn get_revenue_metrics(&self, period_days: u32) -> ManagedVec<M, ManagedBuffer<M>> {
        self.require_not_paused();
        
        let mut metrics = ManagedVec::new();
        
        // Calculate different revenue metrics
        let current_time = self.blockchain().get_block_timestamp();
        let period_start = current_time - (period_days * 86400) as u64;
        
        // Total revenue in period
        metrics.push(ManagedBuffer::from(&format!(
            "total_revenue_{}d: {}",
            period_days, "0"
        )));
        
        // Average daily revenue
        metrics.push(ManagedBuffer::from(&format!(
            "avg_daily_revenue_{}d: {}",
            period_days, "0"
        )));
        
        // Revenue by token type
        metrics.push(ManagedBuffer::from("revenue_by_egld: 0"));
        metrics.push(ManagedBuffer::from("revenue_by_esdt: 0"));
        
        // Growth metrics
        metrics.push(ManagedBuffer::from(&format!(
            "revenue_growth_{}d: 0.0%",
            period_days
        )));
        
        metrics
    }

    #[endpoint(updateTaskStatistics)]
    fn update_task_statistics(&self, task_id: u64, old_state: TaskState, new_state: TaskState) {
        self.require_not_paused();
        
        // Update statistics based on state transitions
        match (old_state, new_state) {
            (TaskState::Open, TaskState::Accepted) => {
                // Task was accepted - update active tasks count
            },
            (TaskState::Accepted, TaskState::Submitted) => {
                // Task was submitted - update completion metrics
            },
            (TaskState::Submitted, TaskState::Approved) => {
                // Task was approved - update revenue and completion metrics
            },
            (TaskState::Open, TaskState::Cancelled) => {
                // Task was cancelled - update cancellation metrics
            },
            (TaskState::Submitted, TaskState::Disputed) => {
                // Task was disputed - update dispute metrics
            },
            _ => {
                // Other transitions
            }
        }
        
        // Store updated statistics
        let stats_key = ManagedBuffer::from("task_statistics");
        let current_stats = task_statistics().get();
        
        // Update the statistics (simplified for now)
        let updated_stats = TaskStatistics {
            total_tasks: current_stats.total_tasks,
            completed_tasks: if new_state == TaskState::Approved {
                current_stats.completed_tasks + 1
            } else {
                current_stats.completed_tasks
            },
            cancelled_tasks: if new_state == TaskState::Cancelled {
                current_stats.cancelled_tasks + 1
            } else {
                current_stats.cancelled_tasks
            },
            disputed_tasks: if new_state == TaskState::Disputed {
                current_stats.disputed_tasks + 1
            } else {
                current_stats.disputed_tasks
            },
            total_volume: current_stats.total_volume,
            average_task_value: current_stats.average_task_value,
            most_active_agent: current_stats.most_active_agent,
            peak_daily_tasks: current_stats.peak_daily_tasks,
        };
        
        // This would need proper serialization and storage
        // For now, just emit an event
        task_statistics_updated_event(self, task_id, old_state, new_state);
    }
}

#[event("taskStatisticsUpdated")]
pub fn task_statistics_updated_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] task_id: u64,
    #[indexed] old_state: TaskState,
    #[indexed] new_state: TaskState,
) {
}
