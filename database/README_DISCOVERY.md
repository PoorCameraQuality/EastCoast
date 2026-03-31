# Discovery engine SQL (SEO programmatic pages)

## If you see: `relation "public.events" does not exist`

Your Supabase project never had an `events` table (the live site mostly uses static `events.js`). **Run this file first:**

1. **`discovery_000_events_core.sql`** — creates `public.venues` and `public.events` with columns aligned to the Next.js API (`src/app/api/events/route.ts`).

Then run the rest in order:

2. **`discovery_schema.sql`** — `tags`, `event_tags`, and any missing columns on `events`
3. **`discovery_seed_tags.sql`** — tag dictionary
4. **`discovery_rls.sql`** — read policies for anon

## If `events` already exists

Skip `discovery_000_events_core.sql` and start at `discovery_schema.sql`. If `event_tags` fails on FK type, check:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'id';
```

If `id` is `bigint` instead of `uuid`, adjust `event_tags.event_id` in `discovery_schema.sql` to match (or migrate `events.id` to uuid—more involved).

Optional backfill from legacy `events.tags` text array into `event_tags` can be done after tags are seeded.

## Load static `events.js` into Supabase (optional)

Discovery pages already read [`src/data/events.js`](../src/data/events.js) via `getUnifiedEvents()`. To **also** store the same events in Postgres (backups, admin, `event_tags`):

1. Add **`SUPABASE_SERVICE_ROLE_KEY`** to `.env.local` (Dashboard → Settings → API — service role; keep secret).
2. Dry run: `npm run migrate:events-to-supabase -- --dry`
3. Run: `npm run migrate:events-to-supabase`

That upserts every event with `status = published`, fills `tags` from inference, and inserts **`event_tags`** links.

By default, **static data still wins** when the same `slug` exists in both places. After you trust the DB copy, set **`UNIFIED_EVENTS_PREFER_DB=true`** in `.env.local` so Supabase rows override static for duplicate slugs.

## Verify from your machine (recommended)

With `.env.local` filled in (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`):

```bash
npm run verify:discovery-db
```

You should see OK lines for `tags` (many rows), `event_tags` (often 0), `events`, `venues`, and sample slugs.

## Verify in SQL Editor (no Node, no `.env`)

Run the bundled query (one result set):

- [`verify_discovery_checks.sql`](verify_discovery_checks.sql)

Or ad hoc:

```sql
SELECT count(*) AS tags FROM public.tags;
SELECT count(*) AS event_tags FROM public.event_tags;
SELECT count(*) AS events FROM public.events;
SELECT count(*) AS venues FROM public.venues;
SELECT slug FROM public.tags ORDER BY slug LIMIT 8;
```
