CREATE TABLE IF NOT EXISTS dancecard_compare_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events(id) ON DELETE CASCADE,
  from_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  to_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CHECK (from_account_id <> to_account_id)
);

CREATE INDEX IF NOT EXISTS idx_dancecard_compare_requests_to_pending
  ON dancecard_compare_requests (event_id, to_account_id)
  WHERE status = 'pending';
