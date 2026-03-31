-- Phase 2 (optional): tie published events to a dungeon directory slug for real
-- "events at this venue" blocks (static `src/data/dungeons.js` or `dungeon_venues.slug`).
-- Run after `discovery_000_events_core.sql` / `discovery_schema.sql`.
-- No FK: slugs may exist only in static data until `dungeon_venues` is fully populated.

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS dungeon_slug text;

COMMENT ON COLUMN public.events.dungeon_slug IS
  'Optional site dungeon slug; align with dungeons.js / public.dungeon_venues.slug when present';

CREATE INDEX IF NOT EXISTS idx_events_dungeon_slug ON public.events (dungeon_slug)
  WHERE dungeon_slug IS NOT NULL;
