-- Org-owned dungeon venues. Does not recreate events or C2K ingest columns.

ALTER TABLE public.dungeon_venues
  ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE public.dungeon_venues DROP CONSTRAINT IF EXISTS dungeon_venues_organization_id_fkey;
ALTER TABLE public.dungeon_venues
  ADD CONSTRAINT dungeon_venues_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_dungeon_venues_organization_id
  ON public.dungeon_venues (organization_id);

DROP POLICY IF EXISTS dungeon_venues_authenticated_select ON public.dungeon_venues;
CREATE POLICY dungeon_venues_authenticated_select ON public.dungeon_venues
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS dungeon_venues_owner_insert ON public.dungeon_venues;
CREATE POLICY dungeon_venues_owner_insert ON public.dungeon_venues
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS dungeon_venues_owner_update ON public.dungeon_venues;
CREATE POLICY dungeon_venues_owner_update ON public.dungeon_venues
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS dungeon_venues_owner_delete ON public.dungeon_venues;
CREATE POLICY dungeon_venues_owner_delete ON public.dungeon_venues
  FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
    )
  );
