# Dancecard — first run & operations

## One-time database setup (Supabase)

1. In the Supabase SQL editor (or `psql`), run in order:
   - [`database/dancecard_000_schema.sql`](../database/dancecard_000_schema.sql)
   - [`database/dancecard_seed_paf26_demo.sql`](../database/dancecard_seed_paf26_demo.sql)
2. Confirm tables exist: `dancecard_events`, `dancecard_program_slots`, `dancecard_accounts`, …

## Local environment

Copy [`.env.example`](../.env.example) to `.env.local` and set at minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to the browser)

Optional:

- `NEXT_PUBLIC_SITE_URL` — canonical origin for share links if the request host behind a proxy is wrong.

## Run the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dancecard/paf26`. After SQL setup you still need to **import the program** (next section) before the schedule tab shows sessions.

## Automated smoke

With dev server running:

```bash
npm run dancecard:smoke
```

Optional: `DANCECARD_SMOKE_URL=http://127.0.0.1:3000 npm run dancecard:smoke`

Expect: `OK dancecard smoke` with a slot count. If the count is `0`, the smoke script prints a warning until you run the import below.

## Manual happy path (5 minutes)

1. Open `/dancecard/paf26`, **Register** user A (username, password, display name).
2. Add one or two program sessions to **My dancecard** (Program tab → click cards).
3. **Copy share for Discord**; note the `/dancecard/paf26/s/…` URL.
4. In a private window, open the share URL; **Register** user B on `/dancecard/paf26`, then reload the share tab — **Mutual free** should list gaps if both have non-overlapping busy time.
5. On the share page as B, set a window inside a mutual gap and **Reserve** — both accounts should show the block under **Reservations** / busy math.

## PAF26 official Grid → JSON → Supabase

The organizer workbook is a **time × venue matrix** on the **Grid** sheet, not a flat Start/End table. Use the dedicated parser (defaults to the standard Downloads filename if present):

```bash
npm run dancecard:parse-paf26
# or, with explicit paths:
node scripts/paf26-grid-to-json.mjs "C:/path/to/PAF26 Schedule Daily At-A-Glance & Grid.xlsx" ./data/paf26-program-slots.json
```

That writes [`data/paf26-program-slots.json`](../data/paf26-program-slots.json) (committed copy can be refreshed after each schedule revision). Times are interpreted as **May 2026, America/New_York (EDT, −04:00)** to match the festival.

Then import into Supabase (requires `.env.local` with service role):

```bash
npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json
```

The seed SQL already sets the `paf26` event window to cover the festival; re-run the parser + import whenever the Grid changes.

## Import other schedules (flat Excel or JSON)

```bash
npm run dancecard:import -- --slug paf26 --json ./path/to/slots.json
npm run dancecard:import -- --slug paf26 ./path/to/schedule.xlsx
```

JSON shape: `{ "slots": [ { "startsAt", "endsAt", "title", "track?", "room?", "sortOrder?" } ] }`.

XLSX (row-oriented): prefers a sheet whose name contains **Grid**; otherwise first sheet. Header row must map to Start / End / Title columns (legacy heuristics). **PAF26 Grid matrix:** use `dancecard:parse-paf26` instead of direct XLSX import.

**Chat → deploy workflow:** when an organizer sends a workbook, create or confirm the `dancecard_events` row (slug, window, titles), run import for that slug, spot-check first/last session times in the UI, then announce the public URL `/dancecard/{slug}`.

## Cutover from standalone repo

The previous Fastify+Vite app (`eck-paf26-dancecard`) is **reference-only**. After production traffic on ECKE is verified, archive that repository and treat **EastCoast-master** as the only source of truth for dancecard.
