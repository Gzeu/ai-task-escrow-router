//! Ecosystem Integration - v0.3.0
//! 
//! Implementation of UCP, ACP, AP2, MCP, and x402 integration
//! for AI Task Escrow Router on MultiversX

#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

use crate::lib::*;

/// Universal Agent Commerce Protocol integration
/// For agent service registration and capability discovery
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct UcpAgentRegistration<M: ManagedTypeApi> {
    pub agent_address: ManagedAddress<M>,
    pub agent_name: ManagedBuffer<M>,
    pub capabilities: ManagedVec<M, ManagedBuffer<M>>,
    pub endpoint_url: ManagedBuffer<M>,
    pub metadata_uri: ManagedBuffer<M>,
    pub verification_hash: ManagedBuffer<M>,
    pub registration_timestamp: u64,
}

/// Agent capability for UCP discovery
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct AgentCapability<M: ManagedTypeApi> {
    pub capability_id: ManagedBuffer<M>,
    pub capability_name: ManagedBuffer<M>,
    pub description: ManagedBuffer<M>,
    pub required_reputation: u64,
    pub verification_required: bool,
}

/// ACP integration for programmatic checkout
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct AcpMerchantFlow<M: ManagedTypeApi> {
    pub merchant_address: ManagedAddress<M>,
    pub flow_template: ManagedBuffer<M>,
    pub task_requirements: ManagedVec<M, ManagedBuffer<M>>,
    pub auto_approval_threshold: u64,
    pub payment_settings: AcpPaymentSettings,
}

#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct AcpPaymentSettings<M: ManagedTypeApi> {
    pub accepted_tokens: ManagedVec<M, EgldOrEsdtTokenIdentifier<M>>,
    pub auto_convert_rates: ManagedVec<M, (u64, u64)>, // (token_id, rate, denominator)
    pub settlement_delay: u64,
}

/// AP2 integration for delegated intent
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct Ap2Mandate<M: ManagedTypeApi> {
    pub mandate_hash: ManagedBuffer<M>,
    pub delegator: ManagedAddress<M>,
    pub delegatee: ManagedAddress<M>,
    pub expiration: u64,
    pub max_amount: BigUint<M>,
    pub usage_count: u64,
    pub is_revoked: bool,
}

/// MCP integration for tool access
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct McpToolRegistration<M: ManagedTypeApi> {
    pub tool_name: ManagedBuffer<M>,
    pub tool_endpoint: ManagedBuffer<M>,
    pub description: ManagedBuffer<M>,
    pub required_capabilities: ManagedVec<M, ManagedBuffer<M>>,
    pub rate_limit: u64,
    pub authentication_required: bool,
}

/// x402 integration for HTTP settlement
#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub struct X402Settlement<M: ManagedTypeApi> {
    pub settlement_ref: ManagedBuffer<M>,
    pub payment_amount: BigUint<M>,
    pub currency: EgldOrEsdtTokenIdentifier<M>,
    pub merchant_data: ManagedBuffer<M>,
    pub status: X402Status,
    pub completion_timestamp: u64,
}

#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Clone, Debug)]
pub enum X402Status {
    Pending,
    Completed,
    Failed,
    Refunded,
}

/// Enhanced contract with ecosystem integration
impl<M: ManagedTypeApi> RouterEscrow for EnhancedTaskData<M> {
    
    // ─────────────────────────────────────────────────────
    // UCP INTEGRATION ENDPOINTS
    // ─────────────────────────────────────────────────────
    
    /// Register agent with UCP protocol
    #[endpoint(registerUcpAgent)]
    fn register_ucp_agent(
        &self,
        agent_name: ManagedBuffer,
        capabilities: ManagedVec<M, ManagedBuffer<M>>,
        endpoint_url: ManagedBuffer,
        metadata_uri: ManagedBuffer,
        verification_hash: ManagedBuffer,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        
        // Create UCP registration
        let registration = UcpAgentRegistration {
            agent_address: caller,
            agent_name,
            capabilities,
            endpoint_url,
            metadata_uri,
            verification_hash,
            registration_timestamp: self.blockchain().get_block_timestamp(),
        };
        
        // Store in UCP registry
        self.ucp_registrations(caller).set(&registration);
        
        // Emit registration event
        self.emit_ucp_agent_registered(caller, agent_name, capabilities);
    }
    
    /// Update agent capabilities
    #[endpoint(updateAgentCapabilities)]
    fn update_agent_capabilities(
        &self,
        new_capabilities: ManagedVec<M, ManagedBuffer<M>>,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let mut registration = self.ucp_registrations(caller).get();
        registration.capabilities = new_capabilities;
        self.ucp_registrations(caller).set(&registration);
        
        self.emit_agent_capabilities_updated(caller, new_capabilities);
    }
    
    /// Get agent registration
    #[view(getUcpAgentRegistration)]
    fn get_ucp_agent_registration(
        &self,
        agent_address: ManagedAddress<M>,
    ) -> UcpAgentRegistration<M> {
        self.ucp_registrations(agent_address).get()
    }
    
    /// Search agents by capability
    #[view(searchAgentsByCapability)]
    fn search_agents_by_capability(
        &self,
        capability: ManagedBuffer<M>,
        min_reputation: u64,
    ) -> ManagedVec<M, UcpAgentRegistration<M>> {
        // Implementation would scan all registrations and filter
        // For now, return empty
        ManagedVec::new()
    }
    
    // ─────────────────────────────────────────────────────
    // ACP INTEGRATION ENDPOINTS
    // ─────────────────────────────────────────────────────
    
    /// Register merchant flow with ACP
    #[endpoint(registerAcpMerchant)]
    fn register_acp_merchant(
        &self,
        flow_template: ManagedBuffer,
        task_requirements: ManagedVec<M, ManagedBuffer<M>>,
        auto_approval_threshold: u64,
        payment_settings: AcpPaymentSettings,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        
        let merchant_flow = AcpMerchantFlow {
            merchant_address: caller,
            flow_template,
            task_requirements,
            auto_approval_threshold,
            payment_settings,
        };
        
        self.acp_merchant_flows(caller).set(&merchant_flow);
        
        self.emit_acp_merchant_registered(caller, flow_template);
    }
    
    /// Execute ACP checkout flow
    #[endpoint(executeAcpCheckout)]
    fn execute_acp_checkout(
        &self,
        merchant_address: ManagedAddress<M>,
        task_data: ManagedBuffer<M>,
        payment_amount: BigUint<M>,
        currency: EgldOrEsdtTokenIdentifier<M>,
    ) {
        self.require_not_paused();
        
        // Validate merchant flow exists
        let merchant_flow = self.acp_merchant_flows(merchant_address).get();
        require!(!merchant_flow.merchant_address.is_zero(), "merchant not registered");
        
        // Create task with ACP metadata
        let task_id = self.create_task_internal(
            task_data,
            Some(merchant_address),
            Some(payment_amount),
            Some(currency),
        );
        
        // Store ACP transaction reference
        let settlement_ref = self.blockchain().get_block_nonce().to_string();
        let x402_settlement = X402Settlement {
            settlement_ref: ManagedBuffer::from(settlement_ref.as_str()),
            payment_amount,
            currency,
            merchant_data: ManagedBuffer::new(),
            status: X402Status::Pending,
            completion_timestamp: self.blockchain().get_block_timestamp(),
        };
        
        self.x402_settlements(settlement_ref).set(&x402_settlement);
        
        self.emit_acp_checkout_executed(merchant_address, task_id, settlement_ref);
    }
    
    // ─────────────────────────────────────────────────────
    // AP2 INTEGRATION ENDPOINTS
    // ─────────────────────────────────────────────────────
    
    /// Create mandate for delegated spending
    #[endpoint(createAp2Mandate)]
    fn create_ap2_mandate(
        &self,
        delegatee: ManagedAddress<M>,
        max_amount: BigUint<M>,
        expiration_hours: u64,
        description: ManagedBuffer<M>,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let expiration = self.blockchain().get_block_timestamp() + (expiration_hours * 3600);
        
        let mandate = Ap2Mandate {
            mandate_hash: self.blockchain().get_current_random_bytes::<32>(0).into(),
            delegator: caller,
            delegatee,
            expiration,
            max_amount,
            usage_count: 0,
            is_revoked: false,
        };
        
        self.ap2_mandates(mandate.mandate_hash).set(&mandate);
        
        self.emit_ap2_mandate_created(mandate.mandate_hash, caller, delegatee, max_amount);
    }
    
    /// Use mandate to create task
    #[endpoint(useAp2Mandate)]
    fn use_ap2_mandate(
        &self,
        mandate_hash: ManagedBuffer<M>,
        task_data: ManagedBuffer<M>,
        payment_amount: BigUint<M>,
        currency: EgldOrEsdtTokenIdentifier<M>,
    ) {
        self.require_not_paused();
        
        let mandate = self.ap2_mandates(mandate_hash).get();
        require!(!mandate.is_revoked, "mandate is revoked");
        require!(self.blockchain().get_block_timestamp() < mandate.expiration, "mandate expired");
        require!(payment_amount <= mandate.max_amount, "amount exceeds mandate limit");
        
        // Check if caller is the delegatee
        let caller = self.blockchain().get_caller();
        require!(caller == mandate.delegatee, "not authorized by mandate");
        
        // Increment usage count
        let mut updated_mandate = mandate;
        updated_mandate.usage_count += 1;
        self.ap2_mandates(mandate_hash).set(&updated_mandate);
        
        // Create task with mandate reference
        let task_id = self.create_task_internal(
            task_data,
            Some(mandate.delegator),
            Some(payment_amount),
            Some(currency),
        );
        
        self.emit_ap2_mandate_used(mandate_hash, caller, task_id);
    }
    
    /// Revoke mandate
    #[endpoint(revokeAp2Mandate)]
    fn revoke_ap2_mandate(
        &self,
        mandate_hash: ManagedBuffer<M>,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let mut mandate = self.ap2_mandates(mandate_hash).get();
        
        // Only delegator or delegatee can revoke
        require!(
            caller == mandate.delegator || caller == mandate.delegatee,
            "only delegator or delegatee can revoke"
        );
        
        mandate.is_revoked = true;
        self.ap2_mandates(mandate_hash).set(&mandate);
        
        self.emit_ap2_mandate_revoked(mandate_hash, caller);
    }
    
    // ─────────────────────────────────────────────────────
    // MCP INTEGRATION ENDPOINTS
    // ─────────────────────────────────────────────────────
    
    /// Register MCP tool
    #[endpoint(registerMcpTool)]
    fn register_mcp_tool(
        &self,
        tool_name: ManagedBuffer<M>,
        tool_endpoint: ManagedBuffer<M>,
        description: ManagedBuffer<M>,
        required_capabilities: ManagedVec<M, ManagedBuffer<M>>,
        rate_limit: u64,
        authentication_required: bool,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        
        let tool = McpToolRegistration {
            tool_name,
            tool_endpoint,
            description,
            required_capabilities,
            rate_limit,
            authentication_required,
        };
        
        self.mcp_tools(caller).set(&tool);
        
        self.emit_mcp_tool_registered(caller, tool_name);
    }
    
    /// Execute MCP tool action
    #[endpoint(executeMcpAction)]
    fn execute_mcp_action(
        &self,
        tool_name: ManagedBuffer<M>,
        action_data: ManagedBuffer<M>,
        authentication_token: Option<ManagedBuffer<M>>,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let tool = self.mcp_tools(tool_name).get();
        
        // Check authentication if required
        if tool.authentication_required {
            require!(authentication_token.is_some(), "authentication required");
            // Verify token (simplified - in production would use proper verification)
        }
        
        // Check rate limit
        let caller_usage = self.mcp_usage_counters(caller).get();
        require!(
            caller_usage < tool.rate_limit,
            "rate limit exceeded"
        );
        
        // Increment usage
        self.mcp_usage_counters(caller).set(caller_usage + 1);
        
        self.emit_mcp_action_executed(caller, tool_name, action_data);
    }
    
    // ─────────────────────────────────────────────────────
    // x402 INTEGRATION ENDPOINTS
    // ─────────────────────────────────────────────────────
    
    /// Create x402 settlement reference
    #[endpoint(createX402Settlement)]
    fn create_x402_settlement(
        &self,
        payment_amount: BigUint<M>,
        currency: EgldOrEsdtTokenIdentifier<M>,
        merchant_data: ManagedBuffer<M>,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let settlement_ref = self.blockchain().get_block_nonce().to_string();
        
        let settlement = X402Settlement {
            settlement_ref: ManagedBuffer::from(settlement_ref.as_str()),
            payment_amount,
            currency,
            merchant_data,
            status: X402Status::Pending,
            completion_timestamp: self.blockchain().get_block_timestamp(),
        };
        
        self.x402_settlements(settlement_ref).set(&settlement);
        
        self.emit_x402_settlement_created(settlement_ref, payment_amount, currency);
    }
    
    /// Complete x402 settlement
    #[endpoint(completeX402Settlement)]
    fn complete_x402_settlement(
        &self,
        settlement_ref: ManagedBuffer<M>,
        success: bool,
    ) {
        self.require_not_paused();
        
        let mut settlement = self.x402_settlements(settlement_ref).get();
        settlement.status = if success {
            X402Status::Completed
        } else {
            X402Status::Failed
        };
        settlement.completion_timestamp = self.blockchain().get_block_timestamp();
        
        self.x402_settlements(settlement_ref).set(&settlement);
        
        self.emit_x402_settlement_completed(settlement_ref, success);
    }
    
    // ─────────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────────
    
    fn create_task_internal(
        &self,
        task_data: ManagedBuffer<M>,
        creator: Option<ManagedAddress<M>>,
        payment_amount: Option<BigUint<M>>,
        currency: Option<EgldOrEsdtTokenIdentifier<M>>,
    ) -> u64 {
        let caller = self.blockchain().get_caller();
        let payment = self.call_value().egld_or_single_esdt();
        
        let task_id = self.task_count().get() + 1;
        let now = self.blockchain().get_block_timestamp();
        
        let task = EnhancedTaskData {
            task_id,
            creator: creator.unwrap_or_else(|| caller),
            assigned_agent: None,
            payment_token: currency.unwrap_or_else(|| payment.token_identifier),
            payment_amount: payment_amount.unwrap_or_else(|| payment.amount),
            fee_bps_snapshot: self.config().get().fee_bps,
            created_at: now,
            accepted_at: None,
            deadline: None,
            review_timeout: None,
            metadata_uri: task_data,
            result_uri: None,
            state: TaskState::Open,
            dispute_metadata_uri: None,
            ap2_mandate_hash: None,
            x402_payment_ref: None,
            gas_used: None,
            completion_time: None,
            priority_fee: None,
            agent_reputation_snapshot: None,
            payment_nonce: None,
        };
        
        self.tasks(task_id).set(&task);
        self.task_count().set(task_id);
        
        task_id
    }
    
    // ─────────────────────────────────────────────────────
    // NEW EVENTS - v0.3.0
    // ─────────────────────────────────────────────────────
    
    #[event("ucp_agent_registered")]
    fn emit_ucp_agent_registered(
        &self,
        #[indexed] agent: &ManagedAddress,
        agent_name: &ManagedBuffer,
        capabilities: ManagedVec<M, ManagedBuffer<M>>,
    );
    
    #[event("agent_capabilities_updated")]
    fn emit_agent_capabilities_updated(
        &self,
        #[indexed] agent: &ManagedAddress,
        new_capabilities: ManagedVec<M, ManagedBuffer<M>>,
    );
    
    #[event("acp_merchant_registered")]
    fn emit_acp_merchant_registered(
        &self,
        #[indexed] merchant: &ManagedAddress,
        flow_template: &ManagedBuffer,
    );
    
    #[event("acp_checkout_executed")]
    fn emit_acp_checkout_executed(
        &self,
        #[indexed] merchant: &ManagedAddress,
        task_id: u64,
        settlement_ref: &ManagedBuffer,
    );
    
    #[event("ap2_mandate_created")]
    fn emit_ap2_mandate_created(
        &self,
        #[indexed] mandate_hash: &ManagedBuffer,
        #[indexed] delegator: &ManagedAddress,
        #[indexed] delegatee: &ManagedAddress,
        max_amount: &BigUint,
    );
    
    #[event("ap2_mandate_used")]
    fn emit_ap2_mandate_used(
        &self,
        #[indexed] mandate_hash: &ManagedBuffer,
        #[indexed] user: &ManagedAddress,
        task_id: u64,
    );
    
    #[event("ap2_mandate_revoked")]
    fn emit_ap2_mandate_revoked(
        &self,
        #[indexed] mandate_hash: &ManagedBuffer,
        #[indexed] revoker: &ManagedAddress,
    );
    
    #[event("mcp_tool_registered")]
    fn emit_mcp_tool_registered(
        &self,
        #[indexed] agent: &ManagedAddress,
        tool_name: &ManagedBuffer,
    );
    
    #[event("mcp_action_executed")]
    fn emit_mcp_action_executed(
        &self,
        #[indexed] agent: &ManagedAddress,
        tool_name: &ManagedBuffer,
        action_data: &ManagedBuffer,
    );
    
    #[event("x402_settlement_created")]
    fn emit_x402_settlement_created(
        &self,
        #[indexed] settlement_ref: &ManagedBuffer,
        payment_amount: &BigUint,
        currency: &EgldOrEsdtTokenIdentifier<M>,
    );
    
    #[event("x402_settlement_completed")]
    fn emit_x402_settlement_completed(
        &self,
        #[indexed] settlement_ref: &ManagedBuffer,
        success: bool,
    );
    
    // ─────────────────────────────────────────────────────
    // NEW STORAGE MAPPERS - v0.3.0
    // ─────────────────────────────────────────────────────
    
    #[storage_mapper("ucp_registrations")]
    fn ucp_registrations(&self, agent: &ManagedAddress<M>) -> SingleValueMapper<UcpAgentRegistration<M>>;
    
    #[storage_mapper("acp_merchant_flows")]
    fn acp_merchant_flows(&self, merchant: &ManagedAddress<M>) -> SingleValueMapper<AcpMerchantFlow<M>>;
    
    #[storage_mapper("ap2_mandates")]
    fn ap2_mandates(&self, mandate_hash: &ManagedBuffer<M>) -> SingleValueMapper<Ap2Mandate<M>>;
    
    #[storage_mapper("mcp_tools")]
    fn mcp_tools(&self, tool_name: &ManagedBuffer<M>) -> SingleValueMapper<McpToolRegistration<M>>;
    
    #[storage_mapper("mcp_usage_counters")]
    fn mcp_usage_counters(&self, agent: &ManagedAddress<M>) -> SingleValueMapper<u64>;
    
    #[storage_mapper("x402_settlements")]
    fn x402_settlements(&self, settlement_ref: &ManagedBuffer<M>) -> SingleValueMapper<X402Settlement<M>>;
}
