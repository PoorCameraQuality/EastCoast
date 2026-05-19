-- Attendee follows for program presenters (my presenters feed).
CREATE TABLE IF NOT EXISTS dancecard_person_follows (
  event_id uuid NOT NULL REFERENCES dancecard_events(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES dancecard_persons(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, account_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_dancecard_person_follows_account
  ON dancecard_person_follows (event_id, account_id);
