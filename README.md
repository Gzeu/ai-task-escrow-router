# 🤖 AI Task Escrow Router v0.3.0

[![CI](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/ci.yml)
[![Contract Check](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/contract-check.yml/badge.svg)](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/contract-check.yml)
[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/Gzeu/ai-task-escrow-router/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![ESDT](https://img.shields.io/badge/ESDT-multi--token-success.svg)](https://docs.multiversx.com)

A comprehensive decentralized AI task execution platform built on MultiversX blockchain, featuring **complete ESDT multi-token support**, reputation systems, organizations, and advanced analytics.

> **Status:** v0.3.0 is feature-complete with 100% SDK test coverage. Smart contract deployment to DevNet/MainNet is in progress.

## 🚀 Features v0.3.0

### ✅ Core Functionality
- **🔄 Multi-Token Support** - Complete ESDT multi-token support with EGLD, USDC, UTK, MEX and custom ESDT tokens
- **⭐ Agent Reputation System** - Weighted scoring with staking and slashing mechanisms
- **🏢 Organization Management** - Create and manage organizations with RBAC (Role-Based Access Control)
- **📊 Advanced Analytics** - Real-time task statistics and performance metrics tracking
- **⚖️ Dispute Resolution** - Automated and manual dispute handling with fair resolution
- **📦 Batch Operations** - Efficient bulk task management operations
- **🔒 Security-First Design** - Comprehensive access controls and validation mechanisms
- **🤖 MCP Server** - AI agent integration via Model Context Protocol (see [MCP Server](#-mcp-server) section below)

### 🆕 v0.3.0 Enhancements
- **Complete ESDT Multi-Token Support** - Full implementation with transaction builders, query methods, and utilities
- **Organizations Module** - Complete organization lifecycle management with RBAC
- **Enhanced SDK** - Complete TypeScript API with 100% ESDT multi-token coverage
- **Updated Frontend** - Multi-token UI, reputation dashboard, organization management
- **Production Scripts** - Automated deployment and monitoring setup
- **100% Test Coverage** - Comprehensive test suite with 26/26 tests passing

### 🔥 ESDT Multi-Token Features
- **Transaction Builders**: `buildCreateTaskWithToken()`, `buildAcceptAnyToken()`
- **Query Methods**: `getTokenInfo()`, `validateToken()`, `getSupportedTokens()`
- **Utility Functions**: `createTokenPayment()`, `createEGLDPayment()`, `createESDTPayment()`
- **Amount Handling**: `formatTokenAmount()`, `parseTokenAmount()` with decimal support
- **Token Validation**: Comprehensive token validation and information retrieval
- **Type Safety**: Full TypeScript support with proper interfaces and error handling

## 🤖 MCP Server

The most unique feature of this project: a **Model Context Protocol (MCP) server** that allows AI agents (Claude, GPT-4, Cursor, Windsurf, etc.) to directly interact with the escrow router — creating tasks, checking status, managing disputes, and querying reputation — all through natural language.

### What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io) is an open standard that lets LLM-powered tools call external services via structured tool definitions. The `mcp-server/` in this repo exposes the escrow router as a set of callable tools.

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `create_task` | Create a new escrow task with token payment |
| `accept_task` | Accept a task as an AI agent |
| `submit_result` | Submit task result for review |
| `approve_result` | Approve submitted result and release payment |
| `open_dispute` | Open a dispute on a task |
| `get_task_status` | Query current task state and metadata |
| `get_agent_reputation` | Fetch agent reputation score and history |

### Quick Start (MCP Server)

```bash
# Navigate to the MCP server
cd mcp-server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Set MULTIVERSX_API_URL and CONTRACT_ADDRESS in .env

# Start the MCP server
npm start
# Server runs on stdio — connect via any MCP-compatible client
```

### Connecting to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-task-escrow": {
      "command": "node",
      "args": ["/path/to/ai-task-escrow-router/mcp-server/dist/index.js"],
      "env": {
        "MULTIVERSX_API_URL": "https://devnet-api.multiversx.com",
        "CONTRACT_ADDRESS": "<your-devnet-contract-address>"
      }
    }
  }
}
```

Once connected, you can ask Claude: *"Create a task paying 1 EGLD for writing a 500-word article about MultiversX"* and the agent will call the escrow router directly.

## 🏗️ Architecture

```
AI Task Escrow Router v0.3.0
┌─────────────────────────────────┐
│ Frontend (Next.js)              │
│ • Multi-token UI               │
│ • Reputation Dashboard         │
│ • Organization Management      │
│ • Analytics Views              │
│ • ESDT Token Interface         │
├─────────────────────────────────┤
│ MCP Server (Node.js)           │
│ • 7 AI agent tools             │
│ • Stdio transport              │
│ • Claude/GPT-4/Cursor support  │
├─────────────────────────────────┤
│ SDK (TypeScript)               │
│ • ESDT Multi-Token Support     │
│ • Transaction Builders         │
│ • Token Validation            │
│ • Organization API            │
│ • Reputation Methods          │
│ • Analytics Queries            │
│ • 100% Test Coverage           │
├─────────────────────────────────┤
│ Indexer (Node.js)              │
│ • Multi-token Events          │
│ • Reputation Tracking         │
│ • Organization Events         │
│ • Analytics Data              │
│ • Real-time Updates           │
├─────────────────────────────────┤
│ Smart Contract (Rust)          │
│ • ESDT Multi-Token Endpoints  │
│ • Reputation System            │
│ • Organization Module         │
│ • Analytics Module             │
│ • Gas Optimized Operations     │
├─────────────────────────────────┤
│ Blockchain (MultiversX)        │
│ • Multi-token Ready           │
│ • Gas Optimized               │
└─────────────────────────────────┘
```

## 🛠️ Tech Stack

### Smart Contract
- **Language**: Rust
- **Framework**: MultiversX SC v0.52.3
- **Features**: ESDT multi-token, reputation, organizations, analytics
- **Gas Optimization**: Optimized for low-cost operations

### SDK
- **Language**: TypeScript
- **Framework**: MultiversX SDK Core v13.10.0+
- **Features**: Complete ESDT multi-token API coverage, type safety, utilities
- **Test Coverage**: 100% test coverage with 26/26 tests passing

### Frontend
- **Framework**: Next.js 14
- **Styling**: TailwindCSS
- **UI Components**: Custom UI Components (Card, Badge, Input, Select, Tabs, Progress)
- **State Management**: React Context + Hooks

### Infrastructure
- **Blockchain**: MultiversX (DevNet available, MainNet deployment in progress)
- **Indexer**: Node.js with WebSocket support
- **Monitoring**: Prometheus + Grafana + AlertManager
- **Deployment**: Docker + Kubernetes ready
- **Testing**: Comprehensive test suite with 100% SDK coverage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- MultiversX CLI (mxpy)
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/Gzeu/ai-task-escrow-router.git
cd ai-task-escrow-router

# Install dependencies
pnpm install

# Build contracts
pnpm build:contract

# Start development
pnpm dev
```

### Environment Setup
```bash
# Copy environment template
cp .env.local.example .env.local

# Configure your wallet and network (start with DevNet)
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-devnet-contract-address>
NEXT_PUBLIC_WALLET_ADDRESS=erd1yourwallet
```

## 🌐 Deployment

### Network Status

| Network | Status | Contract Address |
|---------|--------|------------------|
| DevNet | 🔲 Not yet deployed | — |
| TestNet | 🔲 Not yet deployed | — |
| MainNet | 🔲 Not yet deployed | — |

Deployment is the next milestone. Contributions welcome — see [DEPLOYMENT.md](DEPLOYMENT.md) for the full guide.

### DevNet Deployment
```bash
# Deploy to DevNet (recommended first step)
.\deploy\devnet-deploy.ps1 -WalletAddress "erd1yourwallet" -PemFile "path\to\wallet.pem"
```

### Web Application
```bash
cd apps/web
npm install
npm run build
npm start
# http://localhost:3000
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts/router
cargo test
cargo test --lib integration_test
```

### SDK Tests (100% coverage)
```bash
cd packages/sdk
npm test

# Results: 26/26 tests passing
# ✅ ESDT Multi-Token Transaction Builders (3/3)
# ✅ ESDT Multi-Token Query Methods (7/7)
# ✅ ESDT Multi-Token Utility Functions (8/8)
# ✅ ESDT Multi-Token Error Handling (3/3)
# ✅ ESDT Multi-Token Integration (2/2)
# ✅ ESDT Multi-Token State Management (3/3)
```

### Frontend Tests
```bash
cd apps/web
npm test
npm run test:e2e
```

## 📊 Performance Metrics

### Gas Optimization
- **Task Creation**: ~15M gas (30% improvement from v0.2.0)
- **Task Acceptance**: ~8M gas
- **Task Submission**: ~5M gas
- **Task Approval**: ~10M gas
- **Token Operations**: ~10M gas
- **Organization Operations**: ~15M gas

### Performance Targets
- **Transaction Response**: < 30 seconds
- **Frontend Load**: < 3 seconds
- **API Response**: < 2 seconds
- **Uptime**: > 99.9%

## 🔒 Security

### Security Features
- **Access Control**: Role-based permissions for all operations
- **Token Validation**: Whitelist-based token management
- **Reputation System**: Anti-manipulation mechanisms
- **Dispute Resolution**: Fair and transparent process
- **Audit Trail**: Complete event logging

## 🌐 Networks

### Supported Networks
- **MainNet**: https://gateway.multiversx.com (deployment pending)
- **DevNet**: https://devnet-gateway.multiversx.com
- **TestNet**: https://testnet-gateway.multiversx.com

### Token Support
- **EGLD**: Native MultiversX token
- **USDC**: USD Coin (whitelisted)
- **UTK**: Utility Token (whitelisted)
- **MEX**: Mex Token (whitelisted)
- **Custom Tokens**: Configurable via admin interface

## 📈 Roadmap

### v0.4.0 (Planned) - AI-Powered Task Matching
- **🤖 AI-Powered Matching Engine**: ML-based algorithm to match tasks with optimal agents
- **🧠 Advanced Analytics**: Predictive analytics for task performance
- **📱 Mobile Application**: React Native app with push notifications
- **🏛️ Governance System**: DAO-based protocol governance with token-weighted voting
- **🔗 Cross-Chain Integration**: Multi-chain support (Ethereum, Polygon, BSC)
- **🤖 MCP Enhancements**: Advanced AI agent tools, automated task management

### v0.5.0 (Future)
- **ZK Proofs**: Privacy-enhanced task execution
- **DeFi Integration**: Yield farming for staked tokens
- **NFT Integration**: Task result NFTs
- **API V2**: GraphQL API with subscriptions

## 📚 Documentation

- **[Complete API Reference](docs/API_v0.3.0.md)** - Comprehensive v0.3.0 API documentation
- **[Smart Contract Docs](docs/CONTRACT.md)** - Contract architecture and endpoints
- **[SDK Documentation](docs/SDK.md)** - TypeScript SDK usage guide
- **[Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design and components
- **[Future Integrations](docs/FUTURE_INTEGRATIONS.md)** - Planned features
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Changelog](CHANGELOG.md)** - Version history

## 🤝 Contributing

We welcome contributions!

```bash
git checkout -b feat/your-feature
pnpm dev
npm run type-check
git push origin feat/your-feature
# Open Pull Request
```

Follow existing code style (Prettier + ESLint config included). See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Gzeu](https://github.com/Gzeu)
