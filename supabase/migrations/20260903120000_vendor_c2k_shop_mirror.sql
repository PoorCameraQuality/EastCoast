-- C2K shop mirror columns on public vendors.
-- Applied to Eastcoastkinkevents (affiefoslsewiwfqahhk) 2026-09-03.
-- C2K upserts these via REST. Unpublish still DELETEs the C2K-sourced row.

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS c2k_source_type text,
  ADD COLUMN IF NOT EXISTS c2k_source_id uuid,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS listings jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_hub_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tag_slugs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS kink_social_canonical_path text,
  ADD COLUMN IF NOT EXISTS accepts_commissions boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

COMMENT ON COLUMN public.vendors.listings IS
  'Public-safe product snapshot from kink.social (native first, then cached external). Cap 50.';
COMMENT ON COLUMN public.vendors.seo_hub_tags IS
  'ECKE /vendors/{hub} slugs (rope, leather, …). Reliable read path for C2K shops.';
COMMENT ON COLUMN public.vendors.kink_social_canonical_path IS
  'Path only, e.g. /vendors/{slug}. Never a kink.social host in the REST payload.';

CREATE INDEX IF NOT EXISTS vendors_c2k_source_idx
  ON public.vendors (c2k_source_id)
  WHERE c2k_source_id IS NOT NULL;
