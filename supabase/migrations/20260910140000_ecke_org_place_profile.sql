-- Org-owned dungeon/club profiles reuse public.dungeon_venues.
-- Do not invent a second places table. C2K rows stay published-by-default.

ALTER TABLE public.dungeon_venues
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS street_address text,
  ADD COLUMN IF NOT EXISTS hours text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'dungeon',
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS age_restriction text,
  ADD COLUMN IF NOT EXISTS accessibility text,
  ADD COLUMN IF NOT EXISTS dress_code text,
  ADD COLUMN IF NOT EXISTS photography_policy text,
  ADD COLUMN IF NOT EXISTS parking text,
  ADD COLUMN IF NOT EXISTS house_rules text,
  ADD COLUMN IF NOT EXISTS alcohol_policy text,
  ADD COLUMN IF NOT EXISTS membership_info text,
  ADD COLUMN IF NOT EXISTS first_timer_info text,
  ADD COLUMN IF NOT EXISTS seo_hub_tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.dungeon_venues DROP CONSTRAINT IF EXISTS dungeon_venues_status_check;
ALTER TABLE public.dungeon_venues
  ADD CONSTRAINT dungeon_venues_status_check CHECK (status IN ('draft', 'published'));

ALTER TABLE public.dungeon_venues DROP CONSTRAINT IF EXISTS dungeon_venues_kind_check;
ALTER TABLE public.dungeon_venues
  ADD CONSTRAINT dungeon_venues_kind_check
  CHECK (kind IN ('dungeon', 'club', 'play_space', 'social_club', 'studio', 'other'));

CREATE UNIQUE INDEX IF NOT EXISTS dungeon_venues_one_place_per_org
  ON public.dungeon_venues (organization_id)
  WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS dungeon_venues_status_idx
  ON public.dungeon_venues (status);

UPDATE public.dungeon_venues
SET published_at = COALESCE(published_at, last_synced_at, created_at)
WHERE status = 'published' AND published_at IS NULL;

DROP POLICY IF EXISTS dungeon_venues_anon_select ON public.dungeon_venues;
CREATE POLICY dungeon_venues_anon_select ON public.dungeon_venues
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS dungeon_venues_authenticated_select ON public.dungeon_venues;

DROP POLICY IF EXISTS dungeon_venues_owner_select ON public.dungeon_venues;
CREATE POLICY dungeon_venues_owner_select ON public.dungeon_venues
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
    )
  );

COMMENT ON COLUMN public.dungeon_venues.organization_id IS 'ECKE org-owned dungeon/club. Null for C2K ingest and static-backed rows.';
COMMENT ON COLUMN public.dungeon_venues.status IS 'draft stays out of public catalog, sitemap, and IndexNow.';
