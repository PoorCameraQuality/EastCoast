-- SEO hub tags for `/dungeons/[...slug]` programmatic hubs — run after dungeon_seo_000_dungeon_venues.sql

CREATE TABLE IF NOT EXISTS dungeon_seo_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dungeon_seo_tag_links (
  dungeon_venue_id uuid NOT NULL REFERENCES dungeon_venues (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES dungeon_seo_tags (id) ON DELETE CASCADE,
  PRIMARY KEY (dungeon_venue_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_dungeon_seo_tag_links_tag ON dungeon_seo_tag_links (tag_id);
