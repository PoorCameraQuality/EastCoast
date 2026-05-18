-- Check-in windows per ticket type and registrant check-in audit fields.
-- Apply after dancecard_035_map_pin_zone_shapes.sql.

ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS check_in_valid_from date;

ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS check_in_valid_through date;

ALTER TABLE dancecard_registrants
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

ALTER TABLE dancecard_registrants
  ADD COLUMN IF NOT EXISTS checked_in_timing text;

ALTER TABLE dancecard_registrants DROP CONSTRAINT IF EXISTS dancecard_registrants_checked_in_timing_chk;

ALTER TABLE dancecard_registrants
  ADD CONSTRAINT dancecard_registrants_checked_in_timing_chk
  CHECK (
    checked_in_timing IS NULL
    OR checked_in_timing IN ('on_time', 'late', 'early_override')
  );

COMMENT ON COLUMN dancecard_registration_categories.check_in_valid_from IS 'First calendar day (event-local) this ticket may check in.';
COMMENT ON COLUMN dancecard_registration_categories.check_in_valid_through IS 'Last calendar day (inclusive) this ticket may check in on time.';
COMMENT ON COLUMN dancecard_registrants.checked_in_at IS 'When desk marked this signup on-site.';
COMMENT ON COLUMN dancecard_registrants.checked_in_timing IS 'on_time, late, or early_override.';
