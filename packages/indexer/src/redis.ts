import { createClient, RedisClientType } from 'redis';
import { Logger } from './logger';
import { IndexerConfig, AgentStats, ProtocolStats } from './types';

export class CacheService {
  private client: RedisClientType;
  private logger: Logger;
  private isConnected: boolean = false;
  private keyPrefix: string;

  constructor(private config: IndexerConfig, logger: Logger) {
    this.logger = logger;
    this.keyPrefix = this.config.redis.keyPrefix;

    this.client = createClient({
      socket: {
        host: this.config.redis.host,
        port: this.config.redis.port,
      },
      password: this.config.redis.password,
      database: this.config.redis.db,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis client error', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.logger.debug('Redis client connected');
    });

    this.client.on('ready', () => {
      this.logger.info('Redis connection established');
      this.isConnected = true;
    });

    this.client.on('end', () => {
      this.logger.warn('Redis connection ended');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      this.logger.info('Redis connected successfully', {
        host: this.config.redis.host,
        port: this.config.redis.port,
        db: this.config.redis.db,
      });
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.isConnected = false;
      this.logger.info('Redis disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis', error);
    }
  }

  // =========================================================================
  // Agent Reputation Cache
  // =========================================================================

  async cacheAgentStats(address: string, stats: AgentStats, ttl: number = 3600): Promise<void> {
    const key = this.prefixKey(`agent:${address}`);
    try {
      await this.client.setEx(key, ttl, JSON.stringify(stats));
      this.logger.debug('Cached agent stats', { address, ttl });
    } catch (error) {
      this.logger.warn('Failed to cache agent stats', { address, error });
    }
  }

  async getCachedAgentStats(address: string): Promise<AgentStats | null> {
    const key = this.prefixKey(`agent:${address}`);
    try {
      const cached = await this.client.get(key);
      if (cached) {
        this.logger.debug('Cache hit for agent stats', { address });
        return JSON.parse(cached) as AgentStats;
      }
      this.logger.debug('Cache miss for agent stats', { address });
      return null;
    } catch (error) {
      this.logger.warn('Failed to get cached agent stats', { address, error });
      return null;
    }
  }

  async invalidateAgentStats(address: string): Promise<void> {
    const key = this.prefixKey(`agent:${address}`);
    try {
      await this.client.del(key);
      this.logger.debug('Invalidated agent stats cache', { address });
    } catch (error) {
      this.logger.warn('Failed to invalidate agent stats', { address, error });
    }
  }

  // =========================================================================
  // Task Stats Cache
  // =========================================================================

  async cacheTaskStats(taskId: number, stats: any, ttl: number = 1800): Promise<void> {
    const key = this.prefixKey(`task:${taskId}:stats`);
    try {
      await this.client.setEx(key, ttl, JSON.stringify(stats));
    } catch (error) {
      this.logger.warn('Failed to cache task stats', { taskId, error });
    }
  }

  async getCachedTaskStats(taskId: number): Promise<any | null> {
    const key = this.prefixKey(`task:${taskId}:stats`);
    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn('Failed to get cached task stats', { taskId, error });
      return null;
    }
  }

  // =========================================================================
  // Protocol Stats Cache
  // =========================================================================

  async cacheProtocolStats(stats: ProtocolStats, ttl: number = 300): Promise<void> {
    const key = this.prefixKey('protocol:stats');
    try {
      await this.client.setEx(key, ttl, JSON.stringify(stats));
      this.logger.debug('Cached protocol stats', { ttl });
    } catch (error) {
      this.logger.warn('Failed to cache protocol stats', { error });
    }
  }

  async getCachedProtocolStats(): Promise<ProtocolStats | null> {
    const key = this.prefixKey('protocol:stats');
    try {
      const cached = await this.client.get(key);
      if (cached) {
        return JSON.parse(cached) as ProtocolStats;
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to get cached protocol stats', { error });
      return null;
    }
  }

  // =========================================================================
  // Rate Limiting
  // =========================================================================

  async checkRateLimit(identifier: string, windowMs: number, maxRequests: number): Promise<boolean> {
    const key = this.prefixKey(`ratelimit:${identifier}`);
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      const multi = this.client.multi();

      // Remove old entries
      multi.zRemRangeByScore(key, 0, windowStart);

      // Add current request
      multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });

      // Count requests in window
      multi.zCard(key);

      // Set expiry
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();
      const count = results[2] as number;

      return count <= maxRequests;
    } catch (error) {
      this.logger.warn('Rate limit check failed', { identifier, error });
      return true; // Allow on error
    }
  }

  // =========================================================================
  // Pub/Sub for Real-time Updates
  // =========================================================================

  async publishEvent(channel: string, message: any): Promise<void> {
    try {
      await this.client.publish(channel, JSON.stringify(message));
      this.logger.debug('Published event', { channel });
    } catch (error) {
      this.logger.warn('Failed to publish event', { channel, error });
    }
  }

  async subscribeToChannel(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(channel, (message) => {
        callback(message);
      });
      this.logger.info('Subscribed to Redis channel', { channel });
    } catch (error) {
      this.logger.error('Failed to subscribe to channel', { channel, error });
    }
  }

  // =========================================================================
  // Utility Methods
  // =========================================================================

  private prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
      this.logger.info('Redis cache flushed');
    } catch (error) {
      this.logger.error('Failed to flush Redis', error);
    }
  }

  async healthCheck(): Promise<{ status: 'up' | 'down'; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.client.ping();
      return { status: 'up', latency: Date.now() - start };
    } catch (error) {
      return { status: 'down', latency: Date.now() - start, error: (error as Error).message };
    }
  }
}
