-- Phase 7 — public embed tokens, event module entitlements, webhook retry scheduling,
-- shift swap requests (MVP), vetting applications (MVP).

CREATE TABLE IF NOT EXISTS dancecard_embed_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  embed_kind text NOT NULL CHECK (embed_kind IN ('schedule', 'map')),
  token_hash text NOT NULL,
  label text,
  allowed_origins text[],
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_embed_tokens_event_idx ON dancecard_embed_tokens (event_id);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_embed_tokens_active_hash_uq
  ON dancecard_embed_tokens (token_hash)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE dancecard_embed_tokens IS 'Hashed secrets for iframe embeds (schedule/map); optional allowed_origins for parent page origins.';

CREATE TABLE IF NOT EXISTS dancecard_event_entitlements (
  event_id uuid PRIMARY KEY REFERENCES dancecard_events (id) ON DELETE CASCADE,
  modules jsonb NOT NULL DEFAULT '{"schedule_embed": true, "map_embed": true, "shift_swaps": false, "vetting_applications": false, "policy_public_summary": true}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE dancecard_event_entitlements IS 'Feature flags per event for Phase 7 modules; missing row = all enabled in app code for backwards compatibility.';

ALTER TABLE dancecard_webhook_deliveries
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz;

COMMENT ON COLUMN dancecard_webhook_deliveries.next_retry_at IS 'When set, cron may retry this failed delivery.';

CREATE TABLE IF NOT EXISTS dancecard_shift_swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  from_shift_id uuid NOT NULL REFERENCES dancecard_staff_shifts (id) ON DELETE CASCADE,
  to_shift_id uuid NOT NULL REFERENCES dancecard_staff_shifts (id) ON DELETE CASCADE,
  requester_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_shift_swap_requests_event_idx ON dancecard_shift_swap_requests (event_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_vetting_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  scene_display_name text NOT NULL,
  email text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'review', 'approved', 'rejected')),
  organizer_notes text,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_vetting_applications_event_idx ON dancecard_vetting_applications (event_id, created_at DESC);
