# Dancecard Handoff — 2026-05-17

## Summary

This session completed the **Generic Dancecard platform** push (north star: [GENERIC_DANCECARD_PRODUCT_VISION.md](./GENERIC_DANCECARD_PRODUCT_VISION.md)), applied migrations **030–031**, verified schema (**102/102 PASS**), and fixed **local dev / organizer UX** issues (CSS not loading, dead clicks, gray program grid).

**Primary sandbox URL:** http://localhost:3000/organizer/dancecard/sandbox  
**Public attendee preview:** http://localhost:3000/dancecard/sandbox

---

## What Shipped

### Wave 0 — Foundation

| Item | Path / notes |
| --- | --- |
| Migration 030 — attendee guide + event profile | `database/dancecard_030_attendee_guide.sql` |
| Migration 031 — agreements + RabbitSign columns | `database/dancecard_031_agreements.sql` |
| Bundled in full bundle | `database/dancecard_full_bundle.sql` |
| Event profile + copy libs | `src/lib/dancecard/eventProfile.ts`, `productCopy.ts`, `attendeeGuideJson.ts`, `agreementsConfig.ts`, `organizerEventDto.ts` |
| Organizer nav regroup | `src/components/dancecard/organizer/shell/organizerNavConfig.ts` — Home \| Schedule \| People \| Communications \| Settings \| Tools |
| People hub query param | `?tab=people&peopleTab=` (signups \| roster \| staff \| applications \| swaps \| badges \| coverage) |
| Tracker | [GENERIC_DANCECARD_IMPLEMENTATION_TRACKER.md](./GENERIC_DANCECARD_IMPLEMENTATION_TRACKER.md) — all rows **done** |

### Wave 1 — Product surfaces (agents 1–14)

- **Copy / readiness / import:** `productCopy`, import runbook, diff preview, readiness checks on dashboard.
- **People hub:** `PeopleHubPanel.tsx`, legacy tab redirects (`registrants` → `people?peopleTab=signups`, etc.).
- **Settings:** attendee guide JSON, event profile, agreements config (`AgreementsSettingsSection`, `AttendeeGuideSettingsSection`).
- **Attendee:** `AttendeeWeekendGuide`, `PublicDancecardLanding`, `useEventProfileLabels`.
- **ECKE Sign:** `AgreementsPanel`, `AttendeePolicySignFlow`, policy acceptance APIs.
- **RabbitSign:** `rabbitsignClient.ts`, webhook `POST /api/webhooks/rabbitsign`, integrations panel section.

### Wave 2 — Integration

- `OrganizerDancecardClient.tsx` wires People hub, legacy redirects, command shell, guides.
- `npm run build` succeeded (pre-existing eslint warnings only).

### DB verification

- `database/dancecard_verify_schema.sql` updated through migration **031**.
- User-reported result: **102 passed, 0 failed, PASS**.

---

## Session Fixes (2026-05-17) — Dev & Organizer UX

### 1. CSS “breaking” (unstyled HTML)

**Symptom:** Blue default links, white buttons, vertical nav stack, black background — Tailwind not applied.

**Root cause:** Multiple `npm run dev` instances (port **3000** and **3001**). HTML from one server referenced CSS chunks from another after rebuild.

**Fix applied:**

1. Kill all Node processes on 3000/3001.
2. Delete `.next`.
3. Start **one** dev server: `npm run dev` → http://localhost:3000 only.

**If it happens again:** Hard refresh (Ctrl+Shift+R). DevTools → Network → confirm `/_next/static/css/*.css` returns **200**.

### 2. Organizer sandbox — dead clicks & gray program grid

**Symptoms:** Sidebar/buttons unresponsive; drag-and-drop dead; program blocks all same dark gray.

**Causes & fixes:**

| Issue | Fix | File(s) |
| --- | --- | --- |
| Auto-blocking program tour on first visit | Guides are **opt-in** (localStorage `0` = show, absent/`1` = dismissed). **“Grid tour”** button on Program tab. | `src/lib/dancecard/guides/useGuideState.ts`, `program/ProgramTab.tsx` |
| Session drawer ate all clicks | Backdrop click closes drawer | `SessionDetailDrawer.tsx` |
| Confirm dialog trapped focus | Backdrop click cancels | `organizer/ui/OrganizerConfirmDialog.tsx` |
| No track colors on grid | `roleColor(track)` on slot cards; Classes/Play/Social palette | `ProgramScheduleGrid.tsx`, `roleColors.ts` |
| Tab URL not always updating | `router.replace` + `history.replaceState` on tab switch | `OrganizerDancecardClient.tsx` |
| Invalid Tailwind class | `hover:bg-dc-surface-elevated` → `hover:bg-dc-elevated-muted/80` | `OrganizerGroupedNav.tsx`, `AttendeeBottomNav.tsx` |

**Verify after pull:**

```
http://localhost:3000/organizer/dancecard/sandbox?tab=program
```

- Colored class blocks (blue Classes, violet Play, amber Social).
- Sidebar and Grid/List respond.
- Drag class titles on grid; Esc closes drawers.
- Optional: **Grid tour** for walkthrough (no longer auto-blocks).

---

## Environment & Auth

| Variable | Purpose |
| --- | --- |
| `DANCECARD_ORGANIZER_DEV_BYPASS=1` | Local organizer auth off (orange banner on event pages). **Never in production.** |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required for real data; middleware skips auth checks if missing. |
| `.env.local` | Loaded by `next dev` |

**Organizer layout:** `src/app/organizer/dancecard/layout.tsx` → `OrganizerDancecardChrome` (top bar) → event shell.

**Shell routing (hide ECKE marketing header):** `src/lib/dancecard/shellRoutes.ts`

---

## Key Routes & Entry Points

| Route | Component / notes |
| --- | --- |
| `/organizer/dancecard` | Event hub list |
| `/organizer/dancecard/[slug]` | `OrganizerDancecardClient` — `?tab=` drives panel |
| `/organizer/dancecard/[slug]?tab=program` | Program grid + list |
| `/organizer/dancecard/[slug]?tab=people&peopleTab=signups` | People hub |
| `/dancecard/[slug]` | Attendee `DancecardClient` |
| `/dancecard` | Marketing |

**Organizer tabs (`?tab=`):** `dashboard`, `program`, `venues`, `people`, `settings`, `assignments`, `messaging`, `import`, `integrations`, `media`, `exports`, …

Legacy tabs (`registrants`, `staff`, `vetting`, …) redirect into **people** hub with `peopleTab`.

---

## Migrations (copy-paste)

Last two migrations from this push:

- `database/dancecard_030_attendee_guide.sql`
- `database/dancecard_031_agreements.sql`

**Apply:** Supabase SQL editor or `npm run dancecard:apply-migrations` (if configured).

**Verify:**

```sql
-- Run full file in SQL editor:
-- database/dancecard_verify_schema.sql
-- Expect: PASS (102 checks as of 2026-05-17)
```

---

## Locked Product Decisions

1. **People hub:** Single nav item + `?peopleTab=` sub-routes (no separate top-level Registrants/Staff nav).
2. **Agreements:** Dual path — **ECKE Sign** (default) + optional **RabbitSign** + hybrid mode (`agreementsConfig`, entitlements `ecke_sign`, `rabbitsign_sync`).
3. **PAF** is a stress test event, not the product frame — generic campout/hotel/conference language via `eventProfile` + `productCopy`.
4. **Phase C** (RegFox API, MailerLite, Sheets pull) — out of scope for this push.
5. **Program tours** — opt-in only; do not auto-block the grid on first visit.

---

## Known Gaps / Watch Items

- **Multiple dev servers** — easy to regress CSS; use one port 3000 instance.
- **CSP** in `next.config.js` — `style-src 'self' 'unsafe-inline'`; if styles break in prod only, check CSP headers vs CDN.
- **Hydration warnings** in Cursor browser tooling (`data-cursor-ref`) — dev-only noise.
- **Program grid colors** — track-based via `roleColor`; room-based accent not yet on organizer cards (attendee side uses `locationColor` in places).
- **Import workflow** — still partially local-state when migration 007 absent (see [dancecard-handoff-2026-05-12.md](./dancecard-handoff-2026-05-12.md)).
- **No git commit** from agent session unless user requested — confirm branch state before deploy.

---

## Commands

```bash
cd EastCoast-master
npm run dev                    # http://localhost:3000
npm run build
npm run dancecard:smoke
npm run dancecard:seed-sandbox # reset sandbox demo data (--reset)
```

---

## Recommended Next Steps

1. **Smoke test organizer sandbox** end-to-end: Home → Program (grid + drag) → People → Settings (guide + agreements) → public preview link.
2. **Apply migrations 030–031** on staging/production if not already; re-run verify script.
3. **Production deploy** — single build artifact; confirm no stale `_next` CDN cache.
4. **RabbitSign** — configure webhook URL + secrets in integrations panel; test registrant status sync.
5. **ECKE Sign** — attendee policy flow on `/dancecard/sandbox` with published policies.
6. **Optional polish:** room color rail on organizer grid; persist grid tour completion in UI settings; mobile pass on sidebar + program grid.

---

## Reference Docs

| Doc | Purpose |
| --- | --- |
| [GENERIC_DANCECARD_PRODUCT_VISION.md](./GENERIC_DANCECARD_PRODUCT_VISION.md) | North star |
| [GENERIC_DANCECARD_IMPLEMENTATION_TRACKER.md](./GENERIC_DANCECARD_IMPLEMENTATION_TRACKER.md) | Agent checklist (all done) |
| [dancecard-handoff-2026-05-12.md](./dancecard-handoff-2026-05-12.md) | Import / drag-board prototype |
| [dancecard-design-tokens.md](./dancecard-design-tokens.md) | `dc-*` tokens, z-index |
| `database/README_DANCECARD.md` | Migration order |

---

## Agent Transcript

Full conversation (including parallel agent work):  
`.cursor/projects/.../agent-transcripts/44785d79-2b6e-4de8-90b9-11d0fdb6c06f.jsonl`

---

*Handoff author: Cursor agent session 2026-05-17. Update this file when migrations, env, or sandbox behavior change.*
