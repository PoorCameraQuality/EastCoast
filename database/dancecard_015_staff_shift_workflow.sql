-- Phase 4 P4.1 — staff / volunteer shift lifecycle (status, claim, staff-only notes, dropped).
-- Apply after dancecard_014_venue_maps_pins.sql.

ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS shift_status text NOT NULL DEFAULT 'assigned';

ALTER TABLE dancecard_staff_shifts DROP CONSTRAINT IF EXISTS dancecard_staff_shifts_shift_status_check;

ALTER TABLE dancecard_staff_shifts
  ADD CONSTRAINT dancecard_staff_shifts_shift_status_check CHECK (
    shift_status IN ('draft', 'open', 'assigned', 'dropped')
  );

ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS claimed_by_account_id uuid REFERENCES dancecard_accounts (id) ON DELETE SET NULL;

ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS organizer_notes_staff_only text;

ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS dropped_at timestamptz;

CREATE INDEX IF NOT EXISTS dancecard_staff_shifts_event_status_idx ON dancecard_staff_shifts (event_id, shift_status);

CREATE INDEX IF NOT EXISTS dancecard_staff_shifts_claimed_by_idx ON dancecard_staff_shifts (claimed_by_account_id)
WHERE claimed_by_account_id IS NOT NULL;
