# Dancecard ↔ Coast to Coast Kink (C2K) integration

**UI Phase 8** — connect C2K convention surfaces to East Coast Kink Events (ECKE) Dancecard without duplicate chrome or conflicting schedules.

**Companion:** [DANCECARD_UI_UX_MASTER_PLAN.md](./DANCECARD_UI_UX_MASTER_PLAN.md) §8, [DANCECARD_UI_DESIGN_GUIDE.md](./DANCECARD_UI_DESIGN_GUIDE.md) §12.

---

## Integration modes

| Mode | Use when | ECKE | C2K |
| --- | --- | --- | --- |
| **A. Link out** | Pilot / fastest | Organizer hub + attendee URLs | Manage tab `DancecardOpsCard` |
| **B. Embed** | Marketing site schedule in C2K | `/embed/dancecard/{slug}/schedule?token=` | Schedule tab iframe |
| **C. Port UI** | Deferred | Full React organizer in C2K monorepo | Not Phase 8 |

Default sequencing: **A → B → auth handoff → attendee clarity**.

---

## Slug contract

| Field | Location | Example |
| --- | --- | --- |
| `dancecardSlug` | C2K `conventions.settings` | `paf26` |
| `dancecardHost` | C2K `conventions.settings` | `https://www.eastcoastkinkevents.com` |
| `dancecardEnabled` | C2K `conventions.settings` | `true` |
| C2K convention slug | `conventions.slug` | `primal-arts-2026` |

Registry: [dancecard-slug-registry.md](./dancecard-slug-registry.md) (ECKE directory + C2K rows).

**URLs when linked:**

- Organizer ops: `{dancecardHost}/organizer/dancecard/{dancecardSlug}`
- Attendee: `{dancecardHost}/dancecard/{dancecardSlug}`
- Embed schedule: `{dancecardHost}/embed/dancecard/{dancecardSlug}/schedule?token=emb_…`
- Ops summary embed: `{dancecardHost}/embed/dancecard/{dancecardSlug}/ops-summary?token=emb_…`

---

## Schedule dual-entry strategy (ADR)

**Problem:** C2K stores program in `schedule_slots`; Dancecard stores program in `dancecard_program_slots`. Editing both causes drift.

**Decision (Phase 8):** When `settings.dancecardSlug` is set and `dancecardEnabled` is true:

1. **C2K Manage** — hide inline program slot CRUD; show `DancecardOpsCard` with link to ECKE ops.
2. **C2K public Schedule tab** — prefer ECKE embed or “Open full program on Dancecard” link; keep C2K `schedule_slots` read-only for legacy conventions without a slug.
3. **Staff duties** — remain in C2K Manage (not duplicated in Dancecard Phase 8).
4. **Mutual availability / bookings** — remain on C2K **Dancecard** tab (`ConventionDancecardPanel`).

**Future:** one-way import from Dancecard → C2K `schedule_slots` for public card view only (API job, not manual double entry).

---

## Environment variables

| Variable | Repo | Purpose |
| --- | --- | --- |
| `DANCECARD_C2K_HANDOFF_SECRET` | Both | HMAC/signing for organizer handoff codes (min 32 chars) |
| `DANCECARD_ECKE_PUBLIC_ORIGIN` | ECKE | Canonical host in handoff redirects (default request origin) |
| `C2K_WEB_ORIGIN` | C2K | Allowed return URL prefix for `?from=c2k` banners |

---

## Auth handoff (Wave 3)

1. Organizer on C2K Manage clicks **Open Dancecard ops (signed)**.
2. C2K `POST /api/v1/conventions/:key/dancecard/organizer-handoff` → `{ code, expiresAt }` (60s TTL).
3. Browser opens `{dancecardHost}/organizer/dancecard/handoff?code=…&convention={c2kSlug}`.
4. ECKE `POST /api/organizer/dancecard/handoff/consume` validates code, matches organizer email when possible, sets session cookie.
5. Redirect to `/organizer/dancecard/{slug}`.

Fallback: `/organizer/login?next=…&from=c2k`.

---

## Embed

- Mint `emb_…` tokens in ECKE **Integrations**; set parent origins to C2K production/staging hosts.
- Use `?chrome=minimal` on schedule embed for iframe in C2K.
- Optional `postMessage` type `dc-embed-ready` with `{ height }` for iframe resize.

See [dancecard-embed.md](./dancecard-embed.md).

---

## What stays in C2K only

Forums, chat, announcements, org hub — per design guide §12. **ISO / practice partner board** runs in Dancecard when the event entitlement `iso_board` is enabled (attendee tab + organizer moderation). Dancecard remains the **ops layer** (program, registrants, integrations, exports).

---

## Manual QA checklist

1. Set convention `dancecardSlug` + `dancecardEnabled` in C2K Manage logistics (or API patch).
2. Manage tab shows Dancecard ops card; program slot editor hidden.
3. **Open Dancecard ops** opens ECKE organizer hub; `from=c2k` banner visible.
4. Copy attendee link works; ECKE `/dancecard/{slug}` loads.
5. Schedule tab shows embed or link when token configured.
6. Dancecard tab still shows mutual availability; strip links to ECKE program.
7. Handoff flow (if secret configured) lands in organizer console without duplicate signup when email matches.
