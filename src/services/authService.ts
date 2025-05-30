import { toast } from 'react-hot-toast';
import { supabase } from './db';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'superadmin';
}

export interface RegisterData {
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

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const { data: { user, session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      if (!user) throw new Error('No user returned from login');
      
      // Store the session in localStorage to ensure persistence
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role
      };

      toast.success('Logged in successfully');
      return authUser;
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.message === 'Invalid login credentials' 
        ? 'Invalid email or password'
        : error.message;
      toast.error(message);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<void> {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user returned from registration');
      
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          zip: data.zip || null,
          employment_status: data.employmentStatus || null,
          employer_name: data.employerName || null,
          monthly_income: data.monthlyIncome || null,
          role: 'user'
        });
        
      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('User created but profile setup failed. Please contact support.');
      }

      toast.success('Registration successful! Please log in.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) return null;

      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      // Get profile by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) return null;

      const profile = profiles[0];

      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role
      };
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }
};