-- UI Phase 2 — organizer-only session notes on program slots
ALTER TABLE dancecard_program_slots
  ADD COLUMN IF NOT EXISTS organizer_notes_internal text;

COMMENT ON COLUMN dancecard_program_slots.organizer_notes_internal IS
  'Staff/organizer-only notes; never exposed on public schedule APIs.';
