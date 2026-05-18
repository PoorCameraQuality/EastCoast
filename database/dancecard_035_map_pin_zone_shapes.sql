-- Zone shape and size on venue map pins (circle, square, rectangle, triangle).
-- Apply after dancecard_014_venue_maps_pins.sql.

ALTER TABLE dancecard_map_pins
  ADD COLUMN IF NOT EXISTS shape text NOT NULL DEFAULT 'circle';

ALTER TABLE dancecard_map_pins
  ADD COLUMN IF NOT EXISTS width_frac numeric NOT NULL DEFAULT 0.12;

ALTER TABLE dancecard_map_pins
  ADD COLUMN IF NOT EXISTS height_frac numeric NOT NULL DEFAULT 0.12;

ALTER TABLE dancecard_map_pins DROP CONSTRAINT IF EXISTS dancecard_map_pins_shape_chk;

ALTER TABLE dancecard_map_pins
  ADD CONSTRAINT dancecard_map_pins_shape_chk
  CHECK (shape IN ('circle', 'square', 'rectangle', 'triangle'));

ALTER TABLE dancecard_map_pins DROP CONSTRAINT IF EXISTS dancecard_map_pins_width_frac_chk;

ALTER TABLE dancecard_map_pins
  ADD CONSTRAINT dancecard_map_pins_width_frac_chk
  CHECK (width_frac > 0 AND width_frac <= 0.75);

ALTER TABLE dancecard_map_pins DROP CONSTRAINT IF EXISTS dancecard_map_pins_height_frac_chk;

ALTER TABLE dancecard_map_pins
  ADD CONSTRAINT dancecard_map_pins_height_frac_chk
  CHECK (height_frac > 0 AND height_frac <= 0.75);

COMMENT ON COLUMN dancecard_map_pins.shape IS 'Zone overlay shape on the floor plan.';
COMMENT ON COLUMN dancecard_map_pins.width_frac IS 'Zone width as fraction of map width (0-1).';
COMMENT ON COLUMN dancecard_map_pins.height_frac IS 'Zone height as fraction of map height (0-1).';
