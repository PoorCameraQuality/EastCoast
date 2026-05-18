-- P6.1 — track last activity on events for organizer hub sorting.

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE dancecard_events SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE dancecard_events ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE dancecard_events ALTER COLUMN updated_at SET NOT NULL;

CREATE OR REPLACE FUNCTION dancecard_bump_event_updated_at_from_program_slot()
RETURNS trigger AS $$
DECLARE
  eid uuid;
BEGIN
  eid := COALESCE(NEW.event_id, OLD.event_id);
  IF eid IS NOT NULL THEN
    UPDATE dancecard_events SET updated_at = now() WHERE id = eid;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dancecard_program_slots_touch_event_updated ON dancecard_program_slots;
CREATE TRIGGER dancecard_program_slots_touch_event_updated
  AFTER INSERT OR UPDATE OR DELETE ON dancecard_program_slots
  FOR EACH ROW
  EXECUTE FUNCTION dancecard_bump_event_updated_at_from_program_slot();
