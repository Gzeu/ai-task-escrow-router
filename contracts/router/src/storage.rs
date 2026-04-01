#![no_std]

multiversx_sc::imports!();

use crate::types::*;

// Simplified storage using direct storage API
pub fn config<M: ManagedTypeApi>() -> SingleValueMapper<Config<M>> {
    SingleValueMapper::new("config")
}

pub fn task_counter<M: ManagedTypeApi>() -> SingleValueMapper<u64> {
    SingleValueMapper::new("task_counter")
}

pub fn tasks<M: ManagedTypeApi>(task_id: u64) -> SingleValueMapper<Task<M>> {
    let key = format!("task_{}", task_id);
    SingleValueMapper::new(&key)
}

pub fn agent_reputation<M: ManagedTypeApi>(address: &ManagedAddress<M>) -> SingleValueMapper<AgentReputation<M>> {
    let key = format!("reputation_{}", address.as_hex());
    SingleValueMapper::new(&key)
}

pub fn agent_active_tasks<M: ManagedTypeApi>(address: &ManagedAddress<M>) -> SingleValueMapper<u32> {
    let key = format!("active_tasks_{}", address.as_hex());
    SingleValueMapper::new(&key)
}

pub fn dispute_votes<M: ManagedTypeApi>(task_id: u64) -> SingleValueMapper<bool> {
    let key = format!("dispute_votes_{}", task_id);
    SingleValueMapper::new(&key)
}

pub fn batch_operations<M: ManagedTypeApi>() -> SingleValueMapper<BatchTaskOperation<M>> {
    SingleValueMapper::new("batch_operations")
}

pub fn agent_specializations<M: ManagedTypeApi>(address: &ManagedAddress<M>) -> SingleValueMapper<ManagedBuffer<M>> {
    let key = format!("specializations_{}", address.as_hex());
    SingleValueMapper::new(&key)
}

// ESDT Multi-Token storage
pub fn token_whitelist<M: ManagedTypeApi>() -> SingleValueMapper<ManagedVec<M, TokenWhitelistEntry<M>>> {
    SingleValueMapper::new("token_whitelist")
}

pub fn agent_stake<M: ManagedTypeApi>(address: &ManagedAddress<M>) -> SingleValueMapper<BigUint<M>> {
    let key = format!("stake_{}", address.as_hex());
    SingleValueMapper::new(&key)
}

pub fn reputation_updates<M: ManagedTypeApi>() -> SingleValueMapper<ManagedVec<M, AgentReputationUpdate<M>>> {
    SingleValueMapper::new("reputation_updates")
}

// Organization storage
pub fn organizations<M: ManagedTypeApi>() -> SingleValueMapper<ManagedVec<M, ManagedBuffer<M>>> {
    SingleValueMapper::new("organizations")
}

pub fn organization_members<M: ManagedTypeApi>(org_id: &ManagedBuffer<M>) -> SingleValueMapper<ManagedVec<M, ManagedAddress<M>>> {
    let key = format!("org_members_{}", org_id.as_hex());
    SingleValueMapper::new(&key)
}

// Analytics storage
pub fn task_statistics<M: ManagedTypeApi>() -> SingleValueMapper<ManagedVec<M, ManagedBuffer<M>>> {
    SingleValueMapper::new("task_statistics")
}

pub fn agent_performance<M: ManagedTypeApi>(address: &ManagedAddress<M>) -> SingleValueMapper<ManagedBuffer<M>> {
    let key = format!("performance_{}", address.as_hex());
    SingleValueMapper::new(&key)
}
