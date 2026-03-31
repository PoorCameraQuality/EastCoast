-- Physical venue / dungeon listings for optional Supabase sync (parallel to static `dungeons.js`).
-- Do not reuse `public.venues` (events discovery FK). Apply before tag junction tables.

CREATE TABLE IF NOT EXISTS dungeon_venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  city text,
  state text,
  website_url text,
  private_address boolean NOT NULL DEFAULT false,
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dungeon_venues_state ON dungeon_venues (state);
CREATE INDEX IF NOT EXISTS idx_dungeon_venues_city_state ON dungeon_venues (city, state);
