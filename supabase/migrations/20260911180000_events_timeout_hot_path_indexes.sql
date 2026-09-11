-- Hot-path support for published upcoming event list/detail queries.
-- Backfill so filters can use end_date without OR-null branches.
UPDATE public.events
SET end_date = start_date
WHERE end_date IS NULL
  AND start_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_status_end_date
  ON public.events (status, end_date);

CREATE INDEX IF NOT EXISTS idx_events_status_start_date
  ON public.events (status, start_date);

CREATE INDEX IF NOT EXISTS idx_events_published_end_date
  ON public.events (end_date)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_events_published_dungeon_start
  ON public.events (dungeon_slug, start_date)
  WHERE status = 'published' AND dungeon_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_published_org_start
  ON public.events (organization_id, start_date)
  WHERE status = 'published' AND organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_published_national_end_date
  ON public.events (end_date)
  WHERE status = 'published' AND dungeon_slug IS NULL AND dungeon_venue_id IS NULL;
