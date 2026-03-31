/**
 * Production Client - v1.0.0
 * 
 * TypeScript client for production-ready features including
 * DAO governance, treasury management, grant programs, and security audits
 */

import {
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  Address,
} from "@multiversx/sdk-core";
import type { TransactionConfig } from "./types.js";

// Production-specific types
export interface DaoProposal {
  proposalId: number;
  title: string;
  description: string;
  proposer: string;
  proposalType: ProposalType;
  targetAddress: string;
  payload: string;
  votingStart: number;
  votingEnd: number;
  quorumRequired: number; // basis points (10000 = 100%)
  yesVotes: string;
  noVotes: string;
  totalVotingPower: string;
  status: ProposalStatus;
  executionHash: string;
  createdAt: number;
}

export enum ProposalType {
  ProtocolUpgrade = "ProtocolUpgrade",
  ParameterChange = "ParameterChange",
  TreasuryAllocation = "TreasuryAllocation",
  IncentiveProgram = "IncentiveProgram",
  GrantProgram = "GrantProgram",
  PartnershipAgreement = "PartnershipAgreement",
  EmergencyAction = "EmergencyAction",
}

export enum ProposalStatus {
  Pending = "Pending",
  Active = "Active",
  Passed = "Passed",
  Rejected = "Rejected",
  Executed = "Executed",
  Cancelled = "Cancelled",
  Expired = "Expired",
}

export interface TreasuryAllocation {
  allocationId: number;
  recipient: string;
  amount: string;
  token: string;
  purpose: string;
  vestingStart: number;
  vestingEnd: number;
  vestingCliff: number;
  totalInstallments: number;
  releasedInstallments: number;
  createdAt: number;
  isActive: boolean;
}

export interface GrantProgram {
  programId: number;
  name: string;
  description: string;
  totalBudget: string;
  token: string;
  applicationStart: number;
  applicationEnd: number;
  reviewPeriod: number;
  maxGrantAmount: string;
  minGrantAmount: string;
  criteria: string;
  reviewerPanel: string[];
  status: GrantProgramStatus;
  createdAt: number;
  manager: string;
}

export enum GrantProgramStatus {
  Draft = "Draft",
  Active = "Active",
  UnderReview = "UnderReview",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface GrantApplication {
  applicationId: number;
  programId: number;
  applicant: string;
  projectTitle: string;
  projectDescription: string;
  requestedAmount: string;
  milestoneCount: number;
  deliverables: string[];
  teamInfo: string;
  submissionDate: number;
  status: ApplicationStatus;
  reviewScores: ReviewScore[];
  finalScore: number;
  allocatedAmount: string;
  milestoneProgress: number;
}

export enum ApplicationStatus {
  Submitted = "Submitted",
  UnderReview = "UnderReview",
  Approved = "Approved",
  Rejected = "Rejected",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface ReviewScore {
  reviewer: string;
  score: number; // 0-100
  comments: string;
  reviewedAt: number;
}

export interface EconomicModel {
  protocolFeeRate: number; // basis points
  treasuryAllocationRate: number; // basis points
  stakingRewardRate: number; // basis points
  deflationaryBurnRate: number; // basis points
  liquidityMiningRate: number; // basis points
  maxSupply: string;
  currentSupply: string;
  circulatingSupply: string;
  stakedAmount: string;
  totalBurned: string;
  lastUpdated: number;
}

export interface StressTestConfig {
  testId: number;
  testName: string;
  concurrentUsers: number;
  transactionsPerSecond: number;
  durationSeconds: number;
  taskCreationRate: number;
  disputeRate: number;
  gasLimitPerTx: number;
  maxMemoryUsage: number;
  status: TestStatus;
  startedAt: number;
  completedAt: number;
  results: TestResults;
}

export interface TestResults {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageGasUsed: number;
  peakGasUsed: number;
  averageResponseTime: number;
  peakResponseTime: number;
  throughput: number;
  errorRate: number; // basis points
  memoryUsage: number;
  cpuUsage: number;
}

export enum TestStatus {
  Pending = "Pending",
  Running = "Running",
  Completed = "Completed",
  Failed = "Failed",
  Cancelled = "Cancelled",
}

export interface SecurityAudit {
  auditId: number;
  auditor: string;
  auditType: AuditType;
  contractVersion: string;
  findings: SecurityFinding[];
  overallScore: number; // 0-100
  recommendations: string[];
  auditDate: number;
  status: AuditStatus;
}

export interface SecurityFinding {
  findingId: number;
  severity: Severity;
  category: FindingCategory;
  title: string;
  description: string;
  affectedContract: string;
  lineNumber: number;
  remediation: string;
  status: FindingStatus;
}

export enum AuditType {
  FormalVerification = "FormalVerification",
  PenetrationTest = "PenetrationTest",
  CodeReview = "CodeReview",
  EconomicModel = "EconomicModel",
  SmartContractAudit = "SmartContractAudit",
}

export enum Severity {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Informational = "Informational",
}

export enum FindingCategory {
  AccessControl = "AccessControl",
  Reentrancy = "Reentrancy",
  IntegerOverflow = "IntegerOverflow",
  LogicError = "LogicError",
  GasOptimization = "GasOptimization",
  BestPractice = "BestPractice",
}

export enum FindingStatus {
  Open = "Open",
  InProgress = "InProgress",
  Fixed = "Fixed",
  Verified = "Verified",
  Ignored = "Ignored",
}

export enum AuditStatus {
  InProgress = "InProgress",
  Completed = "Completed",
  Failed = "Failed",
  Cancelled = "Cancelled",
}

/**
 * Production Client for v1.0.0 features
 */
export class ProductionClient {
  private factory: SmartContractTransactionsFactory;

  constructor(private config: TransactionConfig) {
    const factoryConfig = new TransactionsFactoryConfig({ 
      chainID: config.chainId 
    });
    this.factory = new SmartContractTransactionsFactory({ 
      config: factoryConfig 
    });
  }

  // ─────────────────────────────────────────────
  // DAO GOVERNANCE
  // ─────────────────────────────────────────────

  /**
   * Create DAO proposal
   */
  buildCreateDaoProposal(
    title: string,
    description: string,
    proposalType: ProposalType,
    targetAddress: string,
    payload: string,
    votingPeriodHours: number,
    quorumRequired: number,
    senderAddress: string,
  ) {
    const args = [
      title,
      description,
      proposalType,
      targetAddress,
      payload,
      votingPeriodHours,
      quorumRequired,
    ];

    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createDaoProposal",
      gasLimit: BigInt(this.config.gasLimit ?? 25_000_000),
      arguments: args,
    });
  }

  /**
   * Vote on DAO proposal
   */
  buildVoteOnProposal(
    proposalId: number,
    vote: boolean, // true = yes, false = no
    votingPower: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "voteOnProposal",
      gasLimit: BigInt(this.config.gasLimit ?? 10_000_000),
      arguments: [proposalId, vote, votingPower],
    });
  }

  /**
   * Execute passed proposal
   */
  buildExecuteProposal(
    proposalId: number,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "executeProposal",
      gasLimit: BigInt(this.config.gasLimit ?? 30_000_000),
      arguments: [proposalId],
    });
  }

  // ─────────────────────────────────────────────
  // TREASURY MANAGEMENT
  // ─────────────────────────────────────────────

  /**
   * Create treasury allocation
   */
  buildCreateTreasuryAllocation(
    recipient: string,
    amount: string,
    token: string,
    purpose: string,
    vestingMonths: number,
    installments: number,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createTreasuryAllocation",
      gasLimit: BigInt(this.config.gasLimit ?? 20_000_000),
      arguments: [recipient, amount, token, purpose, vestingMonths, installments],
    });
  }

  /**
   * Release vested funds
   */
  buildReleaseVestedFunds(
    allocationId: number,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "releaseVestedFunds",
      gasLimit: BigInt(this.config.gasLimit ?? 15_000_000),
      arguments: [allocationId],
    });
  }

  // ─────────────────────────────────────────────
  // GRANT PROGRAMS
  // ─────────────────────────────────────────────

  /**
   * Create grant program
   */
  buildCreateGrantProgram(
    name: string,
    description: string,
    totalBudget: string,
    token: string,
    applicationPeriodDays: number,
    reviewPeriodDays: number,
    maxGrantAmount: string,
    minGrantAmount: string,
    criteria: string,
    reviewerPanel: string[],
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createGrantProgram",
      gasLimit: BigInt(this.config.gasLimit ?? 35_000_000),
      arguments: [
        name,
        description,
        totalBudget,
        token,
        applicationPeriodDays,
        reviewPeriodDays,
        maxGrantAmount,
        minGrantAmount,
        criteria,
        reviewerPanel,
      ],
    });
  }

  /**
   * Submit grant application
   */
  buildSubmitGrantApplication(
    programId: number,
    projectTitle: string,
    projectDescription: string,
    requestedAmount: string,
    milestoneCount: number,
    deliverables: string[],
    teamInfo: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "submitGrantApplication",
      gasLimit: BigInt(this.config.gasLimit ?? 25_000_000),
      arguments: [
        programId,
        projectTitle,
        projectDescription,
        requestedAmount,
        milestoneCount,
        deliverables,
        teamInfo,
      ],
    });
  }

  /**
   * Review grant application
   */
  buildReviewGrantApplication(
    applicationId: number,
    score: number,
    comments: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "reviewGrantApplication",
      gasLimit: BigInt(this.config.gasLimit ?? 15_000_000),
      arguments: [applicationId, score, comments],
    });
  }

  // ─────────────────────────────────────────────
  // ECONOMIC MODEL
  // ─────────────────────────────────────────────

  /**
   * Update economic model parameters
   */
  buildUpdateEconomicModel(
    protocolFeeRate: number,
    treasuryAllocationRate: number,
    stakingRewardRate: number,
    deflationaryBurnRate: number,
    liquidityMiningRate: number,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "updateEconomicModel",
      gasLimit: BigInt(this.config.gasLimit ?? 20_000_000),
      arguments: [
        protocolFeeRate,
        treasuryAllocationRate,
        stakingRewardRate,
        deflationaryBurnRate,
        liquidityMiningRate,
      ],
    });
  }

  /**
   * Process protocol fees
   */
  buildProcessProtocolFees(
    totalAmount: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "processProtocolFees",
      gasLimit: BigInt(this.config.gasLimit ?? 10_000_000),
      arguments: [totalAmount],
    });
  }

  // ─────────────────────────────────────────────
  // STRESS TESTING
  // ─────────────────────────────────────────────

  /**
   * Start stress test
   */
  buildStartStressTest(
    testName: string,
    concurrentUsers: number,
    transactionsPerSecond: number,
    durationSeconds: number,
    taskCreationRate: number,
    disputeRate: number,
    gasLimitPerTx: number,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "startStressTest",
      gasLimit: BigInt(this.config.gasLimit ?? 15_000_000),
      arguments: [
        testName,
        concurrentUsers,
        transactionsPerSecond,
        durationSeconds,
        taskCreationRate,
        disputeRate,
        gasLimitPerTx,
      ],
    });
  }

  /**
   * Complete stress test
   */
  buildCompleteStressTest(
    testId: number,
    results: TestResults,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "completeStressTest",
      gasLimit: BigInt(this.config.gasLimit ?? 25_000_000),
      arguments: [testId, results],
    });
  }

  // ─────────────────────────────────────────────
  // SECURITY AUDITS
  // ─────────────────────────────────────────────

  /**
   * Create security audit
   */
  buildCreateSecurityAudit(
    auditor: string,
    auditType: AuditType,
    contractVersion: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createSecurityAudit",
      gasLimit: BigInt(this.config.gasLimit ?? 15_000_000),
      arguments: [auditor, auditType, contractVersion],
    });
  }

  /**
   * Add security finding
   */
  buildAddSecurityFinding(
    auditId: number,
    severity: Severity,
    category: FindingCategory,
    title: string,
    description: string,
    affectedContract: string,
    lineNumber: number,
    remediation: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "addSecurityFinding",
      gasLimit: BigInt(this.config.gasLimit ?? 20_000_000),
      arguments: [
        auditId,
        severity,
        category,
        title,
        description,
        affectedContract,
        lineNumber,
        remediation,
      ],
    });
  }

  /**
   * Complete security audit
   */
  buildCompleteSecurityAudit(
    auditId: number,
    overallScore: number,
    recommendations: string[],
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "completeSecurityAudit",
      gasLimit: BigInt(this.config.gasLimit ?? 25_000_000),
      arguments: [auditId, overallScore, recommendations],
    });
  }

  // ─────────────────────────────────────────────
  // VALIDATION HELPERS
  // ─────────────────────────────────────────────

  validateDaoProposalParams(
    title: string,
    description: string,
    votingPeriodHours: number,
    quorumRequired: number,
  ): string[] {
    const errors: string[] = [];

    if (title.length < 10) {
      errors.push("Title must be at least 10 characters");
    }

    if (title.length > 200) {
      errors.push("Title must be less than 200 characters");
    }

    if (description.length < 50) {
      errors.push("Description must be at least 50 characters");
    }

    if (description.length > 2000) {
      errors.push("Description must be less than 2000 characters");
    }

    if (votingPeriodHours < 24) {
      errors.push("Voting period must be at least 24 hours");
    }

    if (votingPeriodHours > 8760) {
      errors.push("Voting period cannot exceed 1 year");
    }

    if (quorumRequired < 1000) {
      errors.push("Quorum must be at least 10%");
    }

    if (quorumRequired > 10000) {
      errors.push("Quorum cannot exceed 100%");
    }

    return errors;
  }

  validateTreasuryAllocationParams(
    amount: string,
    vestingMonths: number,
    installments: number,
  ): string[] {
    const errors: string[] = [];

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      errors.push("Amount must be greater than zero");
    }

    if (vestingMonths < 1) {
      errors.push("Vesting period must be at least 1 month");
    }

    if (vestingMonths > 60) {
      errors.push("Vesting period cannot exceed 60 months");
    }

    if (installments < 1) {
      errors.push("Installments must be at least 1");
    }

    if (installments > 60) {
      errors.push("Installments cannot exceed 60");
    }

    return errors;
  }

  validateGrantProgramParams(
    totalBudget: string,
    maxGrantAmount: string,
    minGrantAmount: string,
    applicationPeriodDays: number,
  ): string[] {
    const errors: string[] = [];

    const budgetNum = parseFloat(totalBudget);
    const maxNum = parseFloat(maxGrantAmount);
    const minNum = parseFloat(minGrantAmount);

    if (budgetNum <= 0) {
      errors.push("Total budget must be greater than zero");
    }

    if (maxNum <= 0) {
      errors.push("Max grant amount must be greater than zero");
    }

    if (minNum <= 0) {
      errors.push("Min grant amount must be greater than zero");
    }

    if (minNum > maxNum) {
      errors.push("Min grant amount cannot exceed max grant amount");
    }

    if (applicationPeriodDays < 7) {
      errors.push("Application period must be at least 7 days");
    }

    if (applicationPeriodDays > 365) {
      errors.push("Application period cannot exceed 1 year");
    }

    return errors;
  }

  validateEconomicModelParams(
    protocolFeeRate: number,
    treasuryAllocationRate: number,
    stakingRewardRate: number,
    deflationaryBurnRate: number,
    liquidityMiningRate: number,
  ): string[] {
    const errors: string[] = [];

    const totalRate = protocolFeeRate + treasuryAllocationRate + stakingRewardRate + deflationaryBurnRate + liquidityMiningRate;

    if (totalRate > 10000) {
      errors.push("Total rates cannot exceed 100%");
    }

    if (protocolFeeRate < 0 || protocolFeeRate > 10000) {
      errors.push("Protocol fee rate must be between 0 and 100%");
    }

    if (treasuryAllocationRate < 0 || treasuryAllocationRate > 10000) {
      errors.push("Treasury allocation rate must be between 0 and 100%");
    }

    if (stakingRewardRate < 0 || stakingRewardRate > 10000) {
      errors.push("Staking reward rate must be between 0 and 100%");
    }

    if (deflationaryBurnRate < 0 || deflationaryBurnRate > 10000) {
      errors.push("Deflationary burn rate must be between 0 and 100%");
    }

    if (liquidityMiningRate < 0 || liquidityMiningRate > 10000) {
      errors.push("Liquidity mining rate must be between 0 and 100%");
    }

    return errors;
  }

  // ─────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────

  calculateQuorumRequired(
    votingPower: string,
    quorumPercentage: number,
  ): string {
    const power = parseFloat(votingPower);
    const required = (power * quorumPercentage) / 10000;
    return required.toString();
  }

  calculateVotingResults(
    yesVotes: string,
    noVotes: string,
  ): { yesPercentage: number; noPercentage: number; winner: 'yes' | 'no' | 'tie' } {
    const yes = parseFloat(yesVotes);
    const no = parseFloat(noVotes);
    const total = yes + no;

    if (total === 0) {
      return { yesPercentage: 0, noPercentage: 0, winner: 'tie' };
    }

    const yesPercentage = (yes / total) * 10000; // basis points
    const noPercentage = (no / total) * 10000; // basis points

    let winner: 'yes' | 'no' | 'tie';
    if (yesPercentage > noPercentage) {
      winner = 'yes';
    } else if (noPercentage > yesPercentage) {
      winner = 'no';
    } else {
      winner = 'tie';
    }

    return { yesPercentage, noPercentage, winner };
  }

  calculateVestedAmount(
    totalAmount: string,
    totalInstallments: number,
    releasedInstallments: number,
    currentTime: number,
    vestingStart: number,
    vestingEnd: number,
  ): { vestedAmount: string; installmentsToRelease: number; isFullyVested: boolean } {
    const amount = parseFloat(totalAmount);
    const current = currentTime;
    const start = vestingStart;
    const end = vestingEnd;

    if (current < start) {
      return { vestedAmount: '0', installmentsToRelease: 0, isFullyVested: false };
    }

    if (current >= end) {
      const vestedAmount = amount.toString();
      const installmentsToRelease = totalInstallments - releasedInstallments;
      return { vestedAmount, installmentsToRelease, isFullyVested: true };
    }

    const elapsedTime = current - start;
    const totalTime = end - start;
    const vestedPercentage = (elapsedTime * 10000) / totalTime; // basis points
    const totalInstallmentsToRelease = (vestedPercentage * totalInstallments) / 10000;
    const installmentsToRelease = totalInstallmentsToRelease - releasedInstallments;

    const vestedAmount = (amount * vestedPercentage) / 10000;
    const isFullyVested = installmentsToRelease >= (totalInstallments - releasedInstallments);

    return { 
      vestedAmount: vestedAmount.toString(), 
      installmentsToRelease: Math.floor(installmentsToRelease), 
      isFullyVested 
    };
  }

  formatEconomicMetrics(model: EconomicModel): any {
    return {
      ...model,
      protocolFeeRate: `${(model.protocolFeeRate / 100).toFixed(2)}%`,
      treasuryAllocationRate: `${(model.treasuryAllocationRate / 100).toFixed(2)}%`,
      stakingRewardRate: `${(model.stakingRewardRate / 100).toFixed(2)}%`,
      deflationaryBurnRate: `${(model.deflationaryBurnRate / 100).toFixed(2)}%`,
      liquidityMiningRate: `${(model.liquidityMiningRate / 100).toFixed(2)}%`,
      totalSupply: this.formatAmount(model.maxSupply),
      currentSupply: this.formatAmount(model.currentSupply),
      circulatingSupply: this.formatAmount(model.circulatingSupply),
      stakedAmount: this.formatAmount(model.stakedAmount),
      totalBurned: this.formatAmount(model.totalBurned),
    };
  }

  formatStressTestResults(results: TestResults): any {
    return {
      ...results,
      successRate: `${((results.successfulTransactions / results.totalTransactions) * 10000).toFixed(2)}%`,
      errorRate: `${(results.errorRate / 100).toFixed(2)}%`,
      averageGasUsed: results.averageGasUsed.toLocaleString(),
      peakGasUsed: results.peakGasUsed.toLocaleString(),
      throughput: `${results.throughput.toLocaleString()} tx/s`,
      averageResponseTime: `${(results.averageResponseTime / 1000).toFixed(2)}s`,
      peakResponseTime: `${(results.peakResponseTime / 1000).toFixed(2)}s`,
    };
  }

  formatSecurityAuditScore(score: number): { grade: string; color: string; description: string } {
    let grade: string;
    let color: string;
    let description: string;

    if (score >= 90) {
      grade = 'A+';
      color = 'green';
      description = 'Excellent security posture';
    } else if (score >= 80) {
      grade = 'A';
      color = 'green';
      description = 'Very good security posture';
    } else if (score >= 70) {
      grade = 'B';
      color = 'yellow';
      description = 'Good security posture';
    } else if (score >= 60) {
      grade = 'C';
      color = 'orange';
      description = 'Fair security posture';
    } else if (score >= 50) {
      grade = 'D';
      color = 'red';
      description = 'Poor security posture';
    } else {
      grade = 'F';
      color = 'red';
      description = 'Critical security issues';
    }

    return { grade, color, description };
  }

  private formatAmount(amount: string): string {
    const num = parseFloat(amount) / 1e18;
    return `${num.toFixed(4)} EGLD`;
  }
}

export { ProductionClient };
