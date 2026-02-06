import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { StorageService } from '../utils/storage';
import { UserRoleKey, normalizeStoredRole, isValidRole } from '../config/roles';

interface AuthContextType {
  userRole: UserRoleKey | null;
  login: (role: UserRoleKey) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRoleKey | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredRole();
  }, []);

  const loadStoredRole = async () => {
    try {
      setIsLoading(true);
      console.log('🔐 AuthContext: Cargando rol almacenado...');
      const storedRoleRaw = StorageService.getItem('userRole');
      
      const normalizedRole = normalizeStoredRole(storedRoleRaw);
      
      if (normalizedRole) {
        if (normalizedRole !== storedRoleRaw) {
          StorageService.setItem('userRole', normalizedRole);
        }
        setUserRole(normalizedRole);
      } else {
        // Default to leader role for this app
        setUserRole('leader');
        StorageService.setItem('userRole', 'leader');
      }
    } catch (error) {
      console.error('❌ Error loading stored role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (role: UserRoleKey) => {
    try {
      setIsLoading(true);
      if (!isValidRole(role)) {
        throw new Error(`Invalid role: ${role}`);
      }
      StorageService.setItem('userRole', role);
      setUserRole(role);
    } catch (error) {
      console.error('Error saving role:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      StorageService.removeItem('userRole');
      setUserRole(null);
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
