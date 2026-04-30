-- Per-owner availability range + anonymous public claim support.

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS availability_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS availability_ends_at timestamptz;

ALTER TABLE dancecard_reservations
  ADD COLUMN IF NOT EXISTS guest_name text;

ALTER TABLE dancecard_reservations
  ALTER COLUMN guest_account_id DROP NOT NULL;

