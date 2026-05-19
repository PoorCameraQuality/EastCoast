-- Compare visibility, directory opt-in, blocks, busy-detail hiding.
ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS compare_visibility text NOT NULL DEFAULT 'off'
    CHECK (compare_visibility IN ('off', 'username', 'link_only'));

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS show_in_compare_directory boolean NOT NULL DEFAULT false;

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS hide_busy_details_in_compare boolean NOT NULL DEFAULT false;

-- Backfill compare_visibility from legacy boolean.
UPDATE dancecard_prefs
SET compare_visibility = CASE
  WHEN allow_compare_by_username IS TRUE THEN 'username'
  ELSE 'off'
END
WHERE compare_visibility = 'off' AND allow_compare_by_username IS TRUE;

CREATE TABLE IF NOT EXISTS dancecard_compare_blocks (
  event_id uuid NOT NULL REFERENCES dancecard_events(id) ON DELETE CASCADE,
  blocker_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  blocked_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, blocker_account_id, blocked_account_id),
  CHECK (blocker_account_id <> blocked_account_id)
);

CREATE INDEX IF NOT EXISTS idx_dancecard_compare_blocks_blocked
  ON dancecard_compare_blocks (event_id, blocked_account_id);
