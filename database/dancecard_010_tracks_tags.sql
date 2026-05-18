-- Tracks (colored), tags (scoped), and session tag links (Phase 1).

CREATE TABLE IF NOT EXISTS dancecard_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#22d3ee',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_tracks_event_lower_name_uidx
  ON dancecard_tracks (event_id, lower(name));

CREATE INDEX IF NOT EXISTS dancecard_tracks_event_sort_idx ON dancecard_tracks (event_id, sort_order, name);

CREATE TABLE IF NOT EXISTS dancecard_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  scope text NOT NULL DEFAULT 'session' CHECK (scope IN ('session', 'person', 'registrant', 'location')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_tags_event_scope_lower_name_uidx
  ON dancecard_tags (event_id, scope, lower(name));

CREATE INDEX IF NOT EXISTS dancecard_tags_event_scope_idx ON dancecard_tags (event_id, scope);

CREATE TABLE IF NOT EXISTS dancecard_program_slot_tags (
  slot_id uuid NOT NULL REFERENCES dancecard_program_slots (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES dancecard_tags (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (slot_id, tag_id)
);

CREATE INDEX IF NOT EXISTS dancecard_program_slot_tags_tag_idx ON dancecard_program_slot_tags (tag_id);

ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS track_id uuid REFERENCES dancecard_tracks (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS dancecard_program_slots_track_id_idx ON dancecard_program_slots (track_id);

-- Backfill tracks from legacy text track (distinct per event).
INSERT INTO dancecard_tracks (event_id, name, color, sort_order)
SELECT DISTINCT s.event_id, trim(s.track), '#22d3ee', 0
FROM dancecard_program_slots s
WHERE s.track IS NOT NULL AND trim(s.track) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM dancecard_tracks t
    WHERE t.event_id = s.event_id AND lower(t.name) = lower(trim(s.track))
  );

UPDATE dancecard_program_slots s
SET track_id = t.id
FROM dancecard_tracks t
WHERE s.track_id IS NULL
  AND s.track IS NOT NULL AND trim(s.track) <> ''
  AND t.event_id = s.event_id AND lower(t.name) = lower(trim(s.track));
