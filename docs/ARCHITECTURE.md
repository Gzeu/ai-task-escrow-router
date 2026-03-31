# AI Task Escrow Router - Architecture

## Overview

AI Task Escrow Router is a comprehensive on-chain escrow and settlement protocol designed for AI-mediated task execution on the MultiversX blockchain. The architecture consists of multiple interconnected components that work together to provide a secure, efficient, and extensible platform for task management.

## System Architecture

### Core Components

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

### Component Responsibilities

#### 1. Smart Contract (RouterEscrow)
- **Location**: `/contracts/router/src/lib.rs`
- **Language**: Rust (MultiversX Framework)
- **Purpose**: Core escrow logic, task state management, and fund custody
- **Key Features**:
  - Task lifecycle management
  - Secure fund escrow and settlement
  - Dispute resolution mechanisms
  - Protocol fee collection
  - Event emission for indexing

#### 2. TypeScript SDK
- **Location**: `/packages/sdk/src/`
- **Purpose**: Developer-friendly interface for interacting with the protocol
- **Key Features**:
  - Type-safe contract interactions
  - Transaction builders
  - Event parsing utilities
  - Validation helpers
  - Network configuration management

#### 3. Frontend Application
- **Location**: `/apps/web/src/`
- **Technology**: Next.js + TypeScript + Tailwind CSS
- **Purpose**: User interface for task creation, management, and monitoring
- **Key Features**:
  - Wallet integration
  - Task creation and management flows
  - Real-time status updates
  - Protocol analytics dashboard

#### 4. Event Indexer
- **Location**: `/packages/indexer/src/`
- **Technology**: Node.js + MongoDB + Redis
- **Purpose**: Real-time event processing and data aggregation
- **Key Features**:
  - Event ingestion and parsing
  - Task state synchronization
  - Analytics computation
  - API endpoints for frontend

## Data Flow

### Task Creation Flow
1. User creates task via frontend
2. Frontend uses SDK to build transaction
3. Transaction sent to smart contract
4. Funds locked in escrow
5. TaskCreated event emitted
6. Indexer processes event and updates database

### Task Execution Flow
1. Agent accepts task through frontend
2. Smart contract updates task state
3. TaskAccepted event emitted
4. Agent performs task off-chain
5. Agent submits result
6. ResultSubmitted event emitted
7. Creator reviews and approves
8. Funds released to agent and treasury

### Dispute Resolution Flow
1. Either party opens dispute
2. DisputeOpened event emitted
3. Resolver reviews evidence
4. Resolution applied to smart contract
5. Funds distributed according to resolution
6. DisputeResolved event emitted

## State Management

### Task States
```
Open → Accepted → Submitted → Approved
  ↓         ↓         ↓
Cancelled  Disputed   Resolved
  ↓         ↓         ↓
Refunded   Refunded   Refunded
```

### Storage Layout

#### Smart Contract Storage
- `config`: Protocol configuration (owner, treasury, fees, etc.)
- `tasks`: Individual task records indexed by task_id
- `task_counter`: Auto-incrementing task identifier

#### Indexer Database Schema
- `tasks`: Complete task records with enhanced metadata
- `events`: Raw and parsed contract events
- `agent_stats`: Agent performance metrics
- `creator_stats`: Creator activity metrics
- `protocol_stats`: Aggregated protocol statistics

## Security Architecture

### Smart Contract Security
- **Access Control**: Role-based permissions for admin functions
- **State Validation**: Strict state transition enforcement
- **Reentrancy Protection**: Prevents recursive calls
- **Overflow Protection**: Safe arithmetic operations
- **Pause Mechanism**: Emergency protocol suspension

### Frontend Security
- **Input Validation**: Client-side and server-side validation
- **XSS Protection**: Content Security Policy implementation
- **Secure Communication**: HTTPS only
- **Wallet Security**: Proper signature verification

### Indexer Security
- **Data Integrity**: Event signature verification
- **Rate Limiting**: API endpoint protection
- **Database Security**: Encrypted connections and access controls

## Integration Points

### MultiversX Ecosystem
- **UCP Integration**: Structured discovery for agent services
- **ACP Integration**: Programmatic checkout for task marketplaces
- **AP2 Integration**: Delegated intent authorization
- **MCP Integration**: Structured tool access for AI agents
- **x402 Integration**: HTTP-native settlement references

### External Systems
- **IPFS**: Decentralized metadata and result storage
- **Oracle Integration**: External data verification
- **Reputation Systems**: Agent trust scoring
- **Payment Processors**: Multi-token support

## Performance Considerations

### Scalability
- **Batch Processing**: Indexer processes events in batches
- **Caching**: Redis layer for frequently accessed data
- **Database Optimization**: Indexed queries and pagination
- **Gas Optimization**: Efficient smart contract operations

### Reliability
- **Error Handling**: Comprehensive error recovery mechanisms
- **Monitoring**: Real-time system health tracking
- **Backup Procedures**: Regular data backups
- **Failover**: Redundant indexer instances

## Future Extensibility

### Protocol Extensions
- **Multi-Token Support**: ESDT and NFT payments
- **Advanced Dispute Resolution**: Arbitration integration
- **Time-Locked Tasks**: Vesting schedules
- **Conditional Tasks**: Automated execution triggers

### Platform Extensions
- **Agent Marketplace**: Discovery and matching services
- **Reputation System**: Trust and reliability scoring
- **Analytics Dashboard**: Advanced insights and reporting
- **Mobile Applications**: Cross-platform support

## Deployment Architecture

### Network Support
- **Mainnet**: Production deployment
- **Testnet**: Development and testing
- **Devnet**: Experimental features

### Infrastructure
- **Smart Contract**: Deployed on MultiversX network
- **Frontend**: Vercel/Netlify deployment
- **Indexer**: Cloud-based container deployment
- **Database**: Managed MongoDB service
- **Cache**: Managed Redis service

This architecture provides a solid foundation for a production-ready escrow protocol while maintaining flexibility for future enhancements and integrations.
