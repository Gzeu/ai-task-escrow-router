import dotenv from 'dotenv';
import { IndexerConfig } from './types';

dotenv.config();

export function loadConfig(): IndexerConfig {
  return {
    network: (process.env.NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'devnet',
    apiUrl: process.env.API_URL || 'https://devnet-api.multiversx.com',
    gatewayWsUrl: process.env.GATEWAY_WS_URL || 'wss://devnet-gateway.multiversx.com/websocket',
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DATABASE || 'ai_task_escrow',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      maxConnections: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20'),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '10000'),
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'indexer:',
    },
    indexing: {
      batchSize: parseInt(process.env.BATCH_SIZE || '100'),
      syncInterval: parseInt(process.env.SYNC_INTERVAL || '5000'),
      startBlock: parseInt(process.env.START_BLOCK || '0'),
      maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
    },
    api: {
      port: parseInt(process.env.API_PORT || '3001'),
      corsOrigins: (process.env.CORS_ORIGINS || '*').split(','),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    },
    websocket: {
      port: parseInt(process.env.WS_PORT || '3002'),
      pingInterval: parseInt(process.env.WS_PING_INTERVAL || '30000'),
      pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '5000'),
    },
    logging: {
      level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
      format: (process.env.LOG_FORMAT as 'json' | 'simple') || 'json',
    },
    monitoring: {
      enabled: process.env.MONITORING_ENABLED === 'true',
      metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
    },
  };
}
