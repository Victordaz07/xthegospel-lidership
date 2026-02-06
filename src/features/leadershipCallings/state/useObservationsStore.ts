/**
 * Observations Store - Zustand + localStorage persistence
 * 
 * Descriptive progress observations for callings.
 * NO metrics, NO scores - just narrative updates.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Observation, ObservationFormData } from '../types';
import { mockObservations } from '../data';

const STORAGE_KEY = 'xtg_leadership_observations_v1';

interface ObservationsState {
  observations: Observation[];
  isHydrated: boolean;
  
  // Actions
  addObservation: (data: ObservationFormData) => Observation;
  deleteObservation: (id: string) => void;
  
  // Queries
  getById: (id: string) => Observation | undefined;
  getByCallingId: (callingId: string) => Observation[];
  
  // Hydration
  setHydrated: () => void;
}

export const useObservationsStore = create<ObservationsState>()(
  persist(
    (set, get) => ({
      observations: mockObservations,
      isHydrated: false,
      
      addObservation: (data: ObservationFormData) => {
        const now = new Date().toISOString();
        const newObs: Observation = {
          id: `obs-${Date.now()}`,
          callingId: data.callingId,
          content: data.content,
          milestone: data.milestone,
          createdAt: now,
        };
        
        set((state) => ({
          observations: [newObs, ...state.observations],
        }));
        
        return newObs;
      },
      
      deleteObservation: (id: string) => {
        set((state) => ({
          observations: state.observations.filter((o) => o.id !== id),
        }));
      },
      
      getById: (id: string) => {
        return get().observations.find((o) => o.id === id);
      },
      
      getByCallingId: (callingId: string) => {
        return get().observations.filter((o) => o.callingId === callingId);
      },
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating observations store:', error);
        }
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
