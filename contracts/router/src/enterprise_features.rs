//! Enterprise Features - v0.4.0
//! 
//! Implementation of enterprise-grade features including
//! organization accounts, role-based access, compliance tools,
//! and advanced analytics for business solutions

#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

use crate::lib::*;

/// Enterprise organization account structure
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct Organization<M: ManagedTypeApi> {
    pub org_id: ManagedBuffer<M>,
    pub org_name: ManagedBuffer<M>,
    pub owner: ManagedAddress<M>,
    pub admins: ManagedVec<M, ManagedAddress<M>>,
    pub members: ManagedVec<M, OrganizationMember<M>>,
    pub created_at: u64,
    pub tier: OrganizationTier,
    pub compliance_level: ComplianceLevel,
    pub is_active: bool,
    pub metadata_uri: ManagedBuffer<M>,
}

/// Organization member with role
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct OrganizationMember<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub role: OrganizationRole,
    pub permissions: ManagedVec<M, Permission>,
    pub joined_at: u64,
    pub last_active: u64,
    pub is_active: bool,
}

/// Organization tiers with different limits
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum OrganizationTier {
    Basic,      // 5 members, 100 tasks/month
    Business,   // 50 members, 1000 tasks/month
    Enterprise, // Unlimited members, unlimited tasks
    Custom,     // Custom limits
}

/// Compliance levels for regulatory requirements
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum ComplianceLevel {
    None,       // No compliance
    Standard,   // Basic KYC
    Enhanced,   // Full KYC/AML
    Institutional, // Enterprise-grade compliance
}

/// Organization roles with hierarchical permissions
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum OrganizationRole {
    Owner,      // Full control
    Admin,      // Manage members, tasks, settings
    Manager,    // Create and manage tasks
    Agent,      // Execute tasks
    Viewer,     // Read-only access
}

/// Granular permissions for fine-grained access control
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum Permission {
    CreateTask,
    ApproveTask,
    ManageMembers,
    ManageSettings,
    ViewAnalytics,
    ExportData,
    ManageApiKeys,
    AuditLogs,
}

/// API key for programmatic access
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct ApiKey<M: ManagedTypeApi> {
    pub key_hash: ManagedBuffer<M>,
    pub org_id: ManagedBuffer<M>,
    pub name: ManagedBuffer<M>,
    pub permissions: ManagedVec<M, Permission>,
    pub rate_limit: u64,
    pub usage_count: u64,
    pub created_at: u64,
    pub expires_at: u64,
    pub is_active: bool,
    pub last_used: u64,
}

/// Compliance audit log entry
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct AuditLogEntry<M: ManagedTypeApi> {
    pub entry_id: u64,
    pub org_id: ManagedBuffer<M>,
    pub user_address: ManagedAddress<M>,
    pub action: AuditAction,
    pub resource: ManagedBuffer<M>,
    pub timestamp: u64,
    pub ip_hash: ManagedBuffer<M>,
    pub metadata: ManagedBuffer<M>,
}

/// Auditable actions for compliance
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum AuditAction {
    UserLogin,
    UserLogout,
    TaskCreated,
    TaskUpdated,
    TaskDeleted,
    MemberAdded,
    MemberRemoved,
    RoleChanged,
    ApiKeyCreated,
    ApiKeyRevoked,
    SettingsModified,
    DataExported,
}

/// Advanced analytics metrics
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct AnalyticsMetrics<M: ManagedTypeApi> {
    pub org_id: ManagedBuffer<M>,
    pub period: AnalyticsPeriod,
    pub total_tasks: u64,
    pub completed_tasks: u64,
    pub total_volume: BigUint<M>,
    pub average_task_value: BigUint<M>,
    pub success_rate: u64, // basis points (10000 = 100%)
    pub agent_performance: ManagedVec<M, AgentPerformance<M>>,
    pub cost_breakdown: CostBreakdown<M>,
    pub risk_metrics: RiskMetrics<M>,
    pub generated_at: u64,
}

/// Analytics period for reporting
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum AnalyticsPeriod {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
}

/// Agent performance metrics
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct AgentPerformance<M: ManagedTypeApi> {
    pub agent_address: ManagedAddress<M>,
    pub tasks_completed: u64,
    pub total_earned: BigUint<M>,
    pub average_rating: u64,
    pub completion_time_avg: u64,
    pub success_rate: u64,
    pub specialization: ManagedBuffer<M>,
}

/// Cost breakdown analysis
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct CostBreakdown<M: ManagedTypeApi> {
    pub protocol_fees: BigUint<M>,
    pub agent_payments: BigUint<M>,
    pub gas_costs: BigUint<M>,
    pub dispute_costs: BigUint<M>,
    pub other_costs: BigUint<M>,
}

/// Risk assessment metrics
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct RiskMetrics<M: ManagedTypeApi> {
    pub dispute_rate: u64,
    pub fraud_score: u64,
    pub compliance_score: u64,
    pub risk_level: RiskLevel,
    pub flagged_transactions: u64,
    pub mitigations_applied: u64,
}

/// Risk assessment levels
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// Webhook configuration for real-time notifications
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct WebhookConfig<M: ManagedTypeApi> {
    pub webhook_id: u64,
    pub org_id: ManagedBuffer<M>,
    pub url: ManagedBuffer<M>,
    pub events: ManagedVec<M, WebhookEvent>,
    pub secret: ManagedBuffer<M>,
    pub is_active: bool,
    pub retry_count: u64,
    pub last_triggered: u64,
    pub success_rate: u64,
}

/// Webhook events that can be subscribed to
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum WebhookEvent {
    TaskCreated,
    TaskAccepted,
    TaskCompleted,
    TaskDisputed,
    TaskApproved,
    MemberJoined,
    MemberLeft,
    ApiKeyUsed,
    ComplianceAlert,
    RiskThreshold,
}

/// GraphQL query interface
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct GraphQLQuery<M: ManagedTypeApi> {
    pub query_id: u64,
    pub org_id: ManagedBuffer<M>,
    pub query: ManagedBuffer<M>,
    pub variables: ManagedBuffer<M>,
    pub created_by: ManagedAddress<M>,
    pub created_at: u64,
    pub execution_count: u64,
    pub avg_execution_time: u64,
    pub is_active: bool,
}

/// Enterprise contract implementation
impl<M: ManagedTypeApi> RouterEscrow for Organization<M> {
    
    // ─────────────────────────────────────────────────────
    // ORGANIZATION MANAGEMENT
    // ─────────────────────────────────────────────────────
    
    /// Create new organization
    #[endpoint(createOrganization)]
    fn create_organization(
        &self,
        org_id: ManagedBuffer<M>,
        org_name: ManagedBuffer<M>,
        tier: OrganizationTier,
        compliance_level: ComplianceLevel,
        metadata_uri: ManagedBuffer<M>,
    ) {
        let caller = self.blockchain().get_caller();
        let payment = self.call_value().egld_or_single_esdt();
        
        // Check tier requirements
        let required_deposit = self.get_tier_deposit(&tier);
        require!(payment.amount >= required_deposit, "Insufficient deposit for tier");
        
        // Create organization
        let org = Organization {
            org_id: org_id.clone(),
            org_name,
            owner: caller,
            admins: ManagedVec::new(),
            members: ManagedVec::new(),
            created_at: self.blockchain().get_block_timestamp(),
            tier,
            compliance_level,
            is_active: true,
            metadata_uri,
        };
        
        // Store organization
        self.organizations(&org_id).set(&org);
        
        // Add owner as admin
        self.add_organization_member(&org_id, caller, OrganizationRole::Owner);
        
        // Emit event
        self.emit_organization_created(caller, org_id, tier);
    }
    
    /// Add member to organization
    #[endpoint(addOrganizationMember)]
    fn add_organization_member(
        &self,
        org_id: ManagedBuffer<M>,
        member_address: ManagedAddress<M>,
        role: OrganizationRole,
    ) {
        self.require_org_admin(&org_id);
        
        let mut org = self.organizations(&org_id).get();
        require!(org.is_active, "Organization not active");
        
        // Check member limits
        require!(self.check_member_limits(&org, role), "Member limit exceeded");
        
        // Create member
        let member = OrganizationMember {
            address: member_address,
            role,
            permissions: self.get_default_permissions(&role),
            joined_at: self.blockchain().get_block_timestamp(),
            last_active: self.blockchain().get_block_timestamp(),
            is_active: true,
        };
        
        // Add to organization
        org.members.push(member);
        self.organizations(&org_id).set(&org);
        
        // Emit event
        self.emit_member_added(org_id, member_address, role);
    }
    
    /// Update member role
    #[endpoint(updateMemberRole)]
    fn update_member_role(
        &self,
        org_id: ManagedBuffer<M>,
        member_address: ManagedAddress<M>,
        new_role: OrganizationRole,
    ) {
        self.require_org_admin(&org_id);
        
        let mut org = self.organizations(&org_id).get();
        
        // Find and update member
        for i in 0..org.members.len() {
            let member = org.members.get(i);
            if member.address == member_address {
                let mut updated_member = member;
                updated_member.role = new_role;
                updated_member.permissions = self.get_default_permissions(&new_role);
                org.members.set(i, updated_member);
                break;
            }
        }
        
        self.organizations(&org_id).set(&org);
        self.emit_member_role_updated(org_id, member_address, new_role);
    }
    
    // ─────────────────────────────────────────────────────
    // API KEY MANAGEMENT
    // ─────────────────────────────────────────────────────
    
    /// Create API key
    #[endpoint(createApiKey)]
    fn create_api_key(
        &self,
        org_id: ManagedBuffer<M>,
        name: ManagedBuffer<M>,
        permissions: ManagedVec<M, Permission>,
        rate_limit: u64,
        expires_in_days: u64,
    ) {
        self.require_org_permission(&org_id, Permission::ManageApiKeys);
        
        let key_hash = self.blockchain().get_current_random_bytes::<32>(0);
        let expires_at = self.blockchain().get_block_timestamp() + (expires_in_days * 86400);
        
        let api_key = ApiKey {
            key_hash: key_hash.into(),
            org_id: org_id.clone(),
            name,
            permissions,
            rate_limit,
            usage_count: 0,
            created_at: self.blockchain().get_block_timestamp(),
            expires_at,
            is_active: true,
            last_used: 0,
        };
        
        self.api_keys(&key_hash.into()).set(&api_key);
        self.emit_api_key_created(org_id, key_hash.into());
    }
    
    /// Revoke API key
    #[endpoint(revokeApiKey)]
    fn revoke_api_key(&self, key_hash: ManagedBuffer<M>) {
        let mut api_key = self.api_keys(&key_hash).get();
        let caller = self.blockchain().get_caller();
        
        // Check permissions
        self.require_org_permission(&api_key.org_id, Permission::ManageApiKeys);
        
        api_key.is_active = false;
        self.api_keys(&key_hash).set(&api_key);
        
        // Log audit
        self.log_audit_action(&api_key.org_id, caller, AuditAction::ApiKeyRevoked, &key_hash);
        self.emit_api_key_revoked(api_key.org_id, key_hash);
    }
    
    // ─────────────────────────────────────────────────────
    // COMPLIANCE & AUDIT
    // ─────────────────────────────────────────────────────
    
    /// Log audit action
    #[endpoint(logAuditAction)]
    fn log_audit_action(
        &self,
        org_id: ManagedBuffer<M>,
        user_address: ManagedAddress<M>,
        action: AuditAction,
        resource: ManagedBuffer<M>,
    ) {
        let entry_id = self.audit_counter().get() + 1;
        let ip_hash = self.blockchain().get_current_random_bytes::<16>(0);
        
        let entry = AuditLogEntry {
            entry_id,
            org_id: org_id.clone(),
            user_address,
            action,
            resource,
            timestamp: self.blockchain().get_block_timestamp(),
            ip_hash: ip_hash.into(),
            metadata: ManagedBuffer::new(),
        };
        
        self.audit_logs(&org_id, entry_id).set(&entry);
        self.audit_counter().set(entry_id);
        self.emit_audit_logged(org_id, entry_id, action);
    }
    
    /// Generate compliance report
    #[endpoint(generateComplianceReport)]
    fn generate_compliance_report(
        &self,
        org_id: ManagedBuffer<M>,
        period: AnalyticsPeriod,
        report_type: ComplianceReportType,
    ) {
        self.require_org_permission(&org_id, Permission::ViewAnalytics);
        
        let report_id = self.report_counter().get() + 1;
        let generated_at = self.blockchain().get_block_timestamp();
        
        // Generate report data based on type
        let report_data = match report_type {
            ComplianceReportType::UserActivity => self.generate_user_activity_report(&org_id, &period),
            ComplianceReportType::TransactionHistory => self.generate_transaction_report(&org_id, &period),
            ComplianceReportType::RiskAssessment => self.generate_risk_assessment_report(&org_id, &period),
            ComplianceReportType::ApiUsage => self.generate_api_usage_report(&org_id, &period),
        };
        
        self.emit_compliance_report_generated(org_id, report_id, report_type, generated_at);
    }
    
    // ─────────────────────────────────────────────────────
    // ADVANCED ANALYTICS
    // ─────────────────────────────────────────────────────
    
    /// Generate analytics metrics
    #[endpoint(generateAnalytics)]
    fn generate_analytics(
        &self,
        org_id: ManagedBuffer<M>,
        period: AnalyticsPeriod,
    ) {
        self.require_org_permission(&org_id, Permission::ViewAnalytics);
        
        let metrics = self.calculate_analytics_metrics(&org_id, &period);
        self.analytics_metrics(&org_id, &period).set(&metrics);
        
        self.emit_analytics_generated(org_id, period);
    }
    
    /// Export organization data
    #[endpoint(exportOrganizationData)]
    fn export_organization_data(
        &self,
        org_id: ManagedBuffer<M>,
        data_type: ExportDataType,
        format: ExportFormat,
    ) {
        self.require_org_permission(&org_id, Permission::ExportData);
        
        let export_id = self.export_counter().get() + 1;
        let export_url = self.generate_export_url(&org_id, data_type, format);
        
        // Log export action
        let caller = self.blockchain().get_caller();
        self.log_audit_action(&org_id, caller, AuditAction::DataExported, &export_id.to_be_bytes().into());
        
        self.emit_data_exported(org_id, export_id, data_type, format, export_url);
    }
    
    // ─────────────────────────────────────────────────────
    // WEBHOOK MANAGEMENT
    // ─────────────────────────────────────────────────────
    
    /// Create webhook
    #[endpoint(createWebhook)]
    fn create_webhook(
        &self,
        org_id: ManagedBuffer<M>,
        url: ManagedBuffer<M>,
        events: ManagedVec<M, WebhookEvent>,
        secret: ManagedBuffer<M>,
    ) {
        self.require_org_permission(&org_id, Permission::ManageSettings);
        
        let webhook_id = self.webhook_counter().get() + 1;
        
        let webhook = WebhookConfig {
            webhook_id,
            org_id: org_id.clone(),
            url,
            events,
            secret,
            is_active: true,
            retry_count: 0,
            last_triggered: 0,
            success_rate: 10000, // 100%
        };
        
        self.webhooks(&org_id, webhook_id).set(&webhook);
        self.emit_webhook_created(org_id, webhook_id);
    }
    
    /// Trigger webhook
    #[endpoint(triggerWebhook)]
    fn trigger_webhook(
        &self,
        org_id: ManagedBuffer<M>,
        webhook_id: u64,
        event_data: ManagedBuffer<M>,
    ) {
        let webhook = self.webhooks(&org_id, webhook_id).get();
        require!(webhook.is_active, "Webhook not active");
        
        // In a real implementation, this would make an HTTP call
        // For now, we just log the trigger
        let mut updated_webhook = webhook;
        updated_webhook.last_triggered = self.blockchain().get_block_timestamp();
        updated_webhook.retry_count += 1;
        
        self.webhooks(&org_id, webhook_id).set(&updated_webhook);
        self.emit_webhook_triggered(org_id, webhook_id, event_data);
    }
    
    // ─────────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────────
    
    fn require_org_admin(&self, org_id: &ManagedBuffer<M>) {
        let caller = self.blockchain().get_caller();
        let org = self.organizations(org_id).get();
        
        require!(org.owner == caller || org.admins.contains(&caller), "Not an organization admin");
    }
    
    fn require_org_permission(&self, org_id: &ManagedBuffer<M>, required_permission: Permission) {
        let caller = self.blockchain().get_caller();
        let org = self.organizations(org_id).get();
        
        // Check owner first
        if org.owner == caller {
            return;
        }
        
        // Check members
        for member in org.members.iter() {
            if member.address == caller && member.permissions.contains(&required_permission) {
                return;
            }
        }
        
        require!(false, "Insufficient permissions");
    }
    
    fn get_tier_deposit(&self, tier: &OrganizationTier) -> BigUint<M> {
        match tier {
            OrganizationTier::Basic => BigUint::from(100u64), // 1 EGLD
            OrganizationTier::Business => BigUint::from(500u64), // 5 EGLD
            OrganizationTier::Enterprise => BigUint::from(2000u64), // 20 EGLD
            OrganizationTier::Custom => BigUint::from(1000u64), // 10 EGLD
        }
    }
    
    fn check_member_limits(&self, org: &Organization<M>, role: OrganizationRole) -> bool {
        let current_count = org.members.len();
        
        match (org.tier, role) {
            (OrganizationTier::Basic, _) => current_count < 5,
            (OrganizationTier::Business, _) => current_count < 50,
            (OrganizationTier::Enterprise, _) => true, // Unlimited
            (OrganizationTier::Custom, _) => current_count < 100, // Custom limit
        }
    }
    
    fn get_default_permissions(&self, role: &OrganizationRole) -> ManagedVec<M, Permission> {
        let mut permissions = ManagedVec::new();
        
        match role {
            OrganizationRole::Owner => {
                permissions.push(Permission::CreateTask);
                permissions.push(Permission::ApproveTask);
                permissions.push(Permission::ManageMembers);
                permissions.push(Permission::ManageSettings);
                permissions.push(Permission::ViewAnalytics);
                permissions.push(Permission::ExportData);
                permissions.push(Permission::ManageApiKeys);
                permissions.push(Permission::AuditLogs);
            },
            OrganizationRole::Admin => {
                permissions.push(Permission::CreateTask);
                permissions.push(Permission::ManageMembers);
                permissions.push(Permission::ViewAnalytics);
                permissions.push(Permission::ExportData);
                permissions.push(Permission::ManageApiKeys);
            },
            OrganizationRole::Manager => {
                permissions.push(Permission::CreateTask);
                permissions.push(Permission::ViewAnalytics);
            },
            OrganizationRole::Agent => {
                // No special permissions
            },
            OrganizationRole::Viewer => {
                permissions.push(Permission::ViewAnalytics);
            },
        }
        
        permissions
    }
    
    fn add_organization_member(&self, org_id: &ManagedBuffer<M>, member_address: ManagedAddress<M>, role: OrganizationRole) {
        let mut org = self.organizations(org_id).get();
        
        let member = OrganizationMember {
            address: member_address,
            role,
            permissions: self.get_default_permissions(&role),
            joined_at: self.blockchain().get_block_timestamp(),
            last_active: self.blockchain().get_block_timestamp(),
            is_active: true,
        };
        
        org.members.push(member);
        self.organizations(org_id).set(&org);
    }
    
    fn calculate_analytics_metrics(&self, org_id: &ManagedBuffer<M>, period: &AnalyticsPeriod) -> AnalyticsMetrics<M> {
        // Mock implementation - in production would calculate real metrics
        AnalyticsMetrics {
            org_id: org_id.clone(),
            period: period.clone(),
            total_tasks: 100,
            completed_tasks: 85,
            total_volume: BigUint::from(1000000u64),
            average_task_value: BigUint::from(10000u64),
            success_rate: 8500, // 85%
            agent_performance: ManagedVec::new(),
            cost_breakdown: CostBreakdown {
                protocol_fees: BigUint::from(30000u64),
                agent_payments: BigUint::from(850000u64),
                gas_costs: BigUint::from(50000u64),
                dispute_costs: BigUint::from(20000u64),
                other_costs: BigUint::from(50000u64),
            },
            risk_metrics: RiskMetrics {
                dispute_rate: 500, // 5%
                fraud_score: 100, // Low risk
                compliance_score: 9500, // 95%
                risk_level: RiskLevel::Low,
                flagged_transactions: 2,
                mitigations_applied: 5,
            },
            generated_at: self.blockchain().get_block_timestamp(),
        }
    }
    
    fn generate_export_url(&self, org_id: &ManagedBuffer<M>, data_type: ExportDataType, format: ExportFormat) -> ManagedBuffer<M> {
        // Generate a unique export URL
        let export_id = self.blockchain().get_current_random_bytes::<16>(0);
        ManagedBuffer::from(&format!("https://api.escrow.router/exports/{:?}", export_id)[..])
    }
    
    // ─────────────────────────────────────────────────────
    // NEW EVENTS - v0.4.0
    // ─────────────────────────────────────────────────────
    
    #[event("organization_created")]
    fn emit_organization_created(
        &self,
        #[indexed] owner: &ManagedAddress,
        #[indexed] org_id: &ManagedBuffer,
        tier: OrganizationTier,
    );
    
    #[event("member_added")]
    fn emit_member_added(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] member_address: &ManagedAddress,
        role: OrganizationRole,
    );
    
    #[event("member_role_updated")]
    fn emit_member_role_updated(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] member_address: &ManagedAddress,
        new_role: OrganizationRole,
    );
    
    #[event("api_key_created")]
    fn emit_api_key_created(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] key_hash: &ManagedBuffer,
    );
    
    #[event("api_key_revoked")]
    fn emit_api_key_revoked(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] key_hash: &ManagedBuffer,
    );
    
    #[event("audit_logged")]
    fn emit_audit_logged(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] entry_id: u64,
        action: AuditAction,
    );
    
    #[event("compliance_report_generated")]
    fn emit_compliance_report_generated(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] report_id: u64,
        report_type: ComplianceReportType,
        generated_at: u64,
    );
    
    #[event("analytics_generated")]
    fn emit_analytics_generated(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        period: AnalyticsPeriod,
    );
    
    #[event("data_exported")]
    fn emit_data_exported(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] export_id: u64,
        data_type: ExportDataType,
        format: ExportFormat,
        export_url: &ManagedBuffer,
    );
    
    #[event("webhook_created")]
    fn emit_webhook_created(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] webhook_id: u64,
    );
    
    #[event("webhook_triggered")]
    fn emit_webhook_triggered(
        &self,
        #[indexed] org_id: &ManagedBuffer,
        #[indexed] webhook_id: u64,
        event_data: &ManagedBuffer,
    );
    
    // ─────────────────────────────────────────────────────
    // NEW STORAGE MAPPERS - v0.4.0
    // ─────────────────────────────────────────────────────
    
    #[storage_mapper("organizations")]
    fn organizations(&self, org_id: &ManagedBuffer<M>) -> SingleValueMapper<Organization<M>>;
    
    #[storage_mapper("api_keys")]
    fn api_keys(&self, key_hash: &ManagedBuffer<M>) -> SingleValueMapper<ApiKey<M>>;
    
    #[storage_mapper("audit_logs")]
    fn audit_logs(&self, org_id: &ManagedBuffer<M>, entry_id: u64) -> SingleValueMapper<AuditLogEntry<M>>;
    
    #[storage_mapper("analytics_metrics")]
    fn analytics_metrics(&self, org_id: &ManagedBuffer<M>, period: &AnalyticsPeriod) -> SingleValueMapper<AnalyticsMetrics<M>>;
    
    #[storage_mapper("webhooks")]
    fn webhooks(&self, org_id: &ManagedBuffer<M>, webhook_id: u64) -> SingleValueMapper<WebhookConfig<M>>;
    
    #[storage_mapper("audit_counter")]
    fn audit_counter(&self) -> SingleValueMapper<u64>;
    
    #[storage_mapper("report_counter")]
    fn report_counter(&self) -> SingleValueMapper<u64>;
    
    #[storage_mapper("export_counter")]
    fn export_counter(&self) -> SingleValueMapper<u64>;
    
    #[storage_mapper("webhook_counter")]
    fn webhook_counter(&self) -> SingleValueMapper<u64>;
}

// Additional types for enterprise features
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum ComplianceReportType {
    UserActivity,
    TransactionHistory,
    RiskAssessment,
    ApiUsage,
}

#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum ExportDataType {
    Tasks,
    Members,
    Analytics,
    AuditLogs,
    ComplianceReports,
}

#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum ExportFormat {
    Json,
    Csv,
    Xml,
    Pdf,
}
