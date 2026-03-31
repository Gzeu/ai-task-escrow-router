/**
 * Ecosystem Integration Client - v0.3.0
 */

import {
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  Address,
} from "@multiversx/sdk-core";
import type { TransactionConfig } from "./types.js";

export class EcosystemIntegrationClient {
  private factory: SmartContractTransactionsFactory;

  constructor(private config: TransactionConfig) {
    const factoryConfig = new TransactionsFactoryConfig({ 
      chainID: config.chainId 
    });
    this.factory = new SmartContractTransactionsFactory({ 
      config: factoryConfig 
    });
  }

  buildRegisterUcpAgent(
    agentName: string,
    capabilities: string[],
    endpointUrl: string,
    metadataUri: string,
    verificationHash: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "registerUcpAgent",
      gasLimit: BigInt(this.config.gasLimit ?? 10_000_000),
      arguments: [agentName, capabilities, endpointUrl, metadataUri, verificationHash],
    });
  }

  buildCreateX402Settlement(
    paymentAmount: string,
    currency: string,
    merchantData: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createX402Settlement",
      gasLimit: BigInt(this.config.gasLimit ?? 8_000_000),
      arguments: [paymentAmount, currency, merchantData],
    });
  }
}
