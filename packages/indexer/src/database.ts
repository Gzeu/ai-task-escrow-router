import { MongoClient, Db, Collection } from 'mongodb';
import { 
  IndexerConfig, 
  IndexedEvent, 
  IndexedTask, 
  AgentStats, 
  CreatorStats, 
  ProtocolStats,
  IndexingProgress,
  TaskFilter,
  PaginationParams,
  QueryResult
} from './types';

export class DatabaseService {
  private client: MongoClient;
  private db!: Db;
  private isConnected: boolean = false;

  constructor(private config: IndexerConfig) {
    this.client = new MongoClient(this.config.mongodb.url);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(this.config.mongodb.database);
      this.isConnected = true;
      
      // Create indexes
      await this.createIndexes();
      
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  private get events(): Collection<IndexedEvent> {
    return this.db.collection('events');
  }

  private get tasks(): Collection<IndexedTask> {
    return this.db.collection('tasks');
  }

  private get agentStats(): Collection<AgentStats> {
    return this.db.collection('agentStats');
  }

  private get creatorStats(): Collection<CreatorStats> {
    return this.db.collection('creatorStats');
  }

  private get protocolStats(): Collection<ProtocolStats> {
    return this.db.collection('protocolStats');
  }

  private get indexingProgress(): Collection<IndexingProgress> {
    return this.db.collection('indexingProgress');
  }

  private async createIndexes(): Promise<void> {
    // Events collection indexes
    await this.events.createIndex({ txHash: 1 });
    await this.events.createIndex({ eventIdentifier: 1 });
    await this.events.createIndex({ address: 1 });
    await this.events.createIndex({ timestamp: 1 });
    await this.events.createIndex({ blockNumber: 1 });
    await this.events.createIndex({ processed: 1 });

    // Tasks collection indexes
    await this.tasks.createIndex({ taskId: 1 }, { unique: true });
    await this.tasks.createIndex({ creator: 1 });
    await this.tasks.createIndex({ assignedAgent: 1 });
    await this.tasks.createIndex({ state: 1 });
    await this.tasks.createIndex({ createdAt: 1 });
    await this.tasks.createIndex({ deadline: 1 });

    // Agent stats indexes
    await this.agentStats.createIndex({ address: 1 }, { unique: true });
    await this.agentStats.createIndex({ reputationScore: -1 });
    await this.agentStats.createIndex({ totalTasks: -1 });

    // Creator stats indexes
    await this.creatorStats.createIndex({ address: 1 }, { unique: true });
    await this.creatorStats.createIndex({ totalTasks: -1 });
    await this.creatorStats.createIndex({ totalSpent: -1 });

    // Protocol stats indexes
    await this.protocolStats.createIndex({ _id: 1 }, { unique: true });
  }

  // Event operations
  async saveEvent(event: IndexedEvent): Promise<void> {
    try {
      await this.events.insertOne(event);
    } catch (error) {
      // Ignore duplicate key errors
      if ((error as any).code !== 11000) {
        throw error;
      }
    }
  }

  async getEvents(filter: any = {}, pagination?: PaginationParams): Promise<QueryResult<IndexedEvent>> {
    const query = this.events.find(filter);
    
    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;
      query.sort({ [pagination.sortBy]: sortOrder });
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      query.skip(skip).limit(limit).toArray(),
      this.events.countDocuments(filter)
    ]);

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + data.length < total
    };
  }

  // Task operations
  async saveTask(task: IndexedTask): Promise<void> {
    try {
      await this.tasks.replaceOne(
        { taskId: task.taskId },
        task,
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to save task:', error);
      throw error;
    }
  }

  async getTask(taskId: number): Promise<IndexedTask | null> {
    return await this.tasks.findOne({ taskId });
  }

  async getTasks(filter: TaskFilter, pagination?: PaginationParams): Promise<QueryResult<IndexedTask>> {
    const query: any = {};

    if (filter.creator) query.creator = filter.creator;
    if (filter.assignedAgent) query.assignedAgent = filter.assignedAgent;
    if (filter.state) query.state = filter.state;
    if (filter.states) query.state = { $in: filter.states };
    if (filter.createdAfter) query.createdAt = { $gte: filter.createdAfter };
    if (filter.createdBefore) query.createdAt = { $lte: filter.createdBefore };
    if (filter.deadlineAfter) query.deadline = { $gte: filter.deadlineAfter };
    if (filter.deadlineBefore) query.deadline = { $lte: filter.deadlineBefore };
    if (filter.minAmount) query.paymentAmount = { $gte: filter.minAmount };
    if (filter.maxAmount) query.paymentAmount = { $lte: filter.maxAmount };

    return this.getPaginatedResults(this.tasks, query, pagination);
  }

  // Agent stats operations
  async saveAgentStats(stats: AgentStats): Promise<void> {
    try {
      await this.agentStats.replaceOne(
        { address: stats.address },
        stats,
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to save agent stats:', error);
      throw error;
    }
  }

  async getAgentStats(address: string): Promise<AgentStats | null> {
    return await this.agentStats.findOne({ address });
  }

  async getTopAgents(limit: number = 10): Promise<AgentStats[]> {
    return await this.agentStats
      .find({})
      .sort({ reputationScore: -1, totalTasks: -1 })
      .limit(limit)
      .toArray();
  }

  // Creator stats operations
  async saveCreatorStats(stats: CreatorStats): Promise<void> {
    try {
      await this.creatorStats.replaceOne(
        { address: stats.address },
        stats,
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to save creator stats:', error);
      throw error;
    }
  }

  async getCreatorStats(address: string): Promise<CreatorStats | null> {
    return await this.creatorStats.findOne({ address });
  }

  async getTopCreators(limit: number = 10): Promise<CreatorStats[]> {
    return await this.creatorStats
      .find({})
      .sort({ totalTasks: -1, totalSpent: -1 })
      .limit(limit)
      .toArray();
  }

  // Protocol stats operations
  async saveProtocolStats(stats: ProtocolStats): Promise<void> {
    try {
      await this.protocolStats.replaceOne(
        { _id: stats._id },
        stats,
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to save protocol stats:', error);
      throw error;
    }
  }

  async getProtocolStats(): Promise<ProtocolStats | null> {
    return await this.protocolStats.findOne({ _id: 'global' });
  }

  // Indexing progress operations
  async saveIndexingProgress(progress: IndexingProgress): Promise<void> {
    try {
      await this.indexingProgress.replaceOne(
        { _id: 'progress' },
        progress,
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to save indexing progress:', error);
      throw error;
    }
  }

  async getIndexingProgress(): Promise<IndexingProgress | null> {
    return await this.indexingProgress.findOne({ _id: 'progress' });
  }

  // Utility methods
  private async getPaginatedResults<T>(
    collection: Collection<T>,
    filter: any,
    pagination?: PaginationParams
  ): Promise<QueryResult<T>> {
    const query = collection.find(filter);
    
    if (pagination?.sortBy) {
      const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;
      query.sort({ [pagination.sortBy]: sortOrder });
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      query.skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter)
    ]);

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + data.length < total
    };
  }

  // Aggregation queries
  async getProtocolMetrics(): Promise<any> {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          totalVolume: { $sum: { $toDecimal: "$paymentAmount" } },
          activeTasks: {
            $sum: {
              $cond: [{ $in: ["$state", ["Open", "Accepted", "Submitted"]] }, 1, 0]
            }
          },
          avgTaskValue: { $avg: { $toDecimal: "$paymentAmount" } }
        }
      }
    ];

    return await this.tasks.aggregate(pipeline).toArray();
  }

  async getAgentMetrics(address: string): Promise<any> {
    const pipeline = [
      { $match: { assignedAgent: address } },
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 },
          totalEarnings: { $sum: { $toDecimal: "$paymentAmount" } }
        }
      }
    ];

    return await this.tasks.aggregate(pipeline).toArray();
  }

  async getCreatorMetrics(address: string): Promise<any> {
    const pipeline = [
      { $match: { creator: address } },
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 },
          totalSpent: { $sum: { $toDecimal: "$paymentAmount" } }
        }
      }
    ];

    return await this.tasks.aggregate(pipeline).toArray();
  }
}
