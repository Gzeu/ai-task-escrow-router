# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Progress
- Integration test suite
- `.env.example` files for each package
- JSDoc coverage for SDK public API
- ESDT multi-token support (v0.2.0)

---

## [0.1.0] — 2026-03-31

### Added
- Core smart contract (Rust / MultiversX framework)
  - Task lifecycle management (create, accept, complete, dispute)
  - On-chain escrow and settlement logic
  - Basic dispute resolution mechanism
  - Emergency pause mechanism
- TypeScript SDK (`@ai-task-escrow/sdk`)
  - `RouterEscrowClient` — core contract interaction client
  - `EnhancedClient` — extended features
  - `EcosystemClient` — ecosystem integrations
  - `EnterpriseClient` — enterprise features scaffolding
  - `ProductionClient` — production-grade utilities
  - Full TypeScript strict mode, type definitions, and constants
- On-chain event indexer (`packages/indexer`, Node.js)
- Frontend dashboard (`apps/web`, Next.js + Tailwind CSS)
  - Wallet connection support
  - Task creation and management UI
  - Dashboard views per feature tier
- GitHub Actions CI/CD
  - `ci.yml` — TypeScript type-check, lint, build on every PR
  - `contract-check.yml` — `cargo fmt`, `cargo clippy`, `cargo test`
  - `release.yml` — npm publish on version tag
- GitHub templates: PR template, bug report, feature request
- Documentation: ARCHITECTURE.md, CONTRACT.md, ROADMAP.md, FUTURE_INTEGRATIONS.md
- Monorepo setup with pnpm workspaces

---

[Unreleased]: https://github.com/Gzeu/ai-task-escrow-router/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Gzeu/ai-task-escrow-router/releases/tag/v0.1.0
