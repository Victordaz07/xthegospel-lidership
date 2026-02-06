/**
 * Calendar Events Store - Zustand + localStorage persistence
 * 
 * Manages leadership calendar events. Local-first only.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CallingEvent, CallingEventFormData, EventKind } from '../types';
import { mockCallingEvents } from '../data';

const STORAGE_KEY = 'xtg_leadership_events_v1';

interface EventsState {
  events: CallingEvent[];
  isHydrated: boolean;
  
  // Actions
  addEvent: (data: CallingEventFormData) => CallingEvent;
  updateEvent: (id: string, updates: Partial<CallingEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Queries
  getById: (id: string) => CallingEvent | undefined;
  getByDate: (date: string) => CallingEvent[];
  getByDateRange: (startDate: string, endDate: string) => CallingEvent[];
  getByKind: (kind: EventKind) => CallingEvent[];
  getByOrganization: (org: string) => CallingEvent[];
  getByCallingId: (callingId: string) => CallingEvent[];
  getByMemberId: (memberId: string) => CallingEvent[];
  
  // Conflict detection
  hasConflict: (date: string, time?: string, excludeId?: string) => CallingEvent[];
  
  // Hydration
  setHydrated: () => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: mockCallingEvents,
      isHydrated: false,
      
      addEvent: (data: CallingEventFormData) => {
        const now = new Date().toISOString();
        const newEvent: CallingEvent = {
          id: `event-${Date.now()}`,
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          events: [...state.events, newEvent],
        }));
        
        return newEvent;
      },
      
      updateEvent: (id: string, updates: Partial<CallingEvent>) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id
              ? { ...e, ...updates, updatedAt: new Date().toISOString() }
              : e
          ),
        }));
      },
      
      deleteEvent: (id: string) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },
      
      getById: (id: string) => {
        return get().events.find((e) => e.id === id);
      },
      
      getByDate: (date: string) => {
        return get().events.filter((e) => e.date === date);
      },
      
      getByDateRange: (startDate: string, endDate: string) => {
        return get().events.filter((e) => e.date >= startDate && e.date <= endDate);
      },
      
      getByKind: (kind: EventKind) => {
        return get().events.filter((e) => e.kind === kind);
      },
      
      getByOrganization: (org: string) => {
        return get().events.filter((e) => e.organization === org);
      },
      
      getByCallingId: (callingId: string) => {
        return get().events.filter((e) => e.callingId === callingId);
      },
      
      getByMemberId: (memberId: string) => {
        return get().events.filter((e) => e.memberId === memberId);
      },
      
      hasConflict: (date: string, time?: string, excludeId?: string) => {
        return get().events.filter((e) => {
          if (excludeId && e.id === excludeId) return false;
          if (e.date !== date) return false;
          if (!time || !e.time) return false; // No time = no conflict
          return e.time === time;
        });
      },
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating events store:', error);
        }
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
