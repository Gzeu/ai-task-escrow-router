# Contributing to AI Task Escrow Router

Thank you for your interest in contributing to AI Task Escrow Router! This document provides guidelines and information for contributors.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Development Workflow](#development-workflow)
- [Commit Conventions](#commit-conventions)
- [Branch Strategy](#branch-strategy)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

## Prerequisites

Before contributing, ensure you have the following installed:

- **Node.js** 18+ 
- **Rust** 1.70+ (for smart contract development)
- **pnpm** 8+ (package manager)
- **MultiversX CLI** (`mxpy`) for contract interactions
- **Docker** and **Docker Compose** for local development
- **Git** for version control

### Installation Commands

```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install pnpm
npm install -g pnpm@8

# Install MultiversX CLI
curl -L https://github.com/multiversx/mx-sdk-rs/releases/latest/download/mx-linux-x64.tar.gz | tar xz
sudo mv mx /usr/local/bin/
```

## Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ai-task-escrow-router.git
   cd ai-task-escrow-router
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Gzeu/ai-task-escrow-router.git
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Build all packages**
   ```bash
   pnpm build
   ```

5. **Run tests to verify setup**
   ```bash
   pnpm test
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Sync with upstream
git fetch upstream
git checkout master
git merge upstream/master

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 2. Make Changes

- Follow the code style guidelines
- Write tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @ai-task-escrow/sdk test
pnpm --filter @ai-task-escrow/indexer test

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Contract tests (if applicable)
cd contracts/router
mxpy contract test
```

### 4. Commit Your Changes

Follow the [commit conventions](#commit-conventions):

```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(sdk): add task creation method
fix(contracts): resolve escrow calculation bug
docs(readme): update installation instructions
test(indexer): add integration tests for events
refactor(web): simplify component structure
```

## Branch Strategy

### Main Branches

- `master`: Main development branch, always stable
- `develop`: (If needed) Integration branch for features

### Feature Branches

- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation changes
- `refactor/*`: Code refactoring
- `test/*`: Test additions/improvements

### Branch Naming

Use descriptive names with hyphens:

```bash
feature/task-creation-api
fix/escrow-calculation-bug
docs/api-documentation-update
refactor/sdk-client-architecture
```

## Pull Request Process

### Before Submitting

1. **Ensure your branch is up to date**
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. **Run all tests**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

3. **Squash commits if needed**
   ```bash
   # Interactive rebase to clean up commits
   git rebase -i upstream/master
   ```

### Pull Request Template

Use the provided PR template and ensure:

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] PR description is clear and detailed

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on different environments
4. **Approval** before merge

## Code Style

### TypeScript/JavaScript

- Use **TypeScript strict mode**
- No `any` types unless absolutely necessary
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Follow ESLint configuration

```typescript
// Good
interface TaskOptions {
  metadataUri: string;
  deadline: number;
  reviewTimeout: number;
}

/**
 * Creates a new task transaction
 * @param creator Address of the task creator
 * @param options Task configuration options
 * @param amount Amount in wei to lock in escrow
 */
export function buildCreateTaskTransaction(
  creator: string,
  options: TaskOptions,
  amount: string
): Transaction {
  // Implementation
}
```

### Rust (Smart Contracts)

- Follow `rustfmt` formatting
- Use `cargo clippy` without warnings
- Document public functions with `///`
- Use custom error types instead of panics
- Prefer `Result<T, Error>` over `Option<T>`

```rust
/// Creates a new task with the specified parameters
#[endpoint]
fn create_task(
    &self,
    #[payment_token] payment: EgldOrEsdtTokenPayment,
    metadata_uri: ManagedBuffer,
    deadline: u64,
    review_timeout: u64,
) -> TaskId {
    require!(metadata_uri.len() > 0, "Metadata URI cannot be empty");
    require!(deadline > 0, "Deadline must be positive");
    
    // Implementation
}
```

### General Guidelines

- Keep functions small and focused
- Use descriptive names
- Add comments for complex logic
- Follow DRY (Don't Repeat Yourself) principle
- Write tests for all public functions

## Testing

### Unit Tests

- Test all public functions
- Cover edge cases and error conditions
- Use descriptive test names
- Mock external dependencies

```typescript
describe('RouterEscrowClient', () => {
  describe('buildCreateTaskTransaction', () => {
    it('should create transaction with correct parameters', () => {
      // Test implementation
    });

    it('should throw error for invalid deadline', () => {
      // Test error case
    });
  });
});
```

### Integration Tests

- Test component interactions
- Use test environment setup
- Clean up after tests
- Test real-world scenarios

### Smart Contract Tests

- Test all endpoints
- Verify gas consumption
- Test edge cases
- Use proper test data

```rust
#[test]
fn test_create_task() {
    let mut blockchain = BlockchainMock::new();
    blockchain.set_current_dir(("mock", "file"));
    
    let owner_address = blockchain.create_user_account(&rust_biguint!(0));
    let user_address = blockchain.create_user_account(&rust_biguint!(1000000));
    
    // Test implementation
}
```

## Documentation

### Code Documentation

- Document all public APIs
- Use JSDoc for TypeScript
- Use `///` for Rust
- Include examples for complex functions

### README Updates

- Update installation instructions if needed
- Add new features to feature list
- Update configuration examples
- Keep documentation current

### API Documentation

- Update API docs for new endpoints
- Include request/response examples
- Document error codes
- Provide usage examples

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions or share ideas
- **Discord**: Join our community (link in README)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AI Task Escrow Router! 🚀
