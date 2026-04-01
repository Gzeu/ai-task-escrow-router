#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

pub trait TokenAdminEndpoints<M: ManagedTypeApi> {
    #[endpoint(addTokenToWhitelist)]
    fn add_token_to_whitelist(
        &self,
        token_identifier: EgldOrEsdtTokenIdentifier<M>,
        min_amount: BigUint<M>,
        max_amount: BigUint<M>,
        fee_discount_bps: u16,
    );

    #[endpoint(removeTokenFromWhitelist)]
    fn remove_token_from_whitelist(&self, token_identifier: EgldOrEsdtTokenIdentifier<M>);

    #[endpoint(updateTokenWhitelist)]
    fn update_token_whitelist(
        &self,
        token_identifier: EgldOrEsdtTokenIdentifier<M>,
        is_enabled: bool,
        min_amount: BigUint<M>,
        max_amount: BigUint<M>,
        fee_discount_bps: u16,
    );

    #[endpoint(getTokenWhitelist)]
    fn get_token_whitelist(&self) -> ManagedVec<M, TokenWhitelistEntry<M>>;
}

impl<M: ManagedTypeApi> TokenAdminEndpoints<M> for RouterEscrow<M> {
    fn require_owner(&self) {
        let config = config().get();
        let caller = self.blockchain().get_caller();
        require!(caller == config.owner, "Only owner can call this function");
    }

    #[endpoint(addTokenToWhitelist)]
    fn add_token_to_whitelist(
        &self,
        token_identifier: EgldOrEsdtTokenIdentifier<M>,
        min_amount: BigUint<M>,
        max_amount: BigUint<M>,
        fee_discount_bps: u16,
    ) {
        self.require_owner();
        
        require!(min_amount > 0, "Min amount must be greater than 0");
        require!(max_amount > min_amount, "Max amount must be greater than min amount");
        require!(fee_discount_bps <= 10000, "Fee discount cannot exceed 100%");
        
        let mut whitelist = token_whitelist();
        let new_entry = TokenWhitelistEntry {
            token_identifier: token_identifier.clone(),
            is_enabled: true,
            min_amount,
            max_amount,
            fee_discount_bps,
        };
        
        whitelist.push(new_entry);
        token_whitelist().set(&whitelist);
        
        token_whitelist_updated_event(self, &token_identifier, true);
    }

    #[endpoint(removeTokenFromWhitelist)]
    fn remove_token_from_whitelist(&self, token_identifier: EgldOrEsdtTokenIdentifier<M>) {
        self.require_owner();
        
        let mut whitelist = token_whitelist();
        whitelist.retain(|entry| entry.token_identifier != token_identifier);
        token_whitelist().set(&whitelist);
        
        token_whitelist_updated_event(self, &token_identifier, false);
    }

    #[endpoint(updateTokenWhitelist)]
    fn update_token_whitelist(
        &self,
        token_identifier: EgldOrEsdtTokenIdentifier<M>,
        is_enabled: bool,
        min_amount: BigUint<M>,
        max_amount: BigUint<M>,
        fee_discount_bps: u16,
    ) {
        self.require_owner();
        
        require!(min_amount > 0, "Min amount must be greater than 0");
        require!(max_amount > min_amount, "Max amount must be greater than min amount");
        require!(fee_discount_bps <= 10000, "Fee discount cannot exceed 100%");
        
        let mut whitelist = token_whitelist();
        let mut found = false;
        
        for entry in whitelist.iter_mut() {
            if entry.token_identifier == token_identifier {
                entry.is_enabled = is_enabled;
                entry.min_amount = min_amount;
                entry.max_amount = max_amount;
                entry.fee_discount_bps = fee_discount_bps;
                found = true;
                break;
            }
        }
        
        require!(found, "Token not found in whitelist");
        token_whitelist().set(&whitelist);
        
        token_whitelist_updated_event(self, &token_identifier, is_enabled);
    }

    #[endpoint(getTokenWhitelist)]
    fn get_token_whitelist(&self) -> ManagedVec<M, TokenWhitelistEntry<M>> {
        token_whitelist().get()
    }
}
