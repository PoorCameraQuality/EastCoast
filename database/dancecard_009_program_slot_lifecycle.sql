-- Program slot lifecycle: publish/visibility/freeze + updated_at (Phase 1).

ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';

DO $$
BEGIN
  ALTER TABLE dancecard_program_slots ADD CONSTRAINT dancecard_program_slots_visibility_chk
    CHECK (visibility IN ('public', 'staff_only', 'secret'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS is_frozen boolean NOT NULL DEFAULT false;
ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION dancecard_touch_program_slot_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dancecard_program_slots_touch_updated_at ON dancecard_program_slots;
CREATE TRIGGER dancecard_program_slots_touch_updated_at
  BEFORE UPDATE ON dancecard_program_slots
  FOR EACH ROW EXECUTE FUNCTION dancecard_touch_program_slot_updated_at();

COMMENT ON COLUMN dancecard_program_slots.is_published IS 'When false, slot is hidden from public schedule (organizers still see it).';
COMMENT ON COLUMN dancecard_program_slots.visibility IS 'public: all attendees; staff_only: staff session cookie; secret: organizer-only.';
COMMENT ON COLUMN dancecard_program_slots.is_frozen IS 'When true, attendees cannot add/remove this slot on their dancecard.';
