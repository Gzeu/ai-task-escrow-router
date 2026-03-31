import { BigUIntValue, U64Value, Address, TokenIdentifier } from '@multiversx/sdk-core';
import { TaskState, DisputeResolution, Task, Config, FeeEstimate } from './types';
import { TASK_STATE_NUMBERS, TASK_STATE_NAMES, DISPUTE_RESOLUTION_NUMBERS, DISPUTE_RESOLUTION_NAMES, MAX_FEE_BPS, MAX_AWARD_BPS } from './constants';

/**
 * Convert TaskState enum to contract number
 */
export function taskStateToNumber(state: TaskState): number {
  return TASK_STATE_NUMBERS[state];
}

/**
 * Convert contract number to TaskState enum
 */
export function numberToTaskState(number: number): TaskState {
  const state = TASK_STATE_NAMES[number];
  if (!state) {
    throw new Error(`Invalid task state number: ${number}`);
  }
  return state;
}

/**
 * Convert DisputeResolution enum to contract number
 */
export function disputeResolutionToNumber(resolution: DisputeResolution): number {
  return DISPUTE_RESOLUTION_NUMBERS[resolution];
}

/**
 * Convert contract number to DisputeResolution enum
 */
export function numberToDisputeResolution(number: number): DisputeResolution {
  const resolution = DISPUTE_RESOLUTION_NAMES[number];
  if (!resolution) {
    throw new Error(`Invalid dispute resolution number: ${number}`);
  }
  return resolution;
}

/**
 * Parse contract task data to Task interface
 */
export function parseTaskFromContract(data: any): Task {
  return {
    taskId: data.task_id.toNumber(),
    creator: data.creator.bech32(),
    assignedAgent: data.assigned_agent ? data.assigned_agent.bech32() : undefined,
    paymentToken: data.payment_token.identifier(),
    paymentAmount: data.payment_amount.toString(),
    protocolFeeBps: data.protocol_fee_bps.toNumber(),
    createdAt: data.created_at.toNumber(),
    acceptedAt: data.accepted_at ? data.accepted_at.toNumber() : undefined,
    deadline: data.deadline ? data.deadline.toNumber() : undefined,
    reviewTimeout: data.review_timeout ? data.review_timeout.toNumber() : undefined,
    metadataUri: data.metadata_uri.toString(),
    resultUri: data.result_uri ? data.result_uri.toString() : undefined,
    state: numberToTaskState(data.state.toNumber()),
    disputeMetadata: data.dispute_metadata ? data.dispute_metadata.toString() : undefined,
    ap2MandateHash: data.ap2_mandate_hash ? data.ap2_mandate_hash.toString() : undefined,
    x402SettlementRef: data.x402_settlement_ref ? data.x402_settlement_ref.toString() : undefined,
  };
}

/**
 * Parse contract config data to Config interface
 */
export function parseConfigFromContract(data: any): Config {
  return {
    owner: data.owner.bech32(),
    treasury: data.treasury.bech32(),
    feeBps: data.fee_bps.toNumber(),
    resolver: data.resolver ? data.resolver.bech32() : undefined,
    paused: data.paused,
  };
}

/**
 * Validate fee basis points
 */
export function validateFeeBps(feeBps: number): void {
  if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > MAX_FEE_BPS) {
    throw new Error(`Fee basis points must be an integer between 0 and ${MAX_FEE_BPS}`);
  }
}

/**
 * Validate award basis points
 */
export function validateAwardBps(awardBps: number): void {
  if (!Number.isInteger(awardBps) || awardBps < 0 || awardBps > MAX_AWARD_BPS) {
    throw new Error(`Award basis points must be an integer between 0 and ${MAX_AWARD_BPS}`);
  }
}

/**
 * Validate address format
 */
export function validateAddress(address: string): void {
  try {
    new Address(address);
  } catch (error) {
    throw new Error(`Invalid address format: ${address}`);
  }
}

/**
 * Validate task ID
 */
export function validateTaskId(taskId: number): void {
  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw new Error('Task ID must be a positive integer');
  }
}

/**
 * Validate metadata URI
 */
export function validateMetadataUri(uri: string): void {
  if (!uri || uri.trim().length === 0) {
    throw new Error('Metadata URI cannot be empty');
  }
  
  // Basic URI validation (can be enhanced)
  try {
    new URL(uri);
  } catch {
    // Allow IPFS and other non-standard URIs
    if (!uri.startsWith('ipfs://') && !uri.startsWith('ar://')) {
      throw new Error('Invalid URI format');
    }
  }
}

/**
 * Calculate fee estimate for a task
 */
export function calculateFeeEstimate(
  paymentAmount: string,
  protocolFeeBps: number,
  resolution?: DisputeResolution,
  agentAwardBps?: number
): FeeEstimate {
  const payment = BigInt(paymentAmount);
  const protocolFee = (payment * BigInt(protocolFeeBps)) / BigInt(10000);
  
  let agentPayment = payment - protocolFee;
  let totalFee = protocolFee;
  
  if (resolution === DisputeResolution.PartialRefund && agentAwardBps !== undefined) {
    const agentAward = (payment * BigInt(agentAwardBps)) / BigInt(10000);
    agentPayment = agentAward;
    totalFee = protocolFee; // Protocol fee stays the same
  }
  
  return {
    protocolFee: protocolFee.toString(),
    totalFee: totalFee.toString(),
    agentPayment: agentPayment.toString(),
  };
}

/**
 * Format amount for display
 */
export function formatAmount(amount: string | bigint, decimals: number = 18): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  
  if (value === 0n) return '0';
  
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  
  if (fraction === 0n) {
    return whole.toString();
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fractionStr}`;
}

/**
 * Parse amount from string
 */
export function parseAmount(amount: string, decimals: number = 18): bigint {
  if (!amount || amount.trim() === '') {
    throw new Error('Amount cannot be empty');
  }
  
  const parts = amount.split('.');
  if (parts.length > 2) {
    throw new Error('Invalid amount format');
  }
  
  const wholePart = parts[0] || '0';
  const fractionPart = parts[1] || '';
  
  if (!/^\d+$/.test(wholePart) || !/^\d+$/.test(fractionPart)) {
    throw new Error('Amount must contain only digits');
  }
  
  const paddedFraction = fractionPart.padEnd(decimals, '0').slice(0, decimals);
  const combined = wholePart + paddedFraction;
  
  try {
    return BigInt(combined);
  } catch {
    throw new Error('Amount is too large');
  }
}

/**
 * Check if a task is in a terminal state
 */
export function isTaskTerminal(state: TaskState): boolean {
  return [
    TaskState.Approved,
    TaskState.Cancelled,
    TaskState.Resolved,
    TaskState.Refunded,
  ].includes(state);
}

/**
 * Check if a task can be cancelled
 */
export function canTaskBeCancelled(state: TaskState): boolean {
  return state === TaskState.Open;
}

/**
 * Check if a task can be accepted
 */
export function canTaskBeAccepted(state: TaskState): boolean {
  return state === TaskState.Open;
}

/**
 * Check if a task can have result submitted
 */
export function canTaskSubmitResult(state: TaskState): boolean {
  return state === TaskState.Accepted;
}

/**
 * Check if a task can be approved
 */
export function canTaskBeApproved(state: TaskState): boolean {
  return state === TaskState.Submitted;
}

/**
 * Check if a task can be disputed
 */
export function canTaskBeDisputed(state: TaskState): boolean {
  return state === TaskState.Submitted;
}

/**
 * Check if a task can be refunded
 */
export function canTaskBeRefunded(state: TaskState, deadline?: number, currentTime?: number): boolean {
  if (state !== TaskState.Accepted || !deadline || !currentTime) {
    return false;
  }
  return currentTime > deadline;
}

/**
 * Create a delay utility
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry utility for async operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      await delay(delayMs * attempt);
    }
  }
  
  throw lastError!;
}
