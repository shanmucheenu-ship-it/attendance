import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultUsers } from '../src/data/mockData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

async function run() {
  console.log("Deleting all existing users from Supabase...");
  const { error: deleteError } = await supabase.from('users').delete().neq('username', '');
  if (deleteError) {
    console.error("Error deleting old users:", deleteError.message);
    process.exit(1);
  }
  console.log("Deleted all old users successfully.");

  console.log(`Seeding ${defaultUsers.length} users...`);
  const { error: usersError } = await supabase.from('users').insert(
    defaultUsers.map(u => ({
      name: u.name,
      username: u.username,
      password: u.password,
      role: u.role,
      department: u.department
    }))
  );

  if (usersError) {
    console.error("Error seeding users:", usersError.message);
    process.exit(1);
  }

  console.log("Successfully updated all users in Supabase!");
}

run();
