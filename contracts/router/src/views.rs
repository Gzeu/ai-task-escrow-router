#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::RouterEscrow;

pub trait ViewEndpoints<M: ManagedTypeApi> {
    #[endpoint(getTask)]
    fn get_task(&self, task_id: u64) -> Task<M>;

    #[endpoint(getTaskCount)]
    fn get_task_count(&self) -> u64;

    #[endpoint(getConfig)]
    fn get_config(&self) -> Config<M>;

    #[endpoint(getAgentReputation)]
    fn get_agent_reputation(&self, address: ManagedAddress<M>) -> AgentReputation<M>;

    #[endpoint(getX402Ref)]
    fn get_x402_ref(&self, task_id: u64) -> OptionalValue<ManagedBuffer<M>>;
}

pub struct ViewEndpoints<M: ManagedTypeApi> {}

impl<M: ManagedTypeApi> ViewEndpoints<M> for RouterEscrow<M> {
    #[endpoint(getTask)]
    fn get_task(&self, task_id: u64) -> Task<M> {
        tasks(task_id).get()
    }

    #[endpoint(getTaskCount)]
    fn get_task_count(&self) -> u64 {
        task_counter().get()
    }

    #[endpoint(getConfig)]
    fn get_config(&self) -> Config<M> {
        config().get()
    }

    #[endpoint(getAgentReputation)]
    fn get_agent_reputation(&self, address: ManagedAddress<M>) -> AgentReputation<M> {
        agent_reputation(address).get()
    }

    #[endpoint(getX402Ref)]
    fn get_x402_ref(&self, task_id: u64) -> OptionalValue<ManagedBuffer<M>> {
        let task = tasks(task_id).get();
        OptionalValue::from(task.x402_settlement_ref)
    }
}
