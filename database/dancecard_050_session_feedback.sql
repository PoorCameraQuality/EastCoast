ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS feedback_config jsonb NOT NULL DEFAULT '{"enabled":false}'::jsonb;

CREATE TABLE IF NOT EXISTS dancecard_session_feedback (
  event_id uuid NOT NULL REFERENCES dancecard_events(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  program_slot_id uuid NOT NULL REFERENCES dancecard_program_slots(id) ON DELETE CASCADE,
  rating smallint CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, account_id, program_slot_id)
);

CREATE INDEX IF NOT EXISTS idx_dancecard_session_feedback_slot
  ON dancecard_session_feedback (event_id, program_slot_id);
