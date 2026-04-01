import { RouterEscrowClient, RouterEscrowClientConfig } from '@ai-task-escrow/sdk';

export class AITaskEscrowClient {
  private client: RouterEscrowClient;

  constructor(config: RouterEscrowClientConfig) {
    this.client = new RouterEscrowClient(config);
  }

  get contractAddress() {
    return this.client['contractAddress'];
  }

  async buildCreateTaskWithToken(creatorAddress: string, params: any) {
    return this.client.buildCreateTaskWithToken(creatorAddress, params);
  }

  async buildSubmitResult(agentAddress: string, params: any) {
    return this.client.buildSubmitResult(agentAddress, params);
  }

  async buildClaimApproval(claimantAddress: string, taskId: bigint) {
    return this.client.buildClaimApproval(claimantAddress, taskId);
  }

  async getTask(taskId: bigint) {
    return this.client.getTask(taskId);
  }

  async getTaskCount() {
    return this.client.getTaskCount();
  }

  async getAgentReputation(address: string) {
    return this.client.getAgentReputation(address);
  }

  async getSupportedTokens() {
    return this.client.getSupportedTokens();
  }
}
