-- P6.3 — Google Sheets OAuth refresh token (encrypted blob) per organizer user + event.

CREATE TABLE IF NOT EXISTS dancecard_google_sheet_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  refresh_token_ciphertext text NOT NULL,
  spreadsheet_id text NOT NULL,
  sheet_title text,
  column_map_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_google_sheet_connections_event_user_uidx UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS dancecard_google_sheet_connections_event_idx ON dancecard_google_sheet_connections (event_id);

COMMENT ON TABLE dancecard_google_sheet_connections IS 'Stores Google OAuth refresh token ciphertext per Supabase user + Dancecard event; requires DANCECARD_GOOGLE_OAUTH_CLIENT_* env.';
