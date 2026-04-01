#![no_std]

multiversx_sc::imports!();

use multiversx_sc_scenario::debug_api::*;
use crate::types::*;
use crate::RouterEscrow;

// Test scenarios for AI Task Escrow Router

#[test]
fn test_complete_task_lifecycle() {
    let mut world = world_mock();
    
    // Setup
    let owner = world.user_address("owner");
    let agent = world.user_address("agent");
    let creator = world.user_address("creator");
    
    let contract = RouterEscrow::new(
        world.current_address(),
        world.current_block_timestamp(),
    );
    
    // Initialize contract
    contract.init(
        owner,
        world.user_address("treasury"),
        100, // 1% fee
        100, // min reputation
        10,   // max concurrent tasks
    );
    
    // Step 1: Create task with EGLD
    let task_id = contract.create_task(
        ManagedBuffer::from("Test Task"),
        OptionalValue::Some(86400), // 24h deadline
        OptionalValue::Some(3600),  // 1h review timeout
        OptionalValue::None,
        OptionalValue::None,
    );
    
    // Verify task created
    let task = world.blockchain_wrapper().query_contract::<Task<_>>(
        world.current_address(),
        "getTask",
        &task_id,
    );
    assert_eq!(task.state, TaskState::Open);
    assert_eq!(task.creator, creator);
    
    // Step 2: Accept task
    world.blockchain_wrapper().execute_tx(&agent, &contract, |sc| {
        sc.accept_task(task_id);
    });
    
    // Verify task accepted
    let task = world.blockchain_wrapper().query_contract::<Task<_>>(
        world.current_address(),
        "getTask",
        &task_id,
    );
    assert_eq!(task.state, TaskState::Accepted);
    assert_eq!(task.assigned_agent, Some(agent));
    
    // Step 3: Submit result
    world.blockchain_wrapper().execute_tx(&agent, &contract, |sc| {
        sc.submit_result(task_id, ManagedBuffer::from("ipfs://result"));
    });
    
    // Verify result submitted
    let task = world.blockchain_wrapper().query_contract::<Task<_>>(
        world.current_address(),
        "getTask",
        &task_id,
    );
    assert_eq!(task.state, TaskState::Submitted);
    assert_eq!(task.result_uri, Some(ManagedBuffer::from("ipfs://result")));
    
    // Step 4: Approve task
    world.blockchain_wrapper().execute_tx(&creator, &contract, |sc| {
        sc.approve_task(task_id);
    });
    
    // Verify task approved and settled
    let task = world.blockchain_wrapper().query_contract::<Task<_>>(
        world.current_address(),
        "getTask",
        &task_id,
    );
    assert_eq!(task.state, TaskState::Approved);
}

#[test]
fn test_dispute_flow() {
    let mut world = world_mock();
    
    // Setup
    let owner = world.user_address("owner");
    let resolver = world.user_address("resolver");
    let agent = world.user_address("agent");
    let creator = world.user_address("creator");
    
    let contract = RouterEscrow::new(
        world.current_address(),
        world.current_block_timestamp(),
    );
    
    // Initialize contract with resolver
    contract.init(
        owner,
        world.user_address("treasury"),
        100, // 1% fee
        100, // min reputation
        10,   // max concurrent tasks
    );
    
    // Set resolver
    world.blockchain_wrapper().execute_tx(&owner, &contract, |sc| {
        sc.set_resolver(Some(resolver));
    });
    
    // Create and accept task
    let task_id = contract.create_task(
        ManagedBuffer::from("Disputed Task"),
        OptionalValue::Some(86400),
        OptionalValue::Some(3600),
        OptionalValue::None,
        OptionalValue::None,
    );
    
    world.blockchain_wrapper().execute_tx(&agent, &contract, |sc| {
        sc.accept_task(task_id);
    });
    
    world.blockchain_wrapper().execute_tx(&agent, &contract, |sc| {
        sc.submit_result(task_id, ManagedBuffer::from("ipfs://result"));
    });
    
    // Open dispute
    world.blockchain_wrapper().execute_tx(&creator, &contract, |sc| {
        sc.open_dispute(task_id, ManagedBuffer::from("ipfs://dispute_reason"));
    });
    
    // Verify dispute opened
    let task = world.blockchain_wrapper().query_contract::<Task<_>>(
        world.current_address(),
        "getTask",
        &task_id,
    );
    assert_eq!(task.state, TaskState::Disputed);
    
    // Resolve dispute
    world.blockchain_wrapper().execute_tx(&resolver, &contract, |sc| {
        sc.resolve_dispute(
            task_id,
            DisputeResolution::PartialRefund { agent_award_bps: 5000 }, // 50% to agent
            OptionalValue::Some(ManagedBuffer::from("x402_ref")),
        );
    });
    
    // Verify dispute resolved
    let task = world.blockchain_wrapper().query_contract::<Task<_>>(
        world.current_address(),
        "getTask",
        &task_id,
    );
    assert_eq!(task.state, TaskState::Resolved);
}

#[test]
fn test_timeout_refund_flow() {
    let mut world = world_mock();
    
    // Setup
    let owner = world.user_address("owner");
    let creator = world.user_address("creator");
    
    let contract = RouterEscrow::new(
        world.current_address(),
        world.current_block_timestamp(),
    );
    
    contract.init(
        owner,
        world.user_address("treasury"),
        100,
        100,
        10,
    );
    
    // Create task with short deadline
    let task_id = contract.create_task(
        ManagedBuffer::from("Timeout Task"),
        OptionalValue::Some(10), // 10 seconds
        OptionalValue::Some(5),
        OptionalValue::None,
        OptionalValue::None,
    );
    
    // Advance time past deadline
    world.blockchain_wrapper().set_block_timestamp(world.current_block_timestamp() + 20);
    
    // Trigger refund
    world.blockchain_wrapper().execute_tx(&creator, &contract, |sc| {
        sc.refund_expired_task(task_id);
    });
    
    // Verify task refunded
    let task = world.blockchain_wrapper().query_contract::<Task<_>>(
        world.current_address(),
        "getTask",
        &task_id,
    );
    assert_eq!(task.state, TaskState::Refunded);
}

#[test]
fn test_multi_token_payment() {
    let mut world = world_mock();
    
    // Setup
    let owner = world.user_address("owner");
    let agent = world.user_address("agent");
    let creator = world.user_address("creator");
    
    let contract = RouterEscrow::new(
        world.current_address(),
        world.current_block_timestamp(),
    );
    
    contract.init(
        owner,
        world.user_address("treasury"),
        100,
        100,
        10,
    );
    
    // Add USDC to whitelist
    world.blockchain_wrapper().execute_tx(&owner, &contract, |sc| {
        sc.add_token_to_whitelist(
            EgldOrEsdtTokenIdentifier::esdt(ManagedBuffer::from("USDC-abcdef")),
            BigUint::from(1000000u64), // 0.001 USDC
            BigUint::from(1000000000u64), // 1000 USDC
            500, // 5% discount
        );
    });
    
    // Create task with USDC payment
    world.blockchain_wrapper().execute_tx(&creator, &contract, |sc| {
        sc.create_task(
            ManagedBuffer::from("USDC Task"),
            OptionalValue::Some(86400),
            OptionalValue::Some(3600),
            OptionalValue::None,
            OptionalValue::None,
        );
    });
    
    // Verify task created with USDC
    let task = world.blockchain_wrapper().query_contract::<Task<_>>(
        world.current_address(),
        "getTask",
        &1u64,
    );
    assert_eq!(task.payment_token, EgldOrEsdtTokenIdentifier::esdt(ManagedBuffer::from("USDC-abcdef")));
}

#[test]
fn test_reputation_system() {
    let mut world = world_mock();
    
    // Setup
    let owner = world.user_address("owner");
    let agent = world.user_address("agent");
    let creator = world.user_address("creator");
    
    let contract = RouterEscrow::new(
        world.current_address(),
        world.current_block_timestamp(),
    );
    
    contract.init(
        owner,
        world.user_address("treasury"),
        100,
        100,
        10,
    );
    
    // Stake reputation
    world.blockchain_wrapper().execute_tx(&agent, &contract, |sc| {
        sc.stake_reputation(BigUint::from(1000000000000000000u64)); // 1 EGLD
    });
    
    // Create and complete task to earn reputation
    let task_id = contract.create_task(
        ManagedBuffer::from("Reputation Task"),
        OptionalValue::Some(86400),
        OptionalValue::Some(3600),
        OptionalValue::None,
        OptionalValue::None,
    );
    
    world.blockchain_wrapper().execute_tx(&agent, &contract, |sc| {
        sc.accept_task(task_id);
    });
    
    world.blockchain_wrapper().execute_tx(&agent, &contract, |sc| {
        sc.submit_result(task_id, ManagedBuffer::from("ipfs://result"));
    });
    
    world.blockchain_wrapper().execute_tx(&creator, &contract, |sc| {
        sc.approve_task(task_id);
    });
    
    // Update reputation after task completion
    world.blockchain_wrapper().execute_tx(&owner, &contract, |sc| {
        sc.update_reputation_after_task(task_id, true, 3600); // 1 hour completion
    });
    
    // Verify reputation updated
    let reputation_score = world.blockchain_wrapper().query_contract::<u32>(
        world.current_address(),
        "getAgentReputationScore",
        &agent,
    );
    assert!(reputation_score > 100); // Should have gained reputation
}

#[test]
fn test_organization_management() {
    let mut world = world_mock();
    
    // Setup
    let owner = world.user_address("owner");
    let member = world.user_address("member");
    
    let contract = RouterEscrow::new(
        world.current_address(),
        world.current_block_timestamp(),
    );
    
    contract.init(
        owner,
        world.user_address("treasury"),
        100,
        100,
        10,
    );
    
    // Create organization
    let org_id = world.blockchain_wrapper().execute_tx(&owner, &contract, |sc| {
        sc.create_organization(
            ManagedBuffer::from("Test Org"),
            ManagedBuffer::from("Test organization description"),
        )
    });
    
    // Add member
    world.blockchain_wrapper().execute_tx(&owner, &contract, |sc| {
        sc.add_org_member(
            org_id.clone(),
            member,
            OrganizationRole::Agent,
            ManagedVec::from_single_element(ManagedBuffer::from("task_execution")),
        );
    });
    
    // Verify organization created
    let org = world.blockchain_wrapper().query_contract::<Organization<_>>(
        world.current_address(),
        "getOrganization",
        &org_id,
    );
    assert_eq!(org.owner, owner);
    assert_eq!(org.member_count, 2); // Owner + new member
    
    // Verify member added
    let members = world.blockchain_wrapper().query_contract::<ManagedVec<_>>(
        world.current_address(),
        "getOrganizationMembers",
        &org_id,
    );
    assert!(members.iter().any(|m| m.address == member));
}
