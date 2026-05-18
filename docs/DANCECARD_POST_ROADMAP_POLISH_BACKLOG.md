# Dancecard — post-roadmap polish backlog

**Purpose:** After **Phases 0–7** in [`DANCECARD_MASTER_PRODUCT_ROADMAP.md`](./DANCECARD_MASTER_PRODUCT_ROADMAP.md) are delivered (or when you intentionally pause for a “quality pass”), use this list to **close gaps**, **align docs with code**, and **finish partials** that were deferred for velocity.

**How to use:** Treat items as **optional polish**, not blockers for the next phase unless you decide otherwise. When you ship something here, move it to **Changelog** at the bottom or strike through / remove the row.

**How to maintain:** Append dated notes under **Changelog** when you add or complete items. Prefer linking to PRs or issues rather than duplicating long specs.

---

## 1. Security & platform hardening

| Item | Source | Notes |
| --- | --- | --- |
| Postgres **RLS** as a second layer for `dancecard_*` where anon/client access could exist | §3.2, P0.4 | Today: service-role + route checks + smoke; threat model in `docs/dancecard-first-run.md`. |
| **CI** beyond smoke: representative API boundary tests (organizer / attendee / staff / anonymous) | P0.4 acceptance | Smoke covers organizer anonymous **401**; expand if regressions slip through. |
| Audit **every** organizer route for `event_id` scoping and capability checks | P0.4 | Belt-and-suspenders review after feature growth. |

---

## 2. Phase 0 — deferred polish

| Item | Source | Notes |
| --- | --- | --- |
| Import UI: **diff highlight** (per-row changed preview before publish) | P0.6 partial, §3.3 | CLI + publish idempotency already exist. |
| **Regression tests** for attendee Program tab availability / `#program` | P0.1 epic | No dedicated automated suite called out today. |
| Program grid **keyboard** sensors (`KeyboardSensor`) parity with import board | P0.5 epic | Import: `ScheduleImportPanel`; grid: `ProgramScheduleGrid` (pointer-only today). |
| **Mobile** non-drag affordances on program grid where drag is primary | P0.5 acceptance | Revisit after Phase 3 boards land. |

---

## 3. Phase 1 — Sched parity & organizer UX

| Item | Source | Notes |
| --- | --- | --- |
| Dashboard quick links vs “reports” depth | P1.1 epic | **Messaging** and **Exports** are linked from `OrganizerEventDashboard.tsx` today; treat “reports” as deeper analytics / PDF server pipeline backlog, not missing tabs. |
| Readiness: deeper **volunteer coverage** (gaps vs requirements), not only shift row count | P1.1 epic | After Phase 4 shift modeling if needed. |
| Bulk toolbar: **`secret`** visibility alongside public / staff | P1.2 minor gap | `ProgramScheduleGrid` bulk actions. |
| Session drawer: **`?slot=`** URL opens drawer | P1.3 partial | Deep link from dashboard / share. |
| Session **Notes / audit**: durable storage + real audit trail (not only `updated_at` + placeholder) | P1.3 partial | May overlap Phase 5 reporting. |
| Per-session **registrant** surface (if product still wants it vs event-level only) | P1.3 epic | Today: copy points to **Registrants** tab. |
| Organizer grid: **location** filter / picker; **person** filter in-grid (optional if People tab is enough) | P1.4 partial | |
| Public schedule: dedicated **tag** filter control (not only search-includes-tags) | P1.5 partial | `DancecardClient` program filters. |
| Public schedule: **canonical location** filter when hierarchy exists | P1.5 + Phase 3 | Room string today. |
| **§3.4 table refresh**: align “dashboard quick links” wording with `OrganizerEventDashboard` | Doc drift | Refreshed **2026-05-13** for People / Registrants / venues / assignments; re-check after future dashboard edits. |

---

## 4. Phase 2 — registration & people depth

| Item | Source | Notes |
| --- | --- | --- |
| Registration form: **stepped wizard** (Intro → Fields → Confirmation) | P2.1 epic | Today: settings-section MVP. |
| Questions: **drag reorder** (`@dnd-kit` or equivalent) | P2.1 epic | |
| **Conditional** question engine + server-side evaluation on submit/import | P2.1 epic | `visibility_rules_json` stored. |
| **Category-scoped** field visibility + **category-required** question rules enforced | P2.1–P2.2 | |
| **Preview** route or modal for published form | P2.1 partial | |
| **Public** attendee registration submit flow (replace Google Forms end-to-end) | Optional Phase 2 slice | Organizer + import path exists first. |
| Registrant console: **answers** editor, **tags** UI, **consent** summary display | P2.3 partial | Policy acceptance recording exists in `RegistrantsPanel.tsx`; full answers/tags editors remain. |
| **CSV import** with column mapping (v1 minimal) | P2.3 partial | Panel supports **JSON and minimal CSV** import (fixed header aliases); interactive column mapper remains backlog. |
| **`PersonRoleAssignment`** CRUD API + UI | P2.4, §3.2 | Table exists in **011**; roles implied via slot people / staff today. |
| People directory: **tags**, **photo upload**, richer profile, **schedule** tab on person, **notes** tab | P2.4 epic | |
| **Presenter conflict detection** (not only “missing people” readiness) | P2.5 acceptance vs Phase 3 | **MVP shipped** in **P3.4** (`conflictScanner.ts` + readiness). **DM staffing gaps** use `dmCoverageScanner.ts` + readiness (not `conflictScanner`). Remaining: **location capacity** in overlap logic, richer conflict UX. |
| Registrant ↔ **Dancecard account** linking / merge UX | §3.2 | `person_id` optional on registrant exists. |

---

## 5. Cross-cutting product (after later phases)

| Item | Source | Notes |
| --- | --- | --- |
| Badges, messaging, calendar feeds, volunteer depth | §3.2, Phases 4–7 | **Shipped MVP slices:** badges print (**020**), staff/DM panels (**015–016**), organizer messaging + delivery log (**022** + Resend), tokenized program ICS (**021**), staff claim + Phase 7 swap API. **Still polish:** volunteer “marketplace” UX, SMS, attendee self-serve subscribe UI, server PDF/XLS, marketing automation. |
| **Roadmap §3.x** tables vs code: periodic reconciliation pass | Process | Especially after large merges. |
| Performance: hot-path allocation audit, documented frame budgets | User rules / roadmap spirit | After feature-complete pass. |

---

## 5.1 Phase 3 — deferred polish (post-MVP)

| Item | Source | Notes |
| --- | --- | --- |
| Venue grid **`@dnd-kit`** parity + capacity heatmap / empty-cell create | §3.6 P3.3 | `VenueAvailabilityGrid` ships HTML5 DnD MVP. |
| Assignment **bulk tag** on multi-select; **staff shift** drops | §3.6 P3.5 | `AssignmentBoardPanel` MVP. |
| **`conflictScanner`**: capacity vs `dancecard_locations.capacity` | §3.6 P3.4 | Venue / presenter / photographer overlap in readiness today; no `capacity` field on locations yet. |
| **DM coverage matrix** | §3.6 P4.2 | Lives in **`dmCoverageScanner.ts`** + readiness — do not fold into `conflictScanner` bullets. |
| Program card **“Where?”** deep link → `/map` + pin focus | P3.2 epic | Public map route exists; session affordance optional. |

---

## 6. Suggested order (non-binding)

1. **Doc sync** (cheap): §3.4 dashboard bullets, any stale “Phase 2 placeholder” copy in UI strings.  
2. **High-touch user polish**: P1.2 bulk secret, P1.5 tag filter, P2.1 reorder + preview.  
3. **Data trust**: session notes/audit, registrant answers/tags in UI, CSV import mapping.  
4. **Security**: RLS / expanded CI when exposure surface grows.  
5. **Delight**: keyboard/mobile parity on grids, import diff UI.

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-05-13 | Initial backlog seeded from Phase 0–2 gap audit and roadmap §3.2–§3.5 partials. |
| 2026-05-13 | Phase **3** MVP shipped: roadmap **§3.6**, migrations **013–014**, `dancecard-smoke` **venue-map** probe, `test:dancecard-conflicts`, first-run maps bucket note; backlog rows updated for presenter conflicts + maps. |
| 2026-05-13 | Docs: **incremental Phase 3** SQL path (013→014 only), post-SQL **Storage** checklist, and roadmap **§3.6** / **§11** ops wording (`dancecard-first-run.md`, `database/README_DANCECARD.md`, `DANCECARD_MASTER_PRODUCT_ROADMAP.md`). |
| 2026-05-14 | Multi-agent code vs docs audit: refreshed §3 / §5 rows for Messaging/Exports/CSV/DM scanner split; changelog note — incremental SQL for existing DBs continues through **027** per `database/README_DANCECARD.md` (not 014-only). Added `database/dancecard_verify_schema.sql` + pointers in README / first-run. |
