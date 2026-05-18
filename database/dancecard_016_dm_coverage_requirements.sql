-- Phase 4 P4.2 — DM / play-space coverage requirements (minimum staff counts per location × time window).
-- Apply after dancecard_015_staff_shift_workflow.sql.

CREATE TABLE IF NOT EXISTS dancecard_event_dm_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES dancecard_locations (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  min_lead integer NOT NULL DEFAULT 1 CHECK (min_lead >= 0),
  min_float integer NOT NULL DEFAULT 0 CHECK (min_float >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_event_dm_requirements_event_loc_idx
  ON dancecard_event_dm_requirements (event_id, location_id, starts_at);
