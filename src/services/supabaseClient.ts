import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { toast } from 'react-hot-toast';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const error = 'Missing Supabase environment variables. Please check your configuration.';
  console.error(error);
  toast.error(error);
  throw new Error(error);
}

// Create Supabase client with enhanced configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'sheltercrest',
      'x-application-version': '1.0.0'
    }
  }
});

// Enhanced error handler with retry capability and better error messages
export const handleSupabaseError = async <T>(operation: () => Promise<T>): Promise<T> => {
  const maxRetries = 3;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`Supabase operation failed (attempt ${attempt}/${maxRetries}):`, error);

      // Handle specific error cases
      if (error.status === 401) {
        toast.error('Please log in to continue');
        throw error;
      }

      if (error.status === 403) {
        toast.error('You do not have permission to perform this action');
        throw error;
      }

      if (error.message?.includes('network')) {
        toast.error('Network error. Please check your internet connection');
        throw error;
      }

      // If we've exhausted all retries, show error and throw
      if (attempt === maxRetries) {
        toast.error(error.message || 'An unexpected error occurred');
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      attempt++;
    }
  }

  throw new Error('Max retries exceeded');
};

// Helper function to check if user is authenticated
export const requireAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('Authentication required');
  }
  return session;
};

// Helper function to check if user is admin
export const requireAdmin = async () => {
  const session = await requireAuth();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || !profile || !['admin', 'superadmin'].includes(profile.role)) {
    throw new Error('Admin access required');
  }
  return true;
};