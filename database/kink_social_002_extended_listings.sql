-- kink.social extended listing projections (org, convention, presenter, venue)
-- Apply in Supabase SQL Editor before enabling extended entity types on the listing webhook.

CREATE TABLE IF NOT EXISTS organization_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  public_location_summary text,
  logo_url text,
  website_url text,
  kink_social_canonical_url text,
  cta_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  source_system text NOT NULL DEFAULT 'kink.social',
  c2k_source_type text NOT NULL DEFAULT 'organization',
  c2k_source_id uuid NOT NULL,
  source_attribution text NOT NULL DEFAULT 'kink.social',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (c2k_source_type, c2k_source_id)
);

CREATE TABLE IF NOT EXISTS convention_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  public_location_summary text,
  logo_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  kink_social_canonical_url text,
  cta_url text,
  org_slug text,
  org_display_name text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  source_system text NOT NULL DEFAULT 'kink.social',
  c2k_source_type text NOT NULL DEFAULT 'convention',
  c2k_source_id uuid NOT NULL,
  source_attribution text NOT NULL DEFAULT 'kink.social',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (c2k_source_type, c2k_source_id)
);

CREATE TABLE IF NOT EXISTS presenter_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  public_location_summary text,
  logo_url text,
  website_url text,
  kink_social_canonical_url text,
  cta_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  source_system text NOT NULL DEFAULT 'kink.social',
  c2k_source_type text NOT NULL DEFAULT 'presenter',
  c2k_source_id uuid NOT NULL,
  source_attribution text NOT NULL DEFAULT 'kink.social',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (c2k_source_type, c2k_source_id)
);

CREATE TABLE IF NOT EXISTS venue_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  public_location_summary text,
  city text,
  state text,
  logo_url text,
  website_url text,
  kink_social_canonical_url text,
  cta_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  source_system text NOT NULL DEFAULT 'kink.social',
  c2k_source_type text NOT NULL DEFAULT 'venue',
  c2k_source_id uuid NOT NULL,
  source_attribution text NOT NULL DEFAULT 'kink.social',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (c2k_source_type, c2k_source_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_listings_status ON organization_listings (status);
CREATE INDEX IF NOT EXISTS idx_convention_listings_status ON convention_listings (status);
CREATE INDEX IF NOT EXISTS idx_presenter_listings_status ON presenter_listings (status);
CREATE INDEX IF NOT EXISTS idx_venue_listings_status ON venue_listings (status);
