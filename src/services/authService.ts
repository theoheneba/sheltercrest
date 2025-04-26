import { supabase, handleSupabaseError } from './supabaseClient';
import { toast } from 'react-hot-toast';

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
    return handleSupabaseError(async () => {
      // First, attempt to sign in and get the session
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        if (authError.status === 401) {
          throw new Error('Invalid email or password');
        }
        throw authError;
      }
      
      if (!user) throw new Error('No user returned from authentication');

      // After successful authentication, fetch the user's profile with specific columns
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        // If profile fetch fails, sign out the user to clean up the session
        await supabase.auth.signOut();
        throw new Error('Failed to fetch user profile. Please try again.');
      }

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error('User profile not found');
      }

      // Map the profile data to our AuthUser interface
      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role as 'user' | 'admin' | 'superadmin'
      };
    });
  },

  async register(data: RegisterData): Promise<void> {
    return handleSupabaseError(async () => {
      // Create the auth user with email verification disabled
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName
          },
          emailRedirectTo: `${window.location.origin}/login`,
          // Disable email confirmation requirement
          emailConfirmTo: null
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Automatically confirm the user's email
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authData.user.id,
        { email_confirmed: true }
      );

      if (updateError) {
        throw new Error('Failed to confirm email automatically');
      }

      // The profile will be created automatically by the trigger function
      toast.success('Registration successful! Please log in.');
    });
  },

  async logout(): Promise<void> {
    return handleSupabaseError(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    });
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      return await handleSupabaseError(async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) return null;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) return null;

        return {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role as 'user' | 'admin' | 'superadmin'
        };
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};