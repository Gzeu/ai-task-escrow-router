// =============================================================================
// Core Domain Types
// =============================================================================

export enum TaskState {
  Open = 'Open',
  Accepted = 'Accepted',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Cancelled = 'Cancelled',
  Disputed = 'Disputed',
  Resolved = 'Resolved',
  Refunded = 'Refunded',
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  metadataUri?: string;
  admin: string;
  members: string[];
  totalTasks: number;
  completedTasks: number;
  totalVolume: string;
  createdAt: number;
  updatedAt: number;
}

export interface IndexedTask {
  _id?: string;
  taskId: number;
  creator: string;
  organizationId?: string;
  assignedAgent?: string;
  paymentToken: string;
  paymentAmount: string;
  protocolFeeBps: number;
  createdAt: number;
  acceptedAt?: number;
  deadline?: number;
  reviewTimeout?: number;
  metadataUri: string;
  resultUri?: string;
  state: TaskState;
  disputeMetadata?: string;
  ap2MandateHash?: string;
  x402SettlementRef?: string;
  txHash?: string;
  indexedAt: number;
  lastUpdated: number;
}

export interface AgentStats {
  address: string;
  totalTasks: number;
  completedTasks: number;
  disputedTasks: number;
  cancelledTasks: number;
  totalEarnings: string;
  averageRating?: number;
  reputationScore: number;
  lastActive: number;
  indexedAt: number;
  lastUpdated: number;
}

export interface CreatorStats {
  address: string;
  totalTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  totalSpent: string;
  averageTaskValue: string;
  lastActive: number;
  indexedAt: number;
  lastUpdated: number;
}

export interface ProtocolStats {
  totalTasks: number;
  totalVolume: string;
  totalProtocolFees: string;
  activeTasks: number;
  disputeRate: number;
  averageTaskValue: string;
  topAgents: AgentStats[];
  topCreators: CreatorStats[];
  lastUpdated: number;
}

export interface IndexedEvent {
  id?: string;
  taskId?: number;
  txHash: string;
  eventIdentifier: string;
  address: string;
  topics: string[];
  data: string;
  timestamp: number;
  blockNumber: number;
  processed: boolean;
  indexedAt: number;
}

export interface TaskCreatedEvent {
  taskId: number;
  creator: string;
  organizationId?: string;
  paymentToken: string;
  paymentAmount: string;
  protocolFeeBps: number;
  metadataUri: string;
  deadline: number;
  reviewTimeout: number;
}

export interface TaskAcceptedEvent {
  taskId: number;
  agent: string;
}

export interface ResultSubmittedEvent {
  taskId: number;
  resultUri: string;
}

export interface TaskApprovedEvent {
  taskId: number;
  protocolFee: string;
  agentPayment: string;
}

export interface TaskCancelledEvent {
  taskId: number;
}

export interface DisputeOpenedEvent {
  taskId: number;
  reasonUri: string;
}

export interface DisputeResolvedEvent {
  taskId: number;
  resolution: string;
}

export interface TaskRefundedEvent {
  taskId: number;
}

export interface OrganizationCreatedEvent {
  organizationId: string;
  name: string;
  admin: string;
}

export interface OrganizationUpdatedEvent {
  organizationId: string;
}

export interface ConfigChangedEvent {
  paramKey: string;
  newValue: string;
}

export type ParsedEvent =
  | TaskCreatedEvent
  | TaskAcceptedEvent
  | ResultSubmittedEvent
  | TaskApprovedEvent
  | TaskCancelledEvent
  | DisputeOpenedEvent
  | DisputeResolvedEvent
  | TaskRefundedEvent
  | OrganizationCreatedEvent
  | OrganizationUpdatedEvent
  | ConfigChangedEvent;

// =============================================================================
// Configuration Types
// =============================================================================

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
}

export interface IndexingConfig {
  batchSize: number;
  syncInterval: number;
  startBlock: number;
  maxRetries: number;
  retryDelay: number;
}

export interface ApiConfig {
  port: number;
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export interface WebSocketConfig {
  port: number;
  pingInterval: number;
  pingTimeout: number;
}

export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'simple';
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsPort: number;
}

export interface IndexerConfig {
  network: 'mainnet' | 'testnet' | 'devnet';
  apiUrl: string;
  gatewayWsUrl: string;
  contractAddress: string;
  postgres: PostgresConfig;
  redis: RedisConfig;
  indexing: IndexingConfig;
  api: ApiConfig;
  websocket: WebSocketConfig;
  logging: LoggingConfig;
  monitoring: MonitoringConfig;
}

// =============================================================================
// API Types
// =============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface EventFilter {
  fromBlock?: number;
  toBlock?: number;
  address?: string;
  eventIdentifiers?: string[];
  topics?: string[];
  taskId?: number;
}

export interface TaskFilter {
  creator?: string;
  assignedAgent?: string;
  organizationId?: string;
  state?: TaskState;
  states?: TaskState[];
  createdAfter?: number;
  createdBefore?: number;
  deadlineAfter?: number;
  deadlineBefore?: number;
  minAmount?: string;
  maxAmount?: string;
  paymentToken?: string;
}

// =============================================================================
// Indexing Types
// =============================================================================

export interface IndexingProgress {
  lastProcessedBlock: number;
  currentBlock: number;
  totalBlocks: number;
  eventsProcessed: number;
  tasksIndexed: number;
  organizationsIndexed: number;
  errors: number;
  lastSyncTime: number;
}

export interface WebSocketMessage {
  type: 'event' | 'progress' | 'error' | 'stats';
  payload: any;
  timestamp: number;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    websocket: ServiceStatus;
  };
  version: string;
  uptime: number;
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  lastCheck: number;
  error?: string;
  latency?: number;
}
