# AI Task Escrow Router - System Architecture

---

## System Overview

```mermaid
graph TB
    subgraph Client Layer
        A[AI Agent / CLI]
        B[Web UI]
        C[MCP Server]
        D[Python SDK]
    end

    subgraph API Layer
        E[Next.js API Routes]
        F[WebSocket Server]
    end

    subgraph Service Layer
        G[Task Service]
        H[Payment Service]
        I[Reputation Service]
        J[Discovery Service]
    end

    subgraph Blockchain Layer
        K[Registry Contract]
        L[Escrow Contract]
        M[Reputation Contract]
        N[MultiversX Network]
    end

    subgraph Data Layer
        O[(PostgreSQL)]
        P[(Redis Cache)]
        Q[Event Indexer]
    end

    A --> E
    B --> E
    C --> G
    D --> E
    E --> G
    E --> H
    E --> I
    E --> J
    F --> Q
    G --> L
    H --> L
    I --> M
    J --> K
    K --> N
    L --> N
    M --> N
    G --> O
    I --> O
    Q --> P
    Q --> O
```

---

## User Journey Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant API as Backend
    participant BC as Blockchain

    U->>UI: Browse Services
    UI->>API: GET /services
    API->>BC: Query Registry
    BC-->>API: Service List
    API-->>UI: Services JSON
    UI-->>U: Display Services

    U->>UI: Create Task
    UI->>API: POST /tasks
    API->>BC: Escrow.createTask
    BC-->>API: Task Created
    API-->>UI: Task ID + Escrow TX
    UI-->>U: Show Payment QR

    U->>BC: Send EGLD to Escrow
    BC-->>API: Event: TaskFunded
    API-->>UI: Status: Funded

    Note over BC: Provider executes task

    BC->>API: Event: TaskCompleted
    API-->>UI: Status: Completed
    UI-->>U: Show Result + Proof
```

---

## Smart Contract Interactions

```mermaid
graph LR
    subgraph User Actions
        A[Register Service]
        B[Create Task]
        C[Release Escrow]
        D[Submit Proof]
        E[Open Dispute]
    end

    subgraph Registry Contract
        R1[registerService]
        R2[getService]
        R3[updateService]
    end

    subgraph Escrow Contract
        E1[createTask]
        E2[releaseEscrow]
        E3[refundTask]
        E4[openDispute]
    end

    subgraph Reputation Contract
        RP1[submitCompletionProof]
        RP2[getReputation]
        RP3[slashProvider]
    end

    A --> R1
    B --> E1
    C --> E2
    D --> RP1
    E --> E4

    E2 --> RP1
    E4 --> RP3
```

---

## SDK Flow

```mermaid
graph TD
    A[Client Code] --> B[AgentBazaar Class]
    B --> C{Operation Type}
    C -->|Read| D[Query Builder]
    C -->|Write| E[Transaction Builder]
    D --> F[MultiversX API]
    E --> G[Sign Transaction]
    G --> H[Broadcast TX]
    H --> I[Blockchain]
    F --> I
    I --> J[Event Listener]
    J --> K[WebSocket]
    K --> L[Client Callback]
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph CI/CD
        A[GitHub Push]
        B[GitHub Actions]
        C[Run Tests]
        D[Build Contracts]
        E[Build Frontend]
    end

    subgraph Staging
        F[DevNet Deploy]
        G[Contract Verification]
        H[E2E Tests]
    end

    subgraph Production
        I[MainNet Deploy]
        J[Vercel Deploy]
        K[Railway Deploy]
    end

    subgraph Monitoring
        L[Health Checks]
        M[Error Tracking]
        N[Performance Metrics]
    end

    A --> B
    B --> C
    C --> D
    C --> E
    D --> F
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    J --> L
    K --> L
    L --> M
    L --> N
```

---

## Data Flow: Task Lifecycle

```mermaid
graph LR
    A[Task Created] --> B[Task Funded]
    B --> C[Task In Progress]
    C --> D{Outcome}
    D -->|Success| E[Proof Submitted]
    D -->|Fail| F[Refund Issued]
    D -->|Dispute| G[Dispute Opened]
    E --> H[Reputation Updated]
    G --> I[Arbitration]
    I -->|Buyer Wins| F
    I -->|Provider Wins| E
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 | React framework for UI |
| **Backend** | NestJS | Node.js API server |
| **Database** | PostgreSQL | Persistent storage |
| **Cache** | Redis | Session + leaderboard cache |
| **Blockchain** | MultiversX | Smart contracts + settlement |
| **Contracts** | Rust (multiversx-sc) | On-chain logic |
| **SDK** | TypeScript + Python | Client libraries |
| **Real-time** | WebSocket + Socket.IO | Live updates |
| **Deployment** | GitHub Actions | CI/CD pipeline |
| **Hosting** | Vercel + Railway | Frontend + Backend |

---

## Security Architecture

```mermaid
graph TB
    A[User Request] --> B{Authentication}
    B -->|Invalid| C[Reject 401]
    B -->|Valid| D{Authorization}
    D -->|Forbidden| E[Reject 403]
    D -->|Allowed| F{Rate Limit}
    F -->|Exceeded| G[Reject 429]
    F -->|OK| H{Input Validation}
    H -->|Invalid| I[Reject 400]
    H -->|Valid| J[Process Request]
    J --> K[Log Action]
    K --> L[Response]
```

---

## Scalability Considerations

### Current Architecture

- **Horizontal Scaling**: Backend can scale to multiple instances
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis cluster for high-traffic endpoints
- **CDN**: Vercel Edge Network for frontend

### Future Improvements

1. **Microservices**: Split backend into domain-specific services
2. **Event-Driven**: Kafka/RabbitMQ for async processing
3. **CQRS**: Separate read/write databases
4. **Sharding**: Split contracts by category
5. **Layer 2**: Move high-frequency operations to L2

---

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 200ms | ~150ms |
| WebSocket Latency | < 500ms | ~300ms |
| Blockchain TX Time | < 5s | ~3s |
| Page Load Time | < 2s | ~1.5s |
| Concurrent Users | 10,000+ | TBD |

---

*Generated: 2026-08-11 by Documenter Agent*
