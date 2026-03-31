# Contributing to AI Task Escrow Router

Thank you for your interest in contributing! This document covers everything you need to get started.

---

## Prerequisites

Make sure you have the following installed:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `npm i -g pnpm` |
| Rust | 1.70+ | [rustup.rs](https://rustup.rs) |
| mxpy | latest | [docs](https://docs.multiversx.com/sdk-and-tools/sdk-py/installing-mxpy/) |

---

## Local Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/ai-task-escrow-router.git
cd ai-task-escrow-router

# 2. Install dependencies
pnpm install

# 3. Configure environments
cp apps/web/.env.example apps/web/.env.local
cp packages/indexer/.env.example packages/indexer/.env

# 4. Verify everything builds
pnpm build
pnpm type-check
pnpm lint
```

---

## Branch Strategy

```
master              ← stable, protected
  └─ feature/*       ← new features
  └─ fix/*           ← bug fixes
  └─ docs/*          ← documentation changes
  └─ chore/*         ← tooling, deps, config
  └─ refactor/*      ← code refactors without behavior change
```

```bash
# Example
git checkout -b feature/agent-reputation-system
```

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, config |
| `test` | Adding or updating tests |
| `refactor` | Code change with no behavior change |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### Examples

```bash
git commit -m "feat(sdk): add ESDT multi-token support"
git commit -m "fix(contract): correct dispute timeout calculation"
git commit -m "docs(readme): update quick start section"
git commit -m "chore(deps): bump @multiversx/sdk-core to 13.x"
```

---

## Code Standards

### TypeScript (SDK & Frontend)

- `strict: true` is enforced — no `any` types
- All public SDK functions must have JSDoc comments
- Error handling must be explicit — no silent catches
- Run before committing:

```bash
pnpm type-check
pnpm lint
pnpm test
```

### Rust (Smart Contract)

- Follow [MultiversX smart contract guidelines](https://docs.multiversx.com/developers/developer-reference/sc-contract-best-practices/)
- All public endpoints must have `///` doc comments
- Run before committing:

```bash
cd contracts/router
cargo fmt
cargo clippy -- -D warnings
cargo test
```

---

## Pull Request Process

1. **Create your branch** from `master`
2. **Make your changes** following the code standards above
3. **Test your changes** — add tests for new behavior
4. **Update documentation** if you changed any public API
5. **Submit your PR** — fill in the PR template completely
6. **Address review feedback** promptly

PRs are merged by squash to keep the `master` history clean.

---

## Project Structure

```
ai-task-escrow-router/
├── contracts/router/      # Rust smart contract
│   └── src/
│       └── lib.rs           # Main contract entry
├── packages/
│   ├── sdk/               # @ai-task-escrow/sdk
│   │   └── src/
│   │       ├── index.ts     # Exports
│   │       ├── types.ts     # All TypeScript types
│   │       └── utils.ts     # Shared utilities
│   └── indexer/           # On-chain event indexer
├── apps/
│   └── web/               # Next.js frontend
├── docs/                  # Technical docs
└── .github/               # CI/CD, templates
```

---

## Getting Help

- Open a [GitHub Issue](https://github.com/Gzeu/ai-task-escrow-router/issues) for bugs or feature requests
- Use [GitHub Discussions](https://github.com/Gzeu/ai-task-escrow-router/discussions) for questions
