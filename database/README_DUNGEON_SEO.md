# Dungeon SEO schema (optional Supabase)

Static dungeon data in `src/data/dungeons.js` powers the live site. These tables prepare Supabase for a future **merge pattern** similar to `unifiedVendors` / `getUnifiedDungeons()` without overloading `public.venues` (events `venue_id`).

## Apply order (Supabase SQL Editor)

1. `dungeon_seo_000_dungeon_venues.sql` — `dungeon_venues` catalog  
2. `dungeon_seo_001_tags_and_links.sql` — `dungeon_seo_tags` + `dungeon_seo_tag_links`  
3. `dungeon_seo_seed_tags.sql` — seed rows for the six hub slugs (`private`, `public`, `members-only`, …)

Grant **SELECT** to `anon` / `authenticated` on these tables if the app reads them with the public key (or restrict to service role in migration scripts only).

## Events at a dungeon (future)

- `public.events` may gain `dungeon_slug` (see `events_optional_dungeon_slug.sql`) aligned with `dungeon_venues.slug` or static dungeon slugs, alongside existing `venue_id` for generic venues.

## Runtime merge (future)

- Extend `getUnifiedDungeons()` to merge static rows with Supabase and dedupe by `slug`.  
- Optional env flag (e.g. `UNIFIED_DUNGEONS_PREFER_DB=true`) can prefer DB fields when both exist.

## RLS (optional)

If RLS is enabled, add policies allowing `SELECT` for published rows, mirroring `articles` / vendor patterns.
