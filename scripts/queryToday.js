import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple .env parser
const loadEnv = () => {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        process.env[key] = value.trim();
      }
    });
  }
};

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTodayAttendance() {
  const today = '2026-06-05';
  console.log(`Checking attendance sessions for date: ${today}`);
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('date', today);
    
  if (error) {
    console.error("Error querying Supabase:", error);
    process.exit(1);
  }
  
  console.log("Found sessions:", JSON.stringify(data, null, 2));
}

checkTodayAttendance();
