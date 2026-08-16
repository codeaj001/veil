// VEIL Supabase Client Module (Frontend)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && !supabaseUrl.includes('your-project-ref') && supabaseAnonKey && !supabaseAnonKey.includes('your-supabase-anon-key');

if (!isConfigured) {
  console.warn('[VEIL Supabase] Supabase URL or Anon Key not configured in .env. Running in local fallback mode.');
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => Promise.resolve({ data: [], error: null }),
        delete: () => Promise.resolve({ data: [], error: null })
      })
    };

export const isSupabaseConfigured = isConfigured;
