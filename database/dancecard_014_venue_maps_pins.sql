-- Phase 3 P3.2 — event floor maps and pins linked to locations.
-- Apply after dancecard_013_location_hierarchy.sql.

CREATE TABLE IF NOT EXISTS dancecard_event_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Venue map',
  image_path text NOT NULL,
  width_px integer,
  height_px integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_event_maps_event_sort_idx
  ON dancecard_event_maps (event_id, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_map_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES dancecard_event_maps (id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES dancecard_locations (id) ON DELETE CASCADE,
  x numeric NOT NULL CHECK (x >= 0 AND x <= 1),
  y numeric NOT NULL CHECK (y >= 0 AND y <= 1),
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_map_pins_map_location_uidx UNIQUE (map_id, location_id)
);

CREATE INDEX IF NOT EXISTS dancecard_map_pins_location_idx ON dancecard_map_pins (location_id);
