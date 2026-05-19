-- Multi-member signups for chores and bring list items.

ALTER TABLE dancecard_attendee_group_chores
  ADD COLUMN IF NOT EXISTS slots_needed integer NOT NULL DEFAULT 1
    CHECK (slots_needed >= 1 AND slots_needed <= 30),
  ADD COLUMN IF NOT EXISTS schedule_label text NOT NULL DEFAULT ''
    CHECK (char_length(schedule_label) <= 80);

ALTER TABLE dancecard_attendee_group_bring_items
  ADD COLUMN IF NOT EXISTS slots_needed integer NOT NULL DEFAULT 1
    CHECK (slots_needed >= 1 AND slots_needed <= 30),
  ADD COLUMN IF NOT EXISTS schedule_label text NOT NULL DEFAULT ''
    CHECK (char_length(schedule_label) <= 80);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_chore_signups (
  chore_id uuid NOT NULL REFERENCES dancecard_attendee_group_chores(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chore_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_chore_signups_account
  ON dancecard_attendee_group_chore_signups (account_id);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_bring_claims (
  item_id uuid NOT NULL REFERENCES dancecard_attendee_group_bring_items(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_bring_claims_account
  ON dancecard_attendee_group_bring_claims (account_id);

INSERT INTO dancecard_attendee_group_chore_signups (chore_id, account_id)
SELECT id, assigned_account_id
FROM dancecard_attendee_group_chores
WHERE assigned_account_id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO dancecard_attendee_group_bring_claims (item_id, account_id)
SELECT id, claimed_by_account_id
FROM dancecard_attendee_group_bring_items
WHERE claimed_by_account_id IS NOT NULL
ON CONFLICT DO NOTHING;
