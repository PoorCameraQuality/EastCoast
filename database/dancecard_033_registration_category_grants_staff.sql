-- Per-category flag: matching access_code also unlocks staff tools (dancecard staff/unlock).
ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS grants_staff_access boolean NOT NULL DEFAULT false;
