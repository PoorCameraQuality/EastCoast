-- Phase 5: organizer message templates, campaigns, and delivery log (email MVP).

CREATE TABLE IF NOT EXISTS dancecard_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  body_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_message_templates_event_idx ON dancecard_message_templates (event_id);

CREATE TABLE IF NOT EXISTS dancecard_message_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES dancecard_message_templates (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_message_campaigns_event_idx ON dancecard_message_campaigns (event_id);

CREATE TABLE IF NOT EXISTS dancecard_message_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES dancecard_message_campaigns (id) ON DELETE CASCADE,
  to_address text NOT NULL,
  idempotency_key text NOT NULL,
  provider_message_id text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS dancecard_message_deliveries_campaign_idx ON dancecard_message_deliveries (campaign_id);

COMMENT ON TABLE dancecard_message_deliveries IS 'Per-recipient send log; idempotency_key prevents duplicate sends on retry.';
