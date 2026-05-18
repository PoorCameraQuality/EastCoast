-- Organizer import workflow, first-class locations, and attendee schedule-change notices.
-- Apply via Supabase SQL editor or npm run dancecard:apply-migrations with DANCECARD_SQL_FILES.

CREATE TABLE IF NOT EXISTS dancecard_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  short_name text,
  capacity integer,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_locations_event_lower_name_uidx
  ON dancecard_locations (event_id, lower(name));

ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL;
ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS dancecard_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  organizer_user_id uuid,
  kind text NOT NULL CHECK (kind IN ('program', 'staff')),
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'validated', 'published', 'discarded')),
  source_filename text,
  sheet_name text,
  column_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_import_batches_event_idx
  ON dancecard_import_batches (event_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES dancecard_import_batches (id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  row_key text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('program', 'staff')),
  action text NOT NULL DEFAULT 'add' CHECK (action IN ('add', 'update', 'delete', 'unchanged', 'ignore')),
  draft_status text NOT NULL DEFAULT 'unplaced' CHECK (draft_status IN ('unplaced', 'placed', 'invalid', 'ignored')),
  source_ref_id uuid,
  title text,
  person_name text,
  role text,
  track text,
  room text,
  location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_minutes integer,
  description text,
  raw_row jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_import_rows_batch_row_key_uidx
  ON dancecard_import_rows (batch_id, row_key);

CREATE INDEX IF NOT EXISTS dancecard_import_rows_batch_idx
  ON dancecard_import_rows (batch_id, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_schedule_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  batch_id uuid REFERENCES dancecard_import_batches (id) ON DELETE SET NULL,
  organizer_user_id uuid,
  action text NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_schedule_audit_log_event_idx
  ON dancecard_schedule_audit_log (event_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_schedule_change_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  program_slot_id uuid REFERENCES dancecard_program_slots (id) ON DELETE SET NULL,
  old_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  new_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  conflict_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'acknowledged', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_schedule_change_notifications_account_idx
  ON dancecard_schedule_change_notifications (account_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_reschedule_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  requester_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  recipient_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES dancecard_reservations (id) ON DELETE SET NULL,
  proposed_starts_at timestamptz NOT NULL,
  proposed_ends_at timestamptz NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_reschedule_requests_recipient_idx
  ON dancecard_reschedule_requests (recipient_account_id, status, created_at DESC);
