export interface IndexedTask {
  _id: string;
  taskId: number;
  creator: string;
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
  indexedAt: number;
  lastUpdated: number;
}

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

export interface IndexedEvent {
  _id: string;
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
  paymentAmount: string;
  metadataUri: string;
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

export interface ConfigChangedEvent {}

export type ParsedEvent = 
  | TaskCreatedEvent
  | TaskAcceptedEvent
  | ResultSubmittedEvent
  | TaskApprovedEvent
  | TaskCancelledEvent
  | DisputeOpenedEvent
  | DisputeResolvedEvent
  | TaskRefundedEvent
  | ConfigChangedEvent;

export interface AgentStats {
  _id: string;
  address: string;
  totalTasks: number;
  completedTasks: number;
  disputedTasks: number;
  totalEarnings: string;
  averageRating?: number;
  reputationScore?: number;
  lastActive: number;
  indexedAt: number;
  lastUpdated: number;
}

export interface CreatorStats {
  _id: string;
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
  _id: string;
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

export interface IndexerConfig {
  network: 'mainnet' | 'testnet' | 'devnet';
  apiUrl: string;
  contractAddress: string;
  mongodb: {
    url: string;
    database: string;
  };
  redis: {
    url: string;
  };
  indexing: {
    batchSize: number;
    syncInterval: number;
    startBlock: number;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
  };
}

export interface IndexingProgress {
  lastProcessedBlock: number;
  currentBlock: number;
  totalBlocks: number;
  eventsProcessed: number;
  tasksIndexed: number;
  errors: number;
  lastSyncTime: number;
}

export interface EventFilter {
  fromBlock?: number;
  toBlock?: number;
  address?: string;
  eventIdentifiers?: string[];
  topics?: string[];
}

export interface TaskFilter {
  creator?: string;
  assignedAgent?: string;
  state?: TaskState;
  states?: TaskState[];
  createdAfter?: number;
  createdBefore?: number;
  deadlineAfter?: number;
  deadlineBefore?: number;
  minAmount?: string;
  maxAmount?: string;
}

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
