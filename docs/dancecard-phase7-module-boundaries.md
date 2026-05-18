# Phase 7 — module boundaries (spike)

Short **contracts** for extractable surfaces. Default packaging choice: **HTTP route modules** in this monolith first; promote hot pure logic to **`src/lib/dancecard/*`** (and later `packages/*` if needed).

## P7.1 Sheet → schedule

- **Inputs:** Google OAuth connection (`dancecard_google_sheet_connections`), spreadsheet id, A1 range.
- **Outputs:** `ImportParseResult` → `dancecard_import_batches` / `dancecard_import_rows` via `insertDancecardImportBatch`.
- **Auth:** Organizer session (`requireOrganizerForSlug` + mutate).
- **Ownership:** `event_id` on batch rows.
- **HTTP:** `POST /api/organizer/dancecard/[slug]/google-sheets/create-import-batch`.
- **Extract later:** `readGoogleSheetMatrix` + `buildImportFromSheetMatrix` as a small Node package or worker job.

## P7.2 Maps

- **Inputs:** `dancecard_event_maps` + Storage object paths.
- **Outputs:** Signed HTTPS image URLs + pins (public JSON and embed HTML).
- **Auth:** Public slug for JSON; embed token + optional origin allowlist for HTML embed.
- **HTTP:** `GET /api/dancecard/[slug]/venue-map`, `GET /embed/dancecard/[slug]/map`.
- **Extract later:** image signing helper only; pins stay DB-backed.

## P7.3 Conflict scanner

- **Inputs:** Program slots + `dancecard_program_slot_persons` presenter links.
- **Outputs:** `DancecardConflict[]` (pure `computeDancecardConflicts`).
- **Auth:** Organizer session for CSV export; ICS preview organizer-only.
- **HTTP:** `GET …/exports/conflict-report`, `POST …/ical-busy-preview`.
- **Extract later:** `conflictScanner.ts` + `scanDancecardConflictsForEvent` → `packages/dancecard-conflicts`.

## P7.4 Shift swaps

- **Inputs:** `dancecard_shift_swap_requests`, staff shifts.
- **Auth:** Dancecard session cookie for create/list; organizer for approve/reject.
- **HTTP:** `GET/POST /api/dancecard/[slug]/shift-swaps`, organizer `GET …/shift-swaps`, `PATCH …/shift-swaps/[id]`.

## P7.5 Policy bridge

- **Inputs:** Published rows in `dancecard_policy_documents`.
- **Outputs:** JSON summary list; attendee page consumes JSON.
- **Auth:** Public read for published event; gated by `policy_public_summary` entitlement.
- **HTTP:** `GET /api/dancecard/[slug]/policy-summary`.

## P7.6 Vetting applications (MVP)

- **Inputs:** Applicant form fields.
- **Outputs:** `dancecard_vetting_applications` rows.
- **Auth:** Public POST when module enabled; organizer PATCH.
- **HTTP:** `POST /api/dancecard/[slug]/vetting-applications`, organizer `GET/PATCH …/vetting-applications`.

## Commercialization (thin)

- **Entitlements:** `dancecard_event_entitlements.modules` JSON; `GET/PATCH …/event-entitlements`.
- **Metering:** `GET …/usage-meter` (30-day window, API key `last_used_at` + webhook delivery counts).
- **Billing:** intentionally **not** implemented here (feature-flagged future work).
