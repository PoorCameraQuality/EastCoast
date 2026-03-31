-- Run in Supabase → SQL Editor (no app env required).
-- Expect: tags > 0; event_tags often 0; events/venues ≥ 0.

SELECT 'tags' AS name, count(*)::int AS n FROM public.tags
UNION ALL
SELECT 'event_tags', count(*)::int FROM public.event_tags
UNION ALL
SELECT 'events', count(*)::int FROM public.events
UNION ALL
SELECT 'venues', count(*)::int FROM public.venues
ORDER BY name;
