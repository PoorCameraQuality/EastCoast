-- P6.4 — external attendee identity for upserts + inbound webhook verification.

ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS external_source text;
ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_registrants_event_source_extid_uidx
  ON dancecard_registrants (event_id, external_source, external_id)
  WHERE external_id IS NOT NULL AND external_source IS NOT NULL AND trim(external_id) <> '' AND trim(external_source) <> '';

CREATE INDEX IF NOT EXISTS dancecard_registrants_event_external_idx
  ON dancecard_registrants (event_id, external_source)
  WHERE external_source IS NOT NULL;

COMMENT ON COLUMN dancecard_registrants.external_source IS 'Import adapter id, e.g. eventbrite, csv, webhook_acme.';
COMMENT ON COLUMN dancecard_registrants.external_id IS 'Stable id from external system; used with external_source for upsert.';

CREATE TABLE IF NOT EXISTS dancecard_registrant_inbound_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  secret_hash text NOT NULL,
  label text NOT NULL DEFAULT 'default',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_registrant_inbound_secrets_event_label_uidx UNIQUE (event_id, label)
);

CREATE INDEX IF NOT EXISTS dancecard_registrant_inbound_secrets_event_idx ON dancecard_registrant_inbound_secrets (event_id);
