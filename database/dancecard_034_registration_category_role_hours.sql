-- Registration category role taxonomy + hours-of-service (comp/staff packages).
ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS role_kind text NOT NULL DEFAULT 'attendee';

ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS expected_hours numeric;

ALTER TABLE dancecard_registration_categories
  DROP CONSTRAINT IF EXISTS dancecard_registration_categories_role_kind_check;

ALTER TABLE dancecard_registration_categories
  ADD CONSTRAINT dancecard_registration_categories_role_kind_check
  CHECK (
    role_kind IN (
      'attendee',
      'staff',
      'volunteer',
      'presenter',
      'photographer',
      'vendor',
      'comp',
      'other'
    )
  );

ALTER TABLE dancecard_registration_categories
  DROP CONSTRAINT IF EXISTS dancecard_registration_categories_expected_hours_check;

ALTER TABLE dancecard_registration_categories
  ADD CONSTRAINT dancecard_registration_categories_expected_hours_check
  CHECK (expected_hours IS NULL OR expected_hours >= 0);
