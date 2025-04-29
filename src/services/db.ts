import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  },
  db: {
    schema: 'public'
  },
  realtime: {
    enabled: true,
    params: {
      eventsPerSecond: 10
    }
  }
});

export const db = {
  execute: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
    const { data, error } = await supabase.rpc('execute_sql', { sql, args });
    if (error) throw error;
    return { rows: data || [] };
  }
};

export const handleDbError = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error('Database error:', error);
    
    if (error.code === '23505') {
      throw new Error('A record with this information already exists');
    }
    
    if (error.code === '23503') {
      throw new Error('Referenced record does not exist');
    }
    
    throw new Error('An unexpected database error occurred');
  }
};

// Subscribe to real-time changes
export const subscribeToChanges = (
  table: string,
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table
      },
      callback
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};