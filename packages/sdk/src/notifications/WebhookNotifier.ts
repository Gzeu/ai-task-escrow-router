import { createHmac } from 'node:crypto';

/**
 * Webhook notification system for AI Task Escrow Router
 * Provides secure webhook delivery with HMAC-SHA256 signatures
 */
export class WebhookNotifier {
  private webhookUrl: string;
  private secret?: string;

  /**
   * Initialize webhook notifier
   * @param webhookUrl - URL to send webhook notifications to
   * @param secret - Optional secret for HMAC signature verification
   */
  constructor(webhookUrl: string, secret?: string) {
    this.webhookUrl = webhookUrl;
    this.secret = secret;
  }

  /**
   * Send notification when task status changes
   * @param taskId - Task identifier
   * @param oldState - Previous task state
   * @param newState - New task state
   * @param metadata - Additional event metadata
   */
  async onTaskStatusChange(
    taskId: string,
    oldState: string,
    newState: string,
    metadata: object = {}
  ): Promise<void> {
    const payload = {
      event: 'task.status_changed',
      taskId,
      oldState,
      newState,
      timestamp: Date.now(),
      metadata
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send notification when payment is claimed
   * @param taskId - Task identifier
   * @param claimant - Address claiming the payment
   * @param amount - Payment amount
   * @param token - Token identifier
   */
  async onPaymentClaimed(
    taskId: string,
    claimant: string,
    amount: string,
    token: string
  ): Promise<void> {
    const payload = {
      event: 'payment.claimed',
      taskId,
      claimant,
      amount,
      token,
      timestamp: Date.now()
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send notification when task is created
   * @param taskId - Task identifier
   * @param creator - Task creator address
   * @param paymentAmount - Task payment amount
   * @param paymentToken - Payment token identifier
   * @param deadline - Task deadline
   */
  async onTaskCreated(
    taskId: string,
    creator: string,
    paymentAmount: string,
    paymentToken: string,
    deadline?: number
  ): Promise<void> {
    const payload = {
      event: 'task.created',
      taskId,
      creator,
      paymentAmount,
      paymentToken,
      deadline,
      timestamp: Date.now()
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send notification when task is accepted
   * @param taskId - Task identifier
   * @param agent - Agent accepting the task
   */
  async onTaskAccepted(taskId: string, agent: string): Promise<void> {
    const payload = {
      event: 'task.accepted',
      taskId,
      agent,
      timestamp: Date.now()
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send notification when task result is submitted
   * @param taskId - Task identifier
   * @param agent - Agent submitting result
   * @param resultUri - Result URI
   */
  async onResultSubmitted(
    taskId: string,
    agent: string,
    resultUri: string
  ): Promise<void> {
    const payload = {
      event: 'result.submitted',
      taskId,
      agent,
      resultUri,
      timestamp: Date.now()
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send notification when task is completed
   * @param taskId - Task identifier
   * @param agent - Agent who completed the task
   * @param paymentAmount - Final payment amount
   */
  async onTaskCompleted(
    taskId: string,
    agent: string,
    paymentAmount: string
  ): Promise<void> {
    const payload = {
      event: 'task.completed',
      taskId,
      agent,
      paymentAmount,
      timestamp: Date.now()
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send notification when dispute is opened
   * @param taskId - Task identifier
   * @param agent - Agent opening dispute
   * @param reason - Dispute reason
   */
  async onDisputeOpened(
    taskId: string,
    agent: string,
    reason: string
  ): Promise<void> {
    const payload = {
      event: 'dispute.opened',
      taskId,
      agent,
      reason,
      timestamp: Date.now()
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send notification when dispute is resolved
   * @param taskId - Task identifier
   * @param resolution - Dispute resolution
   * @param resolver - Address resolving dispute
   */
  async onDisputeResolved(
    taskId: string,
    resolution: string,
    resolver: string
  ): Promise<void> {
    const payload = {
      event: 'dispute.resolved',
      taskId,
      resolution,
      resolver,
      timestamp: Date.now()
    };

    await this.sendWebhook(payload);
  }

  /**
   * Send webhook with HMAC signature
   * @param payload - Event payload to send
   */
  private async sendWebhook(payload: object): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('Webhook URL not configured, skipping notification');
      return;
    }

    try {
      const body = JSON.stringify(payload);
      const signature = this.generateSignature(body);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Task-Escrow-Webhook/1.0.0',
          ...(this.secret && { 'X-Escrow-Signature': signature }),
        },
        body,
      });

      if (!response.ok) {
        console.error('Failed to send webhook:', response.status, response.statusText);
      } else {
        console.log('Webhook sent successfully:', (payload as any).event);
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  /**
   * Generate HMAC-SHA256 signature for webhook security
   * @param body - Request body to sign
   * @returns HMAC-SHA256 signature as hex string
   */
  private generateSignature(body: string): string {
    if (!this.secret) {
      return '';
    }

    const hmac = createHmac('sha256', this.secret);
    hmac.update(body);
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   * @param body - Request body
   * @param signature - Signature to verify
   * @returns True if signature is valid
   */
  verifySignature(body: string, signature: string): boolean {
    if (!this.secret) {
      return false;
    }

    const expectedSignature = this.generateSignature(body);
    return signature === expectedSignature;
  }

  /**
   * Get webhook configuration
   * @returns Current webhook URL and whether secret is configured
   */
  getConfig(): { webhookUrl: string; hasSecret: boolean } {
    return {
      webhookUrl: this.webhookUrl,
      hasSecret: !!this.secret
    };
  }
}
