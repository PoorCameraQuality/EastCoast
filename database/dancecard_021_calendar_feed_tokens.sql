-- Phase 5: opaque subscribe tokens for public-ish ICS program feeds (hashed at rest).

CREATE TABLE IF NOT EXISTS dancecard_calendar_feed_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('full', 'track', 'room', 'presenter')),
  filter_track_id uuid REFERENCES dancecard_tracks (id) ON DELETE SET NULL,
  filter_location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL,
  filter_person_id uuid REFERENCES dancecard_persons (id) ON DELETE SET NULL,
  token_hash text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_calendar_feed_tokens_event_idx ON dancecard_calendar_feed_tokens (event_id);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_calendar_feed_tokens_active_hash_uq
  ON dancecard_calendar_feed_tokens (token_hash)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE dancecard_calendar_feed_tokens IS 'Subscribe URLs for ICS feeds; store SHA-256 of secret token only.';
