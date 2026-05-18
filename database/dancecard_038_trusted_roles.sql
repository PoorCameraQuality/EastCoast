-- Trusted roles: special positions with custom application questionnaires and public apply links.
-- Apply after dancecard_027_phase7_embed_entitlements.sql (vetting applications table).

CREATE TABLE IF NOT EXISTS dancecard_trusted_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  apply_slug text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  intro_text text NOT NULL DEFAULT '',
  confirmation_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_trusted_roles_event_lower_slug_uidx
  ON dancecard_trusted_roles (event_id, lower(apply_slug));

CREATE INDEX IF NOT EXISTS dancecard_trusted_roles_event_idx
  ON dancecard_trusted_roles (event_id, sort_order, name);

CREATE TABLE IF NOT EXISTS dancecard_trusted_role_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES dancecard_trusted_roles (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (
    type IN (
      'text',
      'long_text',
      'email',
      'phone',
      'single_choice',
      'multi_choice',
      'dropdown',
      'date',
      'file_upload',
      'emergency_contact',
      'pronouns',
      'consent_matrix'
    )
  ),
  label text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  options_json jsonb NOT NULL DEFAULT '[]',
  visibility_rules_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_trusted_role_questions_role_sort_idx
  ON dancecard_trusted_role_questions (role_id, sort_order);

ALTER TABLE dancecard_vetting_applications
  ADD COLUMN IF NOT EXISTS trusted_role_id uuid REFERENCES dancecard_trusted_roles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS dancecard_vetting_applications_role_idx
  ON dancecard_vetting_applications (event_id, trusted_role_id, created_at DESC);
