/**
 * Apply dancecard SQL migrations to the remote Postgres database.
 *
 * Requires a direct Postgres URL (not the Supabase REST URL). Add to `.env.local`:
 *   DATABASE_URL=postgresql://postgres.[ref]:[YOUR-DB-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
 * or the "URI" from Supabase Dashboard → Project Settings → Database.
 *
 * Usage:
 *   node scripts/apply-dancecard-migrations.mjs
 *
 * Env: DATABASE_URL (or DIRECT_URL), optional DANCECARD_SQL_FILES=path1;path2
 * Optional: DANCECARD_APPLY_SEED=1 appends dancecard_seed_paf26_demo.sql (upserts `paf26` event row).
 *
 * One-file editor paste: run `npm run dancecard:build-migration-bundle` then open database/dancecard_full_bundle.sql
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config()

const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
if (!dbUrl) {
  const hintUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const m = hintUrl.match(/https?:\/\/([^.]+)\.supabase\.co/i)
  const ref = m ? m[1] : 'YOUR_PROJECT_REF'
  console.error(
    'Missing DATABASE_URL or DIRECT_URL in .env.local.\n' +
      'Get the database password from Supabase → Project Settings → Database (not the API keys).\n' +
      `Example for this project ref (${ref}):\n` +
      `  DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.${ref}.supabase.co:5432/postgres\n` +
      'Or use the "URI" connection string from the dashboard (pooler or direct). Then run this script again.',
  )
  process.exit(1)
}

const baseMigrationFiles = [
  path.join(root, 'database', 'dancecard_000_schema.sql'),
  path.join(root, 'database', 'dancecard_001_staff_shifts.sql'),
  path.join(root, 'database', 'dancecard_002_staff_gate.sql'),
  path.join(root, 'database', 'dancecard_003_selection_notes.sql'),
  path.join(root, 'database', 'dancecard_004_organizers.sql'),
  path.join(root, 'database', 'dancecard_005_availability_claims.sql'),
  path.join(root, 'database', 'dancecard_006_allow_compare_by_username.sql'),
  path.join(root, 'database', 'dancecard_007_organizer_import_workflow.sql'),
  path.join(root, 'database', 'dancecard_008_organizer_viewer_role.sql'),
  path.join(root, 'database', 'dancecard_009_program_slot_lifecycle.sql'),
  path.join(root, 'database', 'dancecard_010_tracks_tags.sql'),
  path.join(root, 'database', 'dancecard_011_people_slot_assignments.sql'),
  path.join(root, 'database', 'dancecard_012_registration.sql'),
  path.join(root, 'database', 'dancecard_013_location_hierarchy.sql'),
  path.join(root, 'database', 'dancecard_014_venue_maps_pins.sql'),
  path.join(root, 'database', 'dancecard_015_staff_shift_workflow.sql'),
  path.join(root, 'database', 'dancecard_016_dm_coverage_requirements.sql'),
  path.join(root, 'database', 'dancecard_017_program_slot_photo_policy.sql'),
  path.join(root, 'database', 'dancecard_018_policy_documents_ledger.sql'),
  path.join(root, 'database', 'dancecard_019_registrant_vetting_safety_role.sql'),
  path.join(root, 'database', 'dancecard_020_badges_layout_pronouns.sql'),
  path.join(root, 'database', 'dancecard_021_calendar_feed_tokens.sql'),
  path.join(root, 'database', 'dancecard_022_message_outbox.sql'),
  path.join(root, 'database', 'dancecard_023_events_updated_at.sql'),
  path.join(root, 'database', 'dancecard_024_registrant_external_webhook.sql'),
  path.join(root, 'database', 'dancecard_025_google_sheet_connections.sql'),
  path.join(root, 'database', 'dancecard_026_api_keys_webhooks_audit.sql'),
  path.join(root, 'database', 'dancecard_027_phase7_embed_entitlements.sql'),
  path.join(root, 'database', 'dancecard_028_program_slot_organizer_notes.sql'),
  path.join(root, 'database', 'dancecard_029_event_theme_config.sql'),
  path.join(root, 'database', 'dancecard_030_attendee_guide.sql'),
  path.join(root, 'database', 'dancecard_031_agreements.sql'),
  path.join(root, 'database', 'dancecard_032_unscheduled_program_slots.sql'),
  path.join(root, 'database', 'dancecard_033_registration_category_grants_staff.sql'),
  path.join(root, 'database', 'dancecard_034_registration_category_role_hours.sql'),
  path.join(root, 'database', 'dancecard_035_map_pin_zone_shapes.sql'),
  path.join(root, 'database', 'dancecard_036_registrant_checkin.sql'),
  path.join(root, 'database', 'dancecard_037_map_pin_rotation.sql'),
  path.join(root, 'database', 'dancecard_038_trusted_roles.sql'),
  path.join(root, 'database', 'dancecard_039_attendee_profile.sql'),
  path.join(root, 'database', 'dancecard_040_ops_summary_embed.sql'),
  path.join(root, 'database', 'dancecard_041_door_checkin_tokens.sql'),
  path.join(root, 'database', 'dancecard_042_safety_incidents.sql'),
  path.join(root, 'database', 'dancecard_043_program_slot_audit.sql'),
  path.join(root, 'database', 'dancecard_044_registration_question_categories.sql'),
  path.join(root, 'database', 'dancecard_045_ics_reminders.sql'),
  path.join(root, 'database', 'dancecard_046_person_follows.sql'),
  path.join(root, 'database', 'dancecard_047_compare_privacy.sql'),
  path.join(root, 'database', 'dancecard_048_compare_requests.sql'),
  path.join(root, 'database', 'dancecard_049_iso_board.sql'),
  path.join(root, 'database', 'dancecard_050_session_feedback.sql'),
  path.join(root, 'database', 'dancecard_051_registrant_badge_tagline.sql'),
  path.join(root, 'database', 'dancecard_052_badge_logo.sql'),
  path.join(root, 'database', 'dancecard_053_iso_comments.sql'),
  path.join(root, 'database', 'dancecard_054_attendee_groups.sql'),
]

const defaultFiles =
  process.env.DANCECARD_APPLY_SEED === '1'
    ? [...baseMigrationFiles, path.join(root, 'database', 'dancecard_seed_paf26_demo.sql')]
    : baseMigrationFiles

const files = process.env.DANCECARD_SQL_FILES
  ? process.env.DANCECARD_SQL_FILES.split(';').map((p) => path.resolve(root, p.trim()))
  : defaultFiles

let pg
try {
  pg = await import('pg')
} catch {
  console.error('Install pg: npm i -D pg')
  process.exit(1)
}

const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
await client.connect()
try {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error('File not found:', file)
      process.exit(1)
    }
    const sql = fs.readFileSync(file, 'utf8')
    console.log('Applying', path.relative(root, file))
    await client.query(sql)
  }
  console.log('OK: dancecard migrations applied.')
} finally {
  await client.end()
}
