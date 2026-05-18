-- P6.5 — API keys, outbound webhooks, audit log.

CREATE TABLE IF NOT EXISTS dancecard_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  secret_hash text NOT NULL,
  scopes text[] NOT NULL DEFAULT ARRAY['read:program']::text[],
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_api_keys_event_idx ON dancecard_api_keys (event_id);

CREATE TABLE IF NOT EXISTS dancecard_webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  event_types text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_webhook_subscriptions_event_idx ON dancecard_webhook_subscriptions (event_id);

CREATE TABLE IF NOT EXISTS dancecard_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES dancecard_webhook_subscriptions (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
  attempt_count integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_webhook_deliveries_sub_idx ON dancecard_webhook_deliveries (subscription_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid,
  actor_api_key_id uuid REFERENCES dancecard_api_keys (id) ON DELETE SET NULL,
  event_id uuid REFERENCES dancecard_events (id) ON DELETE SET NULL,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS dancecard_audit_log_event_idx ON dancecard_audit_log (event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS dancecard_audit_log_actor_user_idx ON dancecard_audit_log (actor_user_id, created_at DESC);

COMMENT ON TABLE dancecard_api_keys IS 'Hashed secrets for external read/write API; plaintext shown once at mint.';
COMMENT ON TABLE dancecard_webhook_subscriptions IS 'Outbound HTTP callbacks for program/registrant changes.';
COMMENT ON TABLE dancecard_audit_log IS 'Append-only audit trail for API keys, clones, imports, and mutations.';
