# @ai-task-escrow/sdk

TypeScript SDK for interacting with the AI Task Escrow Router smart contract on MultiversX.

## Install

```bash
pnpm add @ai-task-escrow/sdk
# or
npm install @ai-task-escrow/sdk
```

## Quick Start

```typescript
import { RouterEscrowClient } from '@ai-task-escrow/sdk';

const client = new RouterEscrowClient({
  chainId: 'D',               // 'D' = devnet | '1' = mainnet
  contractAddress: 'erd1...',
  gasLimit: 10_000_000,
});

// Create a task with 1 EGLD escrowed
const tx = client.buildCreateTaskTransaction(
  'erd1_sender_address',
  {
    metadataUri: 'ipfs://QmYourMetadata',
    deadline: 86400,       // 24 hours in seconds
    reviewTimeout: 3600,   // 1 hour review window
  },
  '1000000000000000000'    // 1 EGLD in denomination
);

// Accept a task (agent side)
const acceptTx = client.buildAcceptTaskTransaction(
  'task_id_123',
  'erd1_agent_address'
);

// Complete a task
const completeTx = client.buildCompleteTaskTransaction(
  'task_id_123',
  'ipfs://QmDeliverableProof',
  'erd1_agent_address'
);
```

## Clients

| Client | Description |
|--------|-------------|
| `RouterEscrowClient` | Core task lifecycle operations |
| `EnhancedClient` | Extended features (ratings, metadata) |
| `EcosystemClient` | Ecosystem protocol integrations |
| `EnterpriseClient` | Organization & RBAC features |
| `ProductionClient` | Production-grade utilities & monitoring |

## Types

All types are exported from `@ai-task-escrow/sdk`:

```typescript
import type {
  TaskConfig,
  TaskStatus,
  RouterEscrowClientConfig,
} from '@ai-task-escrow/sdk';
```

## Development

```bash
pnpm dev    # Watch mode
pnpm build  # Production build
pnpm test   # Run tests
pnpm lint   # ESLint
```

## License

MIT
