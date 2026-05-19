-- Safety incident log. Apply after dancecard_019_registrant_vetting_safety_role.sql.

CREATE TABLE IF NOT EXISTS dancecard_safety_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  reported_at timestamptz NOT NULL DEFAULT now(),
  location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL,
  location_label text,
  involved_registrant_ids uuid[] NOT NULL DEFAULT '{}',
  involved_person_ids uuid[] NOT NULL DEFAULT '{}',
  summary text NOT NULL,
  safety_notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'closed')),
  created_by_user_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_safety_incidents_event_reported_idx
  ON dancecard_safety_incidents (event_id, reported_at DESC);
