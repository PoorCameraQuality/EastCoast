-- Seed SEO hub tags (idempotent inserts via slug conflict).
-- Run after vendor_seo_001_tags_and_links.sql

INSERT INTO vendor_seo_tags (slug, label)
VALUES
  ('rope', 'Rope & bondage'),
  ('latex', 'Latex & rubber'),
  ('leather', 'Leather'),
  ('impact', 'Impact play'),
  ('restraints', 'Restraints & bondage'),
  ('clothing', 'Fetish clothing'),
  ('toys', 'Toys & insertables')
ON CONFLICT (slug) DO NOTHING;
