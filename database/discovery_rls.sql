-- RLS for discovery tables (public read; writes via service role / existing API patterns)

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

-- Idempotent policy drops (Postgres may not have DROP POLICY IF EXISTS on older versions — use separate runs if needed)
DO $$
BEGIN
  DROP POLICY IF EXISTS "venues_select_public" ON public.venues;
  DROP POLICY IF EXISTS "tags_select_public" ON public.tags;
  DROP POLICY IF EXISTS "event_tags_select_public" ON public.event_tags;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "venues_select_public" ON public.venues FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tags_select_public" ON public.tags FOR SELECT TO anon, authenticated USING (true);

-- event_tags: readable if parent event is published (adjust if your events RLS differs)
CREATE POLICY "event_tags_select_public" ON public.event_tags FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_tags.event_id
        AND (e.status = 'published' OR e.status IS NULL)
    )
  );

COMMENT ON POLICY "event_tags_select_public" ON public.event_tags IS 'Expose tag rows only for published (or legacy null-status) events';
