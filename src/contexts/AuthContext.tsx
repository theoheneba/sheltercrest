import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if there's a stored token and validate it
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Token invalid or expired
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await authService.login(email, password);
    setUser(userData);
  };

  const register = async (userData: RegisterData) => {
    await authService.register(userData);
    // Auto login after registration
    await login(userData.email, userData.password);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isInitialized,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}