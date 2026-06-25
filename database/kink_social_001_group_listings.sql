-- kink.social group listing ingest (Pass 4.1)
-- Apply in Supabase SQL Editor before enabling ECKE_PUBLISH_LISTING_WEBHOOK_URL.

CREATE TABLE IF NOT EXISTS group_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  public_location_summary text,
  tags text[] NOT NULL DEFAULT '{}',
  logo_url text,
  kink_social_canonical_url text,
  cta_url text,
  org_slug text,
  org_display_name text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  source_system text NOT NULL DEFAULT 'kink.social',
  c2k_source_type text NOT NULL DEFAULT 'group',
  c2k_source_id uuid NOT NULL,
  source_attribution text NOT NULL DEFAULT 'kink.social',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (c2k_source_type, c2k_source_id)
);

CREATE INDEX IF NOT EXISTS idx_group_listings_status ON group_listings (status);
CREATE INDEX IF NOT EXISTS idx_group_listings_source ON group_listings (c2k_source_type, c2k_source_id);
