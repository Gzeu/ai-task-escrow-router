#![no_std]

multiversx_sc::imports!();

use crate::types::*;

// ── Core config ────────────────────────────────────────────────────────────

#[storage_mapper("config")]
pub fn config<SA: StorageMapperApi>() -> SingleValueMapper<SA, Config<SA>>;

#[storage_mapper("task_counter")]
pub fn task_counter<SA: StorageMapperApi>() -> SingleValueMapper<SA, u64>;

// ── Task storage ────────────────────────────────────────────────────────────

#[storage_mapper("tasks")]
pub fn tasks<SA: StorageMapperApi>(task_id: u64) -> SingleValueMapper<SA, Task<SA>>;

// ── Agent storage ───────────────────────────────────────────────────────────

#[storage_mapper("agent_reputation")]
pub fn agent_reputation<SA: StorageMapperApi>(
    address: &ManagedAddress<SA>,
) -> SingleValueMapper<SA, AgentReputation<SA>>;

#[storage_mapper("agent_active_tasks")]
pub fn agent_active_tasks<SA: StorageMapperApi>(
    address: &ManagedAddress<SA>,
) -> SingleValueMapper<SA, u32>;

#[storage_mapper("agent_stake")]
pub fn agent_stake<SA: StorageMapperApi>(
    address: &ManagedAddress<SA>,
) -> SingleValueMapper<SA, BigUint<SA>>;

#[storage_mapper("agent_specializations")]
pub fn agent_specializations<SA: StorageMapperApi>(
    address: &ManagedAddress<SA>,
) -> UnorderedSetMapper<SA, ManagedBuffer<SA>>;

// ── Token whitelist ─────────────────────────────────────────────────────────

#[storage_mapper("token_whitelist")]
pub fn token_whitelist<SA: StorageMapperApi>(
) -> SingleValueMapper<SA, ManagedVec<SA, TokenWhitelistEntry<SA>>>;

// ── Dispute ─────────────────────────────────────────────────────────────────

#[storage_mapper("dispute_resolved")]
pub fn dispute_resolved<SA: StorageMapperApi>(task_id: u64) -> SingleValueMapper<SA, bool>;

// ── Organizations ────────────────────────────────────────────────────────────

#[storage_mapper("org_members")]
pub fn organization_members<SA: StorageMapperApi>(
    org_id: &ManagedBuffer<SA>,
) -> UnorderedSetMapper<SA, ManagedAddress<SA>>;

#[storage_mapper("org_ids")]
pub fn organization_ids<SA: StorageMapperApi>() -> UnorderedSetMapper<SA, ManagedBuffer<SA>>;

// ── Analytics ────────────────────────────────────────────────────────────────

#[storage_mapper("total_tasks_created")]
pub fn total_tasks_created<SA: StorageMapperApi>() -> SingleValueMapper<SA, u64>;

#[storage_mapper("total_tasks_completed")]
pub fn total_tasks_completed<SA: StorageMapperApi>() -> SingleValueMapper<SA, u64>;

#[storage_mapper("total_tasks_disputed")]
pub fn total_tasks_disputed<SA: StorageMapperApi>() -> SingleValueMapper<SA, u64>;

#[storage_mapper("total_volume")]
pub fn total_volume<SA: StorageMapperApi>() -> SingleValueMapper<SA, BigUint<SA>>;

#[storage_mapper("total_fees_collected")]
pub fn total_fees_collected<SA: StorageMapperApi>() -> SingleValueMapper<SA, BigUint<SA>>;

// ── Reputation pending updates ───────────────────────────────────────────────

#[storage_mapper("reputation_updates")]
pub fn reputation_updates<SA: StorageMapperApi>(
) -> SingleValueMapper<SA, ManagedVec<SA, AgentReputationUpdate<SA>>>;
