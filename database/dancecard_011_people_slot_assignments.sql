-- Phase 2 — unified Person, session assignments, person tags, optional staff_shifts.person_id.
-- Apply after dancecard_010_tracks_tags.sql.

CREATE TABLE IF NOT EXISTS dancecard_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  scene_name text NOT NULL,
  legal_name text,
  pronouns text,
  email text,
  phone text,
  public_bio text,
  internal_notes text,
  photo_url text,
  show_legal_name_on_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_persons_event_scene_idx
  ON dancecard_persons (event_id, lower(scene_name));

CREATE INDEX IF NOT EXISTS dancecard_persons_event_idx ON dancecard_persons (event_id);

CREATE TABLE IF NOT EXISTS dancecard_person_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES dancecard_persons (id) ON DELETE CASCADE,
  role text NOT NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_person_role_assignments_role_len CHECK (char_length(role) >= 1 AND char_length(role) <= 80)
);

CREATE INDEX IF NOT EXISTS dancecard_person_role_assignments_person_idx
  ON dancecard_person_role_assignments (person_id);

CREATE TABLE IF NOT EXISTS dancecard_program_slot_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES dancecard_program_slots (id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES dancecard_persons (id) ON DELETE CASCADE,
  role text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_public_on_schedule boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_program_slot_persons_role_chk CHECK (
    role IN (
      'lead_presenter',
      'co_presenter',
      'moderator',
      'photographer',
      'dm',
      'volunteer',
      'staff'
    )
  ),
  CONSTRAINT dancecard_program_slot_persons_slot_person_uidx UNIQUE (slot_id, person_id, role)
);

CREATE INDEX IF NOT EXISTS dancecard_program_slot_persons_slot_idx
  ON dancecard_program_slot_persons (slot_id, sort_order);

CREATE INDEX IF NOT EXISTS dancecard_program_slot_persons_person_idx
  ON dancecard_program_slot_persons (person_id);

CREATE TABLE IF NOT EXISTS dancecard_person_tags (
  person_id uuid NOT NULL REFERENCES dancecard_persons (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES dancecard_tags (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (person_id, tag_id)
);

CREATE INDEX IF NOT EXISTS dancecard_person_tags_tag_idx ON dancecard_person_tags (tag_id);

ALTER TABLE dancecard_staff_shifts
  ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES dancecard_persons (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS dancecard_staff_shifts_person_id_idx
  ON dancecard_staff_shifts (person_id)
  WHERE person_id IS NOT NULL;
