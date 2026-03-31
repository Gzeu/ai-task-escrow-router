/**
 * AI Task Escrow Router SDK Exports
 */

// Core types
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

export enum TaskState {
  Open = "Open",
  Accepted = "Accepted",
  Submitted = "Submitted",
  Approved = "Approved",
  Cancelled = "Cancelled",
  Disputed = "Disputed",
  Refunded = "Refunded"
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

export interface NetworkConfig {
  chainId: string;
  contractAddress: string;
  apiTimeout: number;
  gasLimit: number;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

// Basic client class
export class RouterEscrowClient {
  private config: NetworkConfig;

  constructor(config: NetworkConfig) {
    this.config = config;
  }

  getConfig(): NetworkConfig {
    return this.config;
  }

  async getTask(taskId: string): Promise<Task> {
    // Mock implementation
    return {
      taskId,
      creator: "erd1...",
      paymentToken: "EGLD",
      paymentAmount: "1000000000000000000",
      feeBpsSnapshot: 300,
      createdAt: Date.now(),
      metadataUri: "ipfs://...",
      state: TaskState.Open
    };
  }

  async getTasks(): Promise<Task[]> {
    // Mock implementation
    return [];
  }

  async createTask(params: any): Promise<TransactionResult> {
    return {
      hash: "tx_hash_" + Date.now(),
      status: "success"
    };
  }
}

// Enhanced client for v0.2.0
export class EnhancedClient extends RouterEscrowClient {
  async updateAgentReputation(params: any): Promise<TransactionResult> {
    return {
      hash: "tx_hash_" + Date.now(),
      status: "success"
    };
  }

  async batchTaskOperations(params: any): Promise<TransactionResult> {
    return {
      hash: "tx_hash_" + Date.now(),
      status: "success"
    };
  }
}

// Ecosystem client for v0.3.0
export class EcosystemClient extends EnhancedClient {
  async registerUcpAgent(params: any): Promise<TransactionResult> {
    return {
      hash: "tx_hash_" + Date.now(),
      status: "success"
    };
  }

  async registerAcpMerchant(params: any): Promise<TransactionResult> {
    return {
      hash: "tx_hash_" + Date.now(),
      status: "success"
    };
  }
}
