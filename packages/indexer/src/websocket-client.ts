import WebSocket from 'ws';
import { Logger } from './logger';
import { IndexerConfig, IndexedEvent, ParsedEvent, TaskCreatedEvent, TaskAcceptedEvent, ResultSubmittedEvent, TaskApprovedEvent, TaskCancelledEvent, DisputeOpenedEvent, DisputeResolvedEvent, TaskRefundedEvent, OrganizationCreatedEvent, OrganizationUpdatedEvent, ConfigChangedEvent } from './types';

type EventHandler = (event: IndexedEvent, parsed: ParsedEvent | null) => Promise<void>;
type ConnectionHandler = (connected: boolean) => void;

export class GatewayWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastBlock: number = 0;
  private eventHandlers: EventHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];

  constructor(
    private config: IndexerConfig,
    private logger: Logger
  ) {
    this.lastBlock = this.config.indexing.startBlock;
  }

  onEvent(handler: EventHandler): void {
    this.eventHandlers.push(handler);
  }

  onConnectionChange(handler: ConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('WebSocket client already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting MultiversX Gateway WebSocket client', {
      url: this.config.gatewayWsUrl,
      contract: this.config.contractAddress,
    });

    await this.connect();
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Normal shutdown');
    }

    this.logger.info('WebSocket client stopped');
  }

  private async connect(): Promise<void> {
    if (!this.isRunning) return;

    try {
      this.ws = new WebSocket(this.config.gatewayWsUrl, { maxReconnectionDelay: 30000 });

      this.ws.on('open', () => {
        this.logger.info('Connected to MultiversX Gateway WebSocket');
        this.notifyConnectionHandlers(true);

        // Subscribe to contract events
        this.subscribe();

        // Start heartbeat
        this.startHeartbeat();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('error', (error) => {
        this.logger.error('WebSocket error', error);
      });

      this.ws.on('close', (code, reason) => {
        this.logger.warn('WebSocket connection closed', { code, reason: reason.toString() });
        this.notifyConnectionHandlers(false);
        this.scheduleReconnect();
      });

      this.ws.on('ping', () => {
        this.ws?.pong();
        this.logger.debug('Received ping');
      });

    } catch (error) {
      this.logger.error('Failed to connect to Gateway WebSocket', error);
      this.scheduleReconnect();
    }
  }

  private subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logger.warn('Cannot subscribe: WebSocket not open');
      return;
    }

    const subscription = {
      subscriptionEntries: [
        {
          address: this.config.contractAddress,
          identifier: '*',
        },
      ],
    };

    this.ws.send(JSON.stringify(subscription));
    this.logger.info('Subscribed to contract events', {
      contract: this.config.contractAddress,
    });
  }

  private startHeartbeat(): void {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000);
  }

  private scheduleReconnect(): void {
    if (!this.isRunning) return;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(1000 * Math.pow(2, Math.random() * 5), 30000); // Exponential backoff with jitter

    this.logger.info(`Scheduling reconnect in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Check if this is an event
      if (message.data && message.data.contents && Array.isArray(message.data.contents)) {
        for (const event of message.data.contents) {
          this.processEvent(event);
        }
      }

      // Update last block if provided
      if (message.data?.block?.nonce) {
        this.lastBlock = Math.max(this.lastBlock, message.data.block.nonce);
      }
    } catch (error) {
      this.logger.warn('Failed to parse WebSocket message', { data: data.substring(0, 200) });
    }
  }

  private async processEvent(event: any): Promise<void> {
    if (!event.identifier || !event.address) {
      return;
    }

    // Filter by contract address
    if (event.address !== this.config.contractAddress) {
      return;
    }

    // Extract topics and data
    const topics = event.topics || [];
    const eventData = event.data || '';

    // Create indexed event
    const indexedEvent: IndexedEvent = {
      txHash: event.txHash || event.data?.txHash || '',
      eventIdentifier: event.identifier,
      address: event.address,
      topics,
      data: eventData,
      timestamp: event.timestamp || Date.now(),
      blockNumber: event.blockNumber || event.data?.block?.nonce || this.lastBlock,
      processed: true,
      indexedAt: Date.now(),
    };

    // Parse event based on identifier
    const parsed = this.parseEvent(event.identifier, topics, eventData);

    // Extract taskId if available
    if (parsed && 'taskId' in parsed) {
      indexedEvent.taskId = (parsed as any).taskId;
    }

    // Notify all handlers
    for (const handler of this.eventHandlers) {
      try {
        await handler(indexedEvent, parsed);
      } catch (error) {
        this.logger.error('Event handler error', error);
      }
    }
  }

  private parseEvent(identifier: string, topics: string[], data: string): ParsedEvent | null {
    try {
      switch (identifier) {
        case 'taskCreated':
          return this.parseTaskCreated(topics, data);
        case 'taskAccepted':
          return this.parseTaskAccepted(topics, data);
        case 'resultSubmitted':
          return this.parseResultSubmitted(topics, data);
        case 'taskApproved':
          return this.parseTaskApproved(topics, data);
        case 'taskCancelled':
          return this.parseTaskCancelled(topics, data);
        case 'disputeOpened':
          return this.parseDisputeOpened(topics, data);
        case 'disputeResolved':
          return this.parseDisputeResolved(topics, data);
        case 'taskRefunded':
          return this.parseTaskRefunded(topics, data);
        case 'organizationCreated':
          return this.parseOrganizationCreated(topics, data);
        case 'organizationUpdated':
          return this.parseOrganizationUpdated(topics, data);
        case 'configChanged':
          return this.parseConfigChanged(topics, data);
        default:
          this.logger.debug('Unhandled event type', { identifier });
          return null;
      }
    } catch (error) {
      this.logger.error('Failed to parse event', { identifier, error });
      return null;
    }
  }

  private parseTaskCreated(topics: string[], data: string): TaskCreatedEvent {
    return {
      taskId: parseInt(topics[0] || '0', 16),
      creator: this.hexToAddress(topics[1]),
      organizationId: topics[2] || undefined,
      paymentToken: this.hexToAddress(topics[3]),
      paymentAmount: this.hexToBigInt(topics[4]).toString(),
      protocolFeeBps: parseInt(topics[5] || '0', 16),
      metadataUri: this.hexToString(topics[6]),
      deadline: parseInt(topics[7] || '0', 16),
      reviewTimeout: parseInt(topics[8] || '0', 16),
    };
  }

  private parseTaskAccepted(topics: string[]): TaskAcceptedEvent {
    return {
      taskId: parseInt(topics[0] || '0', 16),
      agent: this.hexToAddress(topics[1]),
    };
  }

  private parseResultSubmitted(topics: string[]): ResultSubmittedEvent {
    return {
      taskId: parseInt(topics[0] || '0', 16),
      resultUri: this.hexToString(topics[1]),
    };
  }

  private parseTaskApproved(topics: string[]): TaskApprovedEvent {
    return {
      taskId: parseInt(topics[0] || '0', 16),
      protocolFee: this.hexToBigInt(topics[1]).toString(),
      agentPayment: this.hexToBigInt(topics[2]).toString(),
    };
  }

  private parseTaskCancelled(topics: string[]): TaskCancelledEvent {
    return {
      taskId: parseInt(topics[0] || '0', 16),
    };
  }

  private parseDisputeOpened(topics: string[]): DisputeOpenedEvent {
    return {
      taskId: parseInt(topics[0] || '0', 16),
      reasonUri: this.hexToString(topics[1]),
    };
  }

  private parseDisputeResolved(topics: string[]): DisputeResolvedEvent {
    return {
      taskId: parseInt(topics[0] || '0', 16),
      resolution: this.hexToString(topics[1]),
    };
  }

  private parseTaskRefunded(topics: string[]): TaskRefundedEvent {
    return {
      taskId: parseInt(topics[0] || '0', 16),
    };
  }

  private parseOrganizationCreated(topics: string[]): OrganizationCreatedEvent {
    return {
      organizationId: this.hexToString(topics[0]),
      name: this.hexToString(topics[1]),
      admin: this.hexToAddress(topics[2]),
    };
  }

  private parseOrganizationUpdated(topics: string[]): OrganizationUpdatedEvent {
    return {
      organizationId: this.hexToString(topics[0]),
    };
  }

  private parseConfigChanged(topics: string[]): ConfigChangedEvent {
    return {
      paramKey: this.hexToString(topics[0]),
      newValue: this.hexToString(topics[1]),
    };
  }

  private hexToAddress(hex: string): string {
    if (!hex || hex === '0x') return '';
    const cleanHex = hex.replace(/^0x/, '');
    // MultiversX addresses are 62 characters (bech32)
    if (cleanHex.length === 62) {
      return cleanHex;
    }
    // Convert hex to bech32 if needed (simplified)
    return 'erd1' + cleanHex.substring(0, 60);
  }

  private hexToString(hex: string): string {
    if (!hex || hex === '0x') return '';
    const cleanHex = hex.replace(/^0x/, '');
    try {
      return Buffer.from(cleanHex, 'hex').toString('utf8').replace(/\0/g, '').trim();
    } catch {
      return cleanHex;
    }
  }

  private hexToBigInt(hex: string): bigint {
    if (!hex || hex === '0x') return 0n;
    const cleanHex = hex.replace(/^0x/, '');
    return BigInt('0x' + cleanHex);
  }

  getLastBlock(): number {
    return this.lastBlock;
  }

  private notifyConnectionHandlers(connected: boolean): void {
    for (const handler of this.connectionHandlers) {
      try {
        handler(connected);
      } catch (error) {
        this.logger.error('Connection handler error', error);
      }
    }
  }
}
