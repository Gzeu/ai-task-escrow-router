/**
 * AI Task Escrow Router SDK Exports
 * Updated to match Rust contract implementation
 */

// Export all types
export * from './types';

// Export main client
export { RouterEscrowClient } from './client';

// Re-export commonly used types for convenience
export type {
  Task,
  Config,
  AgentReputation,
  RouterEscrowClientConfig,
  CreateTaskParams,
  SubmitResultParams,
  OpenDisputeParams,
  ResolveDisputeParams,
  TransactionResult,
  TaskState,
  VerificationStatus,
  DisputeResolution
} from './types';

// Export utility functions
export { formatAmount, formatDate } from './types';
