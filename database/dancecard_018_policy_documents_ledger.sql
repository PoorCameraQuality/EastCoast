-- Phase 4 P4.4 — versioned policy documents + per-registrant acceptance ledger.
-- Apply after dancecard_017_program_slot_photo_policy.sql.

CREATE TABLE IF NOT EXISTS dancecard_policy_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('coc', 'waiver', 'photo', 'marketing')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  title text NOT NULL,
  body_markdown text NOT NULL DEFAULT '',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_policy_documents_event_kind_version_uidx UNIQUE (event_id, kind, version)
);

CREATE INDEX IF NOT EXISTS dancecard_policy_documents_event_kind_idx ON dancecard_policy_documents (event_id, kind);

CREATE TABLE IF NOT EXISTS dancecard_registrant_policy_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registrant_id uuid NOT NULL REFERENCES dancecard_registrants (id) ON DELETE CASCADE,
  policy_document_id uuid NOT NULL REFERENCES dancecard_policy_documents (id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_reg_pol_accept_reg_doc_uidx UNIQUE (registrant_id, policy_document_id)
);

CREATE INDEX IF NOT EXISTS dancecard_reg_pol_accept_policy_idx ON dancecard_registrant_policy_acceptances (policy_document_id);
