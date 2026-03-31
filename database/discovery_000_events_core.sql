-- RUN THIS FIRST if `public.events` does not exist yet (submissions API expects this table).
-- Then run discovery_schema.sql → discovery_seed_tags.sql → discovery_rls.sql

-- 1) Venues (referenced by events.venue_id)
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

-- 2) Events (matches src/app/api/events/route.ts + admin approve flow)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_title text,
  slug text NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  display_date text,
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  venue text,
  short_description text,
  long_description text,
  seo_description text,
  category text,
  tags text[] DEFAULT '{}',
  logo text,
  images text[] DEFAULT '{}',
  website text,
  organizer text,
  email text,
  phone text,
  organizer_website text,
  early_bird_price text,
  regular_price text,
  at_door_price text,
  includes text,
  features text,
  seo_title text,
  seo_keywords text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  submission_id uuid,
  -- Discovery / SEO columns (safe if you re-run discovery_schema.sql later)
  event_type text,
  venue_id uuid REFERENCES public.venues (id) ON DELETE SET NULL,
  meta_title text,
  meta_description text,
  organizer_name text
);

CREATE INDEX IF NOT EXISTS idx_events_state ON public.events (state);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);

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

COMMENT ON TABLE public.events IS 'Submitted/published events; site also uses static src/data/events.js for main listings';
