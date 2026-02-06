/**
 * Ward Store - Zustand
 * 
 * Manages ward/branch state and membership.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Ward, UserWardMembership, CreateWardRequest, formatWardCode } from '../../types/ward';
import {
  createWard,
  getWard,
  joinWardByCode,
  regenerateWardCode,
  getUserWardMembership,
  leaveWard,
  JoinWardResult,
} from '../../services/firebase/wardService';

const STORAGE_KEY = 'xtg_ward_v1';

interface WardState {
  // Current ward
  ward: Ward | null;
  membership: UserWardMembership | null;
  isWardMember: boolean;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadWardMembership: (uid: string) => Promise<void>;
  createNewWard: (request: CreateWardRequest, uid: string) => Promise<Ward>;
  joinWard: (code: string, uid: string) => Promise<JoinWardResult>;
  regenerateCode: (uid: string) => Promise<string>;
  leave: (uid: string) => Promise<void>;
  clearWard: () => void;
  clearError: () => void;
  
  // Helpers
  getFormattedCode: () => string;
}

export const useWardStore = create<WardState>()(
  persist(
    (set, get) => ({
      ward: null,
      membership: null,
      isWardMember: false,
      isLoading: false,
      error: null,

      loadWardMembership: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const membership = await getUserWardMembership(uid);
          
          if (membership) {
            const ward = await getWard(membership.wardId);
            set({
              membership,
              ward,
              isWardMember: true,
              isLoading: false,
            });
          } else {
            set({
              membership: null,
              ward: null,
              isWardMember: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error loading ward membership:', error);
          set({
            error: 'Error al cargar información del barrio',
            isLoading: false,
          });
        }
      },

      createNewWard: async (request: CreateWardRequest, uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const ward = await createWard(request, uid);
          const membership: UserWardMembership = {
            wardId: ward.id,
            wardName: ward.name,
            stakeName: ward.stakeName,
            joinedAt: Date.now(),
            joinedVia: 'created',
          };
          
          set({
            ward,
            membership,
            isWardMember: true,
            isLoading: false,
          });
          
          return ward;
        } catch (error) {
          console.error('Error creating ward:', error);
          set({
            error: 'Error al crear el barrio',
            isLoading: false,
          });
          throw error;
        }
      },

      joinWard: async (code: string, uid: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await joinWardByCode(code, uid);
          
          if (result.success && result.ward) {
            const membership: UserWardMembership = {
              wardId: result.ward.id,
              wardName: result.ward.name,
              stakeName: result.ward.stakeName,
              joinedAt: Date.now(),
              joinedVia: 'code',
            };
            
            set({
              ward: result.ward,
              membership,
              isWardMember: true,
              isLoading: false,
            });
          } else {
            const errorMessages: Record<string, string> = {
              invalid_code: 'Código inválido. Verifica e intenta de nuevo.',
              code_expired: 'Este código ha expirado.',
              code_inactive: 'Este código ya no está activo.',
              max_uses_reached: 'Este código ya alcanzó el límite de usos.',
              already_member: 'Ya eres miembro de este barrio.',
            };
            
            set({
              error: errorMessages[result.error || 'invalid_code'],
              isLoading: false,
            });
          }
          
          return result;
        } catch (error) {
          console.error('Error joining ward:', error);
          set({
            error: 'Error al unirse al barrio',
            isLoading: false,
          });
          return { success: false, error: 'invalid_code' as const };
        }
      },

      regenerateCode: async (uid: string) => {
        const { ward } = get();
        if (!ward) throw new Error('No ward to regenerate code for');
        
        set({ isLoading: true, error: null });
        try {
          const newCode = await regenerateWardCode(ward.id, uid);
          
          set({
            ward: { ...ward, joinCode: newCode },
            isLoading: false,
          });
          
          return newCode;
        } catch (error) {
          console.error('Error regenerating code:', error);
          set({
            error: 'Error al regenerar el código',
            isLoading: false,
          });
          throw error;
        }
      },

      leave: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
          await leaveWard(uid);
          set({
            ward: null,
            membership: null,
            isWardMember: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error leaving ward:', error);
          set({
            error: 'Error al salir del barrio',
            isLoading: false,
          });
        }
      },

      clearWard: () => {
        set({
          ward: null,
          membership: null,
          isWardMember: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      getFormattedCode: () => {
        const { ward } = get();
        if (!ward?.joinCode) return '---';
        return formatWardCode(ward.joinCode);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        ward: state.ward,
        membership: state.membership,
        isWardMember: state.isWardMember,
      }),
    }
  )
);
