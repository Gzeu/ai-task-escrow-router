import { Pool, PoolClient, QueryResult } from 'pg';
import { Logger } from './logger';
import {
  IndexerConfig,
  IndexedTask,
  IndexedEvent,
  AgentStats,
  CreatorStats,
  ProtocolStats,
  Organization,
  IndexingProgress,
  TaskFilter,
  PaginationParams,
  QueryResult as ApiQueryResult,
  TaskState,
  ParsedEvent,
} from './types';

export class DatabaseService {
  private pool: Pool;
  private logger: Logger;
  private isConnected: boolean = false;

  constructor(private config: IndexerConfig, logger: Logger) {
    this.logger = logger;
    this.pool = new Pool({
      host: this.config.postgres.host,
      port: this.config.postgres.port,
      database: this.config.postgres.database,
      user: this.config.postgres.user,
      password: this.config.postgres.password,
      max: this.config.postgres.maxConnections,
      idleTimeoutMillis: this.config.postgres.idleTimeoutMillis,
      connectionTimeoutMillis: this.config.postgres.connectionTimeoutMillis,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected PostgreSQL client error', err);
      this.isConnected = false;
    });

    this.pool.on('connect', () => {
      this.logger.debug('New PostgreSQL client connected');
    });

    this.pool.on('end', () => {
      this.logger.warn('PostgreSQL client disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      client.release();
      this.isConnected = true;
      this.logger.info('PostgreSQL connection established', {
        host: this.config.postgres.host,
        port: this.config.postgres.port,
        database: this.config.postgres.database,
      });

      // Run migrations
      await this.runMigrations();
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      this.logger.info('PostgreSQL connection closed');
    } catch (error) {
      this.logger.error('Error disconnecting from PostgreSQL', error);
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        this.logger.warn('Slow query detected', { query: text.substring(0, 100), duration });
      }
      return result;
    } catch (error) {
      this.logger.error('Database query error', { query: text, error });
      throw error;
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async runMigrations(): Promise<void> {
    const migrations = [
      // Enable extensions
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`,

      // Organizations table
      `CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(66) PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        metadata_uri TEXT,
        admin VARCHAR(62) NOT NULL,
        members TEXT[] DEFAULT '{}',
        total_tasks INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        total_volume NUMERIC(78, 0) DEFAULT '0',
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        CONSTRAINT fk_organization_admin FOREIGN KEY (admin) REFERENCES indexed_agents(address) ON DELETE CASCADE
      );`,

      // Agents table
      `CREATE TABLE IF NOT EXISTS indexed_agents (
        address VARCHAR(62) PRIMARY KEY,
        total_tasks INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        disputed_tasks INTEGER DEFAULT 0,
        cancelled_tasks INTEGER DEFAULT 0,
        total_earnings NUMERIC(78, 0) DEFAULT '0',
        average_rating NUMERIC(3, 2),
        reputation_score INTEGER DEFAULT 0,
        last_active BIGINT NOT NULL,
        indexed_at BIGINT NOT NULL,
        last_updated BIGINT NOT NULL
      );`,

      // Tasks table
      `CREATE TABLE IF NOT EXISTS indexed_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id INTEGER NOT NULL,
        creator VARCHAR(62) NOT NULL,
        organization_id VARCHAR(66),
        assigned_agent VARCHAR(62),
        payment_token VARCHAR(66) NOT NULL,
        payment_amount NUMERIC(78, 0) NOT NULL,
        protocol_fee_bps INTEGER NOT NULL,
        created_at BIGINT NOT NULL,
        accepted_at BIGINT,
        deadline BIGINT,
        review_timeout BIGINT,
        metadata_uri TEXT NOT NULL,
        result_uri TEXT,
        state VARCHAR(20) NOT NULL DEFAULT 'Open',
        dispute_metadata TEXT,
        ap2_mandate_hash VARCHAR(66),
        x402_settlement_ref VARCHAR(66),
        tx_hash VARCHAR(66),
        indexed_at BIGINT NOT NULL,
        last_updated BIGINT NOT NULL,
        CONSTRAINT fk_task_creator FOREIGN KEY (creator) REFERENCES indexed_agents(address) ON DELETE CASCADE,
        CONSTRAINT fk_task_agent FOREIGN KEY (assigned_agent) REFERENCES indexed_agents(address) ON DELETE SET NULL,
        CONSTRAINT fk_task_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
        UNIQUE(task_id)
      );`,

      // Events table
      `CREATE TABLE IF NOT EXISTS indexed_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id INTEGER,
        tx_hash VARCHAR(66) NOT NULL,
        event_identifier VARCHAR(100) NOT NULL,
        address VARCHAR(62) NOT NULL,
        topics TEXT[] NOT NULL,
        data TEXT,
        timestamp BIGINT NOT NULL,
        block_number BIGINT NOT NULL,
        processed BOOLEAN DEFAULT true,
        indexed_at BIGINT NOT NULL
      );`,

      // Indexing progress table
      `CREATE TABLE IF NOT EXISTS indexing_progress (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
        last_processed_block BIGINT NOT NULL,
        current_block BIGINT NOT NULL,
        total_blocks BIGINT NOT NULL,
        events_processed INTEGER DEFAULT 0,
        tasks_indexed INTEGER DEFAULT 0,
        organizations_indexed INTEGER DEFAULT 0,
        errors INTEGER DEFAULT 0,
        last_sync_time BIGINT NOT NULL
      );`,

      // Creator stats table
      `CREATE TABLE IF NOT EXISTS creator_stats (
        address VARCHAR(62) PRIMARY KEY,
        total_tasks INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        cancelled_tasks INTEGER DEFAULT 0,
        total_spent NUMERIC(78, 0) DEFAULT '0',
        average_task_value NUMERIC(78, 0) DEFAULT '0',
        last_active BIGINT NOT NULL,
        indexed_at BIGINT NOT NULL,
        last_updated BIGINT NOT NULL,
        CONSTRAINT fk_creator_address FOREIGN KEY (address) REFERENCES indexed_agents(address) ON DELETE CASCADE
      );`,
    ];

    for (const migration of migrations) {
      await this.query(migration);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tasks_state ON indexed_tasks(state);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_creator ON indexed_tasks(creator);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_agent ON indexed_tasks(assigned_agent);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON indexed_tasks(organization_id);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON indexed_tasks(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON indexed_tasks(deadline);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_payment_token ON indexed_tasks(payment_token);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_task_id ON indexed_tasks(task_id);',
      'CREATE INDEX IF NOT EXISTS idx_agents_address ON indexed_agents(address);',
      'CREATE INDEX IF NOT EXISTS idx_agents_reputation ON indexed_agents(reputation_score DESC);',
      'CREATE INDEX IF NOT EXISTS idx_agents_last_active ON indexed_agents(last_active DESC);',
      'CREATE INDEX IF NOT EXISTS idx_events_tx_hash ON indexed_events(tx_hash);',
      'CREATE INDEX IF NOT EXISTS idx_events_event_identifier ON indexed_events(event_identifier);',
      'CREATE INDEX IF NOT EXISTS idx_events_block_number ON indexed_events(block_number);',
      'CREATE INDEX IF NOT EXISTS idx_events_timestamp ON indexed_events(timestamp);',
      'CREATE INDEX IF NOT EXISTS idx_events_processed ON indexed_events(processed) WHERE processed = true;',
      'CREATE INDEX IF NOT EXISTS idx_events_task_id ON indexed_events(task_id) WHERE task_id IS NOT NULL;',
      'CREATE INDEX IF NOT EXISTS idx_organizations_admin ON organizations(admin);',
    ];

    for (const index of indexes) {
      try {
        await this.query(index);
      } catch (error) {
        // Index might already exist, which is fine
        if ((error as any).code !== '42P07') {
          this.logger.warn('Index creation warning', { index, error });
        }
      }
    }

    this.logger.info('Database migrations completed');
  }

  // =========================================================================
  // Task Operations
  // =========================================================================

  async saveTask(task: IndexedTask): Promise<void> {
    const query = `
      INSERT INTO indexed_tasks (
        task_id, creator, organization_id, assigned_agent, payment_token,
        payment_amount, protocol_fee_bps, created_at, accepted_at, deadline,
        review_timeout, metadata_uri, result_uri, state, dispute_metadata,
        ap2_mandate_hash, x402_settlement_ref, tx_hash, indexed_at, last_updated
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT (task_id) DO UPDATE SET
        assigned_agent = EXCLUDED.assigned_agent,
        accepted_at = EXCLUDED.accepted_at,
        result_uri = EXCLUDED.result_uri,
        state = EXCLUDED.state,
        dispute_metadata = EXCLUDED.dispute_metadata,
        x402_settlement_ref = EXCLUDED.x402_settlement_ref,
        tx_hash = EXCLUDED.tx_hash,
        last_updated = EXCLUDED.last_updated
    `;

    await this.query(query, [
      task.taskId,
      task.creator,
      task.organizationId || null,
      task.assignedAgent || null,
      task.paymentToken,
      task.paymentAmount,
      task.protocolFeeBps,
      task.createdAt,
      task.acceptedAt || null,
      task.deadline || null,
      task.reviewTimeout || null,
      task.metadataUri,
      task.resultUri || null,
      task.state,
      task.disputeMetadata || null,
      task.ap2MandateHash || null,
      task.x402SettlementRef || null,
      task.txHash || null,
      task.indexedAt,
      task.lastUpdated,
    ]);
  }

  async getTasks(filter: TaskFilter, pagination?: PaginationParams): Promise<ApiQueryResult<IndexedTask>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.creator) {
      conditions.push(`creator = $${paramIndex++}`);
      params.push(filter.creator);
    }

    if (filter.assignedAgent) {
      conditions.push(`assigned_agent = $${paramIndex++}`);
      params.push(filter.assignedAgent);
    }

    if (filter.organizationId) {
      conditions.push(`organization_id = $${paramIndex++}`);
      params.push(filter.organizationId);
    }

    if (filter.state) {
      conditions.push(`state = $${paramIndex++}`);
      params.push(filter.state);
    }

    if (filter.states && filter.states.length > 0) {
      conditions.push(`state = ANY($${paramIndex++}::text[])`);
      params.push(filter.states.map(s => s.toString()));
    }

    if (filter.createdAfter) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filter.createdAfter);
    }

    if (filter.createdBefore) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filter.createdBefore);
    }

    if (filter.deadlineAfter) {
      conditions.push(`deadline >= $${paramIndex++}`);
      params.push(filter.deadlineAfter);
    }

    if (filter.deadlineBefore) {
      conditions.push(`deadline <= $${paramIndex++}`);
      params.push(filter.deadlineBefore);
    }

    if (filter.minAmount) {
      conditions.push(`payment_amount >= $${paramIndex++}`);
      params.push(filter.minAmount);
    }

    if (filter.maxAmount) {
      conditions.push(`payment_amount <= $${paramIndex++}`);
      params.push(filter.maxAmount);
    }

    if (filter.paymentToken) {
      conditions.push(`payment_token = $${paramIndex++}`);
      params.push(filter.paymentToken);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;
    const sortBy = pagination?.sortBy || 'created_at';
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) as total FROM indexed_tasks ${whereClause}`;
    const dataQuery = `
      SELECT * FROM indexed_tasks
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const [countResult, dataResult] = await Promise.all([
      this.query<{ total: string }>(countQuery, params),
      this.query<IndexedTask>(dataQuery, [...params, limit, offset]),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
      page,
      limit,
      hasMore: offset + dataResult.rows.length < parseInt(countResult.rows[0].total, 10),
    };
  }

  async getTaskByTaskId(taskId: number): Promise<IndexedTask | null> {
    const result = await this.query<IndexedTask>(
      'SELECT * FROM indexed_tasks WHERE task_id = $1',
      [taskId]
    );
    return result.rows[0] || null;
  }

  async getTasksByState(state: TaskState, limit: number = 100): Promise<IndexedTask[]> {
    const result = await this.query<IndexedTask>(
      'SELECT * FROM indexed_tasks WHERE state = $1 ORDER BY created_at DESC LIMIT $2',
      [state, limit]
    );
    return result.rows;
  }

  // =========================================================================
  // Event Operations
  // =========================================================================

  async saveEvent(event: IndexedEvent): Promise<void> {
    const query = `
      INSERT INTO indexed_events (
        task_id, tx_hash, event_identifier, address, topics, data,
        timestamp, block_number, processed, indexed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    await this.query(query, [
      event.taskId || null,
      event.txHash,
      event.eventIdentifier,
      event.address,
      event.topics,
      event.data || null,
      event.timestamp,
      event.blockNumber,
      event.processed,
      event.indexedAt,
    ]);
  }

  async getEvents(filter: any, pagination?: PaginationParams): Promise<ApiQueryResult<IndexedEvent>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.eventIdentifier) {
      conditions.push(`event_identifier = $${paramIndex++}`);
      params.push(filter.eventIdentifier);
    }

    if (filter.address) {
      conditions.push(`address = $${paramIndex++}`);
      params.push(filter.address);
    }

    if (filter.taskId !== undefined) {
      conditions.push(`task_id = $${paramIndex++}`);
      params.push(filter.taskId);
    }

    if (filter.fromBlock) {
      conditions.push(`block_number >= $${paramIndex++}`);
      params.push(filter.fromBlock);
    }

    if (filter.toBlock) {
      conditions.push(`block_number <= $${paramIndex++}`);
      params.push(filter.toBlock);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM indexed_events ${whereClause}`;
    const dataQuery = `
      SELECT * FROM indexed_events
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const [countResult, dataResult] = await Promise.all([
      this.query<{ total: string }>(countQuery, params),
      this.query<IndexedEvent>(dataQuery, [...params, limit, offset]),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
      page,
      limit,
      hasMore: offset + dataResult.rows.length < parseInt(countResult.rows[0].total, 10),
    };
  }

  async getEventByTxHash(txHash: string): Promise<IndexedEvent | null> {
    const result = await this.query<IndexedEvent>(
      'SELECT * FROM indexed_events WHERE tx_hash = $1 ORDER BY timestamp DESC LIMIT 1',
      [txHash]
    );
    return result.rows[0] || null;
  }

  // =========================================================================
  // Agent Operations
  // =========================================================================

  async saveAgentStats(stats: AgentStats): Promise<void> {
    const query = `
      INSERT INTO indexed_agents (
        address, total_tasks, completed_tasks, disputed_tasks, cancelled_tasks,
        total_earnings, average_rating, reputation_score, last_active,
        indexed_at, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (address) DO UPDATE SET
        total_tasks = EXCLUDED.total_tasks,
        completed_tasks = EXCLUDED.completed_tasks,
        disputed_tasks = EXCLUDED.disputed_tasks,
        cancelled_tasks = EXCLUDED.cancelled_tasks,
        total_earnings = EXCLUDED.total_earnings,
        average_rating = EXCLUDED.average_rating,
        reputation_score = EXCLUDED.reputation_score,
        last_active = EXCLUDED.last_active,
        last_updated = EXCLUDED.last_updated
    `;

    await this.query(query, [
      stats.address,
      stats.totalTasks,
      stats.completedTasks,
      stats.disputedTasks,
      stats.cancelledTasks,
      stats.totalEarnings,
      stats.averageRating || null,
      stats.reputationScore,
      stats.lastActive,
      stats.indexedAt,
      stats.lastUpdated,
    ]);
  }

  async getAgentStats(address: string): Promise<AgentStats | null> {
    const result = await this.query<AgentStats>(
      'SELECT * FROM indexed_agents WHERE address = $1',
      [address]
    );
    return result.rows[0] || null;
  }

  async getTopAgents(limit: number = 10): Promise<AgentStats[]> {
    const result = await this.query<AgentStats>(
      'SELECT * FROM indexed_agents ORDER BY reputation_score DESC, total_tasks DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  async getAgentTasks(address: string, limit: number = 50): Promise<IndexedTask[]> {
    const result = await this.query<IndexedTask>(
      'SELECT * FROM indexed_tasks WHERE assigned_agent = $1 ORDER BY created_at DESC LIMIT $2',
      [address, limit]
    );
    return result.rows;
  }

  // =========================================================================
  // Creator Operations
  // =========================================================================

  async saveCreatorStats(stats: CreatorStats): Promise<void> {
    const query = `
      INSERT INTO creator_stats (
        address, total_tasks, completed_tasks, cancelled_tasks,
        total_spent, average_task_value, last_active, indexed_at, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (address) DO UPDATE SET
        total_tasks = EXCLUDED.total_tasks,
        completed_tasks = EXCLUDED.completed_tasks,
        cancelled_tasks = EXCLUDED.cancelled_tasks,
        total_spent = EXCLUDED.total_spent,
        average_task_value = EXCLUDED.average_task_value,
        last_active = EXCLUDED.last_active,
        last_updated = EXCLUDED.last_updated
    `;

    await this.query(query, [
      stats.address,
      stats.totalTasks,
      stats.completedTasks,
      stats.cancelledTasks,
      stats.totalSpent,
      stats.averageTaskValue,
      stats.lastActive,
      stats.indexedAt,
      stats.lastUpdated,
    ]);
  }

  async getCreatorStats(address: string): Promise<CreatorStats | null> {
    const result = await this.query<CreatorStats>(
      'SELECT * FROM creator_stats WHERE address = $1',
      [address]
    );
    return result.rows[0] || null;
  }

  async getTopCreators(limit: number = 10): Promise<CreatorStats[]> {
    const result = await this.query<CreatorStats>(
      'SELECT * FROM creator_stats ORDER BY total_tasks DESC, total_spent DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  // =========================================================================
  // Organization Operations
  // =========================================================================

  async saveOrganization(org: Organization): Promise<void> {
    const query = `
      INSERT INTO organizations (
        id, name, description, metadata_uri, admin, members,
        total_tasks, completed_tasks, total_volume, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        metadata_uri = EXCLUDED.metadata_uri,
        members = EXCLUDED.members,
        total_tasks = EXCLUDED.total_tasks,
        completed_tasks = EXCLUDED.completed_tasks,
        total_volume = EXCLUDED.total_volume,
        updated_at = EXCLUDED.updated_at
    `;

    await this.query(query, [
      org.id,
      org.name,
      org.description || null,
      org.metadataUri || null,
      org.admin,
      org.members,
      org.totalTasks,
      org.completedTasks,
      org.totalVolume,
      org.createdAt,
      org.updatedAt,
    ]);
  }

  async getOrganization(id: string): Promise<Organization | null> {
    const result = await this.query<Organization>(
      'SELECT * FROM organizations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async getOrganizations(limit: number = 50, offset: number = 0): Promise<Organization[]> {
    const result = await this.query<Organization>(
      'SELECT * FROM organizations ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async updateOrganizationStats(id: string, taskCompleted: boolean): Promise<void> {
    if (taskCompleted) {
      await this.query(
        'UPDATE organizations SET completed_tasks = completed_tasks + 1, updated_at = $1 WHERE id = $2',
        [Date.now(), id]
      );
    } else {
      await this.query(
        'UPDATE organizations SET total_tasks = total_tasks + 1, updated_at = $1 WHERE id = $2',
        [Date.now(), id]
      );
    }
  }

  // =========================================================================
  // Stats Operations
  // =========================================================================

  async saveProtocolStats(stats: ProtocolStats): Promise<void> {
    const query = `
      INSERT INTO indexing_progress (id, last_processed_block, current_block, total_blocks, events_processed, tasks_indexed, organizations_indexed, errors, last_sync_time)
      VALUES ('protocol_stats', 0, 0, 0, 0, 0, 0, 0, $1)
      ON CONFLICT (id) DO NOTHING
    `;
    await this.query(query, [Date.now()]);

    // Protocol stats are computed on-the-fly, so we just update the timestamp
    await this.query(
      'UPDATE indexing_progress SET last_sync_time = $1 WHERE id = $2',
      [stats.lastUpdated, 'protocol_stats']
    );
  }

  async getProtocolStats(): Promise<ProtocolStats | null> {
    const result = await this.query<ProtocolStats>`
      SELECT 
        COUNT(DISTINCT t.task_id) as total_tasks,
        COALESCE(SUM(t.payment_amount), '0') as total_volume,
        COALESCE(SUM(t.payment_amount * t.protocol_fee_bps / 10000), '0') as total_protocol_fees,
        COUNT(DISTINCT CASE WHEN t.state IN ('Open', 'Accepted', 'Submitted') THEN t.task_id END) as active_tasks,
        COALESCE(AVG(t.payment_amount), '0') as average_task_value,
        (SELECT COUNT(DISTINCT task_id) FROM indexed_tasks WHERE state = 'Disputed'::text)::numeric / 
          NULLIF(COUNT(DISTINCT task_id), 0) * 100 as dispute_rate
      FROM indexed_tasks t
    `;

    const topAgents = await this.getTopAgents(10);
    const topCreators = await this.getTopCreators(10);

    const row = result.rows[0];
    if (!row) return null;

    return {
      totalTasks: parseInt(row.total_tasks, 10),
      totalVolume: row.total_volume,
      totalProtocolFees: row.total_protocol_fees,
      activeTasks: parseInt(row.active_tasks, 10),
      disputeRate: parseFloat(row.dispute_rate) || 0,
      averageTaskValue: row.average_task_value,
      topAgents,
      topCreators,
      lastUpdated: Date.now(),
    };
  }

  // =========================================================================
  // Progress Operations
  // =========================================================================

  async saveIndexingProgress(progress: IndexingProgress): Promise<void> {
    const query = `
      INSERT INTO indexing_progress (
        id, last_processed_block, current_block, total_blocks,
        events_processed, tasks_indexed, organizations_indexed, errors, last_sync_time
      ) VALUES ('global', $1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        last_processed_block = EXCLUDED.last_processed_block,
        current_block = EXCLUDED.current_block,
        total_blocks = EXCLUDED.total_blocks,
        events_processed = EXCLUDED.events_processed,
        tasks_indexed = EXCLUDED.tasks_indexed,
        organizations_indexed = EXCLUDED.organizations_indexed,
        errors = EXCLUDED.errors,
        last_sync_time = EXCLUDED.last_sync_time
    `;

    await this.query(query, [
      progress.lastProcessedBlock,
      progress.currentBlock,
      progress.totalBlocks,
      progress.eventsProcessed,
      progress.tasksIndexed,
      progress.organizationsIndexed,
      progress.errors,
      progress.lastSyncTime,
    ]);
  }

  async getIndexingProgress(): Promise<IndexingProgress | null> {
    const result = await this.query<IndexingProgress>(
      'SELECT * FROM indexing_progress WHERE id = $1',
      ['global']
    );
    return result.rows[0] || null;
  }

  // =========================================================================
  // Utility Methods
  // =========================================================================

  async getProtocolMetrics(): Promise<any> {
    const result = await this.query(`
      SELECT 
        COUNT(DISTINCT t.task_id) as total_tasks,
        COALESCE(SUM(t.payment_amount), '0') as total_volume,
        COALESCE(SUM(t.payment_amount * t.protocol_fee_bps / 10000), '0') as total_protocol_fees,
        COUNT(DISTINCT CASE WHEN t.state IN ('Open', 'Accepted', 'Submitted') THEN t.task_id END) as active_tasks,
        COALESCE(AVG(t.payment_amount), '0') as avg_task_value
      FROM indexed_tasks t
    `);
    return result.rows[0];
  }

  async getAgentMetrics(address: string): Promise<any> {
    const result = await this.query(`
      SELECT 
        state,
        COUNT(*) as count,
        COALESCE(SUM(payment_amount), '0') as total_earnings
      FROM indexed_tasks
      WHERE assigned_agent = $1
      GROUP BY state
    `, [address]);
    return result.rows;
  }

  async getCreatorMetrics(address: string): Promise<any> {
    const result = await this.query(`
      SELECT 
        state,
        COUNT(*) as count,
        COALESCE(SUM(payment_amount), '0') as total_spent
      FROM indexed_tasks
      WHERE creator = $1
      GROUP BY state
    `, [address]);
    return result.rows;
  }

  async healthCheck(): Promise<{ status: 'up' | 'down'; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.query('SELECT 1');
      return { status: 'up', latency: Date.now() - start };
    } catch (error) {
      return { status: 'down', latency: Date.now() - start, error: (error as Error).message };
    }
  }
}
