# AI Task Escrow Router

[![CI](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MultiversX](https://img.shields.io/badge/MultiversX-Devnet-blue.svg)](https://devnet.multiversx.com)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-f69220.svg)](https://pnpm.io)

A decentralized escrow and settlement protocol for AI-mediated task execution on **MultiversX**.

Creators lock funds on-chain. AI agents execute tasks off-chain or on-chain. The smart contract ensures fair settlement with automated dispute resolution — no trusted third party required.

---

## Architecture

```
┌────────────────┐    ┌────────────────┐    ┌─────────────────┐
│  Frontend      │    │     SDK        │    │  Smart Contract │
│  (Next.js)     │◄──►│ (TypeScript)   │◄──►│     (Rust)      │
└────────────────┘    └────────────────┘    └─────────────────┘
                               │                       │
                      ┌───────▼───────┐    ┌────────▼────────┐
                      │   Indexer      │    │  MultiversX    │
                      │  (Node.js)     │    │  Blockchain    │
                      └────────────────┘    └────────────────┘
```

## Monorepo Structure

```
ai-task-escrow-router/
├── contracts/router/      # Smart contract (Rust, MultiversX framework)
├── packages/sdk/          # TypeScript SDK (@ai-task-escrow/sdk)
├── packages/indexer/      # On-chain event indexer (Node.js)
├── apps/web/              # Frontend dashboard (Next.js + Tailwind)
├── docs/                  # Technical documentation
└── .github/workflows/     # CI/CD (GitHub Actions)
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Rust 1.70+
- [mxpy](https://docs.multiversx.com/sdk-and-tools/sdk-py/installing-mxpy/) — MultiversX CLI
- pnpm 8+

### Install

```bash
git clone https://github.com/Gzeu/ai-task-escrow-router.git
cd ai-task-escrow-router
pnpm install
```

### Run locally

```bash
# Frontend dev server → http://localhost:3000
cd apps/web && pnpm dev

# SDK watch mode
cd packages/sdk && pnpm dev

# Indexer
cd packages/indexer
cp .env.example .env   # fill in your values
pnpm dev
```

### Smart Contract

```bash
cd contracts/router
mxpy contract build
mxpy contract test
mxpy contract deploy --network=devnet
```

### Environment

```bash
# apps/web/.env.local
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_CONTRACT_ADDRESS=erd1...
NEXT_PUBLIC_API_URL=https://devnet-api.multiversx.com

# packages/indexer/.env
NETWORK=devnet
CONTRACT_ADDRESS=erd1...
API_URL=https://devnet-api.multiversx.com
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
```

---

## SDK Usage

```typescript
import { RouterEscrowClient } from '@ai-task-escrow/sdk';

const client = new RouterEscrowClient({
  chainId: 'D',               // 'D' = devnet | '1' = mainnet
  contractAddress: 'erd1...',
  gasLimit: 10_000_000,
});

// Create a task with escrowed funds (1 EGLD)
const tx = client.buildCreateTaskTransaction(
  'erd1_sender',
  {
    metadataUri: 'ipfs://QmTaskMetadata',
    deadline: 86400,
    reviewTimeout: 3600,
  },
  '1000000000000000000'
);
```

See [packages/sdk/README.md](./packages/sdk/README.md) for the full API reference.

---

## Project Status

### ✅ v0.1.0 — Core Protocol (current)

- Smart contract: task lifecycle, escrow, settlement, dispute resolution
- TypeScript SDK: `RouterEscrowClient` with full type safety
- On-chain event indexer (Node.js)
- Frontend dashboard (Next.js + Tailwind)
- GitHub Actions CI/CD: TypeScript checks, Rust lint, npm release

### 🚧 In Progress

- Integration test suite
- `.env.example` files for each package
- SDK JSDoc coverage

### 📅 Roadmap

| Version | Features | Target |
|---------|----------|--------|
| v0.2.0 | ESDT multi-token, agent reputation system | Q2 2026 |
| v0.3.0 | UCP / ACP / AP2 / MCP / x402 integration | Q3 2026 |
| v0.4.0 | Organizations, RBAC, analytics | Q4 2026 |
| v1.0.0 | DAO governance, treasury, security audit | Q1 2027 |

---

## CI/CD

| Workflow | Trigger | Checks |
|----------|---------|--------|
| `ci.yml` | PR / push to master | TypeScript type-check, ESLint, Next.js build |
| `contract-check.yml` | Changes in `contracts/**` | `cargo fmt`, `cargo clippy`, `cargo test` |
| `release.yml` | Tag push `v*` | Build + publish SDK to npm |

---

## Development Commands

```bash
pnpm type-check   # TypeScript check across all packages
pnpm lint         # ESLint across all packages
pnpm test         # Run all tests
pnpm build        # Build all packages

# Smart contract
cargo fmt         # Format Rust code
cargo clippy      # Lint Rust code
cargo test        # Run Rust unit tests
```

---

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Contract API](./docs/CONTRACT.md)
- [Future Integrations](./docs/FUTURE_INTEGRATIONS.md)
- [Roadmap](./docs/ROADMAP.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions, branch conventions, and code standards.

---

## License

[MIT](./LICENSE) © [George Pricop](https://github.com/Gzeu)
