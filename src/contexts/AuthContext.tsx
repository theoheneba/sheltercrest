import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'superadmin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean; 
  userRole: string | null;
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
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  employmentStatus?: string;
  employerName?: string;
  monthlyIncome?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    while (retryCount < maxRetries) {
      try {
        // Step 1: Create the user with Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('No user returned from registration');

        // Step 2: Create the user profile directly in the database
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            phone: userData.phone || null,
            address: userData.address || null,
            city: userData.city || null,
            state: userData.state || null,
            zip: userData.zip || null,
            employment_status: userData.employmentStatus || null,
            employer_name: userData.employerName || null,
            monthly_income: userData.monthlyIncome || null,
            role: 'user'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('User created but profile setup failed. Please contact support.');
        }

        toast.success('Registration successful! Please log in.');
        
        // Auto login after successful registration
        await login(userData.email, userData.password);
        return;
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a rate limit error
        if (error?.message?.includes('over_email_send_rate_limit')) {
          // Extract wait time from error message or use default 10 seconds
          const waitTime = 10 * 1000 * Math.pow(2, retryCount); // Exponential backoff
          await sleep(waitTime);
          retryCount++;
        } else {
          // For other errors, don't retry
          throw error;
        }
      }
    }

    // If we've exhausted all retries
    throw lastError;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: ['admin', 'superadmin', 'sales_executive', 'credit_analyst', 'recovery_and_collections', 'inspection_and_verification', 'finance', 'company_manager'].includes(user?.role || ''),
    userRole: user?.role,
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