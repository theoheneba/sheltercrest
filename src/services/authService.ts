import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;
      if (!user) throw new Error('No user returned from authentication');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('User profile not found');

      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role
      };
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in');
      throw error;
    }
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
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
      toast.success('Registration successful! Please log in.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to log out');
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
    } catch (error: any) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};