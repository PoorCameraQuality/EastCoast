# kink.social public SEO ingest contract (ECKE view, Pass 2)

**Status:** Architecture + contract — multi-entity public SEO ingest  
**Mirror (kink.social):** [`coast-to-coast-kink/docs/ECKE_PUBLIC_PUBLISHING_CONTRACT.md`](../../coast-to-coast-kink/docs/ECKE_PUBLIC_PUBLISHING_CONTRACT.md)  
**Supersedes:** [`KINK_SOCIAL_INGEST_CONTRACT.md`](./KINK_SOCIAL_INGEST_CONTRACT.md) (article-only Pass 1 draft)

---

## 1. ECKE role in the product

EastCoastKinkEvents.com is the **public-facing, Google-searchable SEO surface** for opted-in, public-safe content originating on kink.social.

| ECKE owns | kink.social owns |
|-----------|------------------|
| Public rendering & canonical URLs | Identity, privacy, relationships |
| Sitemap, JSON-LD, Open Graph | RSVPs, applications, messaging |
| Directory discovery (events, education, dungeons, vendors) | Member-only and connection-only content |
| IndexNow / search funnel | Credibility history, moderation decisions |
| Contextual CTAs back to kink.social | Full logged-in experience |

---

## 2. Ingest envelope

All entity types share one envelope (validated once at the API boundary):

```ts
type KinkSocialPublicIngestEnvelope = {
  sourceSystem: 'kink.social'
  entityType: EckePublicEntityType
  sourceId: string
  sourceUpdatedAt: string
  action: 'upsert' | 'unpublish'
  visibility: 'PUBLIC'           // required for upsert
  publishToEcke: true             // required for upsert
  publicSafe: true                // required for upsert
  idempotencyKey: string
  canonicalKinkSocialUrl?: string
  preferredSlug?: string
  allowSlugSuffix?: boolean
  payload: unknown
}
```

**ECKE validation (fail closed):**

- Reject upsert if `visibility !== 'PUBLIC'`
- Reject upsert if `publishToEcke !== true` or `publicSafe !== true`
- Reject unsupported `entityType`
- Reject payload failing entity-specific Zod schema
- Reject bodies containing disallowed private-app URL patterns
- Accept `unpublish` without public flags; idempotent by `sourceId`

---

## 3. Entity type → storage → routes

| entityType | ECKE table | Public route | Listing | Phase |
|------------|------------|--------------|---------|-------|
| `education_article` | `articles` | `/education/[slug]` | `/education` | 1 |
| `education_path` | TBD (`education_paths`?) | `/education/paths/[slug]` | `/education` | 1b |
| `event` | `events` | `/events/[slug]` | `/events` | 2 |
| `convention` | `events` | `/events/[slug]` | `/events` | 4 |
| `place` | `dungeon_venues` | `/dungeons/[...slug]` | `/dungeons` | 3 |
| `organization` | TBD / webhook legacy | — | — | 3 |
| `presenter` | TBD (`presenters`?) | `/presenters/[slug]` | TBD | 4 |
| `vendor` | `vendors` | `/vendors/[...slug]` | `/vendors` | 5 |
| `class_sample` | `articles` or dedicated | `/education/[slug]` | `/education` | 5+ |
| `media_reference` | TBD | TBD | TBD | 5+ |

**Schema strategy:** Extend existing public tables (`articles`, `events`, `vendors`, `dungeon_venues`). Do **not** funnel all entities into `articles`. Add `c2k_source_type`, `c2k_source_id`, `kink_social_canonical_url`, `source_attribution`, `last_synced_at` consistently (see migration draft).

---

## 4. Per-entity payload summaries

Detailed allow/deny lists mirror kink.social contract §4. ECKE handlers must enforce **deny list** even if kink.social sends bad data.

### education_article → `articles`

**Payload fields:** title, slug, excerpt, bodyHtml, authorDisplayName, contentWarnings[], categories[], difficulty, readingMinutes, publishedAt, updatedAt, optional profile URLs, heroImageUrl.

**Render:** Markdown/HTML body, warnings banner, author sidebar, `ArticleStructuredData`, CTA.

### event → `events`

**Payload fields:** title, slug, shortDescription, longDescription, startDate, endDate, city, state, publicVenueName, publicAddress (only if flagged public-safe), organizerName, publicImageUrl, publicInfoUrl, tags[], accessibilityNotes.

**Render:** `EventDetailView`, `EventStructuredData`, CTA with RSVP funnel.

**Privacy tests:** no private address, no attendee list, no RSVP counts unless explicitly public-safe.

### convention → `events`

Same table as events; `c2k_source_type = convention`. CTA emphasizes registration on kink.social.

### place → `dungeon_venues`

**Payload:** name, slug, description, city, state (region-level OK), public website, venue type, policies.

**Privacy tests:** no hidden address, no private contact, no safety reports.

### vendor → `vendors`

**Payload:** name, slug, description, websiteUrl, categories, onlineOnly heuristic.

### presenter (future)

**Payload:** displayName, slug, bio, focusAreas[], publicTopicTags[], links to public articles.

**Privacy tests:** no organizer-only fields, no application answers.

---

## 5. Public rendering checklist (per entity)

When a phase goes live, each entity type must have:

- [ ] Public detail page (ISR or SSG as today)
- [ ] Directory/listing inclusion
- [ ] `alternates.canonical` → ECKE URL only
- [ ] Open Graph title, description, image
- [ ] JSON-LD appropriate to type
- [ ] Sitemap entry when `status = published` (or equivalent)
- [ ] IndexNow submission on ingest success
- [ ] `KinkSocialSourceCta` component (planned) with `canonicalKinkSocialUrl`
- [ ] “Published from kink.social” attribution line
- [ ] No private fields in HTML source

### Current SEO capabilities (audit)

| Entity | Detail | Canonical | OG | JSON-LD | Sitemap | IndexNow | CTA |
|--------|--------|-----------|-----|---------|---------|----------|-----|
| Education article | ✓ | ✓ | ✓ | Article | ✓ | infra exists | tease only (home) |
| Event | ✓ | ✓ | ✓ | Event | ✓ | infra exists | — |
| Dungeon | ✓ | ✓ | ✓ | LocalBusiness | ✓ | infra exists | — |
| Vendor | ✓ | ✓ | ✓ | Org/Vendor | ✓ | infra exists | — |
| Presenter | — | — | — | — | — | — | — |
| Convention | ✓ (as event) | ✓ | ✓ | Event | ✓ | infra exists | — |

---

## 6. CTA / funnel (ECKE UI)

Planned shared component: `src/components/kinkSocial/KinkSocialSourceCta.tsx`

| Context | Message pattern |
|---------|-----------------|
| Event | Join kink.social to RSVP, save, and follow updates |
| Education | View full profile and community context on kink.social |
| Presenter | Apply or book on kink.social |
| Place / vendor | Manage this listing on kink.social |
| Generic | Create a kink.social account for messaging, RSVPs, and private updates |

Env: `NEXT_PUBLIC_C2K_PUBLIC_URL` (already in `.env.example` for home tease).

---

## 7. Ingest API design

### Endpoints (recommended)

```
POST /api/kink-social/ingest
POST /api/kink-social/unpublish
```

### `POST /api/kink-social/ingest`

1. Authenticate (Bearer or HMAC)
2. Parse + validate envelope
3. Branch `handleIngest(entityType, payload)`
4. Server-side upsert via `getSupabaseAdminClient()`
5. Conflict on `(c2k_source_type, c2k_source_id)`
6. Return `{ status, eckePublicUrl, eckeSlug, eckeRecordId }`
7. Async: IndexNow + sitemap ping (no await in hot path if slow)

### `POST /api/kink-social/unpublish`

1. Same auth
2. Lookup by source keys; set non-public status
3. Return `{ status: 'unpublished' }`

### Internal handler map (planned)

```ts
const INGEST_HANDLERS: Record<EckePublicEntityType, Handler> = {
  education_article: ingestEducationArticle,
  event: ingestEvent,
  convention: ingestConventionAsEvent,
  place: ingestPlace,
  vendor: ingestVendor,
  // ...
}
```

### Logging

```ts
// OK
console.info('[kink-social-ingest]', { requestId, entityType, sourceId, action, status, durationMs })
// NEVER
console.log(body)
```

---

## 8. Supabase schema plan

**Decision:** Option B — add source tracking columns to each existing public table (not a generic `public_ingest` hub, not hacking non-articles into `articles`).

### Shared columns (all ingest tables)

| Column | Type | Purpose |
|--------|------|---------|
| `c2k_source_type` | varchar(32) | entity type string |
| `c2k_source_id` | uuid | kink.social source UUID |
| `kink_social_canonical_url` | text | CTA deep link |
| `source_attribution` | text | default `'kink.social member'` |
| `last_synced_at` | timestamptz | last successful ingest |

Already on events/vendors/articles/dungeon_venues via `database/c2k_ingest_external_ids.sql` (partial).

### Article-specific (Pass 1 migration draft)

`content_warnings`, `difficulty`, `author_username`, `author_profile_url`, `presenter_profile_url`

### Migration files (draft, not applied to production)

| File | Scope |
|------|-------|
| `database/c2k_ingest_external_ids.sql` | Base source IDs (manual SQL editor history) |
| `supabase/migrations/20260617120000_kink_social_article_ingest_columns.sql` | Articles extensions |
| `supabase/migrations/20260617130000_kink_social_public_ingest_shared_columns.sql` | Shared columns on events, vendors, dungeon_venues |

### RLS

- Anon: `SELECT` published rows only (existing patterns)
- Ingest: service role in API route only — no anon write policies

### Sitemap inclusion query

```sql
-- example pattern
SELECT slug, last_synced_at, updated_at
FROM articles
WHERE status = 'published' AND c2k_source_id IS NOT NULL;
```

---

## 9. Tests required

### Universal

- Rejects non-public, missing auth, missing sourceId, unsupported entityType
- Upsert idempotent; unpublish idempotent
- Slug collision returns 409 without corrupting unrelated rows
- Sitemap includes/excludes correctly
- JSON-LD parses (schema validator)
- CTA link uses public kink.social URL only
- HTML grep: no `MEMBERS`, no private address patterns from fixture leaks

### Event-specific

- Private address absent from HTML and JSON-LD
- No attendee list, RSVP counts, private discussion
- Hidden venue name absent when source marks location private

### Place-specific

- Hidden address absent; region-level city/state OK
- Private contact absent; safety report fields absent

### Presenter-specific (Phase 4)

- Organizer-only materials absent
- Private references and application answers absent

---

## 10. Staging / production

1. Staging Supabase: apply migrations in order
2. Preview Vercel: deploy ingest routes only
3. kink.social staging: `ECKE_PUBLISH_ENDPOINT` → preview
4. Phase 1 pilot: one education article
5. Production: explicit operator instruction for migration + env on both sides

**This pass:** docs + migration drafts only — no production DB, no deploy.

---

## 11. References

- `src/lib/educationArticles.ts`, `unifiedEvents.ts`, `unifiedDungeons.ts`, `unifiedVendors.ts`
- `src/lib/sitemapUrls.ts`, `src/lib/indexnow.ts`
- `src/components/ArticleStructuredData.tsx`, `StructuredData.tsx`
- `docs/C2K_SLUG_COLLISION_AUDIT.md`
