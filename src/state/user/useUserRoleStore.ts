/**
 * User Role Store - Zustand + localStorage persistence
 * 
 * Manages the user's leadership role/calling.
 * Persists to localStorage and can sync to Firestore.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LeadershipRole, getRoleDefinition, getRolePermissions, RolePermissions } from '../../config/roles';

const STORAGE_KEY = 'xtg_user_role_v1';

interface UserRoleState {
  // Current role
  role: LeadershipRole | null;
  isRoleSelected: boolean;
  
  // Actions
  setRole: (role: LeadershipRole) => void;
  clearRole: () => void;
  
  // Computed helpers (cached)
  getRoleLabel: () => string;
  getRoleIcon: () => string;
  getRoleOrganization: () => string;
  getPermissions: () => RolePermissions;
  
  // Permission checks
  canViewAllCallings: () => boolean;
  canManageCallings: () => boolean;
  canApproveCallings: () => boolean;
  isBishopric: () => boolean;
}

export const useUserRoleStore = create<UserRoleState>()(
  persist(
    (set, get) => ({
      role: null,
      isRoleSelected: false,
      
      setRole: (role: LeadershipRole) => {
        set({ role, isRoleSelected: true });
      },
      
      clearRole: () => {
        set({ role: null, isRoleSelected: false });
      },
      
      getRoleLabel: () => {
        const { role } = get();
        if (!role) return 'Sin rol asignado';
        return getRoleDefinition(role)?.label || 'Líder';
      },
      
      getRoleIcon: () => {
        const { role } = get();
        if (!role) return '👤';
        return getRoleDefinition(role)?.icon || '👤';
      },
      
      getRoleOrganization: () => {
        const { role } = get();
        if (!role) return '';
        return getRoleDefinition(role)?.organization || '';
      },
      
      getPermissions: () => {
        const { role } = get();
        if (!role) return {
          canViewAllCallings: false,
          canManageCallings: false,
          canViewAllMembers: false,
          canViewOtherNotes: false,
          canAccessWardSettings: false,
          canApproveCallings: false,
        };
        return getRolePermissions(role);
      },
      
      // Quick permission checks
      canViewAllCallings: () => get().getPermissions().canViewAllCallings,
      canManageCallings: () => get().getPermissions().canManageCallings,
      canApproveCallings: () => get().getPermissions().canApproveCallings,
      
      isBishopric: () => {
        const { role } = get();
        if (!role) return false;
        const def = getRoleDefinition(role);
        return def?.level === 'bishopric';
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
