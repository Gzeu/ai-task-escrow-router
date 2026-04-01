/**
 * AI Task Escrow Router SDK Exports
 * Updated to match Rust contract implementation - v0.3.0 with ESDT, Reputation, Organizations, Analytics
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
  DisputeResolution,
  // v0.2.0 ESDT & Reputation
  TokenWhitelistEntry,
  AddTokenToWhitelistParams,
  UpdateTokenWhitelistParams,
  UpdateReputationAfterTaskParams,
  StakeReputationParams,
  UnstakeReputationParams,
  SlashReputationParams,
  // v0.3.0 Organizations
  Organization,
  OrganizationMember,
  OrganizationRole,
  CreateOrganizationParams,
  JoinOrganizationParams,
  LeaveOrganizationParams,
  AddOrgMemberParams,
  RemoveOrgMemberParams,
  UpdateOrgMemberRoleParams,
  // v0.3.0 Analytics
  TaskStatistics,
  AgentPerformance,
  GetRevenueMetricsParams,
  UpdateTaskStatisticsParams
} from './types';

// Export utility functions
export { formatAmount, formatDate, formatTokenAmount, calculateReputationScore } from './types';
