use multiversx_sc_scenario::*;
use router_escrow::*;

fn world() -> ScenarioWorld {
    let mut world = ScenarioWorld::new();
    world.set_current_dir("tests");

    world.register_contract_builder(
        "file:output/router-escrow.wasm",
        router_escrow::ContractBuilder,
    );

    world
}

#[test]
fn task_creation_and_approval_flow() {
    let mut world = world();
    
    let owner_addr = Address::from("erd1...");
    let treasury_addr = Address::from("erd1...");
    let creator_addr = Address::from("erd1...");
    let agent_addr = Address::from("erd1...");

    // Initialize contract
    world
        .tx()
        .from(owner_addr.clone())
        .to(router_escrow::contract_obj())
        .init(100u16) // 1% fee
        .assert_ok();

    // Create task
    let task_id = world
        .tx()
        .from(creator_addr.clone())
        .to(router_escrow::contract_obj())
        .egld(1000u64)
        .create_task(
            ManagedBuffer::from("ipfs://QmTaskMetadata"),
            Some(1000000u64), // deadline
            Some(864000u64),  // review timeout
            None, // AP2 mandate hash
        )
        .returns(ReturnsNewAddress)
        .assert_ok();

    // Accept task
    world
        .tx()
        .from(agent_addr.clone())
        .to(router_escrow::contract_obj())
        .accept_task(task_id)
        .assert_ok();

    // Submit result
    world
        .tx()
        .from(agent_addr.clone())
        .to(router_escrow::contract_obj())
        .submit_result(
            task_id,
            ManagedBuffer::from("ipfs://QmTaskResult")
        )
        .assert_ok();

    // Approve task
    world
        .tx()
        .from(creator_addr.clone())
        .to(router_escrow::contract_obj())
        .approve_task(task_id)
        .assert_ok();

    // Verify task state
    let task = world
        .query()
        .to(router_escrow::contract_obj())
        .get_task(task_id)
        .returns(Task::<DebugApi>::new_instance())
        .assert_ok();

    assert_eq!(task.state, TaskState::Approved);
}

#[test]
fn dispute_resolution_flow() {
    let mut world = world();
    
    let owner_addr = Address::from("erd1...");
    let treasury_addr = Address::from("erd1...");
    let creator_addr = Address::from("erd1...");
    let agent_addr = Address::from("erd1...");
    let resolver_addr = Address::from("erd1...");

    // Initialize contract
    world
        .tx()
        .from(owner_addr.clone())
        .to(router_escrow::contract_obj())
        .init(100u16) // 1% fee
        .assert_ok();

    // Set resolver
    world
        .tx()
        .from(owner_addr.clone())
        .to(router_escrow::contract_obj())
        .set_resolver(Some(resolver_addr.clone()))
        .assert_ok();

    // Create and accept task
    let task_id = world
        .tx()
        .from(creator_addr.clone())
        .to(router_escrow::contract_obj())
        .egld(1000u64)
        .create_task(
            ManagedBuffer::from("ipfs://QmTaskMetadata"),
            None,
            None,
            None,
        )
        .returns(ReturnsNewAddress)
        .assert_ok();

    world
        .tx()
        .from(agent_addr.clone())
        .to(router_escrow::contract_obj())
        .accept_task(task_id)
        .assert_ok();

    world
        .tx()
        .from(agent_addr.clone())
        .to(router_escrow::contract_obj())
        .submit_result(
            task_id,
            ManagedBuffer::from("ipfs://QmTaskResult")
        )
        .assert_ok();

    // Open dispute
    world
        .tx()
        .from(creator_addr.clone())
        .to(router_escrow::contract_obj())
        .open_dispute(
            task_id,
            ManagedBuffer::from("ipfs://QmDisputeReason")
        )
        .assert_ok();

    // Resolve dispute with partial refund
    world
        .tx()
        .from(resolver_addr.clone())
        .to(router_escrow::contract_obj())
        .resolve_dispute(
            task_id,
            DisputeResolution::PartialRefund { agent_award_bps: 5000 }, // 50% to agent
            None,
        )
        .assert_ok();

    // Verify task state
    let task = world
        .query()
        .to(router_escrow::contract_obj())
        .get_task(task_id)
        .returns(Task::<DebugApi>::new_instance())
        .assert_ok();

    assert_eq!(task.state, TaskState::Resolved);
}

#[test]
fn task_cancellation_flow() {
    let mut world = world();
    
    let owner_addr = Address::from("erd1...");
    let creator_addr = Address::from("erd1...");

    // Initialize contract
    world
        .tx()
        .from(owner_addr.clone())
        .to(router_escrow::contract_obj())
        .init(100u16)
        .assert_ok();

    // Create task
    let task_id = world
        .tx()
        .from(creator_addr.clone())
        .to(router_escrow::contract_obj())
        .egld(1000u64)
        .create_task(
            ManagedBuffer::from("ipfs://QmTaskMetadata"),
            None,
            None,
            None,
        )
        .returns(ReturnsNewAddress)
        .assert_ok();

    // Cancel task
    world
        .tx()
        .from(creator_addr.clone())
        .to(router_escrow::contract_obj())
        .cancel_task(task_id)
        .assert_ok();

    // Verify task state
    let task = world
        .query()
        .to(router_escrow::contract_obj())
        .get_task(task_id)
        .returns(Task::<DebugApi>::new_instance())
        .assert_ok();

    assert_eq!(task.state, TaskState::Cancelled);
}

#[test]
fn expired_task_refund_flow() {
    let mut world = world();
    
    let owner_addr = Address::from("erd1...");
    let creator_addr = Address::from("erd1...");
    let agent_addr = Address::from("erd1...");

    // Initialize contract
    world
        .tx()
        .from(owner_addr.clone())
        .to(router_escrow::contract_obj())
        .init(100u16)
        .assert_ok();

    // Create task with short deadline
    let task_id = world
        .tx()
        .from(creator_addr.clone())
        .to(router_escrow::contract_obj())
        .egld(1000u64)
        .create_task(
            ManagedBuffer::from("ipfs://QmTaskMetadata"),
            Some(1000u64), // 1 second deadline
            None,
            None,
        )
        .returns(ReturnsNewAddress)
        .assert_ok();

    // Accept task
    world
        .tx()
        .from(agent_addr.clone())
        .to(router_escrow::contract_obj())
        .accept_task(task_id)
        .assert_ok();

    // Advance time past deadline
    world.set_block_timestamp(2000u64);

    // Refund expired task
    world
        .tx()
        .from(creator_addr.clone())
        .to(router_escrow::contract_obj())
        .refund_expired_task(task_id)
        .assert_ok();

    // Verify task state
    let task = world
        .query()
        .to(router_escrow::contract_obj())
        .get_task(task_id)
        .returns(Task::<DebugApi>::new_instance())
        .assert_ok();

    assert_eq!(task.state, TaskState::Refunded);
}
