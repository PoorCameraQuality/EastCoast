-- Mirror of supabase migration for local / manual apply.

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS allow_compare_by_username boolean NOT NULL DEFAULT false;
