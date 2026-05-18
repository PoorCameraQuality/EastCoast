-- Phase 4 P4.3 — per-session photo / recording policy for media planning.
-- Apply after dancecard_016_dm_coverage_requirements.sql.

ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS photo_policy text NOT NULL DEFAULT 'allowed';

ALTER TABLE dancecard_program_slots DROP CONSTRAINT IF EXISTS dancecard_program_slots_photo_policy_check;

ALTER TABLE dancecard_program_slots
  ADD CONSTRAINT dancecard_program_slots_photo_policy_check CHECK (photo_policy IN ('allowed', 'restricted', 'none'));

COMMENT ON COLUMN dancecard_program_slots.photo_policy IS 'Organizer-only planning: allowed | restricted | none (public APIs do not expose internal vetting).';
