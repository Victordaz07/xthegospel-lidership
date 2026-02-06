/**
 * Auth Store - Zustand
 * 
 * Manages Firebase authentication state.
 */

import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '../../services/firebase/firebaseApp';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => () => void; // Returns unsubscribe function
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initialize: () => {
    try {
      const auth = getFirebaseAuth();
      
      set({ loading: true });
      
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          set({ user, loading: false, error: null });
        },
        (error) => {
          set({ error: error.message, loading: false });
        }
      );

      return unsubscribe;
    } catch (error: any) {
      set({ error: error.message || 'Failed to initialize auth', loading: false });
      return () => {}; // No-op unsubscribe
    }
  },
}));
