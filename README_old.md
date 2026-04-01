# 🤖 AI Task Escrow Router v0.3.0

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/ai-task-escrow/router)
[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/ai-task-escrow/router/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A comprehensive decentralized AI task execution platform built on MultiversX blockchain, featuring multi-token support, reputation systems, organizations, and advanced analytics.

## �� Features v0.3.0

### ✅ Core Functionality
- **🔄 Multi-Token Support** - EGLD, USDC, UTK, MEX and custom ESDT tokens
- **⭐ Agent Reputation System** - Weighted scoring with staking and slashing
- **🏢 Organization Management** - Create and manage organizations with RBAC
- **📊 Advanced Analytics** - Real-time task statistics and performance metrics
- **⚖️ Dispute Resolution** - Automated and manual dispute handling
- **📦 Batch Operations** - Efficient bulk task management
- **🔒 Security-First Design** - Comprehensive access controls and validations

### 🆕 v0.3.0 Enhancements
- **Organizations Module** - Complete organization lifecycle management
- **RBAC System** - Owner, Admin, Member, Agent roles with granular permissions
- **Enhanced Analytics** - Task statistics, agent performance, revenue tracking
- **Improved SDK** - Complete TypeScript API with all v0.3.0 features
- **Updated Frontend** - Multi-token UI, reputation dashboard, organization management

## 🏗️ Architecture

```
AI Task Escrow Router v0.3.0
┌─────────────────────────────────┐
│ Frontend (Next.js)              │
│ • Multi-token UI               │
│ • Reputation Dashboard         │
│ • Organization Management      │
│ • Analytics Views              │
├─────────────────────────────────┤
│ SDK (TypeScript)               │
│ • ESDT Support                 │
│ • Organization API            │
│ • Reputation Methods          │
│ • Analytics Queries            │
├─────────────────────────────────┤
│ Indexer (Node.js)              │
│ • Multi-token Events          │
│ • Reputation Tracking         │
│ • Organization Events         │
│ • Analytics Data              │
├─────────────────────────────────┤
│ Smart Contract (Rust)          │
│ • ESDT Endpoints              │
│ • Reputation System            │
│ • Organization Module         │
│ • Analytics Module             │
├─────────────────────────────────┤
│ Blockchain (MultiversX)        │
│ • Multi-token Ready           │
│ • Gas Optimized               │
│ • Production Ready            │
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
- **Framework**: MultiversX SDK Core
- **Features**: Complete API coverage, type safety, utilities

### Frontend
- **Framework**: Next.js 14
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui
- **State Management**: React Context + Hooks

### Infrastructure
- **Blockchain**: MultiversX
- **Indexer**: Node.js with WebSocket support
- **Deployment**: Docker + Kubernetes ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- MultiversX CLI (mxpy)
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/ai-task-escrow/router.git
cd router

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
cp .env.example .env.local

# Configure your wallet and network
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_WALLET_ADDRESS=your_wallet_address
```

## 📖 Documentation

### API Documentation
- **[Complete API Reference](docs/API_v0.3.0.md)** - Comprehensive v0.3.0 API documentation
- **[Smart Contract Docs](docs/CONTRACT.md)** - Contract architecture and endpoints
- **[SDK Documentation](docs/SDK.md)** - TypeScript SDK usage guide

### Deployment Guide
- **[Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions
- **[DevNet Script](deploy/devnet-deploy.ps1)** - Automated DevNet deployment
- **[MainNet Script](deploy/mainnet-deploy.ps1)** - Automated MainNet deployment

### Architecture Overview
- **[Architecture Documentation](docs/ARCHITECTURE.md)** - System design and components
- **[Contract Documentation](docs/CONTRACT.md)** - Smart contract details
- **[Future Integrations](docs/FUTURE_INTEGRATIONS.md)** - Planned features

## 🧪 Testing

### Smart Contract Tests
```bash
# Run all tests
cd contracts/router
cargo test

# Run integration tests
cargo test --lib integration_test

# Run with coverage
cargo test --lib -- --nocapture
```

### SDK Tests
```bash
# Run SDK tests
cd packages/sdk
npm test

# Run with coverage
npm run test:coverage
```

### Frontend Tests
```bash
# Run frontend tests
cd apps/web
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📊 Performance Metrics

### Gas Optimization
- **Task Creation**: ~15M gas
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

### Security Audits
- **Code Review**: Comprehensive code review process
- **Penetration Testing**: Regular security assessments
- **Smart Contract Audit**: Professional audit reports
- **Dependency Scanning**: Automated vulnerability scanning

## 🌐 Networks

### Supported Networks
- **DevNet**: https://devnet-gateway.multiversx.com
- **MainNet**: https://gateway.multiversx.com
- **TestNet**: https://testnet-gateway.multiversx.com

### Token Support
- **EGLD**: Native MultiversX token
- **USDC**: USD Coin (whitelisted)
- **UTK**: Utility Token (whitelisted)
- **MEX**: Mex Token (whitelisted)
- **Custom Tokens**: Configurable via admin interface

## 📈 Roadmap

### v0.4.0 (Planned)
- **AI-Powered Matching**: Intelligent agent-task matching
- **Advanced Analytics**: ML-based insights and predictions
- **Mobile App**: React Native mobile application
- **Governance**: DAO-based protocol governance
- **Cross-Chain**: Multi-chain support

### v0.5.0 (Future)
- **ZK Proofs**: Privacy-enhanced task execution
- **DeFi Integration**: Yield farming for staked tokens
- **NFT Integration**: Task result NFTs
- **API V2**: GraphQL API with subscriptions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 
'
"
Add
amazing
feature"'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Quality
- **Rust**: `cargo clippy` + `cargo fmt`
- **TypeScript**: ESLint + Prettier
- **Tests**: Minimum 80% coverage required
- **Documentation**: All public APIs documented

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MultiversX Team** - Excellent blockchain infrastructure
- **OpenAI Community** - Inspiration and guidance
- **Web3 Community** - Feedback and contributions
- **Early Adopters** - Beta testing and validation

## 📞 Support & Community

### Get Help
- **Documentation**: https://docs.ai-task-escrow.com
- **Discord Community**: https://discord.gg/ai-task-escrow
- **GitHub Issues**: https://github.com/ai-task-escrow/router/issues
- **Email Support**: support@ai-task-escrow.com

### Social Media
- **Twitter**: https://twitter.com/ai_task_escrow
- **LinkedIn**: https://linkedin.com/company/ai-task-escrow
- **Medium**: https://medium.com/ai-task-escrow

## 🎯 Quick Links

| Resource | Link |
|----------|-------|
| 🌐 Live App | https://app.ai-task-escrow.com |
| 📚 Documentation | https://docs.ai-task-escrow.com |
| 🔍 Explorer | https://explorer.multiversx.com |
| 💬 Discord | https://discord.gg/ai-task-escrow |
| 📊 Analytics | https://analytics.ai-task-escrow.com |

---

**🚀 AI Task Escrow Router v0.3.0 - Building the future of decentralized AI task execution!**

*Built with ❤️ by the AI Task Escrow Team*
