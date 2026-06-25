-- Supabase Schema for Attendance Management System

-- Drop existing tables if re-running
DROP TABLE IF EXISTS attendance_sessions;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

-- 1. Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    department TEXT NOT NULL,
    department_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance Sessions Table
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    absentees_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending',
    forwarded_to_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate attendance submissions for the same class on the same day
ALTER TABLE attendance_sessions ADD CONSTRAINT unique_attendance_per_class_date UNIQUE (date, department, year, section);

-- Enable Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Create totally open policies for the ANON key (for development/migration purposes)
CREATE POLICY "Allow anonymous read access on departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on departments" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on departments" ON departments FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on departments" ON departments FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on users" ON users FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on students" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on students" ON students FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access on attendance_sessions" ON attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on attendance_sessions" ON attendance_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on attendance_sessions" ON attendance_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on attendance_sessions" ON attendance_sessions FOR DELETE USING (true);

-- Enable Realtime for attendance_sessions
alter publication supabase_realtime add table attendance_sessions;

-- 5. Student Requests Table
CREATE TABLE student_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_type TEXT NOT NULL,
    name TEXT NOT NULL,
    reg_no TEXT NOT NULL,
    gender TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    department TEXT NOT NULL,
    reason TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access on student_requests" ON student_requests FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on student_requests" ON student_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on student_requests" ON student_requests FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on student_requests" ON student_requests FOR DELETE USING (true);

alter publication supabase_realtime add table student_requests;
