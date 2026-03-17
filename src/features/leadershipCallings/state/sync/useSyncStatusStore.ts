/**
 * Sync Status Store
 *
 * Tracks cloud sync state for leadership data.
 * Used by LeadershipSyncBridge and Profile sync UI.
 */

import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'error';

interface SyncStatusState {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
  /** True mientras hydrate/forceHydrate corre. Evita autosync inmediato post-hydrate. */
  isHydrating: boolean;

  setSyncing: () => void;
  setSuccess: () => void;
  setError: (message: string) => void;
  setHydrating: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as SyncStatus,
  lastSyncedAt: null as Date | null,
  errorMessage: null as string | null,
  isHydrating: false,
};

export const useSyncStatusStore = create<SyncStatusState>((set) => ({
  ...initialState,

  setSyncing: () =>
    set({
      status: 'syncing',
      errorMessage: null,
    }),

  setSuccess: () =>
    set({
      status: 'idle',
      lastSyncedAt: new Date(),
      errorMessage: null,
    }),

  setError: (message: string) =>
    set({
      status: 'error',
      errorMessage: message,
    }),

  setHydrating: (value: boolean) => set({ isHydrating: value }),

  reset: () => set(initialState),
}));
