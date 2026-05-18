-- Phase 2 — registration categories, form + questions, registrants, answers, registrant tags.
-- Apply after dancecard_011_people_slot_assignments.sql.

CREATE TABLE IF NOT EXISTS dancecard_registration_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer CHECK (capacity IS NULL OR capacity >= 0),
  access_code text,
  external_source_ref text,
  imported_payment_status text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_registration_categories_event_lower_name_uidx
  ON dancecard_registration_categories (event_id, lower(name));

CREATE INDEX IF NOT EXISTS dancecard_registration_categories_event_idx
  ON dancecard_registration_categories (event_id, sort_order, name);

CREATE TABLE IF NOT EXISTS dancecard_registration_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  intro_text text NOT NULL DEFAULT '',
  confirmation_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_registration_forms_event_uidx UNIQUE (event_id)
);

CREATE TABLE IF NOT EXISTS dancecard_registration_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES dancecard_registration_forms (id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS dancecard_registration_questions_form_sort_idx
  ON dancecard_registration_questions (form_id, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_registrants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES dancecard_registration_categories (id) ON DELETE RESTRICT,
  person_id uuid REFERENCES dancecard_persons (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('imported', 'pending', 'confirmed', 'cancelled', 'waitlisted', 'checked_in')
  ),
  scene_display_name text NOT NULL DEFAULT '',
  legal_name text,
  email text,
  phone text,
  internal_notes text,
  consent_waiver_ack_at timestamptz,
  consent_photo_ack_at timestamptz,
  imported_payment_status text,
  external_source_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_registrants_event_status_idx
  ON dancecard_registrants (event_id, status);

CREATE INDEX IF NOT EXISTS dancecard_registrants_event_category_idx
  ON dancecard_registrants (event_id, category_id);

CREATE TABLE IF NOT EXISTS dancecard_registrant_answers (
  registrant_id uuid NOT NULL REFERENCES dancecard_registrants (id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES dancecard_registration_questions (id) ON DELETE CASCADE,
  value_json jsonb NOT NULL DEFAULT 'null',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (registrant_id, question_id)
);

CREATE TABLE IF NOT EXISTS dancecard_registrant_tags (
  registrant_id uuid NOT NULL REFERENCES dancecard_registrants (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES dancecard_tags (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (registrant_id, tag_id)
);

CREATE INDEX IF NOT EXISTS dancecard_registrant_tags_tag_idx ON dancecard_registrant_tags (tag_id);
