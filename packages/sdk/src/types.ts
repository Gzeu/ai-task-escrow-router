/**
 * AI Task Escrow Router SDK Types
 * Updated to match Rust contract structures - v0.3.0 with ESDT, Reputation, Organizations, Analytics
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

// v0.3.0 - Organization enums
export enum OrganizationRole {
  Owner = "Owner",
  Admin = "Admin",
  Member = "Member",
  Agent = "Agent"
}

// Core interfaces - matching Rust struct fields exactly
export interface Task {
  taskId: bigint;
  creator: string;
  assignedAgent: string | null;
  paymentToken: string; // ESDT token identifier or "EGLD"
  paymentAmount: bigint;
  paymentNonce: bigint; // ESDT nonce (0 for EGLD)
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

// ESDT Multi-Token Support Types
export interface TokenPayment {
  tokenIdentifier: string; // ESDT token identifier or "EGLD"
  amount: bigint;
  nonce: bigint; // ESDT nonce (0 for EGLD)
}

export interface TokenInfo {
  identifier: string;
  name: string;
  decimals: number;
  totalSupply: bigint;
  isEGLD: boolean;
}

export interface TokenValidationResult {
  isValid: boolean;
  tokenInfo?: TokenInfo;
  error?: string;
}

export interface CreateTaskWithTokenParams {
  metadataUri: string;
  deadline?: number;
  reviewTimeout?: number;
  ap2MandateHash?: string;
  priorityFee?: bigint;
  payment: TokenPayment; // ESDT payment details
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

// v0.2.0 - ESDT Multi-Token Support (Enhanced)
export interface TokenWhitelistEntry {
  tokenIdentifier: string;
  isEnabled: boolean;
  minAmount: bigint;
  maxAmount: bigint;
  feeDiscountBps: number;
}

// ESDT Multi-Token Query Parameters
export interface GetTokenInfoParams {
  tokenIdentifier: string;
}

export interface ValidateTokenParams {
  tokenIdentifier: string;
}

export interface GetSupportedTokensParams {
  // No parameters needed
}

export interface AcceptAnyTokenParams {
  payment: TokenPayment;
}

// ESDT Multi-Token Query Results
export interface TokenInfoResult {
  identifier: string;
  name: string;
  decimals: number;
  totalSupply: string; // BigUint as string
  isEGLD: boolean;
}

export interface SupportedTokensResult {
  tokens: string[]; // Array of token identifiers
}

// v0.3.0 - Organization interfaces
export interface Organization {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: number;
  isActive: boolean;
  memberCount: number;
  totalTasksCompleted: number;
  totalRevenue: bigint;
}

export interface OrganizationMember {
  address: string;
  role: OrganizationRole;
  joinedAt: number;
  permissions: string[];
}

// v0.3.0 - Analytics interfaces
export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  disputedTasks: number;
  totalVolume: bigint;
  averageTaskValue: bigint;
  mostActiveAgent: string | null;
  peakDailyTasks: number;
}

export interface AgentPerformance {
  address: string;
  reputationScore: number;
  successRate: number;
  averageCompletionTime: number;
  totalEarned: bigint;
  tasksCompletedLast30d: number;
  specializationCount: number;
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
    approveResult?: number;
    cancelTask?: number;
    openDispute?: number;
    disputeTask?: number;
    resolveDispute?: number;
    acceptAnyToken?: number;
    getTokenInfo?: number;
    validateToken?: number;
    getSupportedTokens?: number;
    getRevenueMetrics?: number;
    updateReputationAfterTask?: number;
    getTopAgents?: number;
    stakeReputation?: number;
    unstakeReputation?: number;
    slashReputation?: number;
    // v0.3.0 Organization endpoints
    createOrganization?: number;
    joinOrganization?: number;
    leaveOrganization?: number;
    addOrgMember?: number;
    removeOrgMember?: number;
    updateOrgMemberRole?: number;
    // v0.3.0 Analytics endpoints
    getTaskStatistics?: number;
    getAgentPerformance?: number;
    getTopPerformingAgents?: number;
    getRevenueMetrics?: number;
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

// v0.2.0 - ESDT Token Management
export interface AddTokenToWhitelistParams {
  tokenIdentifier: string;
  minAmount: bigint;
  maxAmount: bigint;
  feeDiscountBps: number;
}

export interface UpdateTokenWhitelistParams {
  tokenIdentifier: string;
  isEnabled: boolean;
  minAmount: bigint;
  maxAmount: bigint;
  feeDiscountBps: number;
}

export interface UpdateReputationAfterTaskParams {
  taskId: bigint;
  success: boolean;
  completionTime: number;
}

export interface StakeReputationParams {
  amount: bigint;
}

export interface UnstakeReputationParams {
  amount: bigint;
}

export interface SlashReputationParams {
  agent: string;
  amount: bigint;
}

// v0.3.0 - Organization Management
export interface CreateOrganizationParams {
  name: string;
  description: string;
}

export interface JoinOrganizationParams {
  orgId: string;
}

export interface LeaveOrganizationParams {
  orgId: string;
}

export interface AddOrgMemberParams {
  orgId: string;
  member: string;
  role: OrganizationRole;
  permissions: string[];
}

export interface RemoveOrgMemberParams {
  orgId: string;
  member: string;
}

export interface UpdateOrgMemberRoleParams {
  orgId: string;
  member: string;
  role: OrganizationRole;
}

// v0.3.0 - Analytics
export interface GetRevenueMetricsParams {
  periodDays: number;
}

export interface UpdateTaskStatisticsParams {
  taskId: bigint;
  oldState: TaskState;
  newState: TaskState;
}

// Utility functions
export const formatAmount = (amount: bigint | string, token: string = 'EGLD'): string => {
  const num = Number(amount) / 1e18;
  return num.toFixed(4) + ' ' + token;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

export const formatTokenAmount = (amount: bigint | string, decimals: number = 18): string => {
  const divisor = 10 ** decimals;
  const num = Number(amount) / divisor;
  return num.toFixed(4);
};

export const calculateReputationScore = (
  successRate: number,
  averageCompletionTime: number,
  totalEarned: bigint
): number => {
  // Weight-based scoring: success (0.4), speed (0.3), volume (0.3)
  const successScore = successRate * 0.4;
  const speedScore = averageCompletionTime <= 86400 ? 10000 * 0.3 : (86400 * 10000 / averageCompletionTime) * 0.3;
  const volumeScore = Math.log10(Number(totalEarned)) * 1000 * 0.3;
  
  return Math.floor(successScore + speedScore + volumeScore);
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
  paymentToken: string;
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

// v0.2.0 - New events
export interface TokenWhitelistUpdatedEvent {
  tokenIdentifier: string;
  isEnabled: boolean;
}

export interface ReputationUpdatedEvent {
  agent: string;
  newScore: number;
  oldScore: number;
}

// v0.3.0 - Organization events
export interface OrganizationCreatedEvent {
  orgId: string;
  name: string;
  owner: string;
}

export interface OrganizationMemberAddedEvent {
  orgId: string;
  member: string;
  role: OrganizationRole;
}

export interface OrganizationMemberRemovedEvent {
  orgId: string;
  member: string;
}

// v0.3.0 - Analytics events
export interface TaskStatisticsUpdatedEvent {
  taskId: bigint;
  oldState: TaskState;
  newState: TaskState;
}
