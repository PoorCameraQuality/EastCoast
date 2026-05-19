/**
 * Concatenate all dancecard SQL migrations into one Supabase-ready file.
 *
 * Usage: node scripts/build-dancecard-migration-bundle.mjs
 *
 * Output: database/dancecard_full_bundle.sql
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dbDir = path.join(root, 'database')

const files = [
  'dancecard_000_schema.sql',
  'dancecard_001_staff_shifts.sql',
  'dancecard_002_staff_gate.sql',
  'dancecard_003_selection_notes.sql',
  'dancecard_004_organizers.sql',
  'dancecard_005_availability_claims.sql',
  'dancecard_006_allow_compare_by_username.sql',
  'dancecard_007_organizer_import_workflow.sql',
  'dancecard_008_organizer_viewer_role.sql',
  'dancecard_009_program_slot_lifecycle.sql',
  'dancecard_010_tracks_tags.sql',
  'dancecard_011_people_slot_assignments.sql',
  'dancecard_012_registration.sql',
  'dancecard_013_location_hierarchy.sql',
  'dancecard_014_venue_maps_pins.sql',
  'dancecard_015_staff_shift_workflow.sql',
  'dancecard_016_dm_coverage_requirements.sql',
  'dancecard_017_program_slot_photo_policy.sql',
  'dancecard_018_policy_documents_ledger.sql',
  'dancecard_019_registrant_vetting_safety_role.sql',
  'dancecard_020_badges_layout_pronouns.sql',
  'dancecard_021_calendar_feed_tokens.sql',
  'dancecard_022_message_outbox.sql',
  'dancecard_023_events_updated_at.sql',
  'dancecard_024_registrant_external_webhook.sql',
  'dancecard_025_google_sheet_connections.sql',
  'dancecard_026_api_keys_webhooks_audit.sql',
  'dancecard_027_phase7_embed_entitlements.sql',
  'dancecard_028_program_slot_organizer_notes.sql',
  'dancecard_029_event_theme_config.sql',
  'dancecard_030_attendee_guide.sql',
  'dancecard_031_agreements.sql',
  'dancecard_032_unscheduled_program_slots.sql',
  'dancecard_033_registration_category_grants_staff.sql',
  'dancecard_034_registration_category_role_hours.sql',
  'dancecard_035_map_pin_zone_shapes.sql',
  'dancecard_036_registrant_checkin.sql',
  'dancecard_037_map_pin_rotation.sql',
  'dancecard_038_trusted_roles.sql',
  'dancecard_039_attendee_profile.sql',
  'dancecard_040_ops_summary_embed.sql',
  'dancecard_041_door_checkin_tokens.sql',
  'dancecard_042_safety_incidents.sql',
  'dancecard_043_program_slot_audit.sql',
  'dancecard_044_registration_question_categories.sql',
  'dancecard_045_ics_reminders.sql',
  'dancecard_046_person_follows.sql',
  'dancecard_047_compare_privacy.sql',
  'dancecard_048_compare_requests.sql',
  'dancecard_049_iso_board.sql',
  'dancecard_050_session_feedback.sql',
  'dancecard_051_registrant_badge_tagline.sql',
  'dancecard_052_badge_logo.sql',
  'dancecard_053_iso_comments.sql',
  'dancecard_seed_paf26_demo.sql',
]

let out =
  '-- =============================================================================\n' +
  '-- Dancecard — FULL migration bundle (generated)\n' +
  '-- Regenerate: npm run dancecard:build-migration-bundle\n' +
  '-- Paste once into Supabase SQL editor. Mostly idempotent (IF NOT EXISTS / ALTER … IF NOT EXISTS).\n' +
  '-- Final section upserts `paf26` event metadata; remove it if you do not use that slug.\n' +
  '-- Program slots are NOT in SQL — use npm run dancecard:import after this.\n' +
  '-- =============================================================================\n\n'

for (const name of files) {
  const fp = path.join(dbDir, name)
  if (!fs.existsSync(fp)) {
    console.error('Missing file:', fp)
    process.exit(1)
  }
  out += `\n-- ${'='.repeat(76)}\n-- ${name}\n-- ${'='.repeat(76)}\n\n`
  out += fs.readFileSync(fp, 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n'
}

const dest = path.join(dbDir, 'dancecard_full_bundle.sql')
fs.writeFileSync(dest, out)
console.log('Wrote', path.relative(root, dest), `(${files.length} files)`)
