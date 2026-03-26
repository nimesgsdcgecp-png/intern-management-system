-- Intern Management System - PostgreSQL Schema
-- Compatible with PostgreSQL 15+

BEGIN;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
   
 CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'intern');
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intern_status') THEN
    CREATE TYPE intern_status AS ENUM ('active', 'inactive');
  END IF;
END $$;

-- Core users table - Authentication data only
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles - Common profile data for all users
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Intern-specific data
CREATE TABLE IF NOT EXISTS interns (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  college_name TEXT,
  university TEXT,
  start_date DATE,
  end_date DATE,
  status intern_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT interns_date_check
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Tasks created by admin/mentor
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to_all BOOLEAN NOT NULL DEFAULT FALSE,
  deadline DATE,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Many-to-many task assignment (one task can be assigned to multiple interns)
CREATE TABLE IF NOT EXISTS task_assignments (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  intern_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (task_id, intern_id)
);

-- Intern daily/weekly reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  work_description TEXT NOT NULL,
  hours_worked NUMERIC(4,2) NOT NULL CHECK (hours_worked >= 0 AND hours_worked <= 24),
  mentor_feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Password reset tokens for password reset functionality
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT,
  otp_code TEXT,
  type TEXT NOT NULL CHECK (type IN ('otp', 'reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

CREATE INDEX IF NOT EXISTS idx_interns_mentor_id ON interns(mentor_id);
CREATE INDEX IF NOT EXISTS idx_interns_admin_id ON interns(admin_id);
CREATE INDEX IF NOT EXISTS idx_interns_status ON interns(status);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

CREATE INDEX IF NOT EXISTS idx_task_assignments_intern_id ON task_assignments(intern_id);

CREATE INDEX IF NOT EXISTS idx_reports_intern_id ON reports(intern_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_otp_code ON password_reset_tokens(otp_code);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_type ON password_reset_tokens(type);

-- Optional admin seed (safe to run multiple times)
-- Insert admin user
INSERT INTO users (id, email, password_hash, role)
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid,
  'admin@internship.com',
  '$2b$10$6ItCzbH7kFFuk5kKOIdgxOUOMJ.YNN1DF627B.0nHuVWvbMDrV3AG',
  'admin'
)
ON CONFLICT (id) DO NOTHING;

-- Insert admin profile
INSERT INTO profiles (user_id, name, department)
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid,
  'Aarav Shah',
  'AI'
)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
