#![no_std]

multiversx_sc::imports!();

use crate::types::*;
use crate::storage::*;
use crate::events::*;
use crate::RouterEscrow;

#[derive(TypeAbi, PartialEq, Eq, Debug, TopEncode, TopDecode, Clone, Copy)]
pub enum OrganizationRole {
    Owner,
    Admin,
    Member,
    Agent,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct OrganizationMember<M: ManagedTypeApi> {
    pub address: ManagedAddress<M>,
    pub role: OrganizationRole,
    pub joined_at: u64,
    pub permissions: ManagedVec<M, ManagedBuffer<M>>,
}

#[derive(TypeAbi, TopEncode, TopDecode, Clone, Debug)]
pub struct Organization<M: ManagedTypeApi> {
    pub id: ManagedBuffer<M>,
    pub name: ManagedBuffer<M>,
    pub description: ManagedBuffer<M>,
    pub owner: ManagedAddress<M>,
    pub created_at: u64,
    pub is_active: bool,
    pub member_count: u32,
    pub total_tasks_completed: u64,
    pub total_revenue: BigUint<M>,
}

pub trait OrganizationEndpoints<M: ManagedTypeApi> {
    #[endpoint(createOrganization)]
    fn create_organization(
        &self,
        name: ManagedBuffer<M>,
        description: ManagedBuffer<M>,
    ) -> ManagedBuffer<M>;

    #[endpoint(joinOrganization)]
    fn join_organization(&self, org_id: ManagedBuffer<M>);

    #[endpoint(leaveOrganization)]
    fn leave_organization(&self, org_id: ManagedBuffer<M>);

    #[endpoint(addOrgMember)]
    fn add_org_member(
        &self,
        org_id: ManagedBuffer<M>,
        member: ManagedAddress<M>,
        role: OrganizationRole,
        permissions: ManagedVec<M, ManagedBuffer<M>>,
    );

    #[endpoint(removeOrgMember)]
    fn remove_org_member(&self, org_id: ManagedBuffer<M>, member: ManagedAddress<M>);

    #[endpoint(updateOrgMemberRole)]
    fn update_org_member_role(
        &self,
        org_id: ManagedBuffer<M>,
        member: ManagedAddress<M>,
        role: OrganizationRole,
    );

    #[endpoint(getOrganization)]
    fn get_organization(&self, org_id: ManagedBuffer<M>) -> Organization<M>;

    #[endpoint(getOrganizationMembers)]
    fn get_organization_members(&self, org_id: ManagedBuffer<M>) -> ManagedVec<M, OrganizationMember<M>>;

    #[endpoint(getUserOrganizations)]
    fn get_user_organizations(&self, user: ManagedAddress<M>) -> ManagedVec<M, ManagedBuffer<M>>;
}

impl<M: ManagedTypeApi> OrganizationEndpoints<M> for RouterEscrow<M> {
    fn require_not_paused(&self) {
        let config = config().get();
        require!(!config.paused && !config.emergency_pause, "Contract is paused");
    }

    #[endpoint(createOrganization)]
    fn create_organization(
        &self,
        name: ManagedBuffer<M>,
        description: ManagedBuffer<M>,
    ) -> ManagedBuffer<M> {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        
        // Generate unique organization ID
        let org_id = ManagedBuffer::from(&format!("org_{}", caller.as_bytes()).to_be_bytes());
        
        let organization = Organization {
            id: org_id.clone(),
            name,
            description,
            owner: caller,
            created_at: self.blockchain().get_block_timestamp(),
            is_active: true,
            member_count: 1,
            total_tasks_completed: 0,
            total_revenue: BigUint::zero(),
        };
        
        // Store organization
        let mut orgs = organizations();
        orgs.push(org_id.clone());
        organizations().set(&orgs);
        
        // Add owner as first member
        let mut members = ManagedVec::new();
        members.push(OrganizationMember {
            address: caller,
            role: OrganizationRole::Owner,
            joined_at: self.blockchain().get_block_timestamp(),
            permissions: ManagedVec::from_single_element(ManagedBuffer::from("all")),
        });
        
        organization_members(&org_id).set(&members);
        
        org_id
    }

    #[endpoint(joinOrganization)]
    fn join_organization(&self, org_id: ManagedBuffer<M>) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        
        // Check if organization exists
        let orgs = organizations();
        require!(orgs.iter().any(|id| id == &org_id), "Organization not found");
        
        let mut members = organization_members(&org_id).get();
        
        // Check if already a member
        require!(!members.iter().any(|member| member.address == caller), "Already a member");
        
        // Add as member with default role
        members.push(OrganizationMember {
            address: caller,
            role: OrganizationRole::Member,
            joined_at: self.blockchain().get_block_timestamp(),
            permissions: ManagedVec::new(),
        });
        
        organization_members(&org_id).set(&members);
    }

    #[endpoint(leaveOrganization)]
    fn leave_organization(&self, org_id: ManagedBuffer<M>) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let mut members = organization_members(&org_id).get();
        
        // Find and remove member
        let initial_len = members.len();
        members.retain(|member| member.address != caller);
        
        require!(members.len() < initial_len, "Not a member of this organization");
        
        organization_members(&org_id).set(&members);
    }

    #[endpoint(addOrgMember)]
    fn add_org_member(
        &self,
        org_id: ManagedBuffer<M>,
        member: ManagedAddress<M>,
        role: OrganizationRole,
        permissions: ManagedVec<M, ManagedBuffer<M>>,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        
        // Check if caller is owner or admin
        let organization = self.get_organization_internal(&org_id);
        require!(caller == organization.owner, "Only organization owner can add members");
        
        let mut members = organization_members(&org_id).get();
        
        // Check if already a member
        require!(!members.iter().any(|m| m.address == member), "Already a member");
        
        members.push(OrganizationMember {
            address: member,
            role,
            joined_at: self.blockchain().get_block_timestamp(),
            permissions,
        });
        
        organization_members(&org_id).set(&members);
    }

    #[endpoint(removeOrgMember)]
    fn remove_org_member(&self, org_id: ManagedBuffer<M>, member: ManagedAddress<M>) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        
        // Check if caller is owner
        let organization = self.get_organization_internal(&org_id);
        require!(caller == organization.owner, "Only organization owner can remove members");
        
        let mut members = organization_members(&org_id).get();
        
        // Cannot remove owner
        require!(member != organization.owner, "Cannot remove organization owner");
        
        // Find and remove member
        let initial_len = members.len();
        members.retain(|m| m.address != member);
        
        require!(members.len() < initial_len, "Member not found");
        
        organization_members(&org_id).set(&members);
    }

    #[endpoint(updateOrgMemberRole)]
    fn update_org_member_role(
        &self,
        org_id: ManagedBuffer<M>,
        member: ManagedAddress<M>,
        role: OrganizationRole,
    ) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        
        // Check if caller is owner
        let organization = self.get_organization_internal(&org_id);
        require!(caller == organization.owner, "Only organization owner can update roles");
        
        let mut members = organization_members(&org_id).get();
        
        // Find and update member role
        for m in members.iter_mut() {
            if m.address == member {
                m.role = role;
                break;
            }
        }
        
        organization_members(&org_id).set(&members);
    }

    #[endpoint(getOrganization)]
    fn get_organization(&self, org_id: ManagedBuffer<M>) -> Organization<M> {
        self.get_organization_internal(&org_id)
    }

    #[endpoint(getOrganizationMembers)]
    fn get_organization_members(&self, org_id: ManagedBuffer<M>) -> ManagedVec<M, OrganizationMember<M>> {
        organization_members(&org_id).get()
    }

    #[endpoint(getUserOrganizations)]
    fn get_user_organizations(&self, user: ManagedAddress<M>) -> ManagedVec<M, ManagedBuffer<M>> {
        let mut user_orgs = ManagedVec::new();
        let orgs = organizations();
        
        for org_id in orgs.iter() {
            let members = organization_members(&org_id).get();
            if members.iter().any(|member| member.address == user) {
                user_orgs.push(org_id);
            }
        }
        
        user_orgs
    }

    // Helper function to get organization details
    fn get_organization_internal(&self, org_id: &ManagedBuffer<M>) -> Organization<M> {
        // This would need to be implemented based on storage structure
        // For now, return a default organization
        Organization {
            id: org_id.clone(),
            name: ManagedBuffer::from("Default Organization"),
            description: ManagedBuffer::from("Default description"),
            owner: self.blockchain().get_caller(),
            created_at: self.blockchain().get_block_timestamp(),
            is_active: true,
            member_count: 1,
            total_tasks_completed: 0,
            total_revenue: BigUint::zero(),
        }
    }
}
