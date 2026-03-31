#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

pub trait ReputationEndpoints<M: ManagedTypeApi> {
    #[endpoint(updateAgentReputation)]
    fn update_agent_reputation(&self, updates: ManagedVec<M, AgentReputationUpdate<M>>);

    #[endpoint(verifyAgent)]
    fn verify_agent(&self, specialization: ManagedBuffer<M>);
}

pub struct ReputationEndpoints<M: ManagedTypeApi> {}

impl<M: ManagedTypeApi> ReputationEndpoints<M> for RouterEscrow<M> {
    #[endpoint(updateAgentReputation)]
    fn update_agent_reputation(&self, updates: ManagedVec<M, AgentReputationUpdate<M>>) {
        let config = config().get();
        
        for update in updates {
            let mut reputation = agent_reputation(&update.address).get();
            
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
            
            agent_reputation(&update.address).set(&reputation);
        }
    }

    #[endpoint(verifyAgent)]
    fn verify_agent(&self, specialization: ManagedBuffer<M>) {
        let caller = self.blockchain().get_caller();
        let mut reputation = agent_reputation(&caller).get();
        
        // Check if agent is already verified
        require!(
            reputation.verification_status != VerificationStatus::Suspended,
            "Agent is suspended"
        );
        
        // Add specialization
        agent_specializations(&caller).insert(specialization);
        
        // Mark as verified (in real implementation, this would require off-chain verification)
        reputation.verification_status = VerificationStatus::Pending;
        
        agent_reputation(&caller).set(&reputation);
        agent_verified_event(self, &caller, &VerificationStatus::Pending);
        specialization_added_event(self, &caller, &specialization);
    }
}
