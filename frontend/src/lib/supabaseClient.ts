import { createClient } from '@supabase/supabase-js';

// Environment variables are required. Vite prefixes them with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables missing. Supabase client will not be functional.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');
export const supabaseEnabled = Boolean(supabaseUrl && supabaseKey);

