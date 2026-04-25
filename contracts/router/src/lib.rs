#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

// Core modules
mod types;
mod storage;
mod events;
mod admin;
mod admin_token;
mod tasks;
mod reputation_v2;
mod dispute;
mod views;
mod organizations;
mod analytics;
mod multi_token;
mod gas_optimization;

// Extended protocol modules (audit before enabling)
// mod ecosystem_integration;
// mod enhanced_protocol;
// mod enterprise_features;
// mod production_ready;

use types::*;
use storage::*;
use events::*;

#[multiversx_sc::contract]
pub trait RouterEscrow:
    admin::AdminEndpoints<M>
    + admin_token::TokenAdminEndpoints<M>
    + tasks::TaskEndpoints<M>
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

        config().set(&config);
        task_counter().set(&1u64);

        contract_initialized_event(self, &owner, &treasury, fee_bps);
    }

    #[upgrade]
    fn upgrade(&self) {}
}
