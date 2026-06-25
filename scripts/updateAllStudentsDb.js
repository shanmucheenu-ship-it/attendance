import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mockStudents } from '../src/data/mockData.js';

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

async function run() {
  console.log("Deleting all existing students from Supabase...");
  const { error: deleteError } = await supabase.from('students').delete().neq('reg_no', ''); // Delete all
  if (deleteError) {
    console.error("Error deleting old students:", deleteError.message);
    process.exit(1);
  }
  console.log("Deleted all old students successfully.");

  console.log(`Seeding ${mockStudents.length} students in batches...`);
  const batchSize = 100;
  for (let i = 0; i < mockStudents.length; i += batchSize) {
    const batch = mockStudents.slice(i, i + batchSize);
    const { error: studentError } = await supabase.from('students').insert(
      batch.map(s => ({
        reg_no: s.regNo,
        name: s.name,
        gender: s.gender,
        year: s.year,
        section: s.section,
        department: s.department,
        department_code: s.departmentCode
      }))
    );
    if (studentError) {
      console.error(`Error seeding students batch ${i/batchSize}:`, studentError.message);
      process.exit(1);
    }
    console.log(`Seeded batch ${i/batchSize + 1}/${Math.ceil(mockStudents.length/batchSize)}`);
  }

  console.log("Successfully seeded all 3 years of students across all departments in Supabase!");
}

run();
