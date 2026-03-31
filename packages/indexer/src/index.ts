import { config } from 'dotenv';
import { EventIndexer } from './event-indexer';
import { DatabaseService } from './database';
import { Logger } from './logger';
import { IndexerConfig } from './types';

// Load environment variables
config();

const indexerConfig: IndexerConfig = {
  network: (process.env.NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'devnet',
  apiUrl: process.env.API_URL || 'https://devnet-api.multiversx.com',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'ai-task-escrow',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  indexing: {
    batchSize: parseInt(process.env.BATCH_SIZE || '100'),
    syncInterval: parseInt(process.env.SYNC_INTERVAL || '5000'),
    startBlock: parseInt(process.env.START_BLOCK || '0'),
  },
  logging: {
    level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
  },
};

async function main() {
  const logger = new Logger(indexerConfig.logging.level);
  
  try {
    logger.info('Starting AI Task Escrow Router Indexer...');
    
    // Initialize database connection
    const database = new DatabaseService(indexerConfig);
    await database.connect();
    logger.info('Database connected successfully');
    
    // Initialize and start event indexer
    const indexer = new EventIndexer(indexerConfig, database, logger);
    
    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await indexer.stop();
      await database.disconnect();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await indexer.stop();
      await database.disconnect();
      process.exit(0);
    });
    
    // Start indexing
    await indexer.start();
    
  } catch (error) {
    logger.error('Failed to start indexer:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the indexer
if (require.main === module) {
  main();
}

export { EventIndexer, DatabaseService, Logger };
export * from './types';
