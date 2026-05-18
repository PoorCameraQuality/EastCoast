-- Rotation (degrees) for venue map zone overlays.
-- Apply after dancecard_035_map_pin_zone_shapes.sql.

ALTER TABLE dancecard_map_pins
  ADD COLUMN IF NOT EXISTS rotation_deg numeric NOT NULL DEFAULT 0;

ALTER TABLE dancecard_map_pins DROP CONSTRAINT IF EXISTS dancecard_map_pins_rotation_deg_chk;

ALTER TABLE dancecard_map_pins
  ADD CONSTRAINT dancecard_map_pins_rotation_deg_chk
  CHECK (rotation_deg >= -180 AND rotation_deg <= 180);

COMMENT ON COLUMN dancecard_map_pins.rotation_deg IS 'Clockwise rotation in degrees for the zone overlay (-180 to 180).';
