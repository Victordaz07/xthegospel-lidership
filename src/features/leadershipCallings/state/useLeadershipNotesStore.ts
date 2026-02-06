/**
 * Leadership Notes Store - Zustand + localStorage persistence
 * 
 * All notes are PRIVATE to the leader. Local-first only.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LeadershipNote, LeadershipNoteFormData, NoteScope, NoteType } from '../types';
import { mockLeadershipNotes } from '../data';

const STORAGE_KEY = 'xtg_leadership_notes_v1';

interface LeadershipNotesState {
  notes: LeadershipNote[];
  isHydrated: boolean;
  
  // Actions
  addNote: (data: LeadershipNoteFormData) => LeadershipNote;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  
  // Queries
  getById: (id: string) => LeadershipNote | undefined;
  getByScope: (scope: NoteScope, scopeId: string) => LeadershipNote[];
  getByType: (type: NoteType) => LeadershipNote[];
  getCallingNotes: (callingId: string) => LeadershipNote[];
  getMemberNotes: (memberId: string) => LeadershipNote[];
  getAllNotes: () => LeadershipNote[];
  
  // Hydration
  setHydrated: () => void;
}

export const useLeadershipNotesStore = create<LeadershipNotesState>()(
  persist(
    (set, get) => ({
      notes: mockLeadershipNotes,
      isHydrated: false,
      
      addNote: (data: LeadershipNoteFormData) => {
        const now = new Date().toISOString();
        const newNote: LeadershipNote = {
          id: `note-${Date.now()}`,
          scope: data.scope,
          scopeId: data.scopeId,
          type: data.type,
          content: data.content,
          isDictated: data.isDictated || false,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          notes: [newNote, ...state.notes], // New notes at the top
        }));
        
        return newNote;
      },
      
      updateNote: (id: string, content: string) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, content, updatedAt: new Date().toISOString() }
              : n
          ),
        }));
      },
      
      deleteNote: (id: string) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
      },
      
      getById: (id: string) => {
        return get().notes.find((n) => n.id === id);
      },
      
      getByScope: (scope: NoteScope, scopeId: string) => {
        return get().notes.filter((n) => n.scope === scope && n.scopeId === scopeId);
      },
      
      getByType: (type: NoteType) => {
        return get().notes.filter((n) => n.type === type);
      },
      
      getCallingNotes: (callingId: string) => {
        return get().notes.filter((n) => n.scope === 'calling' && n.scopeId === callingId);
      },
      
      getMemberNotes: (memberId: string) => {
        return get().notes.filter((n) => n.scope === 'member' && n.scopeId === memberId);
      },
      
      getAllNotes: () => {
        return get().notes;
      },
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating notes store:', error);
        }
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
