#![no_std]

multiversx_sc::imports!();

#[multiversx_sc::contract]
pub trait RouterEscrowMinimal {
    #[init]
    fn init(&self, owner: ManagedAddress) {
        // Simple initialization
    }

    #[endpoint(getVersion)]
    fn get_version(&self) -> ManagedBuffer {
        ManagedBuffer::from("1.0.0")
    }
}

pub struct RouterEscrowMinimal;
impl<M: ManagedTypeApi> RouterEscrowMinimal for RouterEscrowMinimal<M> {}
