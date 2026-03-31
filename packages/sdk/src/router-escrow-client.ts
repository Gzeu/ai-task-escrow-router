import {
  SmartContract,
  AbiRegistry,
  SmartContractAbi,
  Address,
  ContractFunction,
  Transaction,
  TransactionPayload,
  TypedValue,
  BigUIntValue,
  U64Value,
  OptionalValue,
  AddressValue,
  TokenIdentifierValue,
  ManagedBuffer,
  List,
  StringValue,
  BooleanValue,
} from '@multiversx/sdk-core';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { UserSigner } from '@multiversx/sdk-wallet';

import {
  Task,
  Config,
  CreateTaskParams,
  SubmitResultParams,
  OpenDisputeParams,
  ResolveDisputeParams,
  TransactionResult,
  AgentReputation,
  PerformanceMetrics,
  VerificationStatus,
  BatchTaskOperation,
  AgentReputationUpdate,
  DisputeVote,
  BatchOperationType,
  NetworkConfig,
  TaskState,
  DisputeResolution,
} from './types';
import {
  ENDPOINTS,
  EVENT_TOPICS,
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_PRICE,
  MULTIVERSX_NETWORKS,
} from './constants';
import {
  taskStateToNumber,
  disputeResolutionToNumber,
  parseTaskFromContract,
  parseConfigFromContract,
  validateAddress,
  validateTaskId,
  validateMetadataUri,
  validateFeeBps,
  validateAwardBps,
  retry,
} from './utils';

export class RouterEscrowClient {
  private contract: SmartContract;
  private networkProvider: ProxyNetworkProvider;
  private networkConfig: NetworkConfig;

  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = {
      ...networkConfig,
      chainId: networkConfig.chainId || MULTIVERSX_NETWORKS.MAINNET.chainId,
      gasPrice: networkConfig.gasPrice || DEFAULT_GAS_PRICE,
      gasLimit: networkConfig.gasLimit || DEFAULT_GAS_LIMIT,
      apiTimeout: networkConfig.apiTimeout || MULTIVERSX_NETWORKS.MAINNET.apiTimeout,
    };

    this.networkProvider = new ProxyNetworkProvider(
      this.getApiUrl(),
      { timeout: this.networkConfig.apiTimeout }
    );

    this.contract = new SmartContract({
      address: new Address(networkConfig.contractAddress),
    });
  }

  private getApiUrl(): string {
    switch (this.networkConfig.chainId) {
      case '1':
        return 'https://api.multiversx.com';
      case 'T':
        return 'https://testnet-api.multiversx.com';
      case 'D':
        return 'https://devnet-api.multiversx.com';
      default:
        throw new Error(`Unsupported chain ID: ${this.networkConfig.chainId}`);
    }
  }

  // View functions

  async getTask(taskId: number): Promise<Task> {
    validateTaskId(taskId);

    const query = this.contract.createQuery({
      func: new ContractFunction(ENDPOINTS.GET_TASK),
      args: [new U64Value(taskId)],
    });

    const queryResponse = await this.networkProvider.queryContract(query);
    const endpointDefinition = this.contract.getEndpoint(ENDPOINTS.GET_TASK);
    const { firstValue } = new SmartContractAbi(
      await AbiRegistry.create({}),
      ''
    ).decodeOutcome(queryResponse, endpointDefinition);

    return parseTaskFromContract(firstValue?.valueOf());
  }

  async getTaskCount(): Promise<number> {
    const query = this.contract.createQuery({
      func: new ContractFunction(ENDPOINTS.GET_TASK_COUNT),
    });

    const queryResponse = await this.networkProvider.queryContract(query);
    const endpointDefinition = this.contract.getEndpoint(ENDPOINTS.GET_TASK_COUNT);
    const { firstValue } = new SmartContractAbi(
      await AbiRegistry.create({}),
      ''
    ).decodeOutcome(queryResponse, endpointDefinition);

    return firstValue?.valueOf().toNumber() || 0;
  }

  async getConfig(): Promise<Config> {
    const query = this.contract.createQuery({
      func: new ContractFunction(ENDPOINTS.GET_CONFIG),
    });

    const queryResponse = await this.networkProvider.queryContract(query);
    const endpointDefinition = this.contract.getEndpoint(ENDPOINTS.GET_CONFIG);
    const { firstValue } = new SmartContractAbi(
      await AbiRegistry.create({}),
      ''
    ).decodeOutcome(queryResponse, endpointDefinition);

    return parseConfigFromContract(firstValue?.valueOf());
  }

  // Transaction builders

  buildCreateTaskTransaction(
    sender: string,
    params: CreateTaskParams,
    paymentAmount: string,
    signer?: UserSigner
  ): Transaction {
    validateAddress(sender);
    validateMetadataUri(params.metadataUri);

    const args: TypedValue[] = [
      new ManagedBuffer(params.metadataUri),
      new OptionalValue<U64Value>(
        params.deadline ? new U64Value(params.deadline) : undefined
      ),
      new OptionalValue<U64Value>(
        params.reviewTimeout ? new U64Value(params.reviewTimeout) : undefined
      ),
      new OptionalValue<ManagedBuffer>(
        params.ap2MandateHash ? new ManagedBuffer(params.ap2MandateHash) : undefined
      ),
    ];

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.CREATE_TASK),
      args,
      value: paymentAmount,
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      value: paymentAmount,
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildAcceptTaskTransaction(sender: string, taskId: number): Transaction {
    validateAddress(sender);
    validateTaskId(taskId);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.ACCEPT_TASK),
      args: [new U64Value(taskId)],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildSubmitResultTransaction(sender: string, params: SubmitResultParams): Transaction {
    validateAddress(sender);
    validateTaskId(params.taskId);
    validateMetadataUri(params.resultUri);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.SUBMIT_RESULT),
      args: [
        new U64Value(params.taskId),
        new ManagedBuffer(params.resultUri),
      ],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildApproveTaskTransaction(sender: string, taskId: number): Transaction {
    validateAddress(sender);
    validateTaskId(taskId);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.APPROVE_TASK),
      args: [new U64Value(taskId)],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildCancelTaskTransaction(sender: string, taskId: number): Transaction {
    validateAddress(sender);
    validateTaskId(taskId);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.CANCEL_TASK),
      args: [new U64Value(taskId)],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildOpenDisputeTransaction(sender: string, params: OpenDisputeParams): Transaction {
    validateAddress(sender);
    validateTaskId(params.taskId);
    validateMetadataUri(params.reasonUri);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.OPEN_DISPUTE),
      args: [
        new U64Value(params.taskId),
        new ManagedBuffer(params.reasonUri),
      ],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildResolveDisputeTransaction(sender: string, params: ResolveDisputeParams): Transaction {
    validateAddress(sender);
    validateTaskId(params.taskId);

    let resolutionArg: TypedValue;
    
    switch (params.resolution) {
      case DisputeResolution.FullRefund:
        resolutionArg = new StringValue('FullRefund');
        break;
      case DisputeResolution.PartialRefund:
        if (params.agentAwardBps === undefined) {
          throw new Error('agentAwardBps is required for PartialRefund resolution');
        }
        validateAwardBps(params.agentAwardBps);
        resolutionArg = new StringValue(`PartialRefund:${params.agentAwardBps}`);
        break;
      case DisputeResolution.FullPayment:
        resolutionArg = new StringValue('FullPayment');
        break;
      default:
        throw new Error(`Unsupported dispute resolution: ${params.resolution}`);
    }

    const args: TypedValue[] = [
      new U64Value(params.taskId),
      resolutionArg,
      new OptionalValue<ManagedBuffer>(
        params.x402SettlementRef ? new ManagedBuffer(params.x402SettlementRef) : undefined
      ),
    ];

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.RESOLVE_DISPUTE),
      args,
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildRefundExpiredTaskTransaction(sender: string, taskId: number): Transaction {
    validateAddress(sender);
    validateTaskId(taskId);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.REFUND_EXPIRED_TASK),
      args: [new U64Value(taskId)],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  // Admin transactions

  buildSetFeeBpsTransaction(sender: string, feeBps: number): Transaction {
    validateAddress(sender);
    validateFeeBps(feeBps);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.SET_FEE_BPS),
      args: [new U64Value(feeBps)],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildSetTreasuryTransaction(sender: string, treasury: string): Transaction {
    validateAddress(sender);
    validateAddress(treasury);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.SET_TREASURY),
      args: [new AddressValue(new Address(treasury))],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildSetResolverTransaction(sender: string, resolver?: string): Transaction {
    validateAddress(sender);
    if (resolver) {
      validateAddress(resolver);
    }

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.SET_RESOLVER),
      args: [
        new OptionalValue<AddressValue>(
          resolver ? new AddressValue(new Address(resolver)) : undefined
        ),
      ],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  buildSetPausedTransaction(sender: string, paused: boolean): Transaction {
    validateAddress(sender);

    const payload = TransactionPayload.contractCall({
      func: new ContractFunction(ENDPOINTS.SET_PAUSED),
      args: [new BooleanValue(paused)],
    });

    return new Transaction({
      sender: new Address(sender),
      receiver: this.contract.getAddress(),
      data: payload,
      gasLimit: this.networkConfig.gasLimit,
      chainID: this.networkConfig.chainId,
    });
  }

  // Transaction execution helpers

  async sendTransaction(transaction: Transaction, signer: UserSigner): Promise<TransactionResult> {
    try {
      const signedTransaction = await signer.sign(transaction);
      const txHash = await this.networkProvider.sendTransaction(signedTransaction);
      
      return {
        hash: txHash,
        status: 'pending',
      };
    } catch (error) {
      return {
        hash: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async awaitTransactionCompletion(txHash: string, maxWaitTime: number = 60000): Promise<TransactionResult> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const transaction = await this.networkProvider.getTransaction(txHash);
        
        if (transaction.status) {
          const status = transaction.status.isSuccessful() ? 'success' : 'failed';
          
          return {
            hash: txHash,
            status,
            events: transaction.logs?.events,
            error: status === 'failed' ? transaction.status.toString() : undefined,
          };
        }
      } catch (error) {
        // Transaction might not be indexed yet, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return {
      hash: txHash,
      status: 'failed',
      error: 'Transaction timeout',
    };
  }

  async sendAndAwaitTransaction(
    transaction: Transaction,
    signer: UserSigner,
    maxWaitTime: number = 60000
  ): Promise<TransactionResult> {
    const sendResult = await this.sendTransaction(transaction, signer);
    
    if (sendResult.status === 'failed') {
      return sendResult;
    }
    
    return this.awaitTransactionCompletion(sendResult.hash, maxWaitTime);
  }

  // Event parsing utilities

  parseTaskEvents(events: any[]): any[] {
    return events
      .filter(event => Object.values(EVENT_TOPICS).includes(event.identifier))
      .map(event => ({
        topic: event.identifier,
        address: event.address?.bech32(),
        data: event.data,
        topics: event.topics,
      }));
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return this.contract.getAddress().bech32();
  }

  /**
   * Get network configuration
   */
  getNetworkConfig(): NetworkConfig {
    return { ...this.networkConfig };
  }

  /**
   * Batch task operations for gas optimization
   */
  buildBatchTaskOperationsTransaction(
    operations: BatchTaskOperation[],
    gasLimit?: number,
    data?: string,
  ): Transaction {
    const args = operations.map(op => ({
      operationType: op.operationType,
      taskIds: op.taskIds,
      parameters: op.parameters,
    }));

    return this.contract.methodsExplicit
      .batchTaskOperations(args)
      .withGasLimit(gasLimit || this.calculateBatchGasLimit(operations))
      .withChainID(this.chainId)
      .withSender(this.address)
      .buildTransaction();
  }

  /**
   * Update agent reputation
   */
  buildUpdateAgentReputationTransaction(
    updates: AgentReputationUpdate[],
    gasLimit?: number,
  ): Transaction {
    const args = updates.map(update => ({
      address: update.address,
      totalTasks: update.totalTasks,
      completedTasks: update.completedTasks,
      reputationScore: update.reputationScore,
      averageRating: update.averageRating,
    }));

    return this.contract.methodsExplicit
      .updateAgentReputation(args)
      .withGasLimit(gasLimit || this.calculateReputationGasLimit(updates))
      .withChainID(this.chainId)
      .withSender(this.address)
      .buildTransaction();
  }

  /**
   * Verify agent with specialization
   */
  buildVerifyAgentTransaction(
    specialization: string,
    gasLimit?: number,
  ): Transaction {
    return this.contract.methodsExplicit
      .verifyAgent(specialization)
      .withGasLimit(gasLimit || DEFAULT_GAS_LIMIT)
      .withChainID(this.chainId)
      .withSender(this.address)
      .buildTransaction();
  }

  /**
   * Emergency pause transaction
   */
  buildEmergencyPauseTransaction(gasLimit?: number): Transaction {
    return this.contract.methodsExplicit
      .emergencyPause()
      .withGasLimit(gasLimit || DEFAULT_GAS_LIMIT)
      .withChainID(this.chainId)
      .withSender(this.address)
      .buildTransaction();
  }

  /**
   * Set max concurrent tasks
   */
  buildSetMaxConcurrentTasksTransaction(
    maxTasks: number,
    gasLimit?: number,
  ): Transaction {
    return this.contract.methodsExplicit
      .setMaxConcurrentTasks(maxTasks)
      .withGasLimit(gasLimit || DEFAULT_GAS_LIMIT)
      .withChainID(this.chainId)
      .withSender(this.address)
      .buildTransaction();
  }

  /**
   * Propose upgrade
   */
  buildProposeUpgradeTransaction(
    proposalHash: string,
    votingPeriod: number,
    executionDelay: number,
    gasLimit?: number,
  ): Transaction {
    return this.contract.methodsExplicit
      .proposeUpgrade(proposalHash, votingPeriod, executionDelay)
      .withGasLimit(gasLimit || DEFAULT_GAS_LIMIT)
      .withChainID(this.chainId)
      .withSender(this.address)
      .buildTransaction();
  }

  /**
   * Get agent reputation
   */
  async getAgentReputation(address: string): Promise<AgentReputation> {
    const reputation = await this.contract.methodsExplicit
      .getAgentReputation(new Address(address))
      .check()
      .run();
    
    return this.parseAgentReputation(reputation);
  }

  /**
   * Get agent specializations
   */
  async getAgentSpecializations(address: string): Promise<string[]> {
    const specializations = await this.contract.methodsExplicit
      .getAgentSpecializations(new Address(address))
      .check()
      .run();
    
    return specializations.map(spec => spec.toString());
  }

  /**
   * Get batch operations
   */
  async getBatchOperations(): Promise<BatchTaskOperation[]> {
    const operations = await this.contract.methodsExplicit
      .getBatchOperations()
      .check()
      .run();
    
    return operations.map(op => ({
      operationType: op.operationType.toString(),
      taskIds: op.taskIds.map(id => id.toNumber()),
      parameters: op.parameters.map(param => param.toString()),
    }));
  }

  /**
   * Gas calculation utilities
   */
  private calculateBatchGasLimit(operations: BatchTaskOperation[]): number {
    // Base gas + gas per operation
    const BASE_GAS = 50000;
    const GAS_PER_OPERATION = 15000;
    return BASE_GAS + (operations.length * GAS_PER_OPERATION);
  }

  private calculateReputationGasLimit(updates: AgentReputationUpdate[]): number {
    // Base gas + gas per update
    const BASE_GAS = 30000;
    const GAS_PER_UPDATE = 10000;
    return BASE_GAS + (updates.length * GAS_PER_UPDATE);
  }

  /**
   * Parse agent reputation from contract response
   */
  private parseAgentReputation(reputation: any): AgentReputation {
    return {
      address: reputation.address.toString(),
      totalTasks: reputation.totalTasks.toNumber(),
      completedTasks: reputation.completedTasks.toNumber(),
      cancelledTasks: reputation.cancelledTasks.toNumber(),
      disputedTasks: reputation.disputedTasks.toNumber(),
      totalEarned: reputation.totalEarned.toString(),
      reputationScore: reputation.reputationScore.toNumber(),
      averageRating: reputation.averageRating.toNumber(),
      lastActive: reputation.lastActive.toNumber(),
      createdAt: reputation.createdAt.toNumber(),
      specializations: reputation.specializations.map((spec: any) => spec.toString()),
      verificationStatus: this.parseVerificationStatus(reputation.verificationStatus),
      performanceMetrics: this.parsePerformanceMetrics(reputation.performanceMetrics),
    };
  }

  /**
   * Parse verification status
   */
  private parseVerificationStatus(status: any): VerificationStatus {
    const statusMap = {
      0: VerificationStatus.Unverified,
      1: VerificationStatus.Pending,
      2: VerificationStatus.Verified,
      3: VerificationStatus.Suspended,
    };
    return statusMap[status.toNumber()] || VerificationStatus.Unverified;
  }

  /**
   * Parse performance metrics
   */
  private parsePerformanceMetrics(metrics: any): PerformanceMetrics {
    return {
      averageCompletionTime: metrics.averageCompletionTime.toNumber(),
      successRate: metrics.successRate.toNumber(),
      disputeRate: metrics.disputeRate.toNumber(),
      totalEarnedLast30d: metrics.totalEarnedLast30d.toString(),
      tasksCompletedLast30d: metrics.tasksCompletedLast30d.toNumber(),
    };
  }
}
