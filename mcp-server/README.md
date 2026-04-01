# AI Task Escrow MCP Server

Model Context Protocol (MCP) server for AI Task Escrow Router, enabling AI agents to interact with the MultiversX blockchain smart contract.

## 🚀 Features

### Core Tools
- **create_task** - Create new AI tasks with ESDT multi-token payments
- **submit_result** - Submit task results for accepted tasks
- **claim_payment** - Claim payments for completed tasks
- **get_task** - Retrieve task details and status
- **get_tasks** - List tasks with filtering options
- **get_agent_reputation** - Get agent reputation scores
- **get_supported_tokens** - List supported ESDT tokens

### ESDT Multi-Token Support
- EGLD (native MultiversX token)
- USDC, UTK, MEX (whitelisted tokens)
- Custom ESDT tokens
- Automatic token validation and conversion

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/ai-task-escrow/router.git
cd router/mcp-server

# Install dependencies
npm install

# Build the server
npm run build

# Start the MCP server
npm start
```

## 🛠️ Configuration

The MCP server uses the AI Task Escrow Router smart contract on MultiversX MainNet:

```typescript
export const config: RouterEscrowClientConfig = {
  contractAddress: 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsh',
  network: 'mainnet'
};
```

## 🔧 Usage

### Claude Desktop Integration

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ai-task-escrow": {
      "command": "node",
      "args": ["path/to/mcp-server/dist/index.js"]
    }
  }
}
```

### Available Tools

#### create_task
Create a new AI task with payment:

```typescript
{
  metadataUri: "ipfs://QmTaskMetadata",
  paymentToken: "EGLD",
  paymentAmount: "1000000000000000000",
  creatorAddress: "erd1creator...",
  deadline: 86400,
  reviewTimeout: 3600
}
```

#### submit_result
Submit result for an accepted task:

```typescript
{
  taskId: "123",
  resultUri: "ipfs://QmTaskResult",
  agentAddress: "erd1agent..."
}
```

#### claim_payment
Claim payment for completed task:

```typescript
{
  taskId: "123",
  claimantAddress: "erd1agent..."
}
```

#### get_task
Get task details:

```typescript
{
  taskId: "123"
}
```

#### get_agent_reputation
Get agent reputation:

```typescript
{
  agentAddress: "erd1agent..."
}
```

## 🔒 Security

- **Transaction Building**: Server only builds unsigned transactions
- **No Private Keys**: Server never handles private keys
- **Validation**: All inputs validated using Zod schemas
- **Network**: Uses secure MultiversX MainNet gateway

## 📊 Supported Tokens

| Token | Type | Status |
|-------|------|--------|
| EGLD | Native | ✅ Active |
| USDC | ESDT | ✅ Whitelisted |
| UTK | ESDT | ✅ Whitelisted |
| MEX | ESDT | ✅ Whitelisted |
| Custom | ESDT | 🔧 Configurable |

## 🧪 Development

```bash
# Watch mode for development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📚 Documentation

- [AI Task Escrow Router](../README.md) - Main project documentation
- [Smart Contract](../contracts/router/) - Contract implementation
- [TypeScript SDK](../packages/sdk/) - SDK documentation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.
