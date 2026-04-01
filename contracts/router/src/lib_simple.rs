#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

// Core types
#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum TaskState {
    Open,
    Accepted,
    Submitted,
    Approved,
    Cancelled,
    Disputed,
    Resolved,
    Refunded,
}

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum VerificationStatus {
    Unverified,
    Pending,
    Verified,
    Suspended,
}

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum DisputeResolution {
    FullRefund,
    PartialRefund { agent_award_bps: u16 },
    FullPayment,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct Task<M: ManagedTypeApi> {
    pub task_id: u64,
    pub creator: ManagedAddress<M>,
    pub assigned_agent: Option<ManagedAddress<M>>,
    pub payment_token: EgldOrEsdtTokenIdentifier<M>,
    pub payment_amount: BigUint<M>,
    pub payment_nonce: u64,
    pub protocol_fee_bps: u16,
    pub created_at: u64,
    pub accepted_at: Option<u64>,
    pub deadline: Option<u64>,
    pub review_timeout: Option<u64>,
    pub metadata_uri: ManagedBuffer<M>,
    pub result_uri: Option<ManagedBuffer<M>>,
    pub state: TaskState,
    pub dispute_metadata: Option<ManagedBuffer<M>>,
    pub ap2_mandate_hash: Option<ManagedBuffer<M>>,
    pub x402_settlement_ref: Option<ManagedBuffer<M>>,
    pub agent_reputation_snapshot: Option<u32>,
    pub priority_fee: Option<BigUint<M>>,
    pub gas_used: Option<u64>,
    pub completion_time: Option<u64>,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct AgentReputation<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub total_tasks: u64,
    pub completed_tasks: u64,
    pub cancelled_tasks: u64,
    pub disputed_tasks: u64,
    pub total_earned: BigUint<M>,
    pub reputation_score: u32,
    pub average_rating: u8,
    pub last_active: u64,
    pub created_at: u64,
    pub specialization: ManagedVec<M, ManagedBuffer<M>>,
    pub verification_status: VerificationStatus,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct Config<M: ManagedTypeApi> {
    pub owner: ManagedAddress<M>,
    pub treasury: ManagedAddress<M>,
    pub fee_bps: u16,
    pub resolver: Option<ManagedAddress<M>>,
    pub paused: bool,
    pub min_reputation: u32,
    pub max_task_value: Option<BigUint<M>>,
    pub reputation_decay_rate: u16,
    pub emergency_pause: bool,
    pub upgrade_proposal_threshold: u16,
    pub max_concurrent_tasks: u32,
}

// Storage
#[multiversx_sc::module]
pub trait StorageModule<M: ManagedTypeApi> {
    #[view(getTaskCount)]
    #[storage_mapper("task_count")]
    fn task_count(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("tasks")]
    fn tasks(&self, task_id: u64) -> SingleValueMapper<Task<M>>;

    #[storage_mapper("config")]
    fn config(&self) -> SingleValueMapper<Config<M>>;

    #[storage_mapper("agent_reputation")]
    fn agent_reputation(&self, agent: &ManagedAddress<M>) -> SingleValueMapper<AgentReputation<M>>;

    #[storage_mapper("agent_active_tasks")]
    fn agent_active_tasks(&self, agent: &ManagedAddress<M>) -> SingleValueMapper<u32>;
}

// Events
#[multiversx_sc::module]
pub trait EventsModule<M: ManagedTypeApi> {
    #[event("taskCreated")]
    fn task_created_event(
        &self,
        #[indexed] task_id: u64,
        #[indexed] creator: &ManagedAddress<M>,
        #[indexed] payment_token: &EgldOrEsdtTokenIdentifier<M>,
        payment_amount: &BigUint<M>,
        metadata_uri: &ManagedBuffer<M>,
    );

    #[event("taskAccepted")]
    fn task_accepted_event(
        &self,
        #[indexed] task_id: u64,
        #[indexed] agent: &ManagedAddress<M>,
        result_uri: &ManagedBuffer<M>,
    );

    #[event("taskApproved")]
    fn task_approved_event(
        &self,
        #[indexed] task_id: u64,
        #[indexed] payment_token: &EgldOrEsdtTokenIdentifier<M>,
        agent_payment: &BigUint<M>,
    );
}

// Core contract
#[multiversx_sc::contract]
pub trait RouterEscrow: StorageModule<M> + EventsModule<M>
where M: ManagedTypeApi
{
    #[init]
    fn init(
        &self,
        owner: ManagedAddress,
        treasury: ManagedAddress,
        fee_bps: u16,
        min_reputation: u32,
        max_concurrent_tasks: u32,
    ) {
        require!(fee_bps <= 1000, "Fee cannot exceed 1000 bps (10%)");
        require!(min_reputation <= 1000, "Min reputation cannot exceed 1000");
        require!(max_concurrent_tasks <= 100, "Max concurrent tasks cannot exceed 100");
        
        let config = Config {
            owner: owner.clone(),
            treasury,
            fee_bps,
            resolver: None,
            paused: false,
            min_reputation,
            max_task_value: None,
            reputation_decay_rate: 100, // 1% per month
            emergency_pause: false,
            upgrade_proposal_threshold: 6600, // 66%
            max_concurrent_tasks,
        };
        
        self.config().set(&config);
    }

    #[payable("*")]
    #[endpoint(createTask)]
    fn create_task(
        &self,
        metadata_uri: ManagedBuffer,
        deadline: OptionalValue<u64>,
        review_timeout: OptionalValue<u64>,
        ap2_mandate_hash: OptionalValue<ManagedBuffer>,
        priority_fee: OptionalValue<BigUint<M>>,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let payment = self.call_value().payment_token_amount();
        let token = self.call_value().payment_token();
        let nonce = self.call_value().esdt_token_nonce();
        
        require!(payment > 0, "Payment must be greater than 0");
        
        let config = self.config().get();
        if let Some(max_value) = &config.max_task_value {
            require!(&payment <= max_value, "Task value exceeds maximum");
        }
        
        let task_id = self.task_count().get();
        self.task_count().set(task_id + 1);
        
        let task = Task {
            task_id,
            creator: caller.clone(),
            assigned_agent: None,
            payment_token: token,
            payment_amount: payment.clone(),
            payment_nonce: nonce,
            protocol_fee_bps: config.fee_bps,
            created_at: self.blockchain().get_block_timestamp(),
            accepted_at: None,
            deadline: deadline.into_option(),
            review_timeout: review_timeout.into_option(),
            metadata_uri,
            result_uri: None,
            state: TaskState::Open,
            dispute_metadata: None,
            ap2_mandate_hash: ap2_mandate_hash.into_option(),
            x402_settlement_ref: None,
            agent_reputation_snapshot: None,
            priority_fee: priority_fee.into_option(),
            gas_used: None,
            completion_time: None,
        };
        
        self.tasks(task_id).set(&task);
        
        self.task_created_event(
            task_id,
            &caller,
            &task.payment_token,
            &payment,
            &task.metadata_uri,
        );
    }

    #[endpoint(acceptTask)]
    fn accept_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Open, "Task is not open");
        require!(task.assigned_agent.is_none(), "Task already assigned");
        
        let config = self.config().get();
        let reputation = self.agent_reputation(&caller).get();
        
        require!(
            reputation.reputation_score >= config.min_reputation,
            "Insufficient reputation score"
        );
        
        let current_active = self.agent_active_tasks(&caller).get();
        require!(
            current_active < config.max_concurrent_tasks,
            "Too many active tasks"
        );
        
        task.assigned_agent = Some(caller.clone());
        task.state = TaskState::Accepted;
        task.accepted_at = Some(self.blockchain().get_block_timestamp());
        task.agent_reputation_snapshot = Some(reputation.reputation_score);
        
        self.tasks(task_id).set(&task);
        self.agent_active_tasks(&caller).set(current_active + 1);
        
        self.task_accepted_event(task_id, &caller, &task.metadata_uri);
    }

    #[endpoint(submitResult)]
    fn submit_result(&self, task_id: u64, result_uri: ManagedBuffer) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Accepted, "Task is not accepted");
        require!(
            task.assigned_agent.as_ref().map_or(false, |agent| agent == &caller),
            "Not the assigned agent"
        );
        
        task.state = TaskState::Submitted;
        task.result_uri = Some(result_uri.clone());
        
        self.tasks(task_id).set(&task);
        
        self.task_accepted_event(task_id, &caller, &result_uri);
    }

    #[endpoint(approveTask)]
    fn approve_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Submitted, "Task is not submitted");
        require!(task.creator == caller, "Only creator can approve");
        
        let protocol_fee = &task.payment_amount * task.protocol_fee_bps / 10000;
        let agent_payment = &task.payment_amount - &protocol_fee;
        
        // Send protocol fee to treasury
        let config = self.config().get();
        self.send().direct(
            &config.treasury,
            &task.payment_token,
            task.payment_nonce,
            &protocol_fee,
        );
        
        // Transfer payment to agent
        if let Some(agent) = &task.assigned_agent {
            self.send().direct(
                agent,
                &task.payment_token,
                task.payment_nonce,
                &agent_payment,
            );
            
            // Update agent reputation
            let mut reputation = self.agent_reputation(agent).get();
            reputation.completed_tasks += 1;
            reputation.total_tasks += 1;
            reputation.total_earned += &agent_payment;
            reputation.last_active = self.blockchain().get_block_timestamp();
            self.agent_reputation(agent).set(&reputation);
            
            // Decrement active tasks
            let current_active = self.agent_active_tasks(agent).get();
            self.agent_active_tasks(agent).set(current_active - 1);
        }
        
        task.state = TaskState::Approved;
        self.tasks(task_id).set(&task);
        
        self.task_approved_event(task_id, &task.payment_token, &agent_payment);
    }

    #[endpoint(cancelTask)]
    fn cancel_task(&self, task_id: u64) {
        self.require_not_paused();
        
        let mut task = self.tasks(task_id).get();
        let caller = self.blockchain().get_caller();
        
        require!(task.state == TaskState::Open, "Only open tasks can be cancelled");
        require!(task.creator == caller, "Only creator can cancel task");
        
        // Refund full payment to creator
        self.send().direct(
            &task.creator,
            &task.payment_token,
            task.payment_nonce,
            &task.payment_amount,
        );
        
        task.state = TaskState::Cancelled;
        self.tasks(task_id).set(&task);
    }

    #[endpoint(getTask)]
    fn get_task(&self, task_id: u64) -> Task<M> {
        self.tasks(task_id).get()
    }

    #[endpoint(getAgentReputation)]
    fn get_agent_reputation(&self, agent: ManagedAddress) -> AgentReputation<M> {
        self.agent_reputation(&agent).get()
    }

    fn require_not_paused(&self) {
        let config = self.config().get();
        require!(!config.paused && !config.emergency_pause, "Contract is paused");
    }
}
