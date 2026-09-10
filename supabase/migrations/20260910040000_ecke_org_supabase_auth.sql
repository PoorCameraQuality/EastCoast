-- Link ECKE orgs to Supabase Auth. Does NOT recreate public.events.

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS owner_user_id uuid;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS username text;

ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_owner_user_id_fkey;
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_owner_user_id_fkey
  FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_owner_user_id_uidx
  ON public.organizations (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_username_uidx
  ON public.organizations (lower(username))
  WHERE username IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_owner_user_id
  ON public.organizations (owner_user_id);

DROP POLICY IF EXISTS organizations_owner_update ON public.organizations;
CREATE POLICY organizations_owner_update ON public.organizations
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS events_owner_select ON public.events;
CREATE POLICY events_owner_select ON public.events
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS events_owner_insert ON public.events;
CREATE POLICY events_owner_insert ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS events_owner_update ON public.events;
CREATE POLICY events_owner_update ON public.events
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

DROP POLICY IF EXISTS events_owner_delete ON public.events;
CREATE POLICY events_owner_delete ON public.events
  FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'user');
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
