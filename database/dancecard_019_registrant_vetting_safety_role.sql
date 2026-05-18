-- Phase 4 P4.5 — registrant vetting fields + organizer `safety` role for restricted notes.
-- Apply after dancecard_018_policy_documents_ledger.sql.

ALTER TABLE dancecard_event_organizers DROP CONSTRAINT IF EXISTS dancecard_event_organizers_role_check;

ALTER TABLE dancecard_event_organizers
  ADD CONSTRAINT dancecard_event_organizers_role_check CHECK (role IN ('owner', 'editor', 'viewer', 'safety'));

ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS vetting_status text NOT NULL DEFAULT 'none';

ALTER TABLE dancecard_registrants DROP CONSTRAINT IF EXISTS dancecard_registrants_vetting_status_check;

ALTER TABLE dancecard_registrants
  ADD CONSTRAINT dancecard_registrants_vetting_status_check CHECK (
    vetting_status IN ('none', 'pending', 'approved', 'rejected', 'hold')
  );

ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS vetting_safety_notes text;

CREATE INDEX IF NOT EXISTS dancecard_registrants_event_vetting_idx ON dancecard_registrants (event_id, vetting_status);
