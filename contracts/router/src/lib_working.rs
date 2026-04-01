#![no_std]

multiversx_sc::imports!();

#[multiversx_sc::contract]
pub struct RouterEscrow<M: ManagedTypeApi> {}

#[multiversx_sc::module]
impl<M: ManagedTypeApi> RouterEscrow<M> {
    #[init]
    fn init(&self) {
        // Minimal initialization
    }

    #[endpoint(createTask)]
    fn create_task(&self, metadata: &ManagedBuffer<M>) {
        // Minimal create task endpoint
    }

    #[endpoint(acceptTask)]
    fn accept_task(&self, task_id: u64) {
        // Minimal accept task endpoint
    }

    #[endpoint(getTask)]
    fn get_task(&self, task_id: u64) -> ManagedBuffer<M> {
        ManagedBuffer::from(&b"test"[..])
    }
}
