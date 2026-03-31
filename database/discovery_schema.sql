-- Discovery engine: tags, event_tags, and optional column fixes on `events`.
-- Prerequisite: run discovery_000_events_core.sql first if `public.events` is missing.

-- Venues (no-op if already created in 000)
CREATE TABLE IF NOT EXISTS public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  city text NOT NULL,
  state text NOT NULL,
  address text,
  website text,
  allows_public_events boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venues_state_city ON public.venues (state, city);

-- Tags for SEO / filtering (many-to-many with events)
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags (slug);

-- Junction: requires public.events (uuid id). Run discovery_000_events_core.sql first if this fails.
CREATE TABLE IF NOT EXISTS public.event_tags (
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags (id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_event_tags_tag_id ON public.event_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON public.event_tags (event_id);

-- If `events` existed before discovery_000, add any missing columns
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.venues (id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizer_name text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_event_type_check'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_event_type_check
      CHECK (
        event_type IS NULL
        OR event_type IN ('munch', 'play_party', 'class', 'convention', 'social')
      );
  END IF;
END $$;

COMMENT ON COLUMN public.events.event_type IS 'Discovery filter: munch | play_party | class | convention | social';
COMMENT ON COLUMN public.events.venue_id IS 'Optional FK to public.venues';
COMMENT ON TABLE public.event_tags IS 'Many-to-many events ↔ tags';

-- Optional column for event ↔ dungeon listing linkage (apply `events_optional_dungeon_slug.sql`).
