-- =============================================================================
-- Dancecard — FULL migration bundle (generated)
-- Regenerate: npm run dancecard:build-migration-bundle
-- Paste once into Supabase SQL editor. Mostly idempotent (IF NOT EXISTS / ALTER … IF NOT EXISTS).
-- Final section upserts `paf26` event metadata; remove it if you do not use that slug.
-- Program slots are NOT in SQL — use npm run dancecard:import after this.
-- =============================================================================


-- ============================================================================
-- dancecard_000_schema.sql
-- ============================================================================

-- Dancecard (multi-event) — apply in Supabase SQL editor or psql.
-- Accessed only from Next.js route handlers via service role (no RLS policies required for v1).

CREATE TABLE IF NOT EXISTS dancecard_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  product_title text NOT NULL,
  event_title text NOT NULL,
  subtitle text,
  timezone text NOT NULL,
  window_starts_at timestamptz NOT NULL,
  window_ends_at timestamptz NOT NULL,
  shared_by_label text NOT NULL,
  shared_by_detail text,
  logo_url text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dancecard_program_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  title text NOT NULL,
  track text,
  room text,
  description text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS dancecard_program_slots_event_starts_idx
  ON dancecard_program_slots (event_id, starts_at, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  username text NOT NULL,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_accounts_event_username_uidx
  ON dancecard_accounts (event_id, lower(username));

CREATE INDEX IF NOT EXISTS dancecard_accounts_event_idx ON dancecard_accounts (event_id);

CREATE TABLE IF NOT EXISTS dancecard_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_sessions_token_hash_uidx ON dancecard_sessions (token_hash);
CREATE INDEX IF NOT EXISTS dancecard_sessions_account_idx ON dancecard_sessions (account_id);

CREATE TABLE IF NOT EXISTS dancecard_prefs (
  account_id uuid PRIMARY KEY REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  buffer_minutes integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dancecard_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  slot_id uuid REFERENCES dancecard_program_slots (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  kind text NOT NULL
);

CREATE INDEX IF NOT EXISTS dancecard_selections_account_idx ON dancecard_selections (account_id);

CREATE TABLE IF NOT EXISTS dancecard_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  token text NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_share_links_token_uidx ON dancecard_share_links (token);
CREATE INDEX IF NOT EXISTS dancecard_share_links_account_idx ON dancecard_share_links (account_id);

CREATE TABLE IF NOT EXISTS dancecard_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  host_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  guest_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_reservations_host_idx ON dancecard_reservations (host_account_id);
CREATE INDEX IF NOT EXISTS dancecard_reservations_guest_idx ON dancecard_reservations (guest_account_id);
CREATE INDEX IF NOT EXISTS dancecard_reservations_event_idx ON dancecard_reservations (event_id);

-- Staff / volunteer shifts (Dancecard autofill). Same as dancecard_001_staff_shifts.sql for incremental apply.
CREATE TABLE IF NOT EXISTS dancecard_staff_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  person_name text NOT NULL,
  role text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS dancecard_staff_shifts_event_person_starts_idx
  ON dancecard_staff_shifts (event_id, person_name, starts_at, sort_order);

-- ============================================================================
-- dancecard_001_staff_shifts.sql
-- ============================================================================

-- Staff / volunteer shifts for Dancecard autofill (per event).
-- Apply in Supabase SQL editor after dancecard_000_schema.sql.

CREATE TABLE IF NOT EXISTS dancecard_staff_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  person_name text NOT NULL,
  role text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS dancecard_staff_shifts_event_person_starts_idx
  ON dancecard_staff_shifts (event_id, person_name, starts_at, sort_order);

-- ============================================================================
-- dancecard_002_staff_gate.sql
-- ============================================================================

-- Staff roster gate: shared code unlocks is_staff on the account (per-event via event_id on account).

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS staff_access_code text;

ALTER TABLE dancecard_accounts ADD COLUMN IF NOT EXISTS is_staff boolean NOT NULL DEFAULT false;

-- Default staff code for PAF26 — change in Supabase after apply if desired.
UPDATE dancecard_events
SET staff_access_code = 'PAF26-STAFF-2026'
WHERE slug = 'paf26' AND (staff_access_code IS NULL OR staff_access_code = '');

-- ============================================================================
-- dancecard_003_selection_notes.sql
-- ============================================================================

-- Private per-account notes on dance card selections.

ALTER TABLE dancecard_selections ADD COLUMN IF NOT EXISTS note text;

-- ============================================================================
-- dancecard_004_organizers.sql
-- ============================================================================

-- Organizer access + optional registration gate (shared code before register/login).
-- Apply via Supabase SQL editor or: npm run dancecard:apply-migrations with DANCECARD_SQL_FILES.

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS registration_access_code text;

CREATE TABLE IF NOT EXISTS dancecard_event_organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS dancecard_event_organizers_user_idx ON dancecard_event_organizers (user_id);
CREATE INDEX IF NOT EXISTS dancecard_event_organizers_event_idx ON dancecard_event_organizers (event_id);

-- Seed organizers (replace UUIDs with real auth.users ids from Supabase → Authentication → Users):
-- INSERT INTO dancecard_event_organizers (event_id, user_id, role)
-- SELECT id, '00000000-0000-0000-0000-000000000000'::uuid, 'owner'
-- FROM dancecard_events WHERE slug = 'paf26'
-- ON CONFLICT (event_id, user_id) DO NOTHING;

-- ============================================================================
-- dancecard_005_availability_claims.sql
-- ============================================================================

-- Per-owner availability range + anonymous public claim support.

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS availability_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS availability_ends_at timestamptz;

ALTER TABLE dancecard_reservations
  ADD COLUMN IF NOT EXISTS guest_name text;

ALTER TABLE dancecard_reservations
  ALTER COLUMN guest_account_id DROP NOT NULL;

-- ============================================================================
-- dancecard_006_allow_compare_by_username.sql
-- ============================================================================

-- Mirror of supabase migration for local / manual apply.

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS allow_compare_by_username boolean NOT NULL DEFAULT false;

-- ============================================================================
-- dancecard_007_organizer_import_workflow.sql
-- ============================================================================

-- Organizer import workflow, first-class locations, and attendee schedule-change notices.
-- Apply via Supabase SQL editor or npm run dancecard:apply-migrations with DANCECARD_SQL_FILES.

CREATE TABLE IF NOT EXISTS dancecard_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  short_name text,
  capacity integer,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_locations_event_lower_name_uidx
  ON dancecard_locations (event_id, lower(name));

ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL;
ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS dancecard_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  organizer_user_id uuid,
  kind text NOT NULL CHECK (kind IN ('program', 'staff')),
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'validated', 'published', 'discarded')),
  source_filename text,
  sheet_name text,
  column_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_import_batches_event_idx
  ON dancecard_import_batches (event_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES dancecard_import_batches (id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  row_key text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('program', 'staff')),
  action text NOT NULL DEFAULT 'add' CHECK (action IN ('add', 'update', 'delete', 'unchanged', 'ignore')),
  draft_status text NOT NULL DEFAULT 'unplaced' CHECK (draft_status IN ('unplaced', 'placed', 'invalid', 'ignored')),
  source_ref_id uuid,
  title text,
  person_name text,
  role text,
  track text,
  room text,
  location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_minutes integer,
  description text,
  raw_row jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_import_rows_batch_row_key_uidx
  ON dancecard_import_rows (batch_id, row_key);

CREATE INDEX IF NOT EXISTS dancecard_import_rows_batch_idx
  ON dancecard_import_rows (batch_id, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_schedule_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  batch_id uuid REFERENCES dancecard_import_batches (id) ON DELETE SET NULL,
  organizer_user_id uuid,
  action text NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_schedule_audit_log_event_idx
  ON dancecard_schedule_audit_log (event_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_schedule_change_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  program_slot_id uuid REFERENCES dancecard_program_slots (id) ON DELETE SET NULL,
  old_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  new_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  conflict_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'acknowledged', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_schedule_change_notifications_account_idx
  ON dancecard_schedule_change_notifications (account_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_reschedule_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  requester_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  recipient_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES dancecard_reservations (id) ON DELETE SET NULL,
  proposed_starts_at timestamptz NOT NULL,
  proposed_ends_at timestamptz NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_reschedule_requests_recipient_idx
  ON dancecard_reschedule_requests (recipient_account_id, status, created_at DESC);

-- ============================================================================
-- dancecard_008_organizer_viewer_role.sql
-- ============================================================================

-- Allow read-only organizer access (viewer) alongside owner/editor.
-- Apply after dancecard_004_organizers.sql (or any DB that already has dancecard_event_organizers).

ALTER TABLE dancecard_event_organizers DROP CONSTRAINT IF EXISTS dancecard_event_organizers_role_check;

ALTER TABLE dancecard_event_organizers
  ADD CONSTRAINT dancecard_event_organizers_role_check CHECK (role IN ('owner', 'editor', 'viewer'));

-- ============================================================================
-- dancecard_009_program_slot_lifecycle.sql
-- ============================================================================

-- Program slot lifecycle: publish/visibility/freeze + updated_at (Phase 1).

ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';

DO $$
BEGIN
  ALTER TABLE dancecard_program_slots ADD CONSTRAINT dancecard_program_slots_visibility_chk
    CHECK (visibility IN ('public', 'staff_only', 'secret'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS is_frozen boolean NOT NULL DEFAULT false;
ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION dancecard_touch_program_slot_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dancecard_program_slots_touch_updated_at ON dancecard_program_slots;
CREATE TRIGGER dancecard_program_slots_touch_updated_at
  BEFORE UPDATE ON dancecard_program_slots
  FOR EACH ROW EXECUTE FUNCTION dancecard_touch_program_slot_updated_at();

COMMENT ON COLUMN dancecard_program_slots.is_published IS 'When false, slot is hidden from public schedule (organizers still see it).';
COMMENT ON COLUMN dancecard_program_slots.visibility IS 'public: all attendees; staff_only: staff session cookie; secret: organizer-only.';
COMMENT ON COLUMN dancecard_program_slots.is_frozen IS 'When true, attendees cannot add/remove this slot on their dancecard.';

-- ============================================================================
-- dancecard_010_tracks_tags.sql
-- ============================================================================

-- Tracks (colored), tags (scoped), and session tag links (Phase 1).

CREATE TABLE IF NOT EXISTS dancecard_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#22d3ee',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_tracks_event_lower_name_uidx
  ON dancecard_tracks (event_id, lower(name));

CREATE INDEX IF NOT EXISTS dancecard_tracks_event_sort_idx ON dancecard_tracks (event_id, sort_order, name);

CREATE TABLE IF NOT EXISTS dancecard_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  scope text NOT NULL DEFAULT 'session' CHECK (scope IN ('session', 'person', 'registrant', 'location')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_tags_event_scope_lower_name_uidx
  ON dancecard_tags (event_id, scope, lower(name));

CREATE INDEX IF NOT EXISTS dancecard_tags_event_scope_idx ON dancecard_tags (event_id, scope);

CREATE TABLE IF NOT EXISTS dancecard_program_slot_tags (
  slot_id uuid NOT NULL REFERENCES dancecard_program_slots (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES dancecard_tags (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (slot_id, tag_id)
);

CREATE INDEX IF NOT EXISTS dancecard_program_slot_tags_tag_idx ON dancecard_program_slot_tags (tag_id);

ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS track_id uuid REFERENCES dancecard_tracks (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS dancecard_program_slots_track_id_idx ON dancecard_program_slots (track_id);

-- Backfill tracks from legacy text track (distinct per event).
INSERT INTO dancecard_tracks (event_id, name, color, sort_order)
SELECT DISTINCT s.event_id, trim(s.track), '#22d3ee', 0
FROM dancecard_program_slots s
WHERE s.track IS NOT NULL AND trim(s.track) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM dancecard_tracks t
    WHERE t.event_id = s.event_id AND lower(t.name) = lower(trim(s.track))
  );

UPDATE dancecard_program_slots s
SET track_id = t.id
FROM dancecard_tracks t
WHERE s.track_id IS NULL
  AND s.track IS NOT NULL AND trim(s.track) <> ''
  AND t.event_id = s.event_id AND lower(t.name) = lower(trim(s.track));

-- ============================================================================
-- dancecard_011_people_slot_assignments.sql
-- ============================================================================

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

-- ============================================================================
-- dancecard_012_registration.sql
-- ============================================================================

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

-- ============================================================================
-- dancecard_013_location_hierarchy.sql
-- ============================================================================

-- Phase 3 P3.1 — location hierarchy, kind, accessibility, public directions vs internal notes.
-- Apply after dancecard_012_registration.sql.

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL;

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS kind text;

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS accessibility_notes text;

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS directions_public text;

ALTER TABLE dancecard_locations
  ADD COLUMN IF NOT EXISTS internal_notes text;

CREATE INDEX IF NOT EXISTS dancecard_locations_event_parent_sort_idx
  ON dancecard_locations (event_id, parent_id, sort_order);

CREATE INDEX IF NOT EXISTS dancecard_locations_parent_idx
  ON dancecard_locations (parent_id)
  WHERE parent_id IS NOT NULL;

ALTER TABLE dancecard_locations
  ADD CONSTRAINT dancecard_locations_parent_not_self_chk
  CHECK (parent_id IS NULL OR parent_id <> id);

COMMENT ON COLUMN dancecard_locations.notes IS 'Legacy free-form notes; prefer internal_notes + directions_public for new work.';

-- ============================================================================
-- dancecard_014_venue_maps_pins.sql
-- ============================================================================

-- Phase 3 P3.2 — event floor maps and pins linked to locations.
-- Apply after dancecard_013_location_hierarchy.sql.

CREATE TABLE IF NOT EXISTS dancecard_event_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Venue map',
  image_path text NOT NULL,
  width_px integer,
  height_px integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_event_maps_event_sort_idx
  ON dancecard_event_maps (event_id, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_map_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES dancecard_event_maps (id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES dancecard_locations (id) ON DELETE CASCADE,
  x numeric NOT NULL CHECK (x >= 0 AND x <= 1),
  y numeric NOT NULL CHECK (y >= 0 AND y <= 1),
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_map_pins_map_location_uidx UNIQUE (map_id, location_id)
);

CREATE INDEX IF NOT EXISTS dancecard_map_pins_location_idx ON dancecard_map_pins (location_id);

-- ============================================================================
-- dancecard_015_staff_shift_workflow.sql
-- ============================================================================

-- Phase 4 P4.1 — staff / volunteer shift lifecycle (status, claim, staff-only notes, dropped).
-- Apply after dancecard_014_venue_maps_pins.sql.

ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS shift_status text NOT NULL DEFAULT 'assigned';

ALTER TABLE dancecard_staff_shifts DROP CONSTRAINT IF EXISTS dancecard_staff_shifts_shift_status_check;

ALTER TABLE dancecard_staff_shifts
  ADD CONSTRAINT dancecard_staff_shifts_shift_status_check CHECK (
    shift_status IN ('draft', 'open', 'assigned', 'dropped')
  );

ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS claimed_by_account_id uuid REFERENCES dancecard_accounts (id) ON DELETE SET NULL;

ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS organizer_notes_staff_only text;

ALTER TABLE dancecard_staff_shifts ADD COLUMN IF NOT EXISTS dropped_at timestamptz;

CREATE INDEX IF NOT EXISTS dancecard_staff_shifts_event_status_idx ON dancecard_staff_shifts (event_id, shift_status);

CREATE INDEX IF NOT EXISTS dancecard_staff_shifts_claimed_by_idx ON dancecard_staff_shifts (claimed_by_account_id)
WHERE claimed_by_account_id IS NOT NULL;

-- ============================================================================
-- dancecard_016_dm_coverage_requirements.sql
-- ============================================================================

-- Phase 4 P4.2 — DM / play-space coverage requirements (minimum staff counts per location × time window).
-- Apply after dancecard_015_staff_shift_workflow.sql.

CREATE TABLE IF NOT EXISTS dancecard_event_dm_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES dancecard_locations (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  min_lead integer NOT NULL DEFAULT 1 CHECK (min_lead >= 0),
  min_float integer NOT NULL DEFAULT 0 CHECK (min_float >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_event_dm_requirements_event_loc_idx
  ON dancecard_event_dm_requirements (event_id, location_id, starts_at);

-- ============================================================================
-- dancecard_017_program_slot_photo_policy.sql
-- ============================================================================

-- Phase 4 P4.3 — per-session photo / recording policy for media planning.
-- Apply after dancecard_016_dm_coverage_requirements.sql.

ALTER TABLE dancecard_program_slots ADD COLUMN IF NOT EXISTS photo_policy text NOT NULL DEFAULT 'allowed';

ALTER TABLE dancecard_program_slots DROP CONSTRAINT IF EXISTS dancecard_program_slots_photo_policy_check;

ALTER TABLE dancecard_program_slots
  ADD CONSTRAINT dancecard_program_slots_photo_policy_check CHECK (photo_policy IN ('allowed', 'restricted', 'none'));

COMMENT ON COLUMN dancecard_program_slots.photo_policy IS 'Organizer-only planning: allowed | restricted | none (public APIs do not expose internal vetting).';

-- ============================================================================
-- dancecard_018_policy_documents_ledger.sql
-- ============================================================================

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

-- ============================================================================
-- dancecard_019_registrant_vetting_safety_role.sql
-- ============================================================================

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

-- ============================================================================
-- dancecard_020_badges_layout_pronouns.sql
-- ============================================================================

-- Phase 4 P4.6 — badge layout JSON on event + optional pronouns on registrant for print/badge.
-- Apply after dancecard_019_registrant_vetting_safety_role.sql.

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS badge_layout_json jsonb NOT NULL DEFAULT '{}';

ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS pronouns text;

COMMENT ON COLUMN dancecard_events.badge_layout_json IS 'Organizer badge template: fonts, show fields, category stripe colors, etc.';

-- ============================================================================
-- dancecard_021_calendar_feed_tokens.sql
-- ============================================================================

-- Phase 5: opaque subscribe tokens for public-ish ICS program feeds (hashed at rest).

CREATE TABLE IF NOT EXISTS dancecard_calendar_feed_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('full', 'track', 'room', 'presenter')),
  filter_track_id uuid REFERENCES dancecard_tracks (id) ON DELETE SET NULL,
  filter_location_id uuid REFERENCES dancecard_locations (id) ON DELETE SET NULL,
  filter_person_id uuid REFERENCES dancecard_persons (id) ON DELETE SET NULL,
  token_hash text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_calendar_feed_tokens_event_idx ON dancecard_calendar_feed_tokens (event_id);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_calendar_feed_tokens_active_hash_uq
  ON dancecard_calendar_feed_tokens (token_hash)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE dancecard_calendar_feed_tokens IS 'Subscribe URLs for ICS feeds; store SHA-256 of secret token only.';

-- ============================================================================
-- dancecard_022_message_outbox.sql
-- ============================================================================

-- Phase 5: organizer message templates, campaigns, and delivery log (email MVP).

CREATE TABLE IF NOT EXISTS dancecard_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  body_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_message_templates_event_idx ON dancecard_message_templates (event_id);

CREATE TABLE IF NOT EXISTS dancecard_message_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES dancecard_message_templates (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_message_campaigns_event_idx ON dancecard_message_campaigns (event_id);

CREATE TABLE IF NOT EXISTS dancecard_message_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES dancecard_message_campaigns (id) ON DELETE CASCADE,
  to_address text NOT NULL,
  idempotency_key text NOT NULL,
  provider_message_id text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS dancecard_message_deliveries_campaign_idx ON dancecard_message_deliveries (campaign_id);

COMMENT ON TABLE dancecard_message_deliveries IS 'Per-recipient send log; idempotency_key prevents duplicate sends on retry.';

-- ============================================================================
-- dancecard_023_events_updated_at.sql
-- ============================================================================

-- P6.1 — track last activity on events for organizer hub sorting.

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE dancecard_events SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE dancecard_events ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE dancecard_events ALTER COLUMN updated_at SET NOT NULL;

CREATE OR REPLACE FUNCTION dancecard_bump_event_updated_at_from_program_slot()
RETURNS trigger AS $$
DECLARE
  eid uuid;
BEGIN
  eid := COALESCE(NEW.event_id, OLD.event_id);
  IF eid IS NOT NULL THEN
    UPDATE dancecard_events SET updated_at = now() WHERE id = eid;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dancecard_program_slots_touch_event_updated ON dancecard_program_slots;
CREATE TRIGGER dancecard_program_slots_touch_event_updated
  AFTER INSERT OR UPDATE OR DELETE ON dancecard_program_slots
  FOR EACH ROW
  EXECUTE FUNCTION dancecard_bump_event_updated_at_from_program_slot();

-- ============================================================================
-- dancecard_024_registrant_external_webhook.sql
-- ============================================================================

-- P6.4 — external attendee identity for upserts + inbound webhook verification.

ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS external_source text;
ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_registrants_event_source_extid_uidx
  ON dancecard_registrants (event_id, external_source, external_id)
  WHERE external_id IS NOT NULL AND external_source IS NOT NULL AND trim(external_id) <> '' AND trim(external_source) <> '';

CREATE INDEX IF NOT EXISTS dancecard_registrants_event_external_idx
  ON dancecard_registrants (event_id, external_source)
  WHERE external_source IS NOT NULL;

COMMENT ON COLUMN dancecard_registrants.external_source IS 'Import adapter id, e.g. eventbrite, csv, webhook_acme.';
COMMENT ON COLUMN dancecard_registrants.external_id IS 'Stable id from external system; used with external_source for upsert.';

CREATE TABLE IF NOT EXISTS dancecard_registrant_inbound_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  secret_hash text NOT NULL,
  label text NOT NULL DEFAULT 'default',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_registrant_inbound_secrets_event_label_uidx UNIQUE (event_id, label)
);

CREATE INDEX IF NOT EXISTS dancecard_registrant_inbound_secrets_event_idx ON dancecard_registrant_inbound_secrets (event_id);

-- ============================================================================
-- dancecard_025_google_sheet_connections.sql
-- ============================================================================

-- P6.3 — Google Sheets OAuth refresh token (encrypted blob) per organizer user + event.

CREATE TABLE IF NOT EXISTS dancecard_google_sheet_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  refresh_token_ciphertext text NOT NULL,
  spreadsheet_id text NOT NULL,
  sheet_title text,
  column_map_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dancecard_google_sheet_connections_event_user_uidx UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS dancecard_google_sheet_connections_event_idx ON dancecard_google_sheet_connections (event_id);

COMMENT ON TABLE dancecard_google_sheet_connections IS 'Stores Google OAuth refresh token ciphertext per Supabase user + Dancecard event; requires DANCECARD_GOOGLE_OAUTH_CLIENT_* env.';

-- ============================================================================
-- dancecard_026_api_keys_webhooks_audit.sql
-- ============================================================================

-- P6.5 — API keys, outbound webhooks, audit log.

CREATE TABLE IF NOT EXISTS dancecard_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  name text NOT NULL,
  secret_hash text NOT NULL,
  scopes text[] NOT NULL DEFAULT ARRAY['read:program']::text[],
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_api_keys_event_idx ON dancecard_api_keys (event_id);

CREATE TABLE IF NOT EXISTS dancecard_webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  event_types text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_webhook_subscriptions_event_idx ON dancecard_webhook_subscriptions (event_id);

CREATE TABLE IF NOT EXISTS dancecard_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES dancecard_webhook_subscriptions (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
  attempt_count integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_webhook_deliveries_sub_idx ON dancecard_webhook_deliveries (subscription_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid,
  actor_api_key_id uuid REFERENCES dancecard_api_keys (id) ON DELETE SET NULL,
  event_id uuid REFERENCES dancecard_events (id) ON DELETE SET NULL,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS dancecard_audit_log_event_idx ON dancecard_audit_log (event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS dancecard_audit_log_actor_user_idx ON dancecard_audit_log (actor_user_id, created_at DESC);

COMMENT ON TABLE dancecard_api_keys IS 'Hashed secrets for external read/write API; plaintext shown once at mint.';
COMMENT ON TABLE dancecard_webhook_subscriptions IS 'Outbound HTTP callbacks for program/registrant changes.';
COMMENT ON TABLE dancecard_audit_log IS 'Append-only audit trail for API keys, clones, imports, and mutations.';

-- ============================================================================
-- dancecard_027_phase7_embed_entitlements.sql
-- ============================================================================

-- Phase 7 — public embed tokens, event module entitlements, webhook retry scheduling,
-- shift swap requests (MVP), vetting applications (MVP).

CREATE TABLE IF NOT EXISTS dancecard_embed_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  embed_kind text NOT NULL CHECK (embed_kind IN ('schedule', 'map')),
  token_hash text NOT NULL,
  label text,
  allowed_origins text[],
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS dancecard_embed_tokens_event_idx ON dancecard_embed_tokens (event_id);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_embed_tokens_active_hash_uq
  ON dancecard_embed_tokens (token_hash)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE dancecard_embed_tokens IS 'Hashed secrets for iframe embeds (schedule/map); optional allowed_origins for parent page origins.';

CREATE TABLE IF NOT EXISTS dancecard_event_entitlements (
  event_id uuid PRIMARY KEY REFERENCES dancecard_events (id) ON DELETE CASCADE,
  modules jsonb NOT NULL DEFAULT '{"schedule_embed": true, "map_embed": true, "shift_swaps": false, "vetting_applications": false, "policy_public_summary": true}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE dancecard_event_entitlements IS 'Feature flags per event for Phase 7 modules; missing row = all enabled in app code for backwards compatibility.';

ALTER TABLE dancecard_webhook_deliveries
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz;

COMMENT ON COLUMN dancecard_webhook_deliveries.next_retry_at IS 'When set, cron may retry this failed delivery.';

CREATE TABLE IF NOT EXISTS dancecard_shift_swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  from_shift_id uuid NOT NULL REFERENCES dancecard_staff_shifts (id) ON DELETE CASCADE,
  to_shift_id uuid NOT NULL REFERENCES dancecard_staff_shifts (id) ON DELETE CASCADE,
  requester_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_shift_swap_requests_event_idx ON dancecard_shift_swap_requests (event_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_vetting_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  scene_display_name text NOT NULL,
  email text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'review', 'approved', 'rejected')),
  organizer_notes text,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_vetting_applications_event_idx ON dancecard_vetting_applications (event_id, created_at DESC);

-- ============================================================================
-- dancecard_028_program_slot_organizer_notes.sql
-- ============================================================================

-- UI Phase 2 — organizer-only session notes on program slots
ALTER TABLE dancecard_program_slots
  ADD COLUMN IF NOT EXISTS organizer_notes_internal text;

COMMENT ON COLUMN dancecard_program_slots.organizer_notes_internal IS
  'Staff/organizer-only notes; never exposed on public schedule APIs.';

-- ============================================================================
-- dancecard_029_event_theme_config.sql
-- ============================================================================

-- Dancecard 029: per-event theme_config for accent/surface CSS variables (UI Phase 4).
ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS theme_config jsonb NOT NULL DEFAULT '{}';

-- ============================================================================
-- dancecard_030_attendee_guide.sql
-- ============================================================================

-- Dancecard 030: organizer-authored attendee guide + event profile preset.
ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS attendee_guide_json jsonb NOT NULL DEFAULT '{}';

ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS event_profile text NOT NULL DEFAULT 'camp';

ALTER TABLE dancecard_events
  DROP CONSTRAINT IF EXISTS dancecard_events_event_profile_check;

ALTER TABLE dancecard_events
  ADD CONSTRAINT dancecard_events_event_profile_check
  CHECK (event_profile IN ('camp', 'hotel', 'party', 'conference'));

COMMENT ON COLUMN dancecard_events.attendee_guide_json IS 'Public attendee guide: ticketingUrl, rabbitsignUrl, checkInMarkdown, sections[].';
COMMENT ON COLUMN dancecard_events.event_profile IS 'Vocabulary preset: camp, hotel, party, conference.';

-- ============================================================================
-- dancecard_031_agreements.sql
-- ============================================================================

-- Dancecard 031: agreements config + acceptance audit fields + RabbitSign registrant status.

ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS agreements_config jsonb NOT NULL DEFAULT '{}';

ALTER TABLE dancecard_registrant_policy_acceptances
  ADD COLUMN IF NOT EXISTS signer_name text,
  ADD COLUMN IF NOT EXISTS signer_email text,
  ADD COLUMN IF NOT EXISTS signature_method text,
  ADD COLUMN IF NOT EXISTS provider_ref text,
  ADD COLUMN IF NOT EXISTS ip_hash text;

ALTER TABLE dancecard_registrant_policy_acceptances
  DROP CONSTRAINT IF EXISTS dancecard_reg_pol_accept_signature_method_check;

ALTER TABLE dancecard_registrant_policy_acceptances
  ADD CONSTRAINT dancecard_reg_pol_accept_signature_method_check
  CHECK (signature_method IS NULL OR signature_method IN ('ecke', 'rabbitsign', 'manual'));

ALTER TABLE dancecard_registrants
  ADD COLUMN IF NOT EXISTS rabbitsign_folder_id text,
  ADD COLUMN IF NOT EXISTS rabbitsign_status text;

ALTER TABLE dancecard_registrants
  DROP CONSTRAINT IF EXISTS dancecard_registrants_rabbitsign_status_check;

ALTER TABLE dancecard_registrants
  ADD CONSTRAINT dancecard_registrants_rabbitsign_status_check
  CHECK (rabbitsign_status IS NULL OR rabbitsign_status IN ('pending', 'signed', 'declined'));

COMMENT ON COLUMN dancecard_events.agreements_config IS 'mode: ecke|rabbitsign|hybrid, requiredPolicyKinds[], deadlineAt, rabbitsignApiKeyRef.';

-- ============================================================================
-- dancecard_032_unscheduled_program_slots.sql
-- ============================================================================

-- Allow program slots without schedule times (organizer "unassigned" library).
ALTER TABLE dancecard_program_slots
  ALTER COLUMN starts_at DROP NOT NULL,
  ALTER COLUMN ends_at DROP NOT NULL;

-- ============================================================================
-- dancecard_033_registration_category_grants_staff.sql
-- ============================================================================

-- Per-category flag: matching access_code also unlocks staff tools (dancecard staff/unlock).
ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS grants_staff_access boolean NOT NULL DEFAULT false;

-- ============================================================================
-- dancecard_034_registration_category_role_hours.sql
-- ============================================================================

-- Registration category role taxonomy + hours-of-service (comp/staff packages).
ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS role_kind text NOT NULL DEFAULT 'attendee';

ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS expected_hours numeric;

ALTER TABLE dancecard_registration_categories
  DROP CONSTRAINT IF EXISTS dancecard_registration_categories_role_kind_check;

ALTER TABLE dancecard_registration_categories
  ADD CONSTRAINT dancecard_registration_categories_role_kind_check
  CHECK (
    role_kind IN (
      'attendee',
      'staff',
      'volunteer',
      'presenter',
      'photographer',
      'vendor',
      'comp',
      'other'
    )
  );

ALTER TABLE dancecard_registration_categories
  DROP CONSTRAINT IF EXISTS dancecard_registration_categories_expected_hours_check;

ALTER TABLE dancecard_registration_categories
  ADD CONSTRAINT dancecard_registration_categories_expected_hours_check
  CHECK (expected_hours IS NULL OR expected_hours >= 0);

-- ============================================================================
-- dancecard_035_map_pin_zone_shapes.sql
-- ============================================================================

-- Zone shape and size on venue map pins (circle, square, rectangle, triangle).
-- Apply after dancecard_014_venue_maps_pins.sql.

ALTER TABLE dancecard_map_pins
  ADD COLUMN IF NOT EXISTS shape text NOT NULL DEFAULT 'circle';

ALTER TABLE dancecard_map_pins
  ADD COLUMN IF NOT EXISTS width_frac numeric NOT NULL DEFAULT 0.12;

ALTER TABLE dancecard_map_pins
  ADD COLUMN IF NOT EXISTS height_frac numeric NOT NULL DEFAULT 0.12;

ALTER TABLE dancecard_map_pins DROP CONSTRAINT IF EXISTS dancecard_map_pins_shape_chk;

ALTER TABLE dancecard_map_pins
  ADD CONSTRAINT dancecard_map_pins_shape_chk
  CHECK (shape IN ('circle', 'square', 'rectangle', 'triangle'));

ALTER TABLE dancecard_map_pins DROP CONSTRAINT IF EXISTS dancecard_map_pins_width_frac_chk;

ALTER TABLE dancecard_map_pins
  ADD CONSTRAINT dancecard_map_pins_width_frac_chk
  CHECK (width_frac > 0 AND width_frac <= 0.75);

ALTER TABLE dancecard_map_pins DROP CONSTRAINT IF EXISTS dancecard_map_pins_height_frac_chk;

ALTER TABLE dancecard_map_pins
  ADD CONSTRAINT dancecard_map_pins_height_frac_chk
  CHECK (height_frac > 0 AND height_frac <= 0.75);

COMMENT ON COLUMN dancecard_map_pins.shape IS 'Zone overlay shape on the floor plan.';
COMMENT ON COLUMN dancecard_map_pins.width_frac IS 'Zone width as fraction of map width (0-1).';
COMMENT ON COLUMN dancecard_map_pins.height_frac IS 'Zone height as fraction of map height (0-1).';

-- ============================================================================
-- dancecard_036_registrant_checkin.sql
-- ============================================================================

-- Check-in windows per ticket type and registrant check-in audit fields.
-- Apply after dancecard_035_map_pin_zone_shapes.sql.

ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS check_in_valid_from date;

ALTER TABLE dancecard_registration_categories
  ADD COLUMN IF NOT EXISTS check_in_valid_through date;

ALTER TABLE dancecard_registrants
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

ALTER TABLE dancecard_registrants
  ADD COLUMN IF NOT EXISTS checked_in_timing text;

ALTER TABLE dancecard_registrants DROP CONSTRAINT IF EXISTS dancecard_registrants_checked_in_timing_chk;

ALTER TABLE dancecard_registrants
  ADD CONSTRAINT dancecard_registrants_checked_in_timing_chk
  CHECK (
    checked_in_timing IS NULL
    OR checked_in_timing IN ('on_time', 'late', 'early_override')
  );

COMMENT ON COLUMN dancecard_registration_categories.check_in_valid_from IS 'First calendar day (event-local) this ticket may check in.';
COMMENT ON COLUMN dancecard_registration_categories.check_in_valid_through IS 'Last calendar day (inclusive) this ticket may check in on time.';
COMMENT ON COLUMN dancecard_registrants.checked_in_at IS 'When desk marked this signup on-site.';
COMMENT ON COLUMN dancecard_registrants.checked_in_timing IS 'on_time, late, or early_override.';

-- ============================================================================
-- dancecard_037_map_pin_rotation.sql
-- ============================================================================

-- Rotation (degrees) for venue map zone overlays.
-- Apply after dancecard_035_map_pin_zone_shapes.sql.

ALTER TABLE dancecard_map_pins
  ADD COLUMN IF NOT EXISTS rotation_deg numeric NOT NULL DEFAULT 0;

ALTER TABLE dancecard_map_pins DROP CONSTRAINT IF EXISTS dancecard_map_pins_rotation_deg_chk;

ALTER TABLE dancecard_map_pins
  ADD CONSTRAINT dancecard_map_pins_rotation_deg_chk
  CHECK (rotation_deg >= -180 AND rotation_deg <= 180);

COMMENT ON COLUMN dancecard_map_pins.rotation_deg IS 'Clockwise rotation in degrees for the zone overlay (-180 to 180).';

-- ============================================================================
-- dancecard_038_trusted_roles.sql
-- ============================================================================

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

-- ============================================================================
-- dancecard_seed_paf26_demo.sql
-- ============================================================================

-- PAF26 dancecard event row (idempotent). Program slots are not inserted here.
-- After schema + this file, load the official Grid export:
--   npm run dancecard:parse-paf26
--   npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json
-- (Requires .env.local with Supabase service role for the import step.)

INSERT INTO dancecard_events (
  slug,
  product_title,
  event_title,
  subtitle,
  timezone,
  window_starts_at,
  window_ends_at,
  shared_by_label,
  shared_by_detail,
  logo_url,
  status
)
VALUES (
  'paf26',
  'East Coast Kink Events — Dancecard',
  'Primal Arts Festival 2026 (PAF26)',
  'Official program from the organizer Grid workbook (see docs/dancecard-first-run.md).',
  'America/New_York',
  timestamptz '2026-05-06 08:00:00-04',
  timestamptz '2026-05-13 02:00:00-04',
  'East Coast Kink Events',
  'Import ./data/paf26-program-slots.json after running npm run dancecard:parse-paf26.',
  NULL,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  product_title = EXCLUDED.product_title,
  event_title = EXCLUDED.event_title,
  subtitle = EXCLUDED.subtitle,
  timezone = EXCLUDED.timezone,
  window_starts_at = EXCLUDED.window_starts_at,
  window_ends_at = EXCLUDED.window_ends_at,
  shared_by_label = EXCLUDED.shared_by_label,
  shared_by_detail = EXCLUDED.shared_by_detail,
  logo_url = EXCLUDED.logo_url,
  status = EXCLUDED.status;
