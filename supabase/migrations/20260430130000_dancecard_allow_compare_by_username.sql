-- Opt-in: same-event signed-in users can compare availability by username (no share token).

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS allow_compare_by_username boolean NOT NULL DEFAULT false;
