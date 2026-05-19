-- Dancecard schema health check (read-only). Run in Supabase SQL editor.
-- Expect every row status = 'OK' (or 'SKIP' where noted). Final row: SUMMARY → PASS (000–059).
-- Schema: public. See database/README_DANCECARD.md.

WITH
expected_tables AS (
  SELECT unnest(ARRAY[
    'dancecard_accounts',
    'dancecard_api_keys',
    'dancecard_audit_log',
    'dancecard_calendar_feed_tokens',
    'dancecard_embed_tokens',
    'dancecard_event_dm_requirements',
    'dancecard_event_entitlements',
    'dancecard_event_maps',
    'dancecard_event_organizers',
    'dancecard_events',
    'dancecard_google_sheet_connections',
    'dancecard_import_batches',
    'dancecard_import_rows',
    'dancecard_locations',
    'dancecard_map_pins',
    'dancecard_message_campaigns',
    'dancecard_message_deliveries',
    'dancecard_message_templates',
    'dancecard_person_role_assignments',
    'dancecard_person_tags',
    'dancecard_persons',
    'dancecard_prefs',
    'dancecard_policy_documents',
    'dancecard_program_slot_persons',
    'dancecard_program_slot_tags',
    'dancecard_program_slots',
    'dancecard_registrant_answers',
    'dancecard_registrant_inbound_secrets',
    'dancecard_registrant_policy_acceptances',
    'dancecard_registrant_tags',
    'dancecard_registrants',
    'dancecard_registration_categories',
    'dancecard_registration_forms',
    'dancecard_registration_questions',
    'dancecard_reschedule_requests',
    'dancecard_reservations',
    'dancecard_schedule_audit_log',
    'dancecard_schedule_change_notifications',
    'dancecard_selections',
    'dancecard_sessions',
    'dancecard_share_links',
    'dancecard_shift_swap_requests',
    'dancecard_staff_shifts',
    'dancecard_tags',
    'dancecard_tracks',
    'dancecard_trusted_role_questions',
    'dancecard_trusted_roles',
    'dancecard_vetting_applications',
    'dancecard_webhook_deliveries',
    'dancecard_webhook_subscriptions',
    'dancecard_safety_incidents',
    'dancecard_program_slot_audit',
    'dancecard_compare_requests',
    'dancecard_compare_blocks',
    'dancecard_iso_posts',
    'dancecard_iso_interests',
    'dancecard_iso_comments',
    'dancecard_attendee_groups',
    'dancecard_attendee_group_members',
    'dancecard_attendee_group_join_requests',
    'dancecard_attendee_group_invites',
    'dancecard_attendee_group_questions',
    'dancecard_attendee_group_chores',
    'dancecard_attendee_group_bring_items',
    'dancecard_attendee_group_announcements',
    'dancecard_attendee_group_reports',
    'dancecard_attendee_group_chore_signups',
    'dancecard_attendee_group_bring_claims',
    'dancecard_session_feedback',
    'dancecard_person_follows'
  ])::text AS table_name
),
table_check AS (
  SELECT
    e.table_name,
    CASE WHEN t.table_name IS NOT NULL THEN 'OK' ELSE 'MISSING TABLE' END AS status
  FROM expected_tables e
  LEFT JOIN information_schema.tables t
    ON t.table_schema = 'public'
   AND t.table_name = e.table_name
   AND t.table_type = 'BASE TABLE'
),
expected_columns AS (
  SELECT * FROM (VALUES
    ('dancecard_events', 'staff_access_code'),
    ('dancecard_events', 'registration_access_code'),
    ('dancecard_events', 'badge_layout_json'),
    ('dancecard_events', 'updated_at'),
    ('dancecard_events', 'theme_config'),
    ('dancecard_events', 'attendee_guide_json'),
    ('dancecard_events', 'event_profile'),
    ('dancecard_events', 'agreements_config'),
    ('dancecard_events', 'feedback_config'),
    ('dancecard_events', 'badge_logo_path'),
    ('dancecard_registrants', 'check_in_token'),
    ('dancecard_registrants', 'badge_tagline'),
    ('dancecard_prefs', 'compare_visibility'),
    ('dancecard_prefs', 'show_in_compare_directory'),
    ('dancecard_accounts', 'is_staff'),
    ('dancecard_selections', 'note'),
    ('dancecard_prefs', 'allow_compare_by_username'),
    ('dancecard_prefs', 'availability_starts_at'),
    ('dancecard_prefs', 'availability_ends_at'),
    ('dancecard_reservations', 'guest_name'),
    ('dancecard_program_slots', 'location_id'),
    ('dancecard_program_slots', 'is_published'),
    ('dancecard_program_slots', 'visibility'),
    ('dancecard_program_slots', 'is_frozen'),
    ('dancecard_program_slots', 'updated_at'),
    ('dancecard_program_slots', 'track_id'),
    ('dancecard_program_slots', 'photo_policy'),
    ('dancecard_program_slots', 'organizer_notes_internal'),
    ('dancecard_staff_shifts', 'location_id'),
    ('dancecard_staff_shifts', 'shift_status'),
    ('dancecard_staff_shifts', 'claimed_by_account_id'),
    ('dancecard_staff_shifts', 'organizer_notes_staff_only'),
    ('dancecard_staff_shifts', 'dropped_at'),
    ('dancecard_staff_shifts', 'person_id'),
    ('dancecard_locations', 'parent_id'),
    ('dancecard_locations', 'kind'),
    ('dancecard_locations', 'accessibility_notes'),
    ('dancecard_locations', 'directions_public'),
    ('dancecard_locations', 'internal_notes'),
    ('dancecard_registrants', 'vetting_status'),
    ('dancecard_registrants', 'vetting_safety_notes'),
    ('dancecard_registrants', 'pronouns'),
    ('dancecard_registrants', 'external_source'),
    ('dancecard_registrants', 'external_id'),
    ('dancecard_registrants', 'last_synced_at'),
    ('dancecard_registrants', 'rabbitsign_folder_id'),
    ('dancecard_registrants', 'rabbitsign_status'),
    ('dancecard_registrants', 'checked_in_at'),
    ('dancecard_registrants', 'checked_in_timing'),
    ('dancecard_registrant_policy_acceptances', 'signer_name'),
    ('dancecard_registrant_policy_acceptances', 'signer_email'),
    ('dancecard_registrant_policy_acceptances', 'signature_method'),
    ('dancecard_registrant_policy_acceptances', 'provider_ref'),
    ('dancecard_registrant_policy_acceptances', 'ip_hash'),
    ('dancecard_webhook_deliveries', 'next_retry_at'),
    ('dancecard_registration_categories', 'grants_staff_access'),
    ('dancecard_registration_categories', 'role_kind'),
    ('dancecard_registration_categories', 'expected_hours'),
    ('dancecard_registration_categories', 'check_in_valid_from'),
    ('dancecard_registration_categories', 'check_in_valid_through'),
    ('dancecard_map_pins', 'shape'),
    ('dancecard_map_pins', 'width_frac'),
    ('dancecard_map_pins', 'height_frac'),
    ('dancecard_map_pins', 'rotation_deg'),
    ('dancecard_vetting_applications', 'trusted_role_id'),
    ('dancecard_trusted_roles', 'apply_slug'),
    ('dancecard_trusted_roles', 'status'),
    ('dancecard_trusted_role_questions', 'options_json')
  ) AS v(table_name, column_name)
),
column_check AS (
  SELECT
    e.table_name,
    e.column_name,
    CASE WHEN c.column_name IS NOT NULL THEN 'OK' ELSE 'MISSING COLUMN' END AS status
  FROM expected_columns e
  LEFT JOIN information_schema.columns c
    ON c.table_schema = 'public'
   AND c.table_name = e.table_name
   AND c.column_name = e.column_name
),
nullable_check AS (
  SELECT
    'dancecard_program_slots.starts_at' AS name,
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dancecard_program_slots' AND column_name = 'starts_at'
      ) THEN 'MISSING COLUMN'
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dancecard_program_slots'
          AND column_name = 'starts_at' AND is_nullable = 'YES'
      ) THEN 'OK'
      ELSE 'NOT NULLABLE (need 032)'
    END AS status
  UNION ALL
  SELECT
    'dancecard_program_slots.ends_at',
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dancecard_program_slots' AND column_name = 'ends_at'
      ) THEN 'MISSING COLUMN'
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'dancecard_program_slots'
          AND column_name = 'ends_at' AND is_nullable = 'YES'
      ) THEN 'OK'
      ELSE 'NOT NULLABLE (need 032)'
    END
),
expected_functions AS (
  SELECT unnest(ARRAY[
    'dancecard_touch_program_slot_updated_at',
    'dancecard_bump_event_updated_at_from_program_slot'
  ])::text AS proname
),
function_check AS (
  SELECT
    f.proname,
    CASE WHEN p.oid IS NOT NULL THEN 'OK' ELSE 'MISSING FUNCTION' END AS status
  FROM expected_functions f
  LEFT JOIN pg_proc p
    ON p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
   AND p.proname = f.proname
),
slot_oid AS (
  SELECT c.oid FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'dancecard_program_slots' AND c.relkind = 'r'
),
expected_triggers AS (
  SELECT unnest(ARRAY[
    'dancecard_program_slots_touch_updated_at',
    'dancecard_program_slots_touch_event_updated'
  ])::text AS tgname
),
trigger_check AS (
  SELECT
    e.tgname,
    CASE
      WHEN so.oid IS NULL THEN 'SKIP (no dancecard_program_slots table)'
      WHEN t.tgname IS NOT NULL THEN 'OK'
      ELSE 'MISSING TRIGGER'
    END AS status
  FROM expected_triggers e
  CROSS JOIN slot_oid so
  LEFT JOIN pg_trigger t
    ON t.tgrelid = so.oid
   AND NOT t.tgisinternal
   AND t.tgname = e.tgname
),
expected_constraints AS (
  SELECT * FROM (VALUES
    ('dancecard_events', 'dancecard_events_event_profile_check'),
    ('dancecard_registrant_policy_acceptances', 'dancecard_reg_pol_accept_signature_method_check'),
    ('dancecard_registrants', 'dancecard_registrants_rabbitsign_status_check'),
    ('dancecard_registration_categories', 'dancecard_registration_categories_role_kind_check'),
    ('dancecard_registration_categories', 'dancecard_registration_categories_expected_hours_check'),
    ('dancecard_registrants', 'dancecard_registrants_checked_in_timing_chk'),
    ('dancecard_map_pins', 'dancecard_map_pins_shape_chk'),
    ('dancecard_map_pins', 'dancecard_map_pins_width_frac_chk'),
    ('dancecard_map_pins', 'dancecard_map_pins_height_frac_chk'),
    ('dancecard_map_pins', 'dancecard_map_pins_rotation_deg_chk')
  ) AS v(table_name, constraint_name)
),
constraint_check AS (
  SELECT
    e.table_name,
    e.constraint_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class rel ON rel.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = rel.relnamespace
        WHERE n.nspname = 'public'
          AND rel.relname = e.table_name
          AND c.conname = e.constraint_name
      ) THEN 'OK'
      ELSE 'MISSING CONSTRAINT'
    END AS status
  FROM expected_constraints e
),
expected_indexes AS (
  SELECT unnest(ARRAY[
    'dancecard_trusted_roles_event_lower_slug_uidx',
    'dancecard_trusted_roles_event_idx',
    'dancecard_trusted_role_questions_role_sort_idx',
    'dancecard_vetting_applications_role_idx'
  ])::text AS index_name
),
index_check AS (
  SELECT
    e.index_name,
    CASE WHEN i.indexname IS NOT NULL THEN 'OK' ELSE 'MISSING INDEX' END AS status
  FROM expected_indexes e
  LEFT JOIN pg_indexes i
    ON i.schemaname = 'public'
   AND i.indexname = e.index_name
),
all_checks AS (
  SELECT 'TABLE' AS kind, table_name AS name, NULL::text AS detail, status FROM table_check
  UNION ALL
  SELECT 'COLUMN', table_name, column_name, status FROM column_check
  UNION ALL
  SELECT 'NULLABLE', name, NULL, status FROM nullable_check
  UNION ALL
  SELECT 'FUNCTION', proname, NULL, status FROM function_check
  UNION ALL
  SELECT 'TRIGGER', tgname, NULL, status FROM trigger_check
  UNION ALL
  SELECT 'CONSTRAINT', table_name, constraint_name, status FROM constraint_check
  UNION ALL
  SELECT 'INDEX', index_name, NULL, status FROM index_check
),
summary AS (
  SELECT
    count(*) FILTER (WHERE status = 'OK') AS ok_count,
    count(*) FILTER (WHERE status LIKE 'SKIP%') AS skip_count,
    count(*) FILTER (WHERE status NOT IN ('OK') AND status NOT LIKE 'SKIP%') AS fail_count,
    count(*) AS total_count
  FROM all_checks
)

-- Failures first (empty when fully migrated), then one SUMMARY row.
SELECT kind, name, detail, status
FROM all_checks
WHERE status NOT LIKE 'SKIP%'
  AND status <> 'OK'
UNION ALL
SELECT
  'SUMMARY',
  'migration_health',
  (SELECT ok_count::text || ' ok, ' || fail_count::text || ' fail, ' || total_count::text || ' checked' FROM summary),
  CASE WHEN (SELECT fail_count FROM summary) = 0 THEN 'PASS (000–059)' ELSE 'FAIL' END
ORDER BY CASE kind WHEN 'SUMMARY' THEN 1 ELSE 0 END, kind, name, detail NULLS FIRST;
