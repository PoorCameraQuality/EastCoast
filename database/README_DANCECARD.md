# Dancecard SQL

Schema expectations and app-side delivery notes: **§3.3** (Phase 0), **§3.4** (Phase 1), **§3.5** (Phase 2), **§3.6** (Phase 3), **§3.7** (Phase 4), **§3.8** (Phase 5), **§3.9** (Phase 6), **§3.10** (Phase 7) in [docs/DANCECARD_MASTER_PRODUCT_ROADMAP.md](../docs/DANCECARD_MASTER_PRODUCT_ROADMAP.md).

## One-shot Supabase SQL editor

- **`dancecard_full_bundle.sql`** — concatenates **000 → 053 → PAF26 seed** in order. Paste the entire file into the Supabase SQL editor once (mostly idempotent). **Remove or skip the final seed block** if you do not use slug `paf26`. Regenerate after editing slices: `npm run dancecard:build-migration-bundle`.
- **Regenerate** after editing any slice: `npm run dancecard:build-migration-bundle` (writes `database/dancecard_full_bundle.sql`).

## Verify schema (Supabase SQL editor)

After migrations **000–053**, paste and run **`dancecard_verify_schema.sql`** (read-only). Failures list first; the last row should be **`SUMMARY` → `PASS (000–053)`** (or the highest version your verify file targets). It checks core `dancecard_*` tables, columns through **040** (attendee profile, ops-summary embed), nullable program slots (**032**), indexes, triggers, and bump/touch functions. It does **not** create Storage buckets.

## Phase 3 increment (existing DB already on 012)

If **`dancecard_000`…`012`** are already applied, paste only:

1. `dancecard_013_location_hierarchy.sql`
2. `dancecard_014_venue_maps_pins.sql`

in that order. Then configure Supabase **Storage** bucket **`dancecard-maps`** (see [docs/dancecard-first-run.md](../docs/dancecard-first-run.md)). Re-running **013** can fail on `ADD CONSTRAINT … parent_not_self_chk` if that constraint already exists.

## Phase 4 & 5 SQL increments (existing DB already on 014)

If **`015`–`020`** are not yet applied, run in order:

1. `dancecard_015_staff_shift_workflow.sql`
2. `dancecard_016_dm_coverage_requirements.sql`
3. `dancecard_017_program_slot_photo_policy.sql`
4. `dancecard_018_policy_documents_ledger.sql`
5. `dancecard_019_registrant_vetting_safety_role.sql`
6. `dancecard_020_badges_layout_pronouns.sql`
7. `dancecard_021_calendar_feed_tokens.sql` — subscribe URLs for public program ICS feeds (hashed token storage).
8. `dancecard_022_message_outbox.sql` — message templates, campaigns, per-recipient delivery log.

## Phase 6 SQL increments (existing DB already on 022)

If **`023`–`026`** are not yet applied, run in order:

1. `dancecard_023_events_updated_at.sql` — `dancecard_events.updated_at` + bump from program slot writes.
2. `dancecard_024_registrant_external_webhook.sql` — registrant `external_source` / `external_id` / `last_synced_at`; `dancecard_registrant_inbound_secrets`.
3. `dancecard_025_google_sheet_connections.sql` — per-user Google OAuth refresh token storage (ciphertext).
4. `dancecard_026_api_keys_webhooks_audit.sql` — API keys, outbound webhooks + deliveries, `dancecard_audit_log`.

## Phase 7 SQL increment (existing DB already on 026)

If **`027`** is not yet applied, run:

1. `dancecard_027_phase7_embed_entitlements.sql` — embed tokens (hashed), per-event module entitlements, `next_retry_at` on webhook deliveries, shift swap requests, vetting applications.

## Increment 028–038 (existing DB already on 027)

If **`028`–`038`** are not yet applied, run in order:

1. `dancecard_028_program_slot_organizer_notes.sql` through `dancecard_031_agreements.sql` (theme, guide, agreements).
2. `dancecard_032_unscheduled_program_slots.sql` — nullable program slot times.
3. `dancecard_033_registration_category_grants_staff.sql` — staff access from category codes.
4. `dancecard_034_registration_category_role_hours.sql` — category `role_kind` / `expected_hours`.
5. `dancecard_035_map_pin_zone_shapes.sql` — map pin zone shapes and sizes.
6. `dancecard_036_registrant_checkin.sql` — check-in windows and registrant check-in fields.
7. `dancecard_037_map_pin_rotation.sql` — map pin `rotation_deg` (+ check constraint).
8. `dancecard_038_trusted_roles.sql` — trusted roles and applications.
9. `dancecard_039_attendee_profile.sql` — attendee profile fields on events / prefs.
10. `dancecard_040_ops_summary_embed.sql` — `ops_summary` embed token kind.

Then run **`dancecard_verify_schema.sql`** and confirm **`PASS (000–040)`**.

## Apply via Postgres (`npm run dancecard:apply-migrations`)

Requires `DATABASE_URL` or `DIRECT_URL` in `.env.local` (database password from Supabase → Project Settings → Database, not API keys).

Default order: **000, 001, 002 … 053**. Optional: set **`DANCECARD_APPLY_SEED=1`** to also run `dancecard_seed_paf26_demo.sql` (upserts `paf26` event metadata).

**Storage (three buckets):** create **`dancecard-maps`** (venue floor plans), **`dancecard-event-assets`** (badge logos), and **`dancecard-profile-photos`** (attendee avatars). Override names with **`DANCECARD_*_BUCKET`** env vars (see `.env.example`). Service role uploads and signed URLs only. If you previously used a single bucket for everything, run **`npm run dancecard:migrate-storage`** after creating the new buckets (optional **`--dry-run`**).

## Individual files (reference)

- `dancecard_000_schema.sql` — core `dancecard_*` tables + indexes; includes `dancecard_staff_shifts` (same as 001 for greenfield).
- `dancecard_001_staff_shifts.sql` — redundant if 000 was applied; safe `IF NOT EXISTS`.
- `dancecard_002_staff_gate.sql` — `staff_access_code`, `is_staff`.
- `dancecard_003_selection_notes.sql` — selection `note` column.
- `dancecard_004_organizers.sql` — `dancecard_event_organizers`, `registration_access_code`. Grant access with `INSERT …` (see commented example in file).
- `dancecard_005_availability_claims.sql` — availability range on prefs; anonymous claim fields on reservations.
- `dancecard_006_allow_compare_by_username.sql` — `allow_compare_by_username` on prefs.
- `dancecard_007_organizer_import_workflow.sql` — locations, import batches/rows, audit log, schedule-change notifications, reschedule requests.
- `dancecard_008_organizer_viewer_role.sql` — organizer `viewer` role on `dancecard_event_organizers`.
- `dancecard_009_program_slot_lifecycle.sql` — program slot `is_published`, `visibility`, `is_frozen`, `updated_at` (+ trigger).
- `dancecard_010_tracks_tags.sql` — `dancecard_tracks`, `dancecard_tags`, `dancecard_program_slot_tags`, optional `track_id` on slots; backfills tracks from legacy `track` text.
- `dancecard_011_people_slot_assignments.sql` — `dancecard_persons`, `dancecard_person_role_assignments`, `dancecard_program_slot_persons`, `dancecard_person_tags`; nullable `person_id` on `dancecard_staff_shifts`.
- `dancecard_012_registration.sql` — registration categories, forms, questions, registrants, answers, registrant tags.
- `dancecard_013_location_hierarchy.sql` — `parent_id`, `kind`, `accessibility_notes`, `directions_public`, `internal_notes` on `dancecard_locations`.
- `dancecard_014_venue_maps_pins.sql` — `dancecard_event_maps`, `dancecard_map_pins`.
- `dancecard_015_staff_shift_workflow.sql` — staff shift lifecycle (`shift_status`, claim, staff-only notes, dropped).
- `dancecard_016_dm_coverage_requirements.sql` — `dancecard_event_dm_requirements` for DM coverage readiness.
- `dancecard_017_program_slot_photo_policy.sql` — `photo_policy` on program slots.
- `dancecard_018_policy_documents_ledger.sql` — policy documents + registrant acceptances.
- `dancecard_019_registrant_vetting_safety_role.sql` — `safety` organizer role, vetting columns on registrants.
- `dancecard_020_badges_layout_pronouns.sql` — `badge_layout_json` on events, `pronouns` on registrants.
- `dancecard_021_calendar_feed_tokens.sql` — opaque subscribe tokens (SHA-256 at rest) for `GET /api/dancecard/[slug]/feeds/ics`.
- `dancecard_022_message_outbox.sql` — `dancecard_message_templates`, `dancecard_message_campaigns`, `dancecard_message_deliveries`.
- `dancecard_023_events_updated_at.sql` — `updated_at` on `dancecard_events` for hub sorting.
- `dancecard_024_registrant_external_webhook.sql` — external id upsert columns; inbound webhook secret table.
- `dancecard_025_google_sheet_connections.sql` — Google Sheets OAuth connection per organizer user + event.
- `dancecard_026_api_keys_webhooks_audit.sql` — external API keys, outbound webhooks, audit log.
- `dancecard_027_phase7_embed_entitlements.sql` — embed tokens, entitlements JSON, webhook retry column, swap + vetting MVP tables.
- `dancecard_028_program_slot_organizer_notes.sql` — organizer-only notes on program slots.
- `dancecard_029_event_theme_config.sql` — `theme_config` jsonb on events.
- `dancecard_030_attendee_guide.sql` — `attendee_guide_json`, `event_profile` on events.
- `dancecard_031_agreements.sql` — `agreements_config`, policy acceptance audit fields, RabbitSign registrant status.
- `dancecard_032_unscheduled_program_slots.sql` — nullable `starts_at` / `ends_at` on program slots (unassigned library).
- `dancecard_033_registration_category_grants_staff.sql` — `grants_staff_access` on registration categories.
- `dancecard_034_registration_category_role_hours.sql` — `role_kind`, `expected_hours` on categories.
- `dancecard_035_map_pin_zone_shapes.sql` — map pin zone `shape`, `width_frac`, `height_frac`.
- `dancecard_036_registrant_checkin.sql` — category check-in windows; registrant `checked_in_at` / `checked_in_timing`.
- `dancecard_037_map_pin_rotation.sql` — `rotation_deg` on map pins.
- `dancecard_038_trusted_roles.sql` — trusted roles, questionnaire, vetting link column.
- `dancecard_039_attendee_profile.sql` — attendee profile config and display fields.
- `dancecard_040_ops_summary_embed.sql` — `ops_summary` embed token kind (separate from schedule/map).
- `dancecard_041_door_checkin_tokens.sql` — `check_in_token` on registrants for QR door check-in.
- `dancecard_042_safety_incidents.sql` — safety incident log table.
- `dancecard_043_program_slot_audit.sql` — organizer forensic audit for program slot edits.
- `dancecard_044_registration_question_categories.sql` — `required_for_category_ids` on registration questions.
- `dancecard_045_ics_reminders.sql` through `dancecard_055_chore_bring_signups.sql` — ICS reminders, follows, compare privacy/requests, ISO board, session feedback, badge fields, ISO comments, attendee groups (tent cities / room blocks), multi-slot chore/bring signups.
- `dancecard_056_account_notifications.sql` — unified in-app notification inbox.
- `dancecard_057_compare_social_prefs.sql` — compare request intent, attendee directory opt-in, favorited slots.
- `dancecard_058_meal_signups.sql` — event-scale meal periods and kitchen signups.
- `dancecard_059_exhibitors.sql` — exhibitor / sponsor directory.
- `dancecard_verify_schema.sql` — read-only Postgres checks; paste in Supabase after **053** (expect `PASS (000–053)`).
- `dancecard_seed_paf26_demo.sql` — upserts event `paf26` (no program rows; use `npm run dancecard:import`).

See [docs/dancecard-first-run.md](../docs/dancecard-first-run.md) for smoke tests and program import.

## Production Supabase RLS checklist (manual)

In the Supabase dashboard (not applied by repo migrations):

- `profiles.role` is not user-writable (service role / admin only).
- `submissions` are not readable by non-admin authenticated users.
- Run `articles_rls_policies.sql` if article RLS is missing.
