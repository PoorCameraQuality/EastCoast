-- Seed dungeon SEO hub tags (idempotent). Run after dungeon_seo_001_tags_and_links.sql

INSERT INTO dungeon_seo_tags (slug, label)
VALUES
  ('private', 'Private and vetted spaces'),
  ('public', 'Public-facing and newcomer-friendly spaces'),
  ('members-only', 'Members-only clubs and dungeons'),
  ('rope-friendly', 'Rope, shibari, and suspension-friendly venues'),
  ('impact-play', 'Impact play and dungeon equipment'),
  ('classes', 'Classes, workshops, and education-focused spaces')
ON CONFLICT (slug) DO NOTHING;
