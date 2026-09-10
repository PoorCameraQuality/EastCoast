-- ECKE org auth — ADDITIVE only.
-- Do NOT CREATE TABLE events. The live catalog is already public.events (82 published rows).

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  website text,
  description text,
  logo_url text,
  verified boolean NOT NULL DEFAULT false,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations (slug);
CREATE INDEX IF NOT EXISTS idx_organizations_verified ON public.organizations (verified);

CREATE TABLE IF NOT EXISTS public.org_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email text,
  last_login timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_credentials_org_id ON public.org_credentials (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_credentials_username ON public.org_credentials (username);
CREATE INDEX IF NOT EXISTS idx_org_credentials_email ON public.org_credentials (email);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organization_id uuid;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_organization_id_fkey;
ALTER TABLE public.events
  ADD CONSTRAINT events_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_organization_id ON public.events (organization_id);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS organizations_public_read ON public.organizations;
CREATE POLICY organizations_public_read ON public.organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS org_credentials_no_direct ON public.org_credentials;
CREATE POLICY org_credentials_no_direct ON public.org_credentials FOR ALL USING (false) WITH CHECK (false);

-- Supabase Auth ownership (see supabase/migrations/20260910040000_ecke_org_supabase_auth.sql)
CREATE UNIQUE INDEX IF NOT EXISTS organizations_owner_user_id_uidx
  ON public.organizations (owner_user_id)
  WHERE owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS organizations_username_uidx
  ON public.organizations (lower(username))
  WHERE username IS NOT NULL;
