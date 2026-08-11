#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

pub trait AdminEndpoints<M: ManagedTypeApi> {
    #[endpoint(setFeeBps)]
    fn set_fee_bps(&self, fee_bps: u16);

    #[endpoint(setTreasury)]
    fn set_treasury(&self, treasury: ManagedAddress<M>);

    #[endpoint(setResolver)]
    fn set_resolver(&self, resolver: OptionalValue<ManagedAddress>);

    #[endpoint(setPaused)]
    fn set_paused(&self, paused: bool);

    #[endpoint(emergencyPause)]
    fn emergency_pause(&self);

    #[endpoint(setMaxConcurrentTasks)]
    fn set_max_concurrent_tasks(&self, max_tasks: u32);

    #[endpoint(proposeUpgrade)]
    fn propose_upgrade(
        &self,
        proposal_hash: ManagedBuffer<M>,
        voting_period: u64,
        execution_delay: u64,
    );
}

pub struct AdminEndpoints<M: ManagedTypeApi> {}

impl<M: ManagedTypeApi> AdminEndpoints<M> for RouterEscrow<M> {
    #[endpoint(setFeeBps)]
    fn set_fee_bps(&self, fee_bps: u16) {
        require!(fee_bps <= 1000, "Fee cannot exceed 1000 bps (10%)");
        let mut config = config().get();
        config.fee_bps = fee_bps;
        config().set(&config);
        
        config_changed_event(self);
    }

    #[endpoint(setTreasury)]
    fn set_treasury(&self, treasury: ManagedAddress<M>) {
        let mut config = config().get();
        config.treasury = treasury;
        config().set(&config);
        
        config_changed_event(self);
    }

    #[endpoint(setResolver)]
    fn set_resolver(&self, resolver: OptionalValue<ManagedAddress>) {
        let mut config = config().get();
        config.resolver = resolver.into_option();
        config().set(&config);
        
        config_changed_event(self);
    }

    #[endpoint(setPaused)]
    fn set_paused(&self, paused: bool) {
        let mut config = config().get();
        config.paused = paused;
        config().set(&config);
        
        config_changed_event(self);
    }

    #[endpoint(emergencyPause)]
    fn emergency_pause(&self) {
        let mut config = config().get();
        config.emergency_pause = true;
        config().set(&config);
        
        config_changed_event(self);
    }

    #[endpoint(setMaxConcurrentTasks)]
    fn set_max_concurrent_tasks(&self, max_tasks: u32) {
        require!(max_tasks <= 100, "Max concurrent tasks cannot exceed 100");
        
        let mut config = config().get();
        config.max_concurrent_tasks = max_tasks;
        config().set(&config);
        
        config_changed_event(self);
    }

    #[endpoint(proposeUpgrade)]
    fn propose_upgrade(
        &self,
        proposal_hash: ManagedBuffer<M>,
        voting_period: u64,
        execution_delay: u64,
    ) {
        let config = config().get();
        
        // In a real implementation, this would create a governance proposal
        // For now, we just emit an event
        upgrade_proposed_event(self, proposal_hash, voting_period, execution_delay);
    }
}
