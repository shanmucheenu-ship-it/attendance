import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mockDepartments, mockStudents, defaultUsers, mockSubmittedSessions } from '../src/data/mockData.js';

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

async function seedData() {
  console.log("Starting Supabase seeding process...");

  // 1. Seed Departments
  console.log(`Seeding ${mockDepartments.length} departments...`);
  const { error: deptError } = await supabase.from('departments').insert(
    mockDepartments.map(d => ({ name: d.name, code: d.code }))
  );
  if (deptError) console.error("Error seeding departments:", deptError.message);
  else console.log("Departments seeded successfully.");

  // 2. Seed Users
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
  if (usersError) console.error("Error seeding users:", usersError.message);
  else console.log("Users seeded successfully.");

  // 3. Seed Students (in batches to avoid large payloads)
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
    }
  }
  console.log("Students seeded successfully.");

  // 4. Seed Attendance Sessions
  console.log(`Seeding ${mockSubmittedSessions.length} attendance sessions...`);
  const { error: attError } = await supabase.from('attendance_sessions').insert(
    mockSubmittedSessions.map(s => ({
      date: s.date,
      department: s.department,
      year: s.year,
      section: s.section,
      absentees_count: s.absenteesCount,
      status: s.status,
      forwarded_to_admin: s.forwardedToAdmin
    }))
  );
  if (attError) console.error("Error seeding attendance sessions:", attError.message);
  else console.log("Attendance sessions seeded successfully.");

  console.log("Seeding complete!");
}

seedData();
