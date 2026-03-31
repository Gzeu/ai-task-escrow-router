import { TaskState, DisputeResolution } from './types';

export const TASK_STATE_NUMBERS: Record<TaskState, number> = {
  [TaskState.Open]: 0,
  [TaskState.Accepted]: 1,
  [TaskState.Submitted]: 2,
  [TaskState.Approved]: 3,
  [TaskState.Cancelled]: 4,
  [TaskState.Disputed]: 5,
  [TaskState.Resolved]: 6,
  [TaskState.Refunded]: 7,
};

export const TASK_STATE_NAMES: Record<number, TaskState> = {
  0: TaskState.Open,
  1: TaskState.Accepted,
  2: TaskState.Submitted,
  3: TaskState.Approved,
  4: TaskState.Cancelled,
  5: TaskState.Disputed,
  6: TaskState.Resolved,
  7: TaskState.Refunded,
};

export const DISPUTE_RESOLUTION_NUMBERS: Record<DisputeResolution, number> = {
  [DisputeResolution.FullRefund]: 0,
  [DisputeResolution.PartialRefund]: 1,
  [DisputeResolution.FullPayment]: 2,
};

export const DISPUTE_RESOLUTION_NAMES: Record<number, DisputeResolution> = {
  0: DisputeResolution.FullRefund,
  1: DisputeResolution.PartialRefund,
  2: DisputeResolution.FullPayment,
};

export const DEFAULT_GAS_LIMIT = 10000000;
export const DEFAULT_GAS_PRICE = 1000000000;
export const MAX_FEE_BPS = 1000; // 10%
export const MAX_AWARD_BPS = 10000; // 100%

export const EVENT_TOPICS = {
  TASK_CREATED: 'taskCreated',
  TASK_ACCEPTED: 'taskAccepted',
  RESULT_SUBMITTED: 'resultSubmitted',
  TASK_APPROVED: 'taskApproved',
  TASK_CANCELLED: 'taskCancelled',
  DISPUTE_OPENED: 'disputeOpened',
  DISPUTE_RESOLVED: 'disputeResolved',
  TASK_REFUNDED: 'taskRefunded',
  CONFIG_CHANGED: 'configChanged',
} as const;

export const ENDPOINTS = {
  INIT: 'init',
  CREATE_TASK: 'createTask',
  ACCEPT_TASK: 'acceptTask',
  SUBMIT_RESULT: 'submitResult',
  APPROVE_TASK: 'approveTask',
  CANCEL_TASK: 'cancelTask',
  OPEN_DISPUTE: 'openDispute',
  RESOLVE_DISPUTE: 'resolveDispute',
  REFUND_EXPIRED_TASK: 'refundExpiredTask',
  SET_FEE_BPS: 'setFeeBps',
  SET_TREASURY: 'setTreasury',
  SET_RESOLVER: 'setResolver',
  SET_PAUSED: 'setPaused',
  GET_TASK: 'getTask',
  GET_TASK_COUNT: 'getTaskCount',
  GET_CONFIG: 'getConfig',
} as const;

export const MULTIVERSX_NETWORKS = {
  MAINNET: {
    chainId: '1',
    apiTimeout: 10000,
  },
  TESTNET: {
    chainId: 'T',
    apiTimeout: 10000,
  },
  DEVNET: {
    chainId: 'D',
    apiTimeout: 10000,
  },
} as const;

export const TOKEN_IDENTIFIERS = {
  EGLD: 'EGLD',
} as const;
