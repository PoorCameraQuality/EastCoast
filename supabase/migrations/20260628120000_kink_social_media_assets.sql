-- kink.social photo manifest persistence (ECKE public renderer)
-- Additive: legacy imageUrl / og_image columns remain for dual-read rollback.

CREATE TABLE IF NOT EXISTS public.kink_social_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN (
    'education_article', 'convention', 'event', 'dungeon', 'vendor', 'group', 'organization', 'place', 'presenter'
  )),
  entity_slug text NOT NULL,
  c2k_source_id uuid NOT NULL,
  source_media_asset_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('hero', 'gallery', 'logo', 'thumbnail')),
  ordinal integer NOT NULL DEFAULT 0,
  public_url text NOT NULL,
  width integer,
  height integer,
  sha256_hash text,
  alt_text text,
  source_attribution text DEFAULT 'kink.social',
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_slug, source_media_asset_id),
  UNIQUE (entity_type, entity_slug, role, ordinal)
);

CREATE INDEX IF NOT EXISTS kink_social_media_assets_source_idx
  ON public.kink_social_media_assets (c2k_source_id, entity_type);

COMMENT ON TABLE public.kink_social_media_assets IS
  'Normalized photo rows synced from kink.social publish payloads (photos manifest v1).';

-- Optional hero pointer on articles (education uses og_image today; FK enables future joins)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS hero_media_asset_id uuid REFERENCES public.kink_social_media_assets(id) ON DELETE SET NULL;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS hero_media_asset_id uuid REFERENCES public.kink_social_media_assets(id) ON DELETE SET NULL;

ALTER TABLE public.dungeon_venues
  ADD COLUMN IF NOT EXISTS hero_media_asset_id uuid REFERENCES public.kink_social_media_assets(id) ON DELETE SET NULL;

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS hero_media_asset_id uuid REFERENCES public.kink_social_media_assets(id) ON DELETE SET NULL;
