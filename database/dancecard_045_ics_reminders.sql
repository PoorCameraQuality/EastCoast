-- Personal calendar export: VALARM offset before program selections (0 = off, default 15).
ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS ics_remind_before_minutes integer NOT NULL DEFAULT 15;

COMMENT ON COLUMN dancecard_prefs.ics_remind_before_minutes IS
  'Minutes before each saved program slot to emit ICS VALARM; 0 disables reminders.';
