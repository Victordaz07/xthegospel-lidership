/**
 * Ward Load Status Store
 *
 * Tracks ward membership load state for resilient cloud/cache UX.
 * EPIC 2.1: Ward Cloud Load Hardening.
 */

import { create } from 'zustand';

export type WardLoadStatus = 'idle' | 'loading' | 'success' | 'error' | 'offline';
export type WardLoadSource = 'cloud' | 'cache' | null;

interface WardLoadStatusState {
  status: WardLoadStatus;
  errorMessage: string | null;
  lastLoadedAt: number | null;
  source: WardLoadSource;
  /** True if cache is > 7 days old (stale but usable) */
  isStale: boolean;

  setLoading: () => void;
  setSuccess: (source: WardLoadSource, isStale?: boolean) => void;
  setError: (msg: string) => void;
  setOffline: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as WardLoadStatus,
  errorMessage: null as string | null,
  lastLoadedAt: null as number | null,
  source: null as WardLoadSource,
  isStale: false,
};

export const useWardLoadStatusStore = create<WardLoadStatusState>((set) => ({
  ...initialState,

  setLoading: () =>
    set({
      status: 'loading',
      errorMessage: null,
    }),

  setSuccess: (source: WardLoadSource, isStale = false) =>
    set({
      status: 'success',
      errorMessage: null,
      lastLoadedAt: Date.now(),
      source,
      isStale,
    }),

  setError: (msg: string) =>
    set({
      status: 'error',
      errorMessage: msg,
    }),

  setOffline: () =>
    set({
      status: 'offline',
      errorMessage: null,
    }),

  clearError: () =>
    set({
      errorMessage: null,
    }),

  reset: () => set(initialState),
}));
