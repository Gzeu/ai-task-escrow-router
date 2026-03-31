# Smart Contract Documentation

## Overview

The RouterEscrow smart contract is the core component of the AI Task Escrow Router protocol. It manages task lifecycle, escrow functionality, and dispute resolution on the MultiversX blockchain.

## Contract Address

- **Devnet**: `erd1...` (to be deployed)
- **Testnet**: `erd1...` (to be deployed)
- **Mainnet**: `erd1...` (to be deployed)

## Data Structures

### Task

```rust
pub struct Task<M: ManagedTypeApi> {
    pub task_id: u64,
    pub creator: ManagedAddress<M>,
    pub assigned_agent: Option<ManagedAddress<M>>,
    pub payment_token: EgldOrEsdtTokenIdentifier<M>,
    pub payment_amount: BigUint<M>,
    pub protocol_fee_bps: u16,
    pub created_at: u64,
    pub accepted_at: Option<u64>,
    pub deadline: Option<u64>,
    pub review_timeout: Option<u64>,
    pub metadata_uri: ManagedBuffer<M>,
    pub result_uri: Option<ManagedBuffer<M>>,
    pub state: TaskState,
    pub dispute_metadata: Option<ManagedBuffer<M>>,
    pub ap2_mandate_hash: Option<ManagedBuffer<M>>,
    pub x402_settlement_ref: Option<ManagedBuffer<M>>,
}
```

### TaskState

```rust
pub enum TaskState {
    Open,       // Task created and waiting for agent
    Accepted,   // Agent assigned, task in progress
    Submitted,  // Result submitted, waiting for approval
    Approved,   // Task completed and paid
    Cancelled,  // Task cancelled before acceptance
    Disputed,   // Dispute opened
    Resolved,   // Dispute resolved
    Refunded,   // Task refunded due to expiry/cancellation
}
```

### Config

```rust
pub struct Config<M: ManagedTypeApi> {
    pub owner: ManagedAddress<M>,
    pub treasury: ManagedAddress<M>,
    pub fee_bps: u16,
    pub resolver: Option<ManagedAddress<M>>,
    pub paused: bool,
}
```

### DisputeResolution

```rust
pub enum DisputeResolution {
    FullRefund,                    // 100% refund to creator
    PartialRefund { agent_award_bps: u16 }, // Split payment
    FullPayment,                   // 100% payment to agent
}
```

## Endpoints

### Initialization

#### `init(owner, treasury, fee_bps)`
Initializes the contract with owner, treasury address, and protocol fee.

- **Owner**: Contract administrator
- **Treasury**: Address to receive protocol fees
- **Fee BPS**: Protocol fee in basis points (100-1000 = 1-10%)

### Task Management

#### `createTask(metadataUri, deadline, reviewTimeout, ap2MandateHash)` - Payable
Creates a new task and locks payment in escrow.

**Parameters:**
- `metadataUri`: IPFS/Arweave URI with task details
- `deadline`: Optional deadline for task completion
- `reviewTimeout`: Optional timeout for result review
- `ap2MandateHash`: Optional AP2 mandate hash for delegated intent

**Payment**: EGLD or ESDT tokens for escrow

**Returns**: `task_id` (u64)

#### `acceptTask(taskId)`
Allows an agent to accept and be assigned to an open task.

**Parameters:**
- `taskId`: Identifier of task to accept

**Requirements:**
- Task must be in `Open` state
- Caller cannot be task creator
- Task must not be expired

#### `submitResult(taskId, resultUri)`
Allows assigned agent to submit task result.

**Parameters:**
- `taskId`: Identifier of task
- `resultUri`: URI containing task result/metadata

**Requirements:**
- Task must be in `Accepted` state
- Caller must be assigned agent
- Deadline must not have passed

#### `approveTask(taskId)`
Allows task creator to approve submitted result and release payment.

**Parameters:**
- `taskId`: Identifier of task to approve

**Requirements:**
- Task must be in `Submitted` state
- Caller must be task creator

**Effects:**
- Protocol fee transferred to treasury
- Remaining amount transferred to agent
- Task state set to `Approved`

#### `cancelTask(taskId)`
Allows task creator to cancel an open task and receive refund.

**Parameters:**
- `taskId`: Identifier of task to cancel

**Requirements:**
- Task must be in `Open` state
- Caller must be task creator

**Effects:**
- Full payment refunded to creator
- Task state set to `Cancelled`

### Dispute Management

#### `openDispute(taskId, reasonUri)`
Opens a dispute for a submitted task.

**Parameters:**
- `taskId`: Identifier of task to dispute
- `reasonUri`: URI containing dispute reasoning/evidence

**Requirements:**
- Task must be in `Submitted` state
- Caller must be creator or assigned agent

#### `resolveDispute(taskId, resolution, x402SettlementRef)`
Allows resolver to settle a dispute and distribute funds.

**Parameters:**
- `taskId`: Identifier of disputed task
- `resolution`: Dispute resolution type
- `x402SettlementRef`: Optional x402 settlement reference

**Requirements:**
- Task must be in `Disputed` state
- Caller must be designated resolver

**Resolution Types:**
- `FullRefund`: 100% refund to creator
- `PartialRefund`: Split payment based on agent_award_bps
- `FullPayment`: 100% payment to agent

#### `refundExpiredTask(taskId)`
Allows anyone to refund creator for expired tasks.

**Parameters:**
- `taskId`: Identifier of expired task

**Requirements:**
- Task must be in `Accepted` state
- Deadline must have passed
- Current time > deadline

### Administration

#### `setFeeBps(feeBps)`
Updates protocol fee percentage.

**Parameters:**
- `feeBps`: New fee in basis points (0-1000)

**Requirements:**
- Caller must be contract owner

#### `setTreasury(treasury)`
Updates treasury address for fee collection.

**Parameters:**
- `treasury`: New treasury address

**Requirements:**
- Caller must be contract owner

#### `setResolver(resolver)`
Updates resolver address for dispute handling.

**Parameters:**
- `resolver`: New resolver address (optional)

**Requirements:**
- Caller must be contract owner

#### `setPaused(paused)`
Pauses or unpauses contract operations.

**Parameters:**
- `paused`: Pause state (true/false)

**Requirements:**
- Caller must be contract owner

### View Functions

#### `getTask(taskId)`
Returns complete task information.

**Parameters:**
- `taskId`: Identifier of task

**Returns**: `Task` struct

#### `getTaskCount()`
Returns total number of tasks created.

**Returns**: `u64`

#### `getConfig()`
Returns current contract configuration.

**Returns**: `Config` struct

## Events

### Task Lifecycle Events

#### `TaskCreatedEvent`
Emitted when a new task is created.

```rust
pub struct TaskCreatedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub creator: &ManagedAddress<M>,
    pub payment_amount: &BigUint<M>,
    pub metadata_uri: &ManagedBuffer<M>,
}
```

#### `TaskAcceptedEvent`
Emitted when a task is accepted by an agent.

```rust
pub struct TaskAcceptedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub agent: &ManagedAddress<M>,
}
```

#### `ResultSubmittedEvent`
Emitted when an agent submits a task result.

```rust
pub struct ResultSubmittedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub result_uri: &ManagedBuffer<M>,
}
```

#### `TaskApprovedEvent`
Emitted when a task is approved and payment is released.

```rust
pub struct TaskApprovedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub protocol_fee: &BigUint<M>,
    pub agent_payment: &BigUint<M>,
}
```

#### `TaskCancelledEvent`
Emitted when a task is cancelled.

```rust
pub struct TaskCancelledEvent {
    pub task_id: u64,
}
```

#### `TaskRefundedEvent`
Emitted when an expired task is refunded.

```rust
pub struct TaskRefundedEvent {
    pub task_id: u64,
}
```

### Dispute Events

#### `DisputeOpenedEvent`
Emitted when a dispute is opened.

```rust
pub struct DisputeOpenedEvent<M: ManagedTypeApi> {
    pub task_id: u64,
    pub reason_uri: &ManagedBuffer<M>,
}
```

#### `DisputeResolvedEvent`
Emitted when a dispute is resolved.

```rust
pub struct DisputeResolvedEvent {
    pub task_id: u64,
    pub resolution: &DisputeResolution,
}
```

### Configuration Events

#### `ConfigChangedEvent`
Emitted when contract configuration is updated.

```rust
pub struct ConfigChangedEvent {}
```

## Security Features

### Access Control
- **Owner-only functions**: Administrative operations
- **Resolver-only functions**: Dispute resolution
- **State-based permissions**: Role-based task operations

### State Validation
- **Strict state transitions**: Prevents invalid state changes
- **Deadline enforcement**: Automatic refunds for expired tasks
- **Single settlement**: Prevents double payments

### Financial Security
- **Escrow protection**: Funds locked until task completion
- **Fee snapshots**: Protocol fee locked at task creation
- **Overflow protection**: Safe arithmetic operations

### Emergency Controls
- **Pause mechanism**: Emergency contract suspension
- **Transfer protection**: Prevents accidental token transfers

## Gas Optimization

### Efficient Storage
- **Packed enums**: Minimal storage for state values
- **Optional fields**: Storage only when needed
- **Lazy loading**: View functions minimize gas usage

### Batch Operations
- **Event batching**: Multiple events per transaction
- **Bulk updates**: Efficient state changes

## Upgrade Path

The contract is designed for upgradeability through:

1. **Proxy pattern**: Contract upgrade without data loss
2. **Migration functions**: Smooth data transition
3. **Version management**: Backward compatibility

## Integration Points

### AP2 Integration
- `ap2_mandate_hash`: Store AP2 mandate references
- Delegated intent authorization support

### x402 Integration
- `x402_settlement_ref`: Store x402 settlement references
- HTTP-native settlement compatibility

### MCP Integration
- Structured tool access for AI agents
- Standardized action interfaces

This contract provides a secure, efficient, and extensible foundation for AI-mediated task escrow on MultiversX.
