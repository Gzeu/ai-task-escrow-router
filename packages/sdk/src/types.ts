/**
 * AI Task Escrow Router SDK Types
 * Updated to match Rust contract structures
 */

// Core enums - matching Rust exactly
export enum TaskState {
  Open = "Open",
  Accepted = "Accepted", 
  Submitted = "Submitted",
  Approved = "Approved",
  Cancelled = "Cancelled",
  Disputed = "Disputed",
  Refunded = "Refunded",
  Resolved = "Resolved"
}

export enum VerificationStatus {
  Unverified = "Unverified",
  Pending = "Pending",
  Verified = "Verified",
  Suspended = "Suspended"
}

export enum DisputeResolution {
  FullRefund = "FullRefund",
  PartialRefund = "PartialRefund",
  FullPayment = "FullPayment"
}

// Core interfaces - matching Rust struct fields exactly
export interface Task {
  taskId: bigint;
  creator: string;
  assignedAgent: string | null;
  paymentToken: string;
  paymentAmount: bigint;
  paymentNonce: bigint;
  protocolFeeBps: number;
  createdAt: number;
  acceptedAt: number | null;
  deadline: number | null;
  reviewTimeout: number | null;
  metadataUri: string;
  resultUri: string | null;
  state: TaskState;
  disputeMetadata: string | null;
  ap2MandateHash: string | null;
  x402SettlementRef: string | null;
  agentReputationSnapshot: number | null;
  priorityFee: bigint | null;
  gasUsed: bigint | null;
  completionTime: number | null;
}

export interface AgentReputation {
  address: string;
  totalTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  disputedTasks: number;
  totalEarned: bigint;
  reputationScore: number;
  averageRating: number;
  lastActive: number;
  createdAt: number;
  specialization: string[];
  verificationStatus: VerificationStatus;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  averageCompletionTime: number;
  successRate: number; // basis points
  disputeRate: number; // basis points
  totalEarnedLast30d: bigint;
  tasksCompletedLast30d: number;
}

export interface Config {
  owner: string;
  treasury: string;
  feeBps: number;
  resolver: string | null;
  paused: boolean;
  minReputation: number;
  maxTaskValue: bigint | null;
  reputationDecayRate: number;
  emergencyPause: boolean;
  upgradeProposalThreshold: number;
  maxConcurrentTasks: number;
}

// Configuration interfaces
export interface NetworkConfig {
  chainId: string;
  contractAddress: string;
  apiTimeout: number;
  gasLimit: number;
}

export interface RouterEscrowClientConfig {
  network: 'devnet' | 'mainnet' | 'testnet';
  contractAddress: string;
  apiTimeout?: number;
  gasLimit?: {
    createTask?: number;
    acceptTask?: number;
    submitResult?: number;
    approveTask?: number;
    cancelTask?: number;
    openDispute?: number;
    resolveDispute?: number;
    claimApproval?: number;
    refundExpiredTask?: number;
    batchTaskOperations?: number;
  };
}

// Transaction result
export interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

// Core parameters - matching Rust function signatures
export interface CreateTaskParams {
  metadataUri: string;
  paymentAmount: bigint;
  paymentToken?: string; // default: 'EGLD'
  deadline?: number;
  reviewTimeout?: number;
  ap2MandateHash?: string;
  priorityFee?: bigint;
}

export interface SubmitResultParams {
  taskId: bigint;
  resultUri: string;
}

export interface OpenDisputeParams {
  taskId: bigint;
  reasonUri: string;
}

export interface ResolveDisputeParams {
  taskId: bigint;
  resolution: DisputeResolution;
  x402SettlementRef?: string;
}

export interface BatchTaskOperation {
  operationType: 'BatchCancel' | 'BatchApprove' | 'BatchRefund';
  taskIds: bigint[];
  parameters: string[];
}

export interface AgentReputationUpdate {
  address: string;
  totalTasks?: number;
  completedTasks?: number;
  reputationScore?: number;
  averageRating?: number;
}

export interface VerifyAgentParams {
  specialization: string;
}

export interface ProposeUpgradeParams {
  proposalHash: string;
  votingPeriod: number;
  executionDelay: number;
}

// Utility functions
export const formatAmount = (amount: bigint | string): string => {
  const num = Number(amount) / 1e18;
  return num.toFixed(4) + ' EGLD';
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Error handling
export class RouterEscrowError extends Error {
  constructor(
    message: string,
    public code?: string,
    public txHash?: string
  ) {
    super(message);
    this.name = 'RouterEscrowError';
  }
}

// Event types - matching Rust events
export interface TaskCreatedEvent {
  taskId: bigint;
  creator: string;
  paymentAmount: bigint;
  paymentToken: string;
  metadataUri: string;
}

export interface TaskAcceptedEvent {
  taskId: bigint;
  agent: string;
}

export interface ResultSubmittedEvent {
  taskId: bigint;
  resultUri: string;
}

export interface TaskApprovedEvent {
  taskId: bigint;
  protocolFee: bigint;
  agentPayment: bigint;
}

export interface TaskCancelledEvent {
  taskId: bigint;
}

export interface DisputeOpenedEvent {
  taskId: bigint;
  reasonUri: string;
}

export interface DisputeResolvedEvent {
  taskId: bigint;
  resolution: DisputeResolution;
}

export interface TaskRefundedEvent {
  taskId: bigint;
}
