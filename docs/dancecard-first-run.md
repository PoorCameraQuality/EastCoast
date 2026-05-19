# Dancecard — first run & operations

**Product progress:** Phase 0–7 delivery status (code vs per-environment migrations/smoke) is tracked in [`DANCECARD_MASTER_PRODUCT_ROADMAP.md`](./DANCECARD_MASTER_PRODUCT_ROADMAP.md) — **§3.3 Phase 0**, **§3.4 Phase 1**, **§3.5 Phase 2**, **§3.6 Phase 3**, **§3.7 Phase 4 — implementation status**, **§3.8 Phase 5 — implementation status**, **§3.9 Phase 6 — implementation status**, and **§3.10 Phase 7 — implementation status**.

**Directory ↔ Dancecard slugs:** see [`dancecard-slug-registry.md`](./dancecard-slug-registry.md). Public discovery: `GET /api/dancecard/public-events` and `/dancecard` product landing.

## One-time database setup (Supabase)

**Recommended (one paste):** open [`database/dancecard_full_bundle.sql`](../database/dancecard_full_bundle.sql) in the repo, copy **all** of it into the Supabase **SQL** editor, and run once. That file includes **000 → 029** (regenerate after SQL edits: `npm run dancecard:build-migration-bundle`) plus the **`paf26`** seed; delete the last section (seed) if you do not use that slug.

**Design tokens (UI Phase 4):** semantic `dc-*` variables and z-index matrix — [`dancecard-design-tokens.md`](./dancecard-design-tokens.md). Per-event accent/surface overrides: migration **`dancecard_029_event_theme_config.sql`** (`theme_config` jsonb).

**Alternative:** run slices manually in order — see [`database/README_DANCECARD.md`](../database/README_DANCECARD.md).

**Verify in Postgres (optional):** after **027**, open [`database/dancecard_verify_schema.sql`](../database/dancecard_verify_schema.sql) in the Supabase SQL editor and run it. Expect **`OK`** on every row (tables through **`dancecard_google_sheet_connections`**, prefs availability columns, webhook **`next_retry_at`**, embed/swap/vetting tables, triggers on **`dancecard_program_slots`**).

**CLI (Postgres URI):** `npm run dancecard:apply-migrations` applies **000–027** when `DATABASE_URL` is set. Add **`DANCECARD_APPLY_SEED=1`** to also run `dancecard_seed_paf26_demo.sql`.

### Upgrading an existing Supabase project to Phase 3 (SQL only)

If the database **already has migrations 000–012** (or the equivalent from an older `dancecard_full_bundle`), you do **not** need to re-paste the whole bundle for Phase 3. In the SQL editor, run **in order**:

1. [`database/dancecard_013_location_hierarchy.sql`](../database/dancecard_013_location_hierarchy.sql)
2. [`database/dancecard_014_venue_maps_pins.sql`](../database/dancecard_014_venue_maps_pins.sql)

If **013** was applied before, the `ADD CONSTRAINT dancecard_locations_parent_not_self_chk` line may error (constraint already exists); skip that statement or drop the constraint first, then continue.

**After SQL succeeds**, Phase 3 is **not** complete until **Storage** is configured (next section): map uploads will fail without the bucket.

### Upgrading an existing Supabase project to Phase 4 (SQL only)

If the database **already has migrations through 014** but not operations/volunteer depth, run **`015`–`020`** in numeric order from [`database/README_DANCECARD.md`](../database/README_DANCECARD.md). These add staff shift lifecycle, DM coverage requirements, slot `photo_policy`, policy ledger tables, **`safety`** organizer role + vetting columns, and badge layout JSON.

**Authorization note:** `safety` organizers can edit **vetting safety notes** but cannot read normal **internal** registrant notes; `viewer` cannot mutate. Staff-only shift notes and policy/no-photo exports remain **organizer-only** (service-role + route checks per [`DANCECARD_MASTER_PRODUCT_ROADMAP.md`](./DANCECARD_MASTER_PRODUCT_ROADMAP.md) §3.7).

### Phase 5 increment (existing DB already on 020)

If **`021`–`022`** are not yet applied, run in order from [`database/README_DANCECARD.md`](../database/README_DANCECARD.md):

1. `dancecard_021_calendar_feed_tokens.sql` — calendar feed subscribe tokens (hashed at rest).
2. `dancecard_022_message_outbox.sql` — message templates, campaigns, delivery log.

**Email (organizer campaigns):** set server env **`RESEND_API_KEY`** (from [Resend](https://resend.com)) and **`DANCECARD_RESEND_FROM`** to a sender you have verified for that API key (e.g. `Dancecard <updates@yourdomain.com>`). Without these, **Send** returns **503** and no mail is sent.

**Public ICS feeds:** after **`021`** is applied, organizers mint URLs from **Organizer → Exports → Calendar subscribe** (or `POST /api/organizer/dancecard/[slug]/calendar-feeds`). Subscribers use `GET /api/dancecard/[slug]/feeds/ics?token=…`. Revoke leaked tokens from the same UI (`POST …/calendar-feeds/[id]/revoke`).

### Phase 6 increment (existing DB already on 022)

Organizers land on **My events** at **`/organizer/dancecard`** (default after organizer login when `next` is omitted); open a row to reach **`/organizer/dancecard/[eventSlug]`** for the full console.

If **`023`–`026`** are not yet applied, run in numeric order from [`database/README_DANCECARD.md`](../database/README_DANCECARD.md) (Phase 6). If **`027`** is not yet applied, run `dancecard_027_phase7_embed_entitlements.sql` afterward (Phase 7: embeds, entitlements, webhook **`next_retry_at`**, swap/vetting tables).

**Token encryption (Google refresh tokens):** set **`DANCECARD_TOKEN_ENCRYPT_KEY`** to a long random string (minimum **16** characters). Without it, Google OAuth callback and preview routes error when reading/writing ciphertext.

**Google OAuth (Sheets read-only):** create OAuth client credentials in Google Cloud Console; set **`GOOGLE_OAUTH_CLIENT_ID`** and **`GOOGLE_OAUTH_CLIENT_SECRET`**. Authorized redirect URI must match  
`https://<your-host>/api/organizer/dancecard/<eventSlug>/google-sheets/oauth/callback`  
(use the same origin as production or local dev). Organizers use **Integrations → Connect Google**.

**External API keys:** mint from **Integrations** (owner/admin). Example scopes: `read:program`, `write:registrants`. Plaintext `dk_…` is shown once.

**Inbound registrant webhook:** mint secret on **Integrations**; `POST /api/webhooks/dancecard/[slug]/registrants` with `Authorization: Bearer <secret>` and JSON `{ "rows": […] }` or `{ "eventbrite": { … } }`.

**Phase 7 — public embeds:** after **`027`**, mint **`emb_…`** tokens under **Integrations** and iframe `GET /embed/dancecard/<slug>/schedule?token=…` or `/map?token=…` (see [`dancecard-embed.md`](./dancecard-embed.md)). Optional module flags: **`GET/PATCH /api/organizer/dancecard/<slug>/event-entitlements`**.

**Webhook retries:** set **`DANCECARD_CRON_SECRET`** (or reuse **`CRON_SECRET`**) and schedule **`GET /api/cron/dancecard-webhook-retries`** with header **`Authorization: Bearer <secret>`** every few minutes.

### Storage — Supabase buckets

Three buckets (override via env; see `.env.example`):

| Bucket | Purpose |
|--------|---------|
| **`dancecard-maps`** | Venue floor plans |
| **`dancecard-event-assets`** | Badge logos / event files |
| **`dancecard-profile-photos`** | Attendee profile avatars |

The server uses the **service role** to upload and mint **signed URLs**; attendees never receive that key.

**Checklist (per environment):**

1. Create all three buckets in Supabase.
2. Grant the service role upload + signed read on each.
3. Set **`SUPABASE_SERVICE_ROLE_KEY`** on the host.
4. If older uploads lived only in **`dancecard-maps`**, run **`npm run dancecard:migrate-storage`** once (optional **`--dry-run`**). Until then, signed URLs still fall back via **`DANCECARD_LEGACY_STORAGE_BUCKET`**.

Do not expose the service role key to browsers.

**Verify in Postgres (optional):** `dancecard_event_maps`, `dancecard_map_pins`; on `dancecard_locations`, new columns `parent_id`, `kind`, `accessibility_notes`, `directions_public`, `internal_notes`.

Confirm core tables still exist as before: `dancecard_events`, `dancecard_program_slots`, `dancecard_accounts`, `dancecard_import_batches`, …

## Supabase CLI (optional)

The repo includes [`supabase/config.toml`](../supabase/config.toml) from `supabase init` so you can use the [Supabase CLI](https://supabase.com/docs/guides/cli) for `db pull`, migrations, and local stacks.

On your machine (no secrets committed):

```bash
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` is the subdomain of your project URL (`https://YOUR_PROJECT_REF.supabase.co`). Linking may prompt for the **database password** (set under Project Settings → Database; it is **not** the anon or service_role API keys).

**Direct Postgres** (`postgresql://postgres:…@db.YOUR_PROJECT_REF.supabase.co:5432/postgres`) is only for tools like `psql`; keep the password out of git and chat logs.

For **Next.js / Vercel**, continue to use **Project URL** + **anon/publishable** + **service_role/secret** from **Project Settings → API**, copied into `.env.local` / Vercel env vars as documented below.

## Local environment

Copy [`.env.example`](../.env.example) to `.env.local` and set at minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to the browser)

Optional:

- `NEXT_PUBLIC_SITE_URL` — canonical origin for share links if the request host behind a proxy is wrong.
- `RESEND_API_KEY` — [Resend](https://resend.com) API key for organizer email campaigns (Phase 5); server-only.
- `DANCECARD_RESEND_FROM` — verified sender string for Resend (e.g. `Team <hello@yourdomain.com>`); must match a domain you verified in Resend.

## Run the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dancecard/paf26`. After SQL setup you still need to **import the program** (next section) before the Program tab lists sessions. **Official program** (organizer Grid workbook): [Google Sheets — Grid](https://docs.google.com/spreadsheets/d/14gT9gufCcbHoDtabJeGSRSAkwhiEFUfGdDQcw-2Ju1U/edit?gid=1445461642#gid=1445461642). **Personal dancecard:** registered users click classes on the Program tab to add or remove them; open **My dancecard** to see the list (titles, times, rooms) and optional manual busy blocks.

## Automated smoke

With dev server running:

```bash
npm run dancecard:smoke
```

Optional: `DANCECARD_SMOKE_URL=http://127.0.0.1:3000 npm run dancecard:smoke`

Expect: `OK dancecard smoke` with a slot count. If the count is `0`, the smoke script prints a warning until you run the import below. When slots exist, the public schedule payload must include a **`presenters`** array on each slot (possibly empty). **`GET …/venue-map`** must return **`{ maps: [] }`** or populated maps (always **200** with a **`maps`** array when migrations **014** are applied; older DBs without the table may still return **200** with **`maps: []`** from the route — if your deployment errors, apply **014**).

The same script asserts **organizer** JSON routes return **401** when called without a dancecard session cookie, so anonymous clients cannot hit mutating Supabase-backed organizer APIs even though the server uses the **service role** for organizer reads/writes.

## Security model: RLS vs defense in depth

**Current approach:** organizer and some attendee routes use a **Supabase service-role** client on the server and enforce authorization in application code (session cookie → `dancecard_accounts` / `dancecard_event_organizers` / role checks). **Row Level Security (RLS)** on `dancecard_*` tables is not assumed to be the primary gate for those code paths.

**Threat model (service-role routes):**

- Every query must be scoped by **`event_id`** resolved from the **`eventSlug`** in the URL. Handlers must not accept a client-supplied event id that could point at another event.
- Organizer mutations require an authenticated user with a matching **`dancecard_event_organizers`** row; **viewer** is read-only; **owner** (or site admin / dev bypass) is required for access-code and status fields where documented in code.
- The service role key must **never** ship to the browser or client-side bundles; it stays on the server (Vercel env / local `.env.local`).

**RLS option:** tightening Postgres RLS policies would add a second layer if the anon key were ever used from the client for those tables, or as belt-and-suspenders if service-role code regressed. That is a separate migration effort; until then, rely on **route-level checks + smoke tests** (including organizer **401** without session).

## Manual happy path (5 minutes)

1. Open `/dancecard/paf26`, **Register** user A (username, password, display name).
2. Add one or two program sessions to **My dancecard** (Program tab → click cards).
3. **Copy share for Discord**; note the `/dancecard/paf26/s/…` URL.
4. In a private window, open the share URL; **Register** user B on `/dancecard/paf26`, then reload the share tab — **Mutual free** should list gaps if both have non-overlapping busy time.
5. On the share page as B, set a window inside a mutual gap and **Reserve** — both accounts should show the block under **Reservations** / busy math.

## PAF26 official Grid → JSON → Supabase

**Official program** is maintained by the organizer here: [Google Sheets — Grid (gid 1445461642)](https://docs.google.com/spreadsheets/d/14gT9gufCcbHoDtabJeGSRSAkwhiEFUfGdDQcw-2Ju1U/edit?gid=1445461642#gid=1445461642).

That workbook is a **time × venue matrix** on the **Grid** sheet, not a flat Start/End table. Use the dedicated parser (defaults to the standard Downloads filename if present):

```bash
npm run dancecard:parse-paf26
# or, with explicit paths:
node scripts/paf26-grid-to-json.mjs "C:/path/to/PAF26 Schedule Daily At-A-Glance & Grid.xlsx" ./data/paf26-program-slots.json
```

That writes [`data/paf26-program-slots.json`](../data/paf26-program-slots.json) (committed copy can be refreshed after each schedule revision). Times are interpreted as **May 2026, America/New_York (EDT, −04:00)** to match the festival.

Then import into Supabase (requires `.env.local` with service role). Imports are **upserts** by stable key (slot `id` in JSON when present, else start+end+title+room); unchanged rows are left as-is so attendee program selections keep working when slot identity is stable. Preview changes without writing:

```bash
npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json --dry-run
npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json
```

The seed SQL already sets the `paf26` event window to cover the festival; re-run the parser + import whenever the Grid changes.

### After you deploy to Vercel (or any host)

Deploying the Next.js app does **not** copy rows into Postgres. If `/dancecard/paf26` shows an empty program on the live site, your **production** Supabase project still needs the same import step, using that project’s URL and **secret / service_role** key (never the publishable key in the browser bundle for this script).

From a trusted machine with the repo checked out:

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-production-secret-or-service-role-key"
npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json
```

On Windows PowerShell, use `$env:NEXT_PUBLIC_SUPABASE_URL="..."` and `$env:SUPABASE_SERVICE_ROLE_KEY="..."` instead of `export`. Then reload the live `/dancecard/paf26` Program tab.

## Import other schedules (flat Excel or JSON)

```bash
npm run dancecard:import -- --slug paf26 --json ./path/to/slots.json
npm run dancecard:import -- --slug paf26 ./path/to/schedule.xlsx
```

JSON shape: `{ "slots": [ { "startsAt", "endsAt", "title", "track?", "room?", "sortOrder?", "id?" } ] }`. Optional **`id`** (UUID) ties imports to existing `dancecard_program_slots` rows so re-imports update in place; without `id`, rows match on start+end+title+room.

XLSX (row-oriented): prefers a sheet whose name contains **Grid**; otherwise first sheet. Header row must map to Start / End / Title columns (legacy heuristics). **PAF26 Grid matrix:** use `dancecard:parse-paf26` instead of direct XLSX import.

**Chat → deploy workflow:** when an organizer sends a workbook, create or confirm the `dancecard_events` row (slug, window, titles), run import for that slug, spot-check first/last session times in the UI, then announce the public URL `/dancecard/{slug}`.

## Release smoke checklist (sandbox)

After `npm run dancecard:apply-migrations` and `npm run dancecard:seed-sandbox -- --reset` on a clean DB:

1. **Attendee** — Sign in at `/dancecard/sandbox-dancecard`; land on **Program**; open timeline; `?compare=demo` loads mutual compare when seeded.
2. **Organizer** — Open program grid, select **Opening circle** (or first slot); drawer loads without “Slot not found”.
3. **Conflicts** — Disconnect network or block `/program-conflicts`; program tab shows an error banner (not an empty “all clear”).
4. **Door** — As **viewer** role, door roster API must not return `checkInToken` per row.
5. **Registration** — Register without code → attendee category only; with `SANDBOX-STAFF-REG` → staff category.
6. **Compare** — Blocked users omitted from compare directory; **Request** sends compare request.
7. **Build** — `npm run build` completes without type errors.

## Cutover from standalone repo

The previous Fastify+Vite app (`eck-paf26-dancecard`) is **reference-only**. After production traffic on ECKE is verified, archive that repository and treat **EastCoast-master** as the only source of truth for dancecard.
