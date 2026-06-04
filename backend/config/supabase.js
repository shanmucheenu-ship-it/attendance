const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL ERROR: Supabase URL or Anon Key is missing in backend .env");
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

module.exports = { supabase };
