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
  console.log("Starting update of 2nd Year Section A students in Supabase...");

  // 1. Delete existing students for 2nd Year Section A in Computer department
  console.log("Deleting existing students for Computer - 2nd Year - Section A...");
  const { error: deleteError } = await supabase
    .from('students')
    .delete()
    .eq('year', '2nd Year')
    .eq('section', 'A')
    .eq('department', 'Computer');

  if (deleteError) {
    console.error("Error deleting old students:", deleteError.message);
    process.exit(1);
  }
  console.log("Deleted old students successfully.");

  // 2. Filter students from mockStudents that match Computer - 2nd Year - Section A
  const comp2ndYearAStudents = mockStudents.filter(
    s => s.year === '2nd Year' && s.section === 'A' && s.department === 'Computer'
  );

  console.log(`Inserting ${comp2ndYearAStudents.length} new students...`);
  
  const { error: insertError } = await supabase.from('students').insert(
    comp2ndYearAStudents.map(s => ({
      reg_no: s.regNo,
      name: s.name,
      gender: s.gender,
      year: s.year,
      section: s.section,
      department: s.department,
      department_code: s.departmentCode
    }))
  );

  if (insertError) {
    console.error("Error inserting new students:", insertError.message);
    process.exit(1);
  }

  console.log("Successfully updated students in Supabase database!");
}

run();
