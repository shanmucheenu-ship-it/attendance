import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  console.warn('Warning: VITE_SUPABASE_URL is not set or has placeholder value in .env');
}
if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('Warning: VITE_SUPABASE_ANON_KEY is not set or has placeholder value in .env');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
