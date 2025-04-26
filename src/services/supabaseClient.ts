import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { toast } from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables for Supabase configuration');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  const message = error.message || 'An error occurred while processing your request';
  toast.error(message);
  throw error;
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

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return true;
};