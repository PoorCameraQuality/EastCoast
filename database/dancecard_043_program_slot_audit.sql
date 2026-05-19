-- Organizer forensic audit for program slot edits. Apply after dancecard_007_organizer_import_workflow.sql.

CREATE TABLE IF NOT EXISTS dancecard_program_slot_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  slot_id uuid REFERENCES dancecard_program_slots (id) ON DELETE SET NULL,
  actor_user_id uuid,
  action text NOT NULL,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_program_slot_audit_event_created_idx
  ON dancecard_program_slot_audit (event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS dancecard_program_slot_audit_slot_idx
  ON dancecard_program_slot_audit (slot_id, created_at DESC);
