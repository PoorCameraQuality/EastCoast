-- Phase 3 P3.1 — location hierarchy, kind, accessibility, public directions vs internal notes.
-- Apply after dancecard_012_registration.sql.

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL;

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS kind text;

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS accessibility_notes text;

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS directions_public text;

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS internal_notes text;

CREATE INDEX IF NOT EXISTS dancecard_locations_event_parent_sort_idx
  ON dancecard_locations (event_id, parent_id, sort_order);

CREATE INDEX IF NOT EXISTS dancecard_locations_parent_idx
  ON dancecard_locations (parent_id)
  WHERE parent_id IS NOT NULL;

ALTER TABLE dancecard_locations
  ADD CONSTRAINT dancecard_locations_parent_not_self_chk
  CHECK (parent_id IS NULL OR parent_id <> id);

COMMENT ON COLUMN dancecard_locations.notes IS 'Legacy free-form notes; prefer internal_notes + directions_public for new work.';
