#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

pub trait ReputationEndpointsV2<M: ManagedTypeApi> {
    #[endpoint(updateReputationAfterTask)]
    fn update_reputation_after_task(
        &self,
        task_id: u64,
        success: bool,
        completion_time: u64,
    );

    #[endpoint(getTopAgents)]
    fn get_top_agents(&self, count: u32) -> ManagedVec<M, AgentReputation<M>>;

    #[endpoint(stakeReputation)]
    fn stake_reputation(&self, amount: BigUint<M>);

    #[endpoint(unstakeReputation)]
    fn unstake_reputation(&self, amount: BigUint<M>);

    #[endpoint(slashReputation)]
    fn slash_reputation(&self, agent: ManagedAddress<M>, amount: BigUint<M>);

    #[endpoint(getAgentReputationScore)]
    fn get_agent_reputation_score(&self, address: ManagedAddress<M>) -> u32;
}

impl<M: ManagedTypeApi> ReputationEndpointsV2<M> for RouterEscrow<M> {
    fn require_not_paused(&self) {
        let config = config().get();
        require!(!config.paused && !config.emergency_pause, "Contract is paused");
    }

    #[endpoint(updateReputationAfterTask)]
    fn update_reputation_after_task(
        &self,
        task_id: u64,
        success: bool,
        completion_time: u64,
    ) {
        self.require_not_paused();
        
        let task = tasks(task_id).get();
        let agent = task.assigned_agent.unwrap_or_else(|| ManagedAddress::zero());
        
        require!(agent != ManagedAddress::zero(), "Task has no assigned agent");
        
        let mut reputation = agent_reputation(&agent).get();
        let old_score = reputation.reputation_score;
        
        // Update task counters
        reputation.total_tasks += 1;
        if success {
            reputation.completed_tasks += 1;
        } else {
            reputation.disputed_tasks += 1;
        }
        
        // Calculate performance metrics
        let current_time = self.blockchain().get_block_timestamp();
        let task_duration = if completion_time > 0 {
            completion_time - task.created_at
        } else {
            current_time - task.created_at
        };
        
        // Update average completion time
        let total_completed = reputation.completed_tasks;
        reputation.performance_metrics.average_completion_time = 
            (reputation.performance_metrics.average_completion_time * (total_completed - 1) + task_duration) / total_completed;
        
        // Calculate success rate (weight: 0.4)
        let success_rate = if reputation.total_tasks > 0 {
            (reputation.completed_tasks * 10000) / reputation.total_tasks
        } else {
            0
        };
        
        // Calculate speed score (weight: 0.3) - lower is better
        let speed_score = if task_duration > 0 {
            // Normalize to 0-10000 range (faster = higher score)
            let expected_duration = 86400; // 24 hours
            if task_duration <= expected_duration {
                10000
            } else {
                (expected_duration * 10000) / task_duration
            }
        } else {
            0
        };
        
        // Calculate volume score (weight: 0.3) - based on total earned
        let volume_score = if reputation.total_earned > 0 {
            // Logarithmic scale to prevent domination
            let log_earned = self.log(&reputation.total_earned);
            (log_earned * 1000) as u32
        } else {
            0
        };
        
        // Calculate new reputation score
        let new_score = (success_rate * 40 + speed_score * 30 + volume_score * 30) / 100;
        
        // Apply reputation decay if inactive
        let inactivity_period = current_time - reputation.last_active;
        let decay_threshold = 30 * 86400; // 30 days
        if inactivity_period > decay_threshold {
            let config = config().get();
            let decay_rate = config.reputation_decay_rate;
            let decay_amount = (new_score * decay_rate) / 10000;
            reputation.reputation_score = new_score - decay_amount;
        } else {
            reputation.reputation_score = new_score;
        }
        
        reputation.last_active = current_time;
        
        // Update performance metrics
        reputation.performance_metrics.success_rate = (success_rate / 100) as u16;
        reputation.performance_metrics.dispute_rate = 
            ((reputation.disputed_tasks * 10000) / reputation.total_tasks / 100) as u16;
        
        agent_reputation(&agent).set(&reputation);
        
        reputation_updated_event(self, &agent, reputation.reputation_score, old_score);
    }

    #[endpoint(getTopAgents)]
    fn get_top_agents(&self, count: u32) -> ManagedVec<M, AgentReputation<M>> {
        let mut all_agents = ManagedVec::new();
        
        // This would need to iterate through all reputation entries
        // For now, return empty vector - implementation would need storage iteration
        all_agents
    }

    #[endpoint(stakeReputation)]
    fn stake_reputation(&self, amount: BigUint<M>) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        require!(amount > 0, "Stake amount must be greater than 0");
        
        let current_stake = agent_stake(&caller).get();
        let new_stake = &current_stake + &amount;
        
        agent_stake(&caller).set(&new_stake);
    }

    #[endpoint(unstakeReputation)]
    fn unstake_reputation(&self, amount: BigUint<M>) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        require!(amount > 0, "Unstake amount must be greater than 0");
        
        let current_stake = agent_stake(&caller).get();
        require!(current_stake >= amount, "Insufficient staked amount");
        
        let new_stake = &current_stake - &amount;
        
        // Return unstaked amount
        self.send().direct(
            &caller,
            &EgldOrEsdtTokenIdentifier::egld(),
            0,
            &amount,
            "Reputation unstaked"
        );
        
        agent_stake(&caller).set(&new_stake);
    }

    #[endpoint(slashReputation)]
    fn slash_reputation(&self, agent: ManagedAddress<M>, amount: BigUint<M>) {
        self.require_not_paused();
        
        let config = config().get();
        let caller = self.blockchain().get_caller();
        require!(caller == config.owner || caller == config.resolver.unwrap_or_else(|| ManagedAddress::zero()), 
                 "Only owner or resolver can slash");
        
        let current_stake = agent_stake(&agent).get();
        require!(current_stake >= amount, "Insufficient staked amount to slash");
        
        let new_stake = &current_stake - &amount;
        
        // Transfer slashed amount to treasury
        self.send().direct(
            &config.treasury,
            &EgldOrEsdtTokenIdentifier::egld(),
            0,
            &amount,
            "Reputation slashed"
        );
        
        agent_stake(&agent).set(&new_stake);
    }

    #[endpoint(getAgentReputationScore)]
    fn get_agent_reputation_score(&self, address: ManagedAddress<M>) -> u32 {
        let reputation = agent_reputation(&address).get();
        reputation.reputation_score
    }

    // Helper function for logarithmic calculation
    fn log(&self, value: &BigUint<M>) -> BigUint<M> {
        // Simple logarithm approximation for volume scoring
        if value == &0u64 {
            return BigUint::from(0u64);
        }
        
        let mut result = BigUint::from(0u64);
        let mut temp = value.clone();
        let mut count = 0u32;
        
        while temp > &1u64 {
            temp /= 2u64;
            count += 1;
        }
        
        result += count;
        result
    }
}
