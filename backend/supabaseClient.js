// VEIL Supabase Server Client Module (Backend)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && !supabaseUrl.includes('your-project-ref') && serviceRoleKey && !serviceRoleKey.includes('your-supabase');

if (!isConfigured) {
  console.log('[VEIL Supabase Backend] Running in local in-memory fallback mode (Credentials pending in .env).');
}

export const supabaseServer = isConfigured
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export const isSupabaseServerConfigured = isConfigured;
