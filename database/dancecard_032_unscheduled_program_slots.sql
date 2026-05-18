-- Allow program slots without schedule times (organizer "unassigned" library).
ALTER TABLE dancecard_program_slots
  ALTER COLUMN starts_at DROP NOT NULL,
  ALTER COLUMN ends_at DROP NOT NULL;
