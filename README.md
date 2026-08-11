# ��� AI Task Escrow Router v0.4.0 (MX-8004 Ready)

[![CI](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/ci.yml/badge.svg)](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/ci.yml)
[![Contract Check](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/contract-check.yml/badge.svg)](https://github.com/Gzeu/ai-task-escrow-router/actions/workflows/contract-check.yml)
[![Version](https://img.shields.io/badge/version-0.4.0-orange.svg)](https://github.com/Gzeu/ai-task-escrow-router/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A comprehensive decentralized AI task execution platform built on MultiversX blockchain, featuring **complete ESDT multi-token support**, reputation systems, organizations, and advanced analytics.

> **Status:** v0.4.0 is fully MX-8004 compliant and deployable on DevNet. This release includes full ESDT multi-token support, official Model Context Protocol (MCP) integration, and registration on MultiversX MX-8004 standards with soulbound identity NFTs.

## �� Core Functionality
- ��� Multi-Token Support - Complete ESDT multi-token support with EGLD, USDC, UTK, MEX and custom ESDT tokens
- ��� Agent Reputation System - Weighted scoring with staking and slashing mechanisms
- ��� Organization Management - Create and manage organizations with RBAC (Role-Based Access Control)
- ��� Advanced Analytics - Real-time task statistics and performance metrics tracking
- ������ Dispute Resolution - Automated and manual dispute handling with fair resolution
- ��� Batch Operations - Efficient bulk task management operations
- ��� Security-First Design - Comprehensive access controls and validation mechanisms

### ��� MX-8004 Upgrade (Next Level)
- **Trustless Escrow & Reputation**: Full integration with MX-8004 contracts (Identity, Validation, Reputation, Escrow, Session)
- **Agent Registration**: Soulbound NFT identity registered on MX-8004 via `scripts/mx_8004_registration.sh`
- **Official MCP Endpoint**: `@multiversx/mcp` replaces custom MCP server with standard integration

## ��� ESDT Multi-Token Features
- **Transaction Builders**: `buildCreateTaskWithToken()`, `buildAcceptAnyToken()`
- **Query Methods**: `getTokenInfo()`, `validateToken()`, `getSupportedTokens()`
- **Utility Functions**: `createTokenPayment()`, `createEGLDPayment()`, `createESDTPayment()`
- **Amount Handling**: `formatTokenAmount()`, `parseTokenAmount()` with decimal support
- **Token Validation**: Comprehensive token validation and information retrieval
- **Type Safety**: Full TypeScript support with proper interfaces and error handling

## ��� MCP Server (Official MultiversX)

The most unique feature: a **Model Context Protocol (MCP) server** that allows AI agents (Claude, GPT-4, Cursor, Windsurf, etc.) to directly interact with the escrow router — creating tasks, checking status, managing disputes, and querying reputation — all through natural language.

### What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io) is an open standard that lets LLM-powered tools call external services via structured tool definitions. The official MultiversX MCP server replaces the custom implementation with standard compliance.

### Available MCP Tools
| Tool | Description |
|------|-------------|
| `create_task` | Create a new escrow task with token payment |
| `accept_task` | Accept an escrow task |
| `cancel_task` | Cancel an active task |
| `refund_task` | Refund a task (if within deadline) |
| `query_task` | Get status of a task |
| `check_reputation` | Get agent's reputation score |

### MCP Setup

**For Claude Desktop / Cursor (JSON config):**
```json
{
  "mcpServers": {
    "multiversx-mcp": {
      "command": "npx",
      "args": ["-y", "@multiversx/mcp"],
      "env": {
        "MVX_NETWORK": "devnet",
        "MVX_WALLET": "/absolute/path/to/your-wallet.pem"
      }
    }
  }
}
```

**Or build from source:**
```bash
git clone https://github.com/multiversx/mx-mcp.git
cd mx-mcp
npm install
npm run build
```

## ��� Performance Metrics
- **Transaction Response**: < 30 seconds
- **Frontend Load**: < 3 seconds
- **API Response**: < 2 seconds
- **Uptime**: > 99.9%

## ��� Security
- Access Control: Role-based permissions
- Token Validation: Whitelist-based management
- Anti-Manipulation: Reputation system safeguards
- Audit Trail: Complete event logging

## ��� Networks
- **MainNet**: https://gateway.multiversx.com (deploy coming soon)
- **DevNet**: https://devnet-gateway.multiversx.com
- **TestNet**: https://testnet-gateway.multiversx.com

## ��� Roadmap
- **v0.5.0 (Planned)**: Cross-chain integration, ZK proofs, NFT integration
- **Completed**: AI-Powered Matching (v0.4.0), Official MCP Integration, MX-8004 Registration

## ��� Documentation
- [Complete API Reference](/docs/API_v0.4.0.md)
- [Smart Contract Docs](/docs/CONTRACT.md)
- [SDK Documentation](/docs/SDK.md)
- [Deployment Guide](/docs/DEPLOYMENT.md)
- [Agent Protocol Specification](/docs/AGENT_PROTOCOL.md) - NEW

