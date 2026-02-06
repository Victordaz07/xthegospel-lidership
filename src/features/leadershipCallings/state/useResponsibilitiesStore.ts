/**
 * Responsibilities Store - Zustand + localStorage persistence
 * 
 * Manages responsibilities for callings. Local-first, no sync.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Responsibility, ResponsibilityFormData, ResponsibilityStatus } from '../types';
import { mockResponsibilities } from '../data';

const STORAGE_KEY = 'xtg_leadership_responsibilities_v1';

interface ResponsibilitiesState {
  responsibilities: Responsibility[];
  isHydrated: boolean;
  
  // Actions
  addResponsibility: (data: ResponsibilityFormData) => Responsibility;
  updateResponsibility: (id: string, updates: Partial<Responsibility>) => void;
  updateStatus: (id: string, status: ResponsibilityStatus, note?: string) => void;
  deleteResponsibility: (id: string) => void;
  
  // Queries
  getById: (id: string) => Responsibility | undefined;
  getByCallingId: (callingId: string) => Responsibility[];
  getByStatus: (status: ResponsibilityStatus) => Responsibility[];
  getAllPending: () => Responsibility[];
  getAllInProgress: () => Responsibility[];
  
  // Hydration
  setHydrated: () => void;
}

export const useResponsibilitiesStore = create<ResponsibilitiesState>()(
  persist(
    (set, get) => ({
      responsibilities: mockResponsibilities,
      isHydrated: false,
      
      addResponsibility: (data: ResponsibilityFormData) => {
        const now = new Date().toISOString();
        const newResp: Responsibility = {
          id: `resp-${Date.now()}`,
          callingId: data.callingId,
          title: data.title,
          description: data.description,
          status: 'pending',
          priority: data.priority,
          suggestedDate: data.suggestedDate,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          responsibilities: [...state.responsibilities, newResp],
        }));
        
        return newResp;
      },
      
      updateResponsibility: (id: string, updates: Partial<Responsibility>) => {
        set((state) => ({
          responsibilities: state.responsibilities.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },
      
      updateStatus: (id: string, status: ResponsibilityStatus, note?: string) => {
        const now = new Date().toISOString();
        
        set((state) => ({
          responsibilities: state.responsibilities.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  completedAt: status === 'done' ? now : r.completedAt,
                  notes: note || r.notes,
                  updatedAt: now,
                }
              : r
          ),
        }));
      },
      
      deleteResponsibility: (id: string) => {
        set((state) => ({
          responsibilities: state.responsibilities.filter((r) => r.id !== id),
        }));
      },
      
      getById: (id: string) => {
        return get().responsibilities.find((r) => r.id === id);
      },
      
      getByCallingId: (callingId: string) => {
        return get().responsibilities.filter((r) => r.callingId === callingId);
      },
      
      getByStatus: (status: ResponsibilityStatus) => {
        return get().responsibilities.filter((r) => r.status === status);
      },
      
      getAllPending: () => {
        return get().responsibilities.filter((r) => r.status === 'pending');
      },
      
      getAllInProgress: () => {
        return get().responsibilities.filter((r) => r.status === 'in_progress');
      },
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating responsibilities store:', error);
        }
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
