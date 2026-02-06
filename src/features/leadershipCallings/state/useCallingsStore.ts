/**
 * Callings Store - Zustand + localStorage persistence
 * 
 * Manages all callings data locally. Never synced without consent.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Calling, CallingFormData, CallingStatus } from '../types';
import { mockCallings } from '../data';

const STORAGE_KEY = 'xtg_leadership_callings_v1';

interface CallingsState {
  callings: Calling[];
  isHydrated: boolean;
  
  // Actions
  addCalling: (data: CallingFormData) => Calling;
  updateCalling: (id: string, updates: Partial<Calling>) => void;
  updateCallingStatus: (id: string, status: CallingStatus, date?: string) => void;
  releaseCalling: (id: string, releaseDate: string, finalNote?: string) => void;
  deleteCalling: (id: string) => void;
  
  // Queries
  getCallingById: (id: string) => Calling | undefined;
  getCallingsByStatus: (status: CallingStatus) => Calling[];
  getCallingsByOrganization: (org: string) => Calling[];
  getCallingsByMember: (memberId: string) => Calling[];
  getActiveCallings: () => Calling[];
  
  // Hydration
  setHydrated: () => void;
}

export const useCallingsStore = create<CallingsState>()(
  persist(
    (set, get) => ({
      callings: mockCallings, // Start with mock data for development
      isHydrated: false,
      
      addCalling: (data: CallingFormData) => {
        const now = new Date().toISOString();
        const newCalling: Calling = {
          id: `calling-${Date.now()}`,
          memberId: data.memberId,
          memberName: data.memberName,
          organization: data.organization,
          position: data.position,
          status: 'proposed',
          timeline: {
            proposedAt: data.proposedDate || now.split('T')[0],
          },
          notes: data.notes,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          callings: [...state.callings, newCalling],
        }));
        
        return newCalling;
      },
      
      updateCalling: (id: string, updates: Partial<Calling>) => {
        set((state) => ({
          callings: state.callings.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },
      
      updateCallingStatus: (id: string, status: CallingStatus, date?: string) => {
        const dateValue = date || new Date().toISOString().split('T')[0];
        
        set((state) => ({
          callings: state.callings.map((c) => {
            if (c.id !== id) return c;
            
            const timelineUpdate: Record<string, string> = {};
            switch (status) {
              case 'called':
                timelineUpdate.calledAt = dateValue;
                break;
              case 'sustained':
                timelineUpdate.sustainedAt = dateValue;
                break;
              case 'set_apart':
                timelineUpdate.setApartAt = dateValue;
                break;
              case 'released':
                timelineUpdate.releasedAt = dateValue;
                break;
            }
            
            return {
              ...c,
              status,
              timeline: { ...c.timeline, ...timelineUpdate },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      
      releaseCalling: (id: string, releaseDate: string, finalNote?: string) => {
        set((state) => ({
          callings: state.callings.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'released' as CallingStatus,
                  timeline: { ...c.timeline, releasedAt: releaseDate },
                  notes: finalNote ? `${c.notes || ''}\n\n[Relevo] ${finalNote}`.trim() : c.notes,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      },
      
      deleteCalling: (id: string) => {
        set((state) => ({
          callings: state.callings.filter((c) => c.id !== id),
        }));
      },
      
      getCallingById: (id: string) => {
        return get().callings.find((c) => c.id === id);
      },
      
      getCallingsByStatus: (status: CallingStatus) => {
        return get().callings.filter((c) => c.status === status);
      },
      
      getCallingsByOrganization: (org: string) => {
        return get().callings.filter((c) => c.organization === org);
      },
      
      getCallingsByMember: (memberId: string) => {
        return get().callings.filter((c) => c.memberId === memberId);
      },
      
      getActiveCallings: () => {
        return get().callings.filter((c) => 
          c.status !== 'released' && c.status !== 'proposed'
        );
      },
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating callings store:', error);
        }
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
