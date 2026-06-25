# ECKE listing consumer audit (Pass 4.1)

**Date:** 2026-06-25  
**Repo:** [EastCoast](https://github.com/PoorCameraQuality/EastCoast)  
**kink.social source:** PR #14 — `group_listing` via `listing_webhook`

---

## Phase 1 findings (before Pass 4.1)

| Question | Answer |
|----------|--------|
| Endpoint receiving `kind: 'ecke_listing'`? | **No** — not found before this pass |
| Endpoint handling `entityType: 'group'`? | **No** — education ingest only accepts `education_article` |
| Where do org/convention/group listings live? | Static dungeons/vendors/events in `src/data/`; C2K events in Supabase `events`; education in `articles`. **No group table.** |
| Public group listing pages? | **No** `/groups` route existed |
| Sitemap includes group listings? | **No** |
| Unpublish/draft for listings? | Education articles: yes (`status: draft`). Groups: **none** |

### Existing kink.social ingest (education only)

| Route | Handler | Entity types |
|-------|---------|--------------|
| `POST /api/kink-social/ingest` | `handleKinkSocialIngest` | `education_article` only |
| `POST /api/kink-social/unpublish` | `handleKinkSocialUnpublish` | `education_article` only |

Auth: `KINK_SOCIAL_INGEST_SECRET` Bearer token.

### kink.social listing webhook shape (from C2K `ecke-publish-client.ts`)

```json
{
  "kind": "ecke_listing",
  "action": "upsert" | "unpublish",
  "entityType": "group",
  "sourceSystem": "kink.social",
  "sourceId": "<uuid>",
  "canonicalKinkSocialUrl": "https://kink.social/groups/<id>",
  "payload": {
    "slug": "my-group",
    "title": "Group name",
    "description": "Public description",
    "location": "Baltimore metro",
    "imageUrl": "https://…",
    "orgSlug": "parent-org",
    "orgDisplayName": "Parent Org",
    "visibility": "public" | "hidden"
  }
}
```

Unpublish omits most payload fields; includes `payload.slug` and `payload.visibility: "hidden"`.

---

## Pass 4.1 implementation

| Item | Value |
|------|--------|
| **New endpoint** | `POST /api/kink-social/listing` |
| **Auth** | Bearer `ECKE_PUBLISH_WEBHOOK_SECRET` (falls back to `KINK_SOCIAL_INGEST_SECRET` for dev) |
| **Storage** | Supabase `group_listings` table |
| **Public route** | `/groups/[slug]` |
| **Unpublish** | Sets `status: draft`; idempotent when missing |
| **Unsupported types** | `organization`, `convention`, etc. → `400 unsupported_entity_type` |

### Operator setup

1. Apply `database/kink_social_001_group_listings.sql` in Supabase SQL editor.
2. Set on ECKE (Vercel):
   - `ECKE_PUBLISH_WEBHOOK_SECRET` — same value as kink.social prod
3. Set on kink.social:
   - `ECKE_PUBLISH_LISTING_WEBHOOK_URL=https://www.eastcoastkinkevents.com/api/kink-social/listing`

### Remaining gaps (not Pass 4.1)

- Group **index** page (`/groups`) — detail-only for now
- Org/convention listing webhook entity types
- JSON-LD for group listings
- IndexNow on group publish (optional follow-up)
