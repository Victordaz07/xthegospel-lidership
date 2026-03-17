/**
 * Ward Store - Zustand
 *
 * Manages ward/branch state and membership.
 * EPIC 2.1: Cloud load with cache fallback, offline resilient.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Ward, UserWardMembership, CreateWardRequest, generateWardCode, formatWardCode } from '../../types/ward';
import { FLAGS } from '../../config/featureFlags';
import { useWardLoadStatusStore } from './useWardLoadStatusStore';
import {
  saveWardMembershipCache,
  readWardMembershipCache,
  isCacheStale,
  clearWardMembershipCache,
} from './wardMembershipCache';

const STORAGE_KEY = 'xtg_ward_v1';

const useCloud = FLAGS.CLOUD_SYNC_ENABLED;

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
  joinWard: (code: string, uid: string) => Promise<{ success: boolean; error?: string }>;
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
        const statusStore = useWardLoadStatusStore.getState();
        statusStore.setLoading();
        set({ isLoading: true, error: null });

        const { ward, membership } = get();

        if (!useCloud) {
          // Local-only: use persisted state
          if (ward && membership) {
            set({ isWardMember: true, isLoading: false });
            statusStore.setSuccess('cache');
          } else {
            set({ isWardMember: false, isLoading: false });
            statusStore.setSuccess(null);
          }
          return;
        }

        if (!navigator.onLine) {
          const cached = readWardMembershipCache(uid);
          if (cached) {
            const stale = isCacheStale(cached.loadedAt);
            set({
              membership: cached.membership,
              ward: cached.ward,
              isWardMember: true,
              isLoading: false,
            });
            statusStore.setSuccess('cache', stale);
          } else {
            set({ isLoading: false });
            statusStore.setOffline();
          }
          return;
        }

        try {
          const { getUserWardMembership, getWard } = await import('../../services/firebase/wardService');
          const membershipData = await getUserWardMembership(uid);

          if (membershipData) {
            const wardData = await getWard(membershipData.wardId);
            if (wardData) {
              saveWardMembershipCache(uid, membershipData, wardData);
              set({
                membership: membershipData,
                ward: wardData,
                isWardMember: true,
                isLoading: false,
              });
              statusStore.setSuccess('cloud');
            } else {
              set({
                membership: membershipData,
                ward: null,
                isWardMember: true,
                isLoading: false,
              });
              statusStore.setSuccess('cloud');
            }
          } else {
            set({
              membership: null,
              ward: null,
              isWardMember: false,
              isLoading: false,
            });
            statusStore.setSuccess('cloud');
          }
        } catch (error: unknown) {
          console.error('Error loading ward membership:', error);

          const isPermissionDenied =
            error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'permission-denied';
          const errorMsg = isPermissionDenied
            ? 'No tienes acceso al barrio / tu cuenta no está vinculada.'
            : 'No pudimos cargar tu barrio. Intenta de nuevo.';

          const cached = readWardMembershipCache(uid);
          if (cached) {
            const stale = isCacheStale(cached.loadedAt);
            set({
              membership: cached.membership,
              ward: cached.ward,
              isWardMember: true,
              isLoading: false,
            });
            statusStore.setSuccess('cache', stale);
          } else {
            set({ isLoading: false });
            statusStore.setError(errorMsg);
          }
        }
      },

      createNewWard: async (request: CreateWardRequest, uid: string) => {
        set({ isLoading: true, error: null });
        
        try {
          let ward: Ward;
          
          if (useCloud) {
            try {
              const { createWard } = await import('../../services/firebase/wardService');
              ward = await createWard(request, uid);
            } catch (error) {
              console.warn('Firebase error, creating locally:', error);
              // Create locally if Firebase fails
              ward = createLocalWard(request, uid);
            }
          } else {
            // Create locally
            ward = createLocalWard(request, uid);
          }
          
          const membership: UserWardMembership = {
            wardId: ward.id,
            wardName: ward.name,
            stakeName: ward.stakeName,
            joinedAt: Date.now(),
            joinedVia: 'created',
          };

          if (useCloud) saveWardMembershipCache(uid, membership, ward);

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
          if (useCloud) {
            try {
              const { joinWardByCode } = await import('../../services/firebase/wardService');
              const result = await joinWardByCode(code, uid);
              
              if (result.success && result.ward) {
                const membership: UserWardMembership = {
                  wardId: result.ward.id,
                  wardName: result.ward.name,
                  stakeName: result.ward.stakeName,
                  joinedAt: Date.now(),
                  joinedVia: 'code',
                };

                if (useCloud) saveWardMembershipCache(uid, membership, result.ward);

                set({
                  ward: result.ward,
                  membership,
                  isWardMember: true,
                  isLoading: false,
                });

                return { success: true };
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
                
                return { success: false, error: result.error };
              }
            } catch (error) {
              console.warn('Firebase error:', error);
              set({
                error: 'No se puede verificar el código ahora. Intenta más tarde.',
                isLoading: false,
              });
              return { success: false, error: 'offline' };
            }
          } else {
            // In local-only mode, we can't validate codes
            set({
              error: 'La verificación de códigos requiere conexión a internet.',
              isLoading: false,
            });
            return { success: false, error: 'offline' };
          }
        } catch (error) {
          console.error('Error joining ward:', error);
          set({
            error: 'Error al unirse al barrio',
            isLoading: false,
          });
          return { success: false, error: 'unknown' };
        }
      },

      regenerateCode: async (uid: string) => {
        const { ward } = get();
        if (!ward) throw new Error('No ward to regenerate code for');
        
        set({ isLoading: true, error: null });
        
        try {
          const newCode = generateWardCode();
          
          if (useCloud) {
            try {
              const { regenerateWardCode } = await import('../../services/firebase/wardService');
              await regenerateWardCode(ward.id, uid);
            } catch (error) {
              console.warn('Firebase error, regenerating locally:', error);
            }
          }
          
          // Update locally regardless
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
          if (useCloud) {
            try {
              const { leaveWard } = await import('../../services/firebase/wardService');
              await leaveWard(uid);
            } catch (error) {
              console.warn('Firebase error:', error);
            }
            clearWardMembershipCache(uid);
          }

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
        useWardLoadStatusStore.getState().reset();
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

// Helper to create ward locally
function createLocalWard(request: CreateWardRequest, creatorUid: string): Ward {
  const wardId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const joinCode = generateWardCode();
  const now = Date.now();

  return {
    id: wardId,
    name: request.name,
    type: request.type,
    stakeName: request.stakeName,
    stakeType: request.stakeType,
    country: request.country,
    city: request.city,
    joinCode: joinCode,
    joinCodeCreatedAt: now,
    joinCodeCreatedBy: creatorUid,
    createdAt: now,
    createdBy: creatorUid,
    updatedAt: now,
    memberCount: 0,
    leaderCount: 1,
  };
}
