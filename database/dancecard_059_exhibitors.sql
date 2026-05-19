-- Exhibitor / sponsor directory (con-style)

CREATE TABLE IF NOT EXISTS dancecard_exhibitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  booth text,
  hours text,
  description text,
  logo_path text,
  tags text[] NOT NULL DEFAULT '{}',
  specials text,
  sort_order int NOT NULL DEFAULT 0,
  view_count int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_exhibitors_event_idx
  ON dancecard_exhibitors (event_id, sort_order) WHERE is_published = true;
