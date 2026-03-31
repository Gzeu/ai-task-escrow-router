/**
 * Enhanced Client - v0.2.0
 */

import {
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  Address,
  BigUIntValue,
} from "@multiversx/sdk-core";
import type { 
  TransactionConfig, 
  EnhancedCreateTaskParams, 
  UpdateAgentReputationParams,
  BatchTaskOperationsParams,
  TransactionResult
} from "./types.js";

export class EnhancedRouterEscrowClient {
  private factory: SmartContractTransactionsFactory;

  constructor(private config: TransactionConfig) {
    const factoryConfig = new TransactionsFactoryConfig({ 
      chainID: config.chainId 
    });
    this.factory = new SmartContractTransactionsFactory({ 
      config: factoryConfig 
    });
  }

  buildCreateEnhancedTask(
    params: EnhancedCreateTaskParams,
    senderAddress: string,
  ) {
    const args = [
      params.metadataUri,
      new BigUIntValue(BigInt(params.paymentAmount)),
      params.paymentToken || "EGLD",
      params.deadline || 0,
      params.reviewTimeout || 0,
      params.priorityFee || "0",
      params.ap2MandateHash || "",
      params.x402PaymentRef || "",
    ];

    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createEnhancedTask",
      gasLimit: BigInt(this.config.gasLimit ?? 15_000_000),
      arguments: args,
    });
  }

  buildUpdateAgentReputation(
    params: UpdateAgentReputationParams,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "updateAgentReputation",
      gasLimit: BigInt(this.config.gasLimit ?? 5_000_000),
      arguments: [params.agentAddress, params.newReputation, params.reason || ""],
    });
  }

  buildBatchTaskOperations(
    params: BatchTaskOperationsParams,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "batchTaskOperations",
      gasLimit: BigInt(this.config.gasLimit ?? 50_000_000),
      arguments: [JSON.stringify(params.operations)],
    });
  }

  async simulateTransaction(tx: any): Promise<TransactionResult> {
    return {
      hash: "sim_" + Date.now(),
      status: "success"
    };
  }
}
