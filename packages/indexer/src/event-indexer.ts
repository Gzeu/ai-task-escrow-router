import { ApiNetworkProvider, Transaction, TransactionOnNetwork } from '@multiversx/sdk-network-providers';
import { DatabaseService } from './database';
import { Logger } from './logger';
import { 
  IndexerConfig, 
  IndexingProgress, 
  IndexedEvent, 
  ParsedEvent,
  TaskCreatedEvent,
  TaskAcceptedEvent,
  ResultSubmittedEvent,
  TaskApprovedEvent,
  TaskCancelledEvent,
  DisputeOpenedEvent,
  DisputeResolvedEvent,
  TaskRefundedEvent
} from './types';

export class EventIndexer {
  private networkProvider: ApiNetworkProvider;
  private isRunning: boolean = false;
  private indexingInterval: NodeJS.Timeout | null = null;
  private lastProcessedBlock: number = 0;
  private progress: IndexingProgress;

  constructor(
    private config: IndexerConfig,
    private database: DatabaseService,
    private logger: Logger
  ) {
    this.networkProvider = new ApiNetworkProvider(this.config.apiUrl);
    this.progress = {
      lastProcessedBlock: this.config.indexing.startBlock,
      currentBlock: 0,
      totalBlocks: 0,
      eventsProcessed: 0,
      tasksIndexed: 0,
      errors: 0,
      lastSyncTime: Date.now()
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Indexer is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting event indexer...');

    // Load last processed block from database
    await this.loadIndexingProgress();

    // Start the indexing loop
    this.indexingInterval = setInterval(
      () => this.indexEvents(),
      this.config.indexing.syncInterval
    );

    this.logger.info(`Event indexer started. Sync interval: ${this.config.indexing.syncInterval}ms`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.indexingInterval) {
      clearInterval(this.indexingInterval);
      this.indexingInterval = null;
    }

    this.logger.info('Event indexer stopped');
  }

  private async loadIndexingProgress(): Promise<void> {
    try {
      const saved = await this.database.getIndexingProgress();
      if (saved) {
        this.progress.lastProcessedBlock = saved.lastProcessedBlock;
        this.logger.info(`Resumed indexing from block ${this.progress.lastProcessedBlock}`);
      }
    } catch (error) {
      this.logger.warn('Failed to load indexing progress, starting from configured block:', error);
    }
  }

  private async saveIndexingProgress(): Promise<void> {
    try {
      await this.database.saveIndexingProgress(this.progress);
    } catch (error) {
      this.logger.error('Failed to save indexing progress:', error);
    }
  }

  private async indexEvents(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.logger.debug('Fetching new transactions...');
      
      // Get current block number
      const currentBlock = await this.getCurrentBlockNumber();
      this.progress.currentBlock = currentBlock;

      // Fetch transactions since last processed block
      const transactions = await this.networkProvider.getTransactions({
        receiver: this.config.contractAddress,
        size: this.config.indexing.batchSize,
        after: this.progress.lastProcessedBlock
      });

      if (transactions.items.length === 0) {
        this.logger.debug('No new transactions found');
        return;
      }

      this.logger.info(`Processing ${transactions.items.length} transactions`);

      let processedCount = 0;
      for (const tx of transactions.items) {
        try {
          await this.processTransaction(tx);
          processedCount++;
        } catch (error) {
          this.logger.error(`Failed to process transaction ${tx.hash}:`, error);
          this.progress.errors++;
        }
      }

      // Update progress
      this.progress.eventsProcessed += processedCount;
      this.progress.lastProcessedBlock = currentBlock;
      this.progress.lastSyncTime = Date.now();

      await this.saveIndexingProgress();

      this.logger.info(`Processed ${processedCount}/${transactions.items.length} transactions`);

    } catch (error) {
      this.logger.error('Error during event indexing:', error);
      this.progress.errors++;
    }
  }

  private async getCurrentBlockNumber(): Promise<number> {
    try {
      const networkStatus = await this.networkProvider.getNetworkStatus();
      return networkStatus.blocks[0].nonce;
    } catch (error) {
      this.logger.error('Failed to get current block number:', error);
      return this.progress.lastProcessedBlock;
    }
  }

  private async processTransaction(tx: TransactionOnNetwork): Promise<void> {
    if (!tx.logs || tx.logs.events.length === 0) {
      return;
    }

    // Filter events from our contract
    const contractEvents = tx.logs.events.filter(event => 
      event.address === this.config.contractAddress
    );

    for (const event of contractEvents) {
      try {
        const parsedEvent = this.parseEvent(event);
        if (parsedEvent) {
          await this.database.saveEvent({
            _id: `${tx.hash}_${event.identifier}_${event.nonce}`,
            txHash: tx.hash,
            eventIdentifier: event.identifier,
            address: event.address,
            topics: event.topics,
            data: event.data || '',
            timestamp: tx.timestamp,
            blockNumber: tx.blockNonce,
            processed: false,
            indexedAt: Date.now()
          });

          // Process event-specific logic
          await this.processParsedEvent(parsedEvent, tx);
        }
      } catch (error) {
        this.logger.error(`Failed to process event ${event.identifier}:`, error);
      }
    }
  }

  private parseEvent(event: any): ParsedEvent | null {
    try {
      switch (event.identifier) {
        case 'taskCreated':
          return this.parseTaskCreatedEvent(event);
        case 'taskAccepted':
          return this.parseTaskAcceptedEvent(event);
        case 'resultSubmitted':
          return this.parseResultSubmittedEvent(event);
        case 'taskApproved':
          return this.parseTaskApprovedEvent(event);
        case 'taskCancelled':
          return this.parseTaskCancelledEvent(event);
        case 'disputeOpened':
          return this.parseDisputeOpenedEvent(event);
        case 'disputeResolved':
          return this.parseDisputeResolvedEvent(event);
        case 'taskRefunded':
          return this.parseTaskRefundedEvent(event);
        default:
          this.logger.debug(`Unknown event type: ${event.identifier}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to parse event ${event.identifier}:`, error);
      return null;
    }
  }

  private parseTaskCreatedEvent(event: any): TaskCreatedEvent | null {
    try {
      // Parse topics: [taskId, creator, paymentAmount, metadataUri]
      const taskId = parseInt(event.topics[0], 16);
      const creator = event.topics[1];
      const paymentAmount = event.topics[2];
      const metadataUri = Buffer.from(event.topics[3] || '', 'hex').toString();

      return {
        taskId,
        creator,
        paymentAmount,
        metadataUri
      };
    } catch (error) {
      this.logger.error('Failed to parse taskCreated event:', error);
      return null;
    }
  }

  private parseTaskAcceptedEvent(event: any): TaskAcceptedEvent | null {
    try {
      const taskId = parseInt(event.topics[0], 16);
      const agent = event.topics[1];

      return { taskId, agent };
    } catch (error) {
      this.logger.error('Failed to parse taskAccepted event:', error);
      return null;
    }
  }

  private parseResultSubmittedEvent(event: any): ResultSubmittedEvent | null {
    try {
      const taskId = parseInt(event.topics[0], 16);
      const resultUri = Buffer.from(event.topics[1] || '', 'hex').toString();

      return { taskId, resultUri };
    } catch (error) {
      this.logger.error('Failed to parse resultSubmitted event:', error);
      return null;
    }
  }

  private parseTaskApprovedEvent(event: any): TaskApprovedEvent | null {
    try {
      const taskId = parseInt(event.topics[0], 16);
      const protocolFee = event.topics[1];
      const agentPayment = event.topics[2];

      return { taskId, protocolFee, agentPayment };
    } catch (error) {
      this.logger.error('Failed to parse taskApproved event:', error);
      return null;
    }
  }

  private parseTaskCancelledEvent(event: any): TaskCancelledEvent | null {
    try {
      const taskId = parseInt(event.topics[0], 16);
      return { taskId };
    } catch (error) {
      this.logger.error('Failed to parse taskCancelled event:', error);
      return null;
    }
  }

  private parseDisputeOpenedEvent(event: any): DisputeOpenedEvent | null {
    try {
      const taskId = parseInt(event.topics[0], 16);
      const reasonUri = Buffer.from(event.topics[1] || '', 'hex').toString();

      return { taskId, reasonUri };
    } catch (error) {
      this.logger.error('Failed to parse disputeOpened event:', error);
      return null;
    }
  }

  private parseDisputeResolvedEvent(event: any): DisputeResolvedEvent | null {
    try {
      const taskId = parseInt(event.topics[0], 16);
      const resolution = Buffer.from(event.topics[1] || '', 'hex').toString();

      return { taskId, resolution };
    } catch (error) {
      this.logger.error('Failed to parse disputeResolved event:', error);
      return null;
    }
  }

  private parseTaskRefundedEvent(event: any): TaskRefundedEvent | null {
    try {
      const taskId = parseInt(event.topics[0], 16);
      return { taskId };
    } catch (error) {
      this.logger.error('Failed to parse taskRefunded event:', error);
      return null;
    }
  }

  private async processParsedEvent(event: ParsedEvent, tx: TransactionOnNetwork): Promise<void> {
    // Update task states based on events
    switch (event as any) {
      case 'taskCreated':
        await this.handleTaskCreated(event as TaskCreatedEvent, tx);
        break;
      case 'taskAccepted':
        await this.handleTaskAccepted(event as TaskAcceptedEvent, tx);
        break;
      case 'resultSubmitted':
        await this.handleResultSubmitted(event as ResultSubmittedEvent, tx);
        break;
      case 'taskApproved':
        await this.handleTaskApproved(event as TaskApprovedEvent, tx);
        break;
      case 'taskCancelled':
        await this.handleTaskCancelled(event as TaskCancelledEvent, tx);
        break;
      case 'disputeOpened':
        await this.handleDisputeOpened(event as DisputeOpenedEvent, tx);
        break;
      case 'disputeResolved':
        await this.handleDisputeResolved(event as DisputeResolvedEvent, tx);
        break;
      case 'taskRefunded':
        await this.handleTaskRefunded(event as TaskRefundedEvent, tx);
        break;
    }
  }

  private async handleTaskCreated(event: TaskCreatedEvent, tx: TransactionOnNetwork): Promise<void> {
    this.logger.debug(`Task created: ${event.taskId}`);
    this.progress.tasksIndexed++;
  }

  private async handleTaskAccepted(event: TaskAcceptedEvent, tx: TransactionOnNetwork): Promise<void> {
    this.logger.debug(`Task accepted: ${event.taskId} by ${event.agent}`);
  }

  private async handleResultSubmitted(event: ResultSubmittedEvent, tx: TransactionOnNetwork): Promise<void> {
    this.logger.debug(`Result submitted: ${event.taskId}`);
  }

  private async handleTaskApproved(event: TaskApprovedEvent, tx: TransactionOnNetwork): Promise<void> {
    this.logger.debug(`Task approved: ${event.taskId}`);
  }

  private async handleTaskCancelled(event: TaskCancelledEvent, tx: TransactionOnNetwork): Promise<void> {
    this.logger.debug(`Task cancelled: ${event.taskId}`);
  }

  private async handleDisputeOpened(event: DisputeOpenedEvent, tx: TransactionOnNetwork): Promise<void> {
    this.logger.debug(`Dispute opened: ${event.taskId}`);
  }

  private async handleDisputeResolved(event: DisputeResolvedEvent, tx: TransactionOnNetwork): Promise<void> {
    this.logger.debug(`Dispute resolved: ${event.taskId}`);
  }

  private async handleTaskRefunded(event: TaskRefundedEvent, tx: TransactionOnNetwork): Promise<void> {
    this.logger.debug(`Task refunded: ${event.taskId}`);
  }

  getProgress(): IndexingProgress {
    return { ...this.progress };
  }
}
