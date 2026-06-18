# kink.social education article ingest contract (ECKE view)

> **Superseded by Pass 2:** [`KINK_SOCIAL_PUBLIC_INGEST_CONTRACT.md`](./KINK_SOCIAL_PUBLIC_INGEST_CONTRACT.md) — multi-entity public SEO ingest. This file retained for article-only Pass 1 history.

**Status:** Superseded — see Pass 2 doc  
**Mirror doc (kink.social):** [`coast-to-coast-kink/docs/ECKE_PUBLIC_PUBLISHING_CONTRACT.md`](../../coast-to-coast-kink/docs/ECKE_PUBLIC_PUBLISHING_CONTRACT.md)

---

## 1. Scope

ECKE receives **opt-in, public, published** education articles from kink.social for rendering at:

```text
https://www.eastcoastkinkevents.com/education/{slug}
```

ECKE does **not** host kink.social member content, DMs, or non-public articles.

---

## 2. Storage model

**Extend existing `public.articles`** — do not add a parallel `kink_social_articles` table.

| Column | Purpose |
|--------|---------|
| Existing | `title`, `slug`, `excerpt`, `content`, `author_name`, `category`, `status`, `publish_date`, `read_time`, `seo_title`, `meta_description`, `og_image`, `tags` |
| `c2k_source_type` | `education_article` (from `c2k_ingest_external_ids.sql`) |
| `c2k_source_id` | kink.social `education_articles.id` |
| **Proposed (migration)** | `content_warnings`, `difficulty`, `author_username`, `author_profile_url`, `presenter_profile_url`, `kink_social_canonical_url`, `source_attribution`, `last_synced_at` |

Unique: `(c2k_source_type, c2k_source_id)` where both not null; `slug` unique for public routing.

---

## 3. API endpoints (Pass 2 design)

### `POST /api/kink-social/articles/upsert`

- Auth: Bearer secret or HMAC (see mirror doc §8)
- Validates payload schema + privacy rules
- Upserts by `(c2k_source_type, c2k_source_id)`
- Handles slug collision per contract §6
- Returns `ecke_public_url`, `ecke_slug`, `status`
- Side effects (server-side only): optional IndexNow ping for new/updated slug; never expose service role to kink.social

### `POST /api/kink-social/articles/unpublish`

- Sets `status = 'draft'` (or soft-unpublish pattern)
- Idempotent by `source_article_id`

---

## 4. Privacy enforcement (fail closed)

Reject with `403` + `error_code: ineligible_*` when:

- `visibility !== 'PUBLIC'`
- `publication_status !== 'PUBLISHED'`
- `ecke_publish !== true`
- Body contains disallowed kink.social private URLs after sanitization check
- Upsert attempted for archived/deleted without unpublish action

---

## 5. Public rendering requirements

| Requirement | Implementation |
|-------------|----------------|
| Google-indexable page | `src/app/education/[slug]/page.tsx` (ISR 30m) |
| Canonical | `alternates.canonical` → ECKE URL |
| JSON-LD | `ArticleStructuredData` — `author` = educator, `publisher` = ECKE |
| Content warnings | New UI block above body (Pass 2) |
| Attribution | “By {author_display_name}” — not “by kink.social” |
| Optional link-out | “View on kink.social” using `kink_social_canonical_url` only when public |

---

## 6. Sitemap and indexing

- `src/lib/sitemapUrls.ts` already lists `/education/{slug}` from `articles` where `status = published`
- `src/lib/indexnow.ts` — call `submitContentToIndexNow` after successful ingest (Pass 2)
- `src/app/api/sitemap/ping/route.ts` — optional post-ingest ping

---

## 7. RLS and service role

- Anon: `SELECT` where `status = 'published'` (`database/articles_rls_policies.sql`)
- Ingest route: `SUPABASE_SERVICE_ROLE_KEY` via `getSupabaseAdminClient()` only on server
- No new anon `INSERT`/`UPDATE` policies for kink.social

---

## 8. Environment variables

Add to `.env.example` (placeholders only):

```bash
# kink.social education ingest (server-only)
KINK_SOCIAL_INGEST_SECRET=
# Optional HMAC: KINK_SOCIAL_INGEST_HMAC_SECRET=
```

Existing: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`

---

## 9. Migration

See `supabase/migrations/20260617120000_kink_social_article_ingest_columns.sql` (proposed, **not applied to production**).

Apply locally:

```bash
cd EastCoast-master
npx supabase db push   # or npm run dancecard:apply-migrations with DATABASE_URL
```

---

## 10. Current state vs target

| Area | Today | Target |
|------|-------|--------|
| Transport | C2K direct Supabase REST (Option B) | Authenticated ECKE API (Option A) |
| C2K article rows in DB | 0 | Pilot after contract + visibility fix |
| Ingest route | None | `/api/kink-social/articles/*` |
| Content warnings on page | Not rendered | Required |
| `educationArticles.ts` merge | Supabase replaces static when any DB rows | Document static slug collision audit |

---

## 11. References

- `database/c2k_ingest_external_ids.sql`
- `docs/C2K_SLUG_COLLISION_AUDIT.md`
- `docs/C2K_HOOKUP_BASELINE.md`
- `src/lib/educationArticles.ts`
