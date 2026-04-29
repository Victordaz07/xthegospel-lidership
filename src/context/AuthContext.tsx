/**
 * Auth Context - Unified Authentication
 * 
 * Now integrated with Firebase Auth via useAuthStore.
 * Provides user authentication state and role management.
 */

import React, { createContext, useContext, ReactNode, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { useAuthStore } from '../state/auth/useAuthStore';
import { signIn, signUp, signOut, signInWithGoogle } from '../services/firebase/authService';

export type UserRoleKey = 'leader' | 'member';

interface AuthContextType {
  // Firebase user
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Role management (for future multi-role support)
  userRole: UserRoleKey;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, loading, error, initialize, setError } = useAuthStore();

  // Initialize Firebase Auth listener on mount
  useEffect(() => {
    const unsubscribe = initialize();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initialize]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await signIn(email, password);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await signUp(email, password);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut();
    } catch (err: any) {
      setError('Error al cerrar sesión');
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    error,
    userRole: 'leader', // Default role for this app
    login,
    loginWithGoogle,
    register,
    logout,
    clearError,
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Helper to translate Firebase Auth error codes to Spanish
 */
function getAuthErrorMessage(code: string | undefined): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Este correo ya está registrado',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Inicio con Google cancelado',
    'auth/cancelled-popup-request': 'Inicio con Google cancelado',
    'auth/popup-blocked':
      'El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.',
    'auth/account-exists-with-different-credential':
      'Ya existe una cuenta con este correo usando otro método de acceso. Usa correo y contraseña o el mismo proveedor que usaste antes.',
  };

  return errorMessages[code || ''] || 'Error de autenticación';
}
