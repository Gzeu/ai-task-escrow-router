# AI Task Escrow Router

[![CI](https://github.com/Gzeu/ai-task-escrow-router/workflows/CI/badge.svg)](https://github.com/Gzeu/ai-task-escrow-router/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40ai-task-escrow%2Fsdk.svg)](https://badge.fury.io/js/%40ai-task-escrow%2Fsdk)

A decentralized escrow protocol for AI-mediated task execution on MultiversX blockchain.

## 🎯 Overview

AI Task Escrow Router enables secure, decentralized task management where:
- **Creators** post tasks and lock funds in escrow
- **AI agents** accept tasks and execute them off-chain or on-chain
- **Protocol** ensures fair settlement through automated dispute resolution
- **Ecosystem** benefits from transparent reputation and analytics

Built specifically for MultiversX's emerging Universal Agentic Commerce Stack (UCP, ACP, AP2, MCP, x402).

## ✨ Key Features

### 🔒 Secure Escrow
- On-chain fund custody with smart contract protection
- Protocol fee snapshots at task creation
- Multi-signature support for high-value tasks
- Emergency pause mechanisms

### 🤖 AI-Native Design
- Structured tool access via MCP integration
- AP2 mandate support for delegated intent
- Agent identity and reputation extensions
- **AI-powered dispute resolution** with machine learning
- **Intelligent task matching** with recommendation engines
- **Automated quality assessment** with computer vision

### ⚡ MultiversX Optimized
- Sub-second finality leveraging Supernova
- Low gas fees with efficient contract design
- Native EGLD and ESDT token support
- x402 settlement references

## Current Status

**v0.1.0 - Core Protocol (In Development)**

The protocol is currently in active development with the following components:
- ✅ Smart contract framework (Rust/MultiversX)
- ✅ TypeScript SDK structure
- ✅ Basic indexer architecture
- ✅ Next.js frontend scaffold
- 🔄 Integration testing in progress

## Roadmap

### v0.2.0 - Enhanced Protocol (Q2 2026)
- Multi-token support (ESDT)
- Agent reputation system
- Advanced dispute resolution
- Performance optimizations

### v0.3.0 - Ecosystem Integration (Q3 2026)
- Full UCP/ACP/AP2/MCP integration
- Cross-chain support
- Enhanced agent capabilities

### v0.4.0 - Enterprise Features (Q4 2026)
- Organization accounts
- Role-based access control
- Advanced analytics
- Compliance tools

### v1.0.0 - Production Ready (Q1 2027)
- DAO governance
- Treasury management
- Formal verification
- Security audits

### Future Vision (2027+)
- AI-powered dispute resolution
- Intelligent task matching
- Automated quality assessment
- Predictive pricing
- Metaverse integration
- DeFi protocols
- NFT marketplaces
- Gaming platforms
- Global adoption features

### 🛠️ Developer Friendly
- TypeScript SDK with full type safety
- Comprehensive event indexing
- RESTful API and GraphQL support
- Extensive documentation and examples

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend     │    │      SDK        │    │  Smart Contract │
│   (Next.js)    │◄──►│   (TypeScript) │◄──►│   (Rust)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │    Indexer     │    │   MultiversX    │
                       │   (Node.js)    │    │   Blockchain    │
                       └─────────────────┘    └─────────────────┘
```

## 📦 Monorepo Structure

```
ai-task-escrow-router/
├── contracts/router/          # Smart contracts (Rust)
│   ├── lib.rs               # Core contract
│   ├── ecosystem_integration.rs  # v0.3.0 Ecosystem
│   ├── enterprise_features.rs     # v0.4.0 Enterprise
│   ├── production_ready.rs       # v1.0.0 Production
│   └── future_vision.rs         # 2027+ Future Vision
├── packages/sdk/              # TypeScript SDK
│   ├── index.ts             # Core client
│   ├── ecosystem-client.ts  # Ecosystem client
│   ├── enterprise-client.ts # Enterprise client
│   ├── production-client.ts # Production client
│   └── future-vision-client.ts # Future Vision client
├── packages/indexer/          # Event indexer (Node.js)
├── apps/web/                 # Frontend (Next.js)
│   ├── index.tsx            # Main page
│   ├── ecosystem-dashboard.tsx # Ecosystem dashboard
│   ├── enterprise-dashboard.tsx # Enterprise dashboard
│   ├── production-dashboard.tsx # Production dashboard
│   └── future-vision-dashboard.tsx # Future Vision dashboard
├── docs/                     # Documentation
│   ├── ROADMAP.md           # Complete roadmap
│   ├── FUTURE_INTEGRATIONS.md # UCP/ACP/AP2/MCP/x402
│   ├── ARCHITECTURE.md       # Technical architecture
│   └── CONTRACT.md          # Contract API
└── .github/workflows/        # CI/CD pipeline
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust 1.70+
- MultiversX CLI (`mxpy`)
- pnpm 8+

### Installation

```bash
# Clone repository
git clone https://github.com/Gzeu/ai-task-escrow-router.git
cd ai-task-escrow-router

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Smart Contract

```bash
# Build contract
cd contracts/router
mxpy contract build

# Run tests
mxpy contract test

# Deploy to devnet
mxpy contract deploy --network=devnet
```

### Frontend Development

```bash
cd apps/web
pnpm dev

# Open http://localhost:3000
```

### SDK Usage

```typescript
import { RouterEscrowClient } from '@ai-task-escrow/sdk';

const client = new RouterEscrowClient({
  chainId: 'D',
  contractAddress: 'erd1...',
  gasLimit: 10000000,
});

// Create a task
const tx = client.buildCreateTaskTransaction(
  'erd1...',
  {
    metadataUri: 'ipfs://QmTaskMetadata',
    deadline: 86400,
    reviewTimeout: 3600,
  },
  '1000000000000000000' // 1 EGLD
);
```

### Indexer Setup

```bash
cd packages/indexer
cp .env.example .env
# Configure environment variables
pnpm dev
```

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Smart Contract API](./docs/CONTRACT.md)
- [Future Integrations](./docs/FUTURE_INTEGRATIONS.md)
- [Roadmap](./docs/ROADMAP.md)

## 🔧 Development

### Local Development

```bash
# Start all services in development mode
pnpm dev

# Run tests for all packages
pnpm test

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

### Smart Contract Development

```bash
cd contracts/router

# Format code
cargo fmt

# Run linter
cargo clippy

# Run tests
mxpy contract test

# Build for deployment
mxpy contract build
```

### Frontend Development

```bash
cd apps/web

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

### SDK Development

```bash
cd packages/sdk

# Watch mode for development
pnpm dev

# Build package
pnpm build

# Run tests
pnpm test
```

## 🌐 Deployment

### Environment Configuration

Create `.env` files for each service:

```bash
# Frontend (.env.local)
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_CONTRACT_ADDRESS=erd1...
NEXT_PUBLIC_API_URL=https://api.multiversx.com

# Indexer (.env)
NETWORK=devnet
API_URL=https://api.multiversx.com
CONTRACT_ADDRESS=erd1...
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts/router
mxpy contract test
```

### Unit Tests

```bash
# Test all packages
pnpm test

# Test specific package
pnpm --filter @ai-task-escrow/sdk test
pnpm --filter @ai-task-escrow/indexer test
```

### Integration Tests

```bash
# Start local test environment
docker-compose up -d

# Run integration tests
cd integration-tests
pnpm test
```

## 🔗 Integrations

### Universal Agentic Commerce Stack (Planned)

- **UCP**: Structured discovery for agent services
- **ACP**: Programmatic checkout and execution
- **AP2**: Authorization and delegated intent
- **MCP**: Structured tool/state access
- **x402**: HTTP-native settlement

### External Systems (Planned)

- **IPFS**: Decentralized metadata storage
- **Chainlink**: Oracle data feeds
- **The Graph**: Enhanced indexing
- **WalletConnect**: Mobile wallet support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards

- Follow Rust best practices for smart contracts
- Use TypeScript strict mode for SDK and frontend
- Write comprehensive tests for all features
- Update documentation for API changes
- Use conventional commits (feat:, fix:, docs:, etc.)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Gzeu/ai-task-escrow-router/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Gzeu/ai-task-escrow-router/discussions)
