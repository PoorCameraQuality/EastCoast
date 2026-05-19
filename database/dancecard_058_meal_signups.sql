-- Event-scale meal periods and attendee signups (kitchen rollup)

CREATE TABLE IF NOT EXISTS dancecard_meal_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  label text NOT NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_meal_periods_event_idx
  ON dancecard_meal_periods (event_id, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_meal_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  meal_period_id uuid NOT NULL REFERENCES dancecard_meal_periods (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  meal_choice text NOT NULL DEFAULT 'standard',
  dietary_notes text,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (meal_period_id, account_id)
);

CREATE INDEX IF NOT EXISTS dancecard_meal_signups_period_idx
  ON dancecard_meal_signups (meal_period_id, status);
