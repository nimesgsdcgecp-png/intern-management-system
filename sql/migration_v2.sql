-- Migration V2: Attendance, Task Status Review, and Activity Logs

BEGIN;

-- 1. Add 'review' to task_status enum
-- Note: In PostgreSQL, you cannot ADD a value to an enum inside a transaction block using ALTER TYPE.
-- So we use a workaround if needed, or the user can run this outside a transaction.
-- For this script, we'll try to add it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'review' AFTER 'in-progress';
  END IF;
END $$;

-- 2. Create Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present', -- 'present', 'late', 'half-day'
  total_hours NUMERIC(4,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- 3. Create Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g., 'task_created', 'report_submitted', 'clock_in'
  entity_type TEXT NOT NULL, -- e.g., 'task', 'report', 'attendance'
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

COMMIT;
