#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

pub trait MultiTokenEndpoints<M: ManagedTypeApi> {
    #[endpoint(acceptAnyToken)]
    #[payable("*")]
    fn accept_any_token(
        &self,
        #[payment_amount] payment_amount: BigUint<M>,
        #[payment_token] payment_token: EgldOrEsdtTokenIdentifier<M>,
        #[payment_nonce] payment_nonce: u64,
    );

    #[endpoint(getTokenInfo)]
    fn get_token_info(&self, token_identifier: EgldOrEsdtTokenIdentifier<M>) -> ManagedVec<M, ManagedBuffer<M>>;

    #[endpoint(validateToken)]
    fn validate_token(&self, token_identifier: EgldOrEsdtTokenIdentifier<M>) -> bool;

    #[endpoint(getSupportedTokens)]
    fn get_supported_tokens(&self) -> ManagedVec<M, EgldOrEsdtTokenIdentifier<M>>;
}

impl<M: ManagedTypeApi> MultiTokenEndpoints<M> for RouterEscrow<M> {
    #[payable("*")]
    #[endpoint(acceptAnyToken)]
    fn accept_any_token(
        &self,
        #[payment_amount] payment_amount: BigUint<M>,
        #[payment_token] payment_token: EgldOrEsdtTokenIdentifier<M>,
        #[payment_nonce] payment_nonce: u64,
    ) {
        require!(payment_amount > 0, "Payment must be greater than 0");
        
        // ESDT Multi-Token Support: Accept any ESDT token + EGLD
        let is_valid_token = match &payment_token {
            EgldOrEsdtTokenIdentifier::Egld => true,
            EgldOrEsdtTokenIdentifier::Esdt(esdt_id) => {
                // Accept any valid ESDT token identifier
                !esdt_id.is_empty()
            }
        };
        
        require!(is_valid_token, "Invalid token identifier");
        
        let caller = self.blockchain().get_caller();
        
        // Emit event for token acceptance
        token_accepted_event(self, &caller, &payment_token, &payment_amount, payment_nonce);
    }

    #[endpoint(getTokenInfo)]
    fn get_token_info(&self, token_identifier: EgldOrEsdtTokenIdentifier<M>) -> ManagedVec<M, ManagedBuffer<M>> {
        let mut result = ManagedVec::new();
        
        match &token_identifier {
            EgldOrEsdtTokenIdentifier::Egld => {
                result.push(ManagedBuffer::from("EGLD"));
                result.push(ManagedBuffer::from("Native MultiversX Token"));
                result.push(ManagedBuffer::from("18"));
                result.push(ManagedBuffer::from("1"));
            }
            EgldOrEsdtTokenIdentifier::Esdt(esdt_id) => {
                result.push(esdt_id.clone());
                
                // Get ESDT token properties
                if let Some(token_data) = self.blockchain().get_esdt_token_data(esdt_id) {
                    result.push(token_data.name);
                    result.push(ManagedBuffer::from(&token_data.decimals.to_be_bytes()));
                    result.push(ManagedBuffer::from(&token_data.total_supply.to_be_bytes()));
                } else {
                    result.push(ManagedBuffer::from("Unknown"));
                    result.push(ManagedBuffer::from("0"));
                    result.push(ManagedBuffer::from("0"));
                }
            }
        }
        
        result
    }

    #[endpoint(validateToken)]
    fn validate_token(&self, token_identifier: EgldOrEsdtTokenIdentifier<M>) -> bool {
        match &token_identifier {
            EgldOrEsdtTokenIdentifier::Egld => true,
            EgldOrEsdtTokenIdentifier::Esdt(esdt_id) => {
                // Check if ESDT token exists and is valid
                !esdt_id.is_empty() && self.blockchain().get_esdt_token_data(esdt_id).is_some()
            }
        }
    }

    #[endpoint(getSupportedTokens)]
    fn get_supported_tokens(&self) -> ManagedVec<M, EgldOrEsdtTokenIdentifier<M>> {
        let mut supported_tokens = ManagedVec::new();
        
        // Always support EGLD
        supported_tokens.push(EgldOrEsdtTokenIdentifier::Egld);
        
        // Add whitelisted ESDT tokens if any
        let whitelist = token_whitelist().get();
        for entry in whitelist.iter() {
            if entry.is_enabled {
                supported_tokens.push(entry.token_identifier.clone());
            }
        }
        
        supported_tokens
    }
}

#[event("tokenAccepted")]
pub fn token_accepted_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] user: &ManagedAddress<M>,
    #[indexed] token_identifier: &EgldOrEsdtTokenIdentifier<M>,
    #[indexed] amount: &BigUint<M>,
    #[indexed] nonce: u64,
) {
}

#[event("tokenValidated")]
pub fn token_validated_event<M: ManagedTypeApi>(
    self: &RouterEscrow<M>,
    #[indexed] token_identifier: &EgldOrEsdtTokenIdentifier<M>,
    #[indexed] is_valid: bool,
) {
}
