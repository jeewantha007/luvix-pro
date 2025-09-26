import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase admin client for server-side operations
export const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

// Create regular Supabase client for user operations
export const supabase = (supabaseUrl && process.env.VITE_SUPABASE_ANON_KEY)
  ? createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY)
  : null;

export const config = {
  supabase: {
    url: supabaseUrl,
    hasServiceRole: !!serviceRoleKey,
    hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY
  }
};
