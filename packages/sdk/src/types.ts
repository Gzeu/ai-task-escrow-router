/**
 * AI Task Escrow Router SDK Types
 */

// Core enums
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

export enum DisputeResolution {
  AgentWins = "agent_wins",
  CreatorWins = "creator_wins",
  Split = "split"
}

// Core interfaces
export interface Task {
  taskId: string;
  creator: string;
  assignedAgent?: string;
  paymentToken: string;
  paymentAmount: string;
  feeBpsSnapshot: number;
  createdAt: number;
  acceptedAt?: number;
  deadline?: number;
  reviewTimeout?: number;
  metadataUri: string;
  resultUri?: string;
  state: TaskState;
  disputeMetadataUri?: string;
  ap2MandateHash?: string;
  x402PaymentRef?: string;
  gasUsed?: string;
  completionTime?: number;
  priorityFee?: string;
  agentReputationSnapshot?: number;
  paymentNonce?: number;
}

export interface Config {
  owner: string;
  treasury: string;
  feeBps: number;
  minReputation: number;
  maxTaskValue: string;
  reputationDecayRate: number;
  isPaused: boolean;
  maxConcurrentTasks: number;
}

// Configuration interfaces
export interface NetworkConfig {
  chainId: string;
  contractAddress: string;
  apiTimeout: number;
  gasLimit: number;
}

export interface ProtocolConfig {
  chainId: string;
  contractAddress: string;
  gasLimit: number;
  apiTimeout: number;
}

export interface TransactionConfig {
  chainId: string;
  contractAddress: string;
  gasLimit: number;
  apiTimeout: number;
}

// Transaction result
export interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

// Core parameters
export interface CreateTaskParams {
  metadataUri: string;
  paymentAmount: string;
  currency?: string;
  deadline?: number;
  reviewTimeout?: number;
}

export interface SubmitResultParams {
  taskId: string;
  resultUri: string;
  completionTime?: number;
  gasUsed?: string;
}

export interface OpenDisputeParams {
  taskId: string;
  reason: string;
  evidenceUri?: string;
}

export interface ResolveDisputeParams {
  taskId: string;
  resolution: DisputeResolution;
  agentPercentage?: number;
}

// Enhanced v0.2.0 parameters
export interface EnhancedCreateTaskParams {
  metadataUri: string;
  paymentAmount: string;
  paymentToken?: string;
  deadline?: number;
  reviewTimeout?: number;
  priorityFee?: string;
  ap2MandateHash?: string;
  x402PaymentRef?: string;
}

export interface UpdateAgentReputationParams {
  agentAddress: string;
  newReputation: number;
  reason?: string;
}

export interface BatchTaskOperationsParams {
  operations: Array<{
    type: 'create' | 'accept' | 'submit' | 'approve';
    params: any;
  }>;
}

export interface VerifyAgentParams {
  specializations: string[];
  verificationData: string;
}

export interface ProposeUpgradeParams {
  upgradeData: string;
  description: string;
  votingPeriod: number;
}

export interface VoteOnUpgradeParams {
  proposalId: string;
  vote: 'for' | 'against';
}

export interface EmergencyPauseParams {
  reason: string;
  duration: number;
}

export interface SetMaxConcurrentTasksParams {
  maxTasks: number;
}

// Ecosystem v0.3.0 types
export interface UcpAgentRegistration {
  agentAddress: string;
  agentName: string;
  capabilities: string[];
  endpointUrl: string;
  metadataUri: string;
  verificationHash: string;
  registrationTimestamp: number;
}

export interface AcpPaymentSettings {
  acceptedTokens: string[];
  autoConvertRates: { [tokenId: string]: { rate: number; denominator: number } };
  settlementDelay: number;
}

export interface AcpMerchantFlow {
  merchantAddress: string;
  flowTemplate: string;
  taskRequirements: string[];
  autoApprovalThreshold: number;
  paymentSettings: AcpPaymentSettings;
}

export interface Ap2Mandate {
  mandateHash: string;
  delegator: string;
  delegatee: string;
  expiration: number;
  maxAmount: string;
  usageCount: number;
  isRevoked: boolean;
}

export interface McpToolRegistration {
  toolName: string;
  toolEndpoint: string;
  description: string;
  requiredCapabilities: string[];
  rateLimit: number;
  authenticationRequired: boolean;
}

export interface X402Settlement {
  settlementRef: string;
  paymentAmount: string;
  currency: string;
  merchantData: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  completionTimestamp: number;
}

// Utility functions
export const formatAmount = (amount: string | number): string => {
  const num = Number(amount) / 1e18;
  return num.toFixed(4) + ' EGLD';
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};
