import { RouterEscrowClientConfig } from '@ai-task-escrow/sdk';

export const config: RouterEscrowClientConfig = {
  contractAddress: process.env.CONTRACT_ADDRESS || 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsh',
  network: (process.env.NETWORK as 'devnet' | 'mainnet' | 'testnet') || 'devnet',
  apiTimeout: parseInt(process.env.API_TIMEOUT || '6000'),
};

export const webhookConfig = {
  webhookUrl: process.env.WEBHOOK_URL || '',
  webhookSecret: process.env.WEBHOOK_SECRET || '',
};

export const indexerConfig = {
  apiUrl: process.env.INDEXER_URL || 'http://localhost:3001',
  syncInterval: parseInt(process.env.SYNC_INTERVAL || '5000'),
  startBlock: parseInt(process.env.START_BLOCK || '0'),
};
