-- SEO hub tags (coarse slugs like rope, latex) — distinct from vendor taxonomy in app code.
-- Run after vendor_seo_000_vendors_core.sql

CREATE TABLE IF NOT EXISTS vendor_seo_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_seo_tag_links (
  vendor_id uuid NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES vendor_seo_tags (id) ON DELETE CASCADE,
  PRIMARY KEY (vendor_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_vendor_seo_tag_links_tag ON vendor_seo_tag_links (tag_id);
