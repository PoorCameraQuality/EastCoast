# Dancecard Phase 7 — handoff (night stop)

**Purpose:** Single place to resume work: what exists in code, what env/DB needs, doc drift, and prioritized next steps.  
**Repo root:** `EastCoast-master/`  
**Do not treat as authoritative product spec** — roadmap remains [`DANCECARD_MASTER_PRODUCT_ROADMAP.md`](./DANCECARD_MASTER_PRODUCT_ROADMAP.md) §3.9–3.10 and the Cursor plan file (do not edit the plan).

---

## 1. State at handoff

### Implemented in code (backend + partial UI)

- **Embeds:** `GET /embed/dancecard/[slug]/schedule` and `/map` (token query param; CSP on `/embed/*` in `next.config.js`).
- **Embed tokens:** Organizer `GET/POST …/embed-tokens`, `DELETE …/embed-tokens/[id]`; mint in **`IntegrationsPanel.tsx`**.
- **Entitlements:** `GET/PATCH …/event-entitlements` (`dancecard_event_entitlements.modules`) — **no organizer UI** yet.
- **Sheet → import batch:** `POST …/google-sheets/create-import-batch` + Integrations button; uses `readGoogleSheetMatrix` + `buildImportFromSheetMatrix` + `insertDancecardImportBatch`.
- **Webhook retries:** `GET /api/cron/dancecard-webhook-retries` (Bearer `DANCECARD_CRON_SECRET` or `CRON_SECRET`); `webhookRetry.ts` + `next_retry_at` on deliveries (**requires migration 027**).
- **OpenAPI stub:** `GET /api/openapi/dancecard-external` (subset: external program + registrants import).
- **Conflict report:** `GET …/exports/conflict-report` (CSV); link in **`ExportsHubPanel.tsx`**.
- **ICS busy preview:** `POST …/ical-busy-preview` — **API only**, no organizer UI wired.
- **Policy summary:** `GET /api/dancecard/[slug]/policy-summary` + page **`/dancecard/[slug]/policies`**.
- **Maps:** Shared **`fetchSignedVenueMapsForEvent`**; public JSON up to **20** maps; embed map uses **12**; attendee **`map/page.tsx`** has **multi-map tabs**.
- **Shift swaps + vetting apps:** Public/organizer API routes + tables in **027** — **almost no UI** (no swap inbox, no vetting queue, no attendee forms).

### Metering

- **`GET …/usage-meter`** — aggregates API keys + webhook deliveries (30-day window); **no UI**.

---

## 2. Database: migrations since Phase 5 (verify on Supabase)

Apply **in order** any slice not yet on the target project:

| # | File |
|---|------|
| 021 | `database/dancecard_021_calendar_feed_tokens.sql` |
| 022 | `database/dancecard_022_message_outbox.sql` |
| 023 | `database/dancecard_023_events_updated_at.sql` |
| 024 | `database/dancecard_024_registrant_external_webhook.sql` |
| 025 | `database/dancecard_025_google_sheet_connections.sql` |
| 026 | `database/dancecard_026_api_keys_webhooks_audit.sql` |
| 027 | `database/dancecard_027_phase7_embed_entitlements.sql` |

**Critical:** If **026** is applied but **027** is not, outbound webhook failure inserts that set **`next_retry_at`** can error (column missing). Treat **027** as required for current webhook code paths.

**One-shot:** regenerate and paste `database/dancecard_full_bundle.sql` after `npm run dancecard:build-migration-bundle`, or `npm run dancecard:apply-migrations` with `DATABASE_URL` (see [`dancecard-first-run.md`](./dancecard-first-run.md)).

---

## 3. Environment / ops

| Variable | Role |
|----------|------|
| `DANCECARD_CRON_SECRET` or `CRON_SECRET` | Bearer for webhook retry cron route |
| `DANCECARD_TOKEN_ENCRYPT_KEY` | Google refresh token crypto (Phase 6) |
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` | Sheets OAuth |
| `NEXT_PUBLIC_SITE_URL` | OAuth redirect base if needed |

Schedule cron: **`GET /api/cron/dancecard-webhook-retries`** with `Authorization: Bearer <secret>` every few minutes (external scheduler).

---

## 4. Key file index (quick jump)

| Topic | Path |
|-------|------|
| Embed HTML | `src/lib/dancecard/embedHtml.ts` |
| Embed auth | `src/lib/dancecard/embedTokenAuth.ts` |
| Entitlements | `src/lib/dancecard/eventEntitlements.ts` |
| Bundle order | `scripts/build-dancecard-migration-bundle.mjs` |
| Integrations UI | `src/components/dancecard/organizer/IntegrationsPanel.tsx` |
| Exports UI | `src/components/dancecard/organizer/ExportsHubPanel.tsx` |
| Map attendee | `src/app/dancecard/[eventSlug]/map/page.tsx` |
| Policies attendee | `src/app/dancecard/[eventSlug]/policies/page.tsx` |
| Embed routes | `src/app/embed/dancecard/[eventSlug]/schedule/route.ts`, `.../map/route.ts` |
| Phase 7 SQL | `database/dancecard_027_phase7_embed_entitlements.sql` |
| Iframe / CSP doc | [`dancecard-embed.md`](./dancecard-embed.md) |
| Module boundaries spike | [`dancecard-phase7-module-boundaries.md`](./dancecard-phase7-module-boundaries.md) |
| UI facelift backlog | [`DANCECARD_UI_FACELIFT_BACKLOG.md`](./DANCECARD_UI_FACELIFT_BACKLOG.md) |

---

## 5. Doc drift to fix (next editorial pass)

- **Phase 6 vs 7:** Primary narrative docs (**`README_DANCECARD.md`**, **`DANCECARD_MASTER_PRODUCT_ROADMAP.md` §3.9**, **`dancecard-first-run.md`**) now use split wording (**023–026** vs **027**). Grep for legacy “023–027 as Phase 6 only” in older notes or PR text if needed.
- **§3.10 vs reality:** Opening paragraph can over-read as full UX; clarify **API MVP vs UI** (entitlements, usage meter, swaps, vetting, ICS preview have little/no UI).
- **Facelift §3 multi-map:** Updated **2026-05-14** — attendee map uses **multi-map tabs**; public signed JSON allows many maps (see `venueMapsSigned.ts`).
- **Long-form roadmap “Phase 7” section** (~extractable modules): **§3.10** + long-form Phase 7 header now cross-reference; long-form bullets remain **target** narrative.

---

## 6. Recommended next session order

1. **Confirm 027** on staging/prod; smoke embed mint + iframe + one webhook failure → retry.
2. **Organizer UI:** entitlements panel + usage meter card (small wins, unlocks understanding).
3. **Organizer UI:** shift swap inbox + vetting applications queue (APIs already exist).
4. **Sheets:** column-map UI + less brittle than fixed range/kind (roadmap P7.1).
5. **Attendee:** top bar / DancecardClient links to **Policies**; swap + vetting forms when modules on.
6. **Conflict / external busy:** wire ICS (and later CSV) into overlap story; PDF/HTML report optional.
7. **Docs:** single cross-link block §3.10 ↔ facelift ↔ embed ↔ module-boundaries.

---

## 7. Explicitly still open vs Phase 7 plan themes

- Column map + dry-run diff + **scheduled** sheet sync  
- **Embed themes** / shared design tokens with main app  
- **iCal/CSV ingest → conflict scanner** (preview parses only today)  
- **`packages/dancecard-conflicts`** (or HTTP-only until approved)  
- Swap **marketplace UX** + **reminders**  
- Policy **pack export** + richer **main-shell** policy bridge  
- Vetting **references/vouch** + full CRM  
- **Stripe / billing** behind entitlements  

---

## 8. Parallel audit summary

Earlier read-only passes covered APIs/embeds, organizer components, attendee pages + `DancecardClient`, SQL **027** + bundle, and docs consistency; consolidated findings align with sections **5–7** above.

**2026-05-14:** Ten parallel codebase audits vs roadmap §3.2–§3.10, `DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md`, `DANCECARD_UI_FACELIFT_BACKLOG.md`, and handoff docs — full tables and reconciliation notes: [`DANCECARD_CODE_VS_DOCS_AUDIT.md`](./DANCECARD_CODE_VS_DOCS_AUDIT.md).

---

*Handoff written for end-of-session pickup. Update this file when major milestones land so the next session starts from truth.*
