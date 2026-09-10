-- Tie dated events to an org-owned dungeon/club. Still one public.events table.
-- dungeon_slug already exists for static/C2K matching; this adds a real FK.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS dungeon_venue_id uuid;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_dungeon_venue_id_fkey;
ALTER TABLE public.events
  ADD CONSTRAINT events_dungeon_venue_id_fkey
  FOREIGN KEY (dungeon_venue_id)
  REFERENCES public.dungeon_venues(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_dungeon_venue_id
  ON public.events (dungeon_venue_id)
  WHERE dungeon_venue_id IS NOT NULL;

COMMENT ON COLUMN public.events.dungeon_venue_id IS
  'Org-owned dungeon/club this dated event is hosted at. Null for hotel weekends and standalone listings.';
