# Vendor SEO schema + Supabase sync

Static vendor data in `src/data/vendors.js` powers the live site by default. The SQL below prepares Supabase for the same **merge pattern** as events (`unifiedEvents`).

## Apply order (Supabase SQL Editor)

1. `vendor_seo_000_vendors_core.sql` — base `vendors` table  
2. `vendor_seo_001_tags_and_links.sql` — `vendor_seo_tags` + `vendor_seo_tag_links`  
3. `vendor_seo_seed_tags.sql` — seed rows for hub slugs (`rope`, `latex`, …)

Ensure **anon/authenticated can SELECT** on these tables if the app reads them with the public key (or use service role only in scripts).

## Load static vendors into Supabase

From the project root (requires service role in `.env.local`):

```bash
npm run migrate:vendors-to-supabase
```

Dry run:

```bash
node scripts/migrate-static-vendors-to-supabase.mjs --dry
```

This upserts rows from `vendors.js` and links **SEO hub tags** inferred from each vendor’s taxonomy `tagSlugs`.

## Runtime merge (app)

- `getUnifiedVendors()` in `src/lib/unifiedVendors.ts` loads **static + Supabase** and dedupes by `slug`.  
- **`UNIFIED_VENDORS_PREFER_DB=true`** — DB row wins when the same `slug` exists in both places (optional).  
- Without that flag, **static wins**; DB-only slugs are still appended.

The vendors index, vendor discovery hubs, vendor detail URLs, and sitemap use `getUnifiedVendors()` so DB-only vendors appear after migration.

## RLS (optional)

If you enable RLS on `vendors`, add a policy allowing `SELECT` for `anon` on published rows (mirror your `events` / `articles` policies).
