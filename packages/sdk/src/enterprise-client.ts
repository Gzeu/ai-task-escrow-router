/**
 * Enterprise Client - v0.4.0
 * 
 * TypeScript client for enterprise features including
 * organization management, compliance, and advanced analytics
 */

import {
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  Address,
} from "@multiversx/sdk-core";
import type { TransactionConfig } from "./types.js";

// Enterprise-specific types
export interface Organization {
  orgId: string;
  orgName: string;
  owner: string;
  admins: string[];
  members: OrganizationMember[];
  createdAt: number;
  tier: OrganizationTier;
  complianceLevel: ComplianceLevel;
  isActive: boolean;
  metadataUri: string;
}

export interface OrganizationMember {
  address: string;
  role: OrganizationRole;
  permissions: Permission[];
  joinedAt: number;
  lastActive: number;
  isActive: boolean;
}

export enum OrganizationTier {
  Basic = "Basic",
  Business = "Business",
  Enterprise = "Enterprise",
  Custom = "Custom"
}

export enum ComplianceLevel {
  None = "None",
  Standard = "Standard",
  Enhanced = "Enhanced",
  Institutional = "Institutional"
}

export enum OrganizationRole {
  Owner = "Owner",
  Admin = "Admin",
  Manager = "Manager",
  Agent = "Agent",
  Viewer = "Viewer"
}

export enum Permission {
  CreateTask = "CreateTask",
  ApproveTask = "ApproveTask",
  ManageMembers = "ManageMembers",
  ManageSettings = "ManageSettings",
  ViewAnalytics = "ViewAnalytics",
  ExportData = "ExportData",
  ManageApiKeys = "ManageApiKeys",
  AuditLogs = "AuditLogs"
}

export interface ApiKey {
  keyHash: string;
  orgId: string;
  name: string;
  permissions: Permission[];
  rateLimit: number;
  usageCount: number;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  lastUsed: number;
}

export interface AnalyticsMetrics {
  orgId: string;
  period: string;
  totalTasks: number;
  completedTasks: number;
  totalVolume: string;
  averageTaskValue: string;
  successRate: number;
  agentPerformance: AgentPerformance[];
  costBreakdown: CostBreakdown;
  riskMetrics: RiskMetrics;
  generatedAt: number;
}

export enum AnalyticsPeriod {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Quarterly = "Quarterly",
  Yearly = "Yearly"
}

export interface AgentPerformance {
  agentAddress: string;
  tasksCompleted: number;
  totalEarned: string;
  averageRating: number;
  completionTimeAvg: number;
  successRate: number;
  specialization: string;
}

export interface CostBreakdown {
  protocolFees: string;
  agentPayments: string;
  gasCosts: string;
  disputeCosts: string;
  otherCosts: string;
}

export interface RiskMetrics {
  disputeRate: number;
  fraudScore: number;
  complianceScore: number;
  riskLevel: string;
  flaggedTransactions: number;
  mitigationsApplied: number;
}

export enum RiskLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical"
}

export interface WebhookConfig {
  webhookId: number;
  orgId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  retryCount: number;
  lastTriggered: number;
  successRate: number;
}

export enum WebhookEvent {
  TaskCreated = "TaskCreated",
  TaskAccepted = "TaskAccepted",
  TaskCompleted = "TaskCompleted",
  TaskDisputed = "TaskDisputed",
  TaskApproved = "TaskApproved",
  MemberJoined = "MemberJoined",
  MemberLeft = "MemberLeft",
  ApiKeyUsed = "ApiKeyUsed",
  ComplianceAlert = "ComplianceAlert",
  RiskThreshold = "RiskThreshold"
}

export enum ComplianceReportType {
  UserActivity = "UserActivity",
  TransactionHistory = "TransactionHistory",
  RiskAssessment = "RiskAssessment",
  ApiUsage = "ApiUsage"
}

export enum ExportDataType {
  Tasks = "Tasks",
  Members = "Members",
  Analytics = "Analytics",
  AuditLogs = "AuditLogs",
  ComplianceReports = "ComplianceReports"
}

export enum ExportFormat {
  Json = "Json",
  Csv = "Csv",
  Xml = "Xml",
  Pdf = "Pdf"
}

/**
 * Enterprise Client for v0.4.0 features
 */
export class EnterpriseClient {
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
  // ORGANIZATION MANAGEMENT
  // ─────────────────────────────────────────────

  /**
   * Create new organization
   */
  buildCreateOrganization(
    orgId: string,
    orgName: string,
    tier: OrganizationTier,
    complianceLevel: ComplianceLevel,
    metadataUri: string,
    senderAddress: string,
  ) {
    const args = [
      orgId,
      orgName,
      tier,
      complianceLevel,
      metadataUri,
    ];

    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createOrganization",
      gasLimit: BigInt(this.config.gasLimit ?? 20_000_000),
      arguments: args,
    });
  }

  /**
   * Add member to organization
   */
  buildAddOrganizationMember(
    orgId: string,
    memberAddress: string,
    role: OrganizationRole,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "addOrganizationMember",
      gasLimit: BigInt(this.config.gasLimit ?? 10_000_000),
      arguments: [orgId, memberAddress, role],
    });
  }

  /**
   * Update member role
   */
  buildUpdateMemberRole(
    orgId: string,
    memberAddress: string,
    newRole: OrganizationRole,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "updateMemberRole",
      gasLimit: BigInt(this.config.gasLimit ?? 8_000_000),
      arguments: [orgId, memberAddress, newRole],
    });
  }

  // ─────────────────────────────────────────────
  // API KEY MANAGEMENT
  // ─────────────────────────────────────────────

  /**
   * Create API key
   */
  buildCreateApiKey(
    orgId: string,
    name: string,
    permissions: Permission[],
    rateLimit: number,
    expiresInDays: number,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createApiKey",
      gasLimit: BigInt(this.config.gasLimit ?? 15_000_000),
      arguments: [orgId, name, permissions, rateLimit, expiresInDays],
    });
  }

  /**
   * Revoke API key
   */
  buildRevokeApiKey(
    keyHash: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "revokeApiKey",
      gasLimit: BigInt(this.config.gasLimit ?? 5_000_000),
      arguments: [keyHash],
    });
  }

  // ─────────────────────────────────────────────
  // COMPLIANCE & AUDIT
  // ─────────────────────────────────────────────

  /**
   * Generate compliance report
   */
  buildGenerateComplianceReport(
    orgId: string,
    period: AnalyticsPeriod,
    reportType: ComplianceReportType,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "generateComplianceReport",
      gasLimit: BigInt(this.config.gasLimit ?? 25_000_000),
      arguments: [orgId, period, reportType],
    });
  }

  /**
   * Log audit action
   */
  buildLogAuditAction(
    orgId: string,
    userAddress: string,
    action: string, // AuditAction
    resource: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "logAuditAction",
      gasLimit: BigInt(this.config.gasLimit ?? 8_000_000),
      arguments: [orgId, userAddress, action, resource],
    });
  }

  // ─────────────────────────────────────────────
  // ADVANCED ANALYTICS
  // ─────────────────────────────────────────────

  /**
   * Generate analytics metrics
   */
  buildGenerateAnalytics(
    orgId: string,
    period: AnalyticsPeriod,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "generateAnalytics",
      gasLimit: BigInt(this.config.gasLimit ?? 30_000_000),
      arguments: [orgId, period],
    });
  }

  /**
   * Export organization data
   */
  buildExportOrganizationData(
    orgId: string,
    dataType: ExportDataType,
    format: ExportFormat,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "exportOrganizationData",
      gasLimit: BigInt(this.config.gasLimit ?? 20_000_000),
      arguments: [orgId, dataType, format],
    });
  }

  // ─────────────────────────────────────────────
  // WEBHOOK MANAGEMENT
  // ─────────────────────────────────────────────

  /**
   * Create webhook
   */
  buildCreateWebhook(
    orgId: string,
    url: string,
    events: WebhookEvent[],
    secret: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "createWebhook",
      gasLimit: BigInt(this.config.gasLimit ?? 15_000_000),
      arguments: [orgId, url, events, secret],
    });
  }

  /**
   * Trigger webhook
   */
  buildTriggerWebhook(
    orgId: string,
    webhookId: number,
    eventData: string,
    senderAddress: string,
  ) {
    return this.factory.createTransactionForExecute({
      sender: Address.fromBech32(senderAddress),
      contract: Address.fromBech32(this.config.contractAddress),
      function: "triggerWebhook",
      gasLimit: BigInt(this.config.gasLimit ?? 10_000_000),
      arguments: [orgId, webhookId, eventData],
    });
  }

  // ─────────────────────────────────────────────
  // VALIDATION HELPERS
  // ─────────────────────────────────────────────

  validateOrganizationParams(
    orgName: string,
    tier: OrganizationTier,
    complianceLevel: ComplianceLevel,
  ): string[] {
    const errors: string[] = [];

    if (orgName.length < 3) {
      errors.push("Organization name must be at least 3 characters");
    }

    if (orgName.length > 100) {
      errors.push("Organization name must be less than 100 characters");
    }

    if (!Object.values(OrganizationTier).includes(tier)) {
      errors.push("Invalid organization tier");
    }

    if (!Object.values(ComplianceLevel).includes(complianceLevel)) {
      errors.push("Invalid compliance level");
    }

    return errors;
  }

  validateApiKeyParams(
    name: string,
    permissions: Permission[],
    rateLimit: number,
    expiresInDays: number,
  ): string[] {
    const errors: string[] = [];

    if (name.length < 1) {
      errors.push("API key name is required");
    }

    if (name.length > 50) {
      errors.push("API key name must be less than 50 characters");
    }

    if (permissions.length === 0) {
      errors.push("At least one permission is required");
    }

    if (rateLimit <= 0 || rateLimit > 1000000) {
      errors.push("Rate limit must be between 1 and 1,000,000");
    }

    if (expiresInDays < 1 || expiresInDays > 365) {
      errors.push("Expiration must be between 1 and 365 days");
    }

    return errors;
  }

  validateWebhookParams(
    url: string,
    events: WebhookEvent[],
    secret: string,
  ): string[] {
    const errors: string[] = [];

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      errors.push("URL must start with http:// or https://");
    }

    if (events.length === 0) {
      errors.push("At least one event must be selected");
    }

    if (secret.length < 8) {
      errors.push("Secret must be at least 8 characters");
    }

    if (secret.length > 100) {
      errors.push("Secret must be less than 100 characters");
    }

    return errors;
  }

  // ─────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────

  getTierDeposit(tier: OrganizationTier): number {
    switch (tier) {
      case OrganizationTier.Basic:
        return 1_000_000_000_000_000_000; // 1 EGLD
      case OrganizationTier.Business:
        return 5_000_000_000_000_000_000; // 5 EGLD
      case OrganizationTier.Enterprise:
        return 20_000_000_000_000_000_000; // 20 EGLD
      case OrganizationTier.Custom:
        return 10_000_000_000_000_000_000; // 10 EGLD
      default:
        return 1_000_000_000_000_000_000;
    }
  }

  getMaxMembers(tier: OrganizationTier): number {
    switch (tier) {
      case OrganizationTier.Basic:
        return 5;
      case OrganizationTier.Business:
        return 50;
      case OrganizationTier.Enterprise:
        return Number.MAX_SAFE_INTEGER;
      case OrganizationTier.Custom:
        return 100;
      default:
        return 5;
    }
  }

  getDefaultPermissions(role: OrganizationRole): Permission[] {
    switch (role) {
      case OrganizationRole.Owner:
        return [
          Permission.CreateTask,
          Permission.ApproveTask,
          Permission.ManageMembers,
          Permission.ManageSettings,
          Permission.ViewAnalytics,
          Permission.ExportData,
          Permission.ManageApiKeys,
          Permission.AuditLogs,
        ];
      case OrganizationRole.Admin:
        return [
          Permission.CreateTask,
          Permission.ManageMembers,
          Permission.ViewAnalytics,
          Permission.ExportData,
          Permission.ManageApiKeys,
        ];
      case OrganizationRole.Manager:
        return [
          Permission.CreateTask,
          Permission.ViewAnalytics,
        ];
      case OrganizationRole.Agent:
        return [];
      case OrganizationRole.Viewer:
        return [
          Permission.ViewAnalytics,
        ];
      default:
        return [];
    }
  }

  formatAnalyticsMetrics(metrics: AnalyticsMetrics): any {
    return {
      ...metrics,
      totalVolume: this.formatAmount(metrics.totalVolume),
      averageTaskValue: this.formatAmount(metrics.averageTaskValue),
      successRate: `${(metrics.successRate / 100).toFixed(2)}%`,
      agentPerformance: metrics.agentPerformance.map(agent => ({
        ...agent,
        totalEarned: this.formatAmount(agent.totalEarned),
        successRate: `${(agent.successRate / 100).toFixed(2)}%`,
      })),
      costBreakdown: {
        ...metrics.costBreakdown,
        protocolFees: this.formatAmount(metrics.costBreakdown.protocolFees),
        agentPayments: this.formatAmount(metrics.costBreakdown.agentPayments),
        gasCosts: this.formatAmount(metrics.costBreakdown.gasCosts),
        disputeCosts: this.formatAmount(metrics.costBreakdown.disputeCosts),
        otherCosts: this.formatAmount(metrics.costBreakdown.otherCosts),
      },
      riskMetrics: {
        ...metrics.riskMetrics,
        disputeRate: `${(metrics.riskMetrics.disputeRate / 100).toFixed(2)}%`,
        fraudScore: `${metrics.riskMetrics.fraudScore}/1000`,
        complianceScore: `${(metrics.riskMetrics.complianceScore / 100).toFixed(2)}%`,
      },
    };
  }

  private formatAmount(amount: string): string {
    const num = parseFloat(amount) / 1e18;
    return `${num.toFixed(4)} EGLD`;
  }
}
