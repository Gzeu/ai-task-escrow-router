#![no_std]

multiversx_sc::imports!();

use crate::types::*;

// Simplified storage using direct storage API
pub fn config<M: ManagedTypeApi>() -> Config<M> {
    M::storage_api().managed_get_boxed_bytes(&ManagedBuffer::from("config")).into_top_buffer()
}

pub fn task_counter<M: ManagedTypeApi>() -> u64 {
    M::storage_api().managed_get_boxed_bytes(&ManagedBuffer::from("task_counter")).into_top_buffer()
}

pub fn tasks<M: ManagedTypeApi>(task_id: u64) -> Task<M> {
    let key = ManagedBuffer::from(&format!("task_{}", task_id).to_be_bytes());
    M::storage_api().managed_get_boxed_bytes(&key).into_top_buffer()
}

pub fn agent_reputation<M: ManagedTypeApi>(address: &ManagedAddress<M>) -> AgentReputation<M> {
    let key = ManagedBuffer::from(&format!("reputation_{}", address.as_bytes()).to_be_bytes());
    M::storage_api().managed_get_boxed_bytes(&key).into_top_buffer()
}

pub fn agent_active_tasks<M: ManagedTypeApi>(address: &ManagedAddress<M>) -> u32 {
    let key = ManagedBuffer::from(&format!("active_tasks_{}", address.as_bytes()).to_be_bytes());
    M::storage_api().managed_get_boxed_bytes(&key).into_top_buffer()
}

pub fn dispute_votes<M: ManagedTypeApi>(task_id: u64) -> bool {
    let key = ManagedBuffer::from(&format!("dispute_votes_{}", task_id).to_be_bytes());
    M::storage_api().managed_get_boxed_bytes(&key).into_top_buffer()
}

pub fn batch_operations<M: ManagedTypeApi>() -> BatchTaskOperation<M> {
    M::storage_api().managed_get_boxed_bytes(&ManagedBuffer::from("batch_operations")).into_top_buffer()
}

pub fn agent_specializations<M: ManagedTypeApi>(address: &ManagedAddress<M>) -> ManagedBuffer<M> {
    let key = ManagedBuffer::from(&format!("specializations_{}", address.as_bytes()).to_be_bytes());
    M::storage_api().managed_get_boxed_bytes(&key).into_top_buffer()
}
