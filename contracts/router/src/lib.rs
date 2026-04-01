#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

// Import modules
mod types;
mod storage;
mod events;
mod admin;
mod admin_token;
mod tasks;
mod reputation;
mod reputation_v2;
mod dispute;
mod views;
mod organizations;
mod analytics;
mod multi_token;

use types::*;
use storage::*;
use events::*;

#[multiversx_sc::contract]
pub trait RouterEscrow:
    admin::AdminEndpoints<M>
    + admin_token::TokenAdminEndpoints<M>
    + tasks::TaskEndpoints<M>
    + reputation::ReputationEndpoints<M>
    + reputation_v2::ReputationEndpointsV2<M>
    + dispute::DisputeEndpoints<M>
    + views::ViewEndpoints<M>
    + organizations::OrganizationEndpoints<M>
    + analytics::AnalyticsEndpoints<M>
    + multi_token::MultiTokenEndpoints<M>
where M: ManagedTypeApi
{
    #[init]
    fn init(
        &self,
        owner: ManagedAddress,
        treasury: ManagedAddress,
        fee_bps: u16,
        min_reputation: u32,
        max_concurrent_tasks: u32,
    ) {
        require!(fee_bps <= 1000, "Fee cannot exceed 1000 bps (10%)");
        require!(min_reputation <= 1000, "Min reputation cannot exceed 1000");
        require!(max_concurrent_tasks <= 100, "Max concurrent tasks cannot exceed 100");
        
        let config = Config {
            owner: owner.clone(),
            treasury: treasury.clone(),
            fee_bps,
            resolver: None,
            paused: false,
            min_reputation,
            max_task_value: None,
            reputation_decay_rate: 100, // 1% decay per month
            emergency_pause: false,
            upgrade_proposal_threshold: 5000, // 50%
            max_concurrent_tasks,
        };
        
        // Initialize storage
        config().set(&config);
        task_counter().set(&1u64);
        
        // Emit initialization event
        contract_initialized_event(self, &owner, &treasury, fee_bps);
    }
}

// Implement the trait by combining all module implementations
pub struct RouterEscrow<M: ManagedTypeApi> {}

// ABI generation
#[allow(non_upper_case_globals)]
#[multiversx_sc::contract]
impl<M: ManagedTypeApi> RouterEscrow<M> {
    // All endpoints are automatically included from trait implementations
}
