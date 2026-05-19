-- Unified in-app notification inbox (schedule change, reservations, reschedule, etc.)

CREATE TABLE IF NOT EXISTS dancecard_account_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (
    kind IN (
      'schedule_change',
      'reservation',
      'reschedule',
      'swap',
      'announcement',
      'starting_soon'
    )
  ),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_account_notifications_account_idx
  ON dancecard_account_notifications (account_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS dancecard_account_notifications_event_idx
  ON dancecard_account_notifications (event_id, created_at DESC);
