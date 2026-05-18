# Dancecard Master Product Roadmap

**Deploy snapshot (2026-05-18):** Phases **0–7** implementation is on GitHub `master` @ `931bc94`. Production Vercel + Supabase **007–040** apply still pending — [PROJECT_STATUS.md](./PROJECT_STATUS.md), [dancecard-handoff-2026-05-18.md](./dancecard-handoff-2026-05-18.md).

**Purpose:** Long-term reference plan for evolving Dancecard from a personal schedule / mutual availability app into a full event operations platform for kink events, hotel takeovers, campgrounds, presenter-led programming, staff/volunteer coordination, and attendee registration.

**Primary inputs:**

- `SCHED_REGISTRATION_EDITOR_REBUILD_MASTER.md` — Sched.com editor and registration reconnaissance.
- `sched_routing_table.json` — verified Sched route map and routing pitfalls.
- Dancecard app source under `EastCoast-master`.
- Dancecard schema migrations under `database/dancecard_*.sql`.
- Dancecard handoff docs under `docs/dancecard-*.md`.
- Periodic **code vs docs** reconciliation: [`DANCECARD_CODE_VS_DOCS_AUDIT.md`](./DANCECARD_CODE_VS_DOCS_AUDIT.md) (2026-05-14 snapshot).

**Product stance:** Build the robust platform first, but avoid payment processing. Registration, attendee imports, schedules, presenters, rooms, volunteers, photographers, badges, maps, reporting, and communications are in scope. Payments are out of scope except as external imports from third-party systems.

---

## 1. Working Product Vision

Dancecard should become the operational system of record for events that currently run on Google Docs, spreadsheets, group chats, and institutional memory.

The platform should help multiple organizers divide work safely:

- Programming lead manages sessions, tracks, presenters, rooms, and conflicts.
- Registration lead manages attendees, registration forms, categories, imports, waivers, and consent.
- Staff lead manages volunteers, DMs, check-in, shifts, and coverage gaps.
- Safety lead manages vetting, conduct acknowledgments, incident intake, and restricted notes.
- Media lead manages photographers, release status, and assignment coverage.
- Admin/owner manages event settings, permissions, exports, and integrations.

The app should feel approachable to non-technical organizers who are used to spreadsheets, but it should replace the fragile parts of spreadsheet workflows: no accidental overwrites, no invisible conflicts, no stale copies, no single-person bottlenecks, and no guessing whether a task was done.

---

## 2. Guiding Principles

1. **No payment processing.** Model registration categories, imported payment status, attendee status, and capacity, but do not process cards or hold funds.
2. **Spreadsheet-friendly, not spreadsheet-bound.** Import from Google Sheets, CSV, Eventbrite, or other systems, but convert records into structured entities with validation, diffs, audit logs, and safe re-import.
3. **Drag and drop everywhere it helps.** Drag sessions, people, venue pins, form questions, shifts, tags, and assignments. Every drag interaction must also have keyboard/mobile alternatives.
4. **Kink-event privacy by default.** Support scene names, legal names, privacy boundaries, consent fields, photography restrictions, vetting status, and restricted organizer notes.
5. **Rooms and places are first-class.** Hotel rooms, barns, cabins, play spaces, conference rooms, dining areas, and camp zones should be modeled as real locations, not just free-text labels.
6. **All organizer work should be shareable.** Every module should have role-based access so different leads can own their part of the event without full admin power.
7. **Every major operation needs an audit trail.** Imports, schedule changes, registration status changes, permission changes, and safety-sensitive edits should record who did what and when.
8. **Design for repeat events.** Cloning last year's event should be a core workflow, not an afterthought.
9. **Build modularly.** Several pieces should be extractable later: Sheet-to-Schedule, Floor-plan Navigator, Conflict Scanner, Volunteer Shift Board, Consent Manager, and Vetting CRM.

---

## 3. Current Dancecard Baseline

### 3.1 Already Strong

- Event-scoped app at `/dancecard/[eventSlug]`.
- Organizer route at `/organizer/dancecard/[eventSlug]`.
- Supabase-authenticated organizer access through `dancecard_event_organizers`.
- Site-wide admins can access any organizer event.
- Attendee accounts are event-scoped with custom username/password sessions.
- Personal dancecard selections, manual busy blocks, reservations, share links, and mutual availability are already core concepts.
- Staff access code and `is_staff` flag exist.
- Organizer import workflow has persistent batches, rows, validation errors, mapping, audit logs, and publish lifecycle.
- First-class locations exist in migration 007 with `name`, `short_name`, `capacity`, `notes`, and `sort_order`.
- Schedule-change notification tables exist.
- ICS export exists for personal commitments.
- Organizer program grid already uses `@dnd-kit`.
- **Phase 0 (May 2026):** Attendee **Program** tab is in shipped tab options with `#program` deep link; organizer import board uses `@dnd-kit/sortable` with keyboard sensors; owner/editor/**viewer** capabilities enforced in APIs and read-only organizer UI; `dancecard-smoke.mjs` probes organizer anonymous access; CLI program import is **upsert + `--dry-run`** (stable keys / slot `id`). See **§3.3** for the full delivery log.
- **Phase 1 (May 2026):** Organizer **Dashboard** + `GET …/readiness`; program slot **publish / visibility / freeze** (SQL **009**) and **bulk** API + grid multi-select; **session drawer** (GET/PATCH per slot); **tracks + session tags** (SQL **010**, CRUD APIs, settings + organizer grid filters); public schedule respects visibility + **List** view with search/day/**track/room/presenter** filters and **My schedule** count. See **§3.4** for the full delivery log and partials.
- **Phase 2 (May 2026):** **`dancecard_persons`** + **`dancecard_program_slot_persons`** + registration stack (**011–012**): organizer **People** and **Registrants** tabs; **Registration** settings (categories + form builder MVP); public schedule **`presenters[]`**; session drawer **People** tab; readiness checks for categories / published form / missing session people. See **§3.5**.
- **Phase 3 (May 2026):** **`dancecard_013`** location hierarchy + **`dancecard_014`** maps/pins; **`conflictScanner.ts`** + readiness integration; organizer **Venue grid** and **Assignments** tabs; **Maps** in event settings + public **`/dancecard/[slug]/map`** + **`GET /api/dancecard/.../venue-map`**. See **§3.6**.
- **Phase 4 (May 2026):** **`dancecard_015`–`020`** staff shift lifecycle + open-shift claim, **DM coverage** requirements + organizer matrix, **`photo_policy`** + no-photo export, **policy ledger** + registrant acceptances, **`safety`** role + vetting fields, **badges** JSON + check-in print tab. See **§3.7**.
- **MVP vs parity:** Phases **0–7** are **implemented in code** for the acceptance rows marked **Done** / **Done (MVP)** in **§3.3–§3.10** (each section still lists **partial** and **not done** backlog before claiming full Sched parity, public registration, RLS everywhere, full marketing automation, billing, etc. — see **§3.2**).

### 3.2 Important Current Gaps

- **Postgres RLS** is not the primary gate for organizer paths yet; access relies on **service-role + route authorization** and smoke checks (decision and threat model in `docs/dancecard-first-run.md`). Tightening RLS remains optional hardening.
- **`PersonRoleAssignment`** is in the schema (**011**) but has **no** organizer API/UI yet (roles are implied via `dancecard_program_slot_persons` and staff shifts).
- Program slots support **009** lifecycle, **`track_id`**, **session tags** (**010**), and **session people** (**011**) with public **`presenters[]`** on the attendee schedule. **Phase 3** adds **location hierarchy** (**013**), **maps/pins** (**014**), **`conflictScanner`**-driven readiness warnings, organizer **Venue grid** / **Assignments**, and public **`/map`**. **Phase 5** adds organizer-minted **tokenized ICS** for the published program (`GET /api/dancecard/[slug]/feeds/ics?token=…`). Remaining gaps include full **free-venues matrix** parity (advanced P3.3), **drag assignment board** parity with all roadmap roles (P3.5), **presenter conflict auto-fix**, and first-class attendee “copy my feed” UX beyond organizer token mint.
- No venue **capacity headcount** modeling (session-count proxy only in optional future work).
- No **venue hierarchy** browsing on the public schedule (locations are organizer-first; attendee map is separate).
- Registration **form builder MVP** and **registrant console** ship under organizer settings/tabs; there is still **no** public self-serve registration page, **no** conditional-question evaluator wired end-to-end, **no** payment import beyond text fields, and **no** separate attendee account ↔ registrant merge UX.
- No attendee ticket wallet beyond organizer badge print (Phase 4 MVP).
- **Organizer email (Phase 5):** Resend-backed **templates + campaigns + delivery log** ship; gaps remain for **SMS**, **schedule-change auto-campaigns** from `dancecard_schedule_change_notifications`, and **marketing automation** / segmentation beyond “all registrant emails.”
- **Calendar feeds (Phase 5):** organizer-minted **scoped program ICS** (full / track / room / presenter) ships; gaps remain for **attendee self-serve subscribe UI**, **non-token public** feeds, and **personal dancecard** ICS beyond existing personal commitments export patterns.
- No volunteer self-serve shift **marketplace** beyond open-shift **claim** API + organizer staff board (Phase 4 MVP) and **Phase 7** swap-request MVP.
- Consent/vetting: Phase 4 adds **policy ledger**, **vetting status + safety notes (RBAC)**, and **photo_policy** / no-photo export; Phase 7 adds **vetting applications** MVP and **policy summary** surface — there is still no full public registration checkout or legal e-sign vendor.
- **External registration paths (Phase 6–7):** JSON + CSV import, **registrant inbound webhook** + **`eventbrite`** adapter field paths, **external API** scopes, and **Google Sheet → import batch** ship; gaps remain for **signed HMAC-only inbound**, **Eventbrite polling**, and **import batch UI parity** with schedule imports.

### 3.3 Phase 0 — implementation status (May 2026)

**Product / code:** Phase **P0.1–P0.5** and the shipped parts of **P0.6** are **done** in `EastCoast-master` (see table). **P0.4** remains **interim** by design (service-role + route checks + smoke; full table RLS is optional follow-up).

**Database / ops:** Apply **000–020** (and optional `paf26` seed) per Supabase project using **`database/dancecard_full_bundle.sql`** (one editor paste) or `npm run dancecard:apply-migrations` with `DATABASE_URL` (includes 000–020; set `DANCECARD_APPLY_SEED=1` for seed). After deploy, run `npm run dancecard:smoke` / `npm run dancecard:smoke:auth` with **`DANCECARD_ORGANIZER_DEV_BYPASS` unset** so organizer anonymous **401** checks run.

| ID | Topic | Status | Where to look |
| --- | --- | --- | --- |
| P0.1 | Attendee program browser | **Done** | `DancecardClient.tsx` — `TAB_OPTIONS` + `DancecardProgramTabBody` in **minimal** and classic layouts; `#program` + `hashchange`. |
| P0.2 | Migration 007 + prototype UX | **Done** | `ScheduleImportPanel` migration messaging + **locations** `needsMigration` banner; SQL in `dancecard_007_…` / full bundle. |
| P0.3 | Organizer roles | **Done** | `dancecard_008_organizer_viewer_role.sql`; `organizerRoles.ts`, `organizerAuth.ts`; mutating routes gated; viewer read-only UI. **Note:** role union later gained **`safety`** (Phase 4 / §3.7 P4.5) for vetting-only access; treat as additive to the original owner/editor/viewer matrix. |
| P0.4 | RLS vs defense-in-depth | **Done (interim)** | `dancecard-first-run.md` — security model; `dancecard-smoke.mjs` — organizer **401** probe on multiple routes including **`GET …/readiness`**, **`GET …/tracks`**, **`GET …/tags`**, **`PATCH …/program-slots/bulk`**, etc. (skipped if dev bypass returns 200). |
| P0.5 | Unified `@dnd-kit` on import | **Done** | `ScheduleImportPanel` + `scheduleImportDndParts` / `scheduleImportDndIds`; `@dnd-kit/sortable`; pointer + keyboard sensors. |
| P0.6 | Idempotent re-import | **Done (CLI + publish); UI partial** | `dancecard-import-schedule.mjs` — upsert + `--dry-run`; publish uses `source_ref_id`. **Not done:** dedicated “diff highlight every changed row” in import *UI* before publish (roadmap stretch). |

**Scripts / ops:** `dancecard-add-organizer.mjs` accepts `viewer`. **`database/dancecard_full_bundle.sql`** + `npm run dancecard:build-migration-bundle` — see `database/README_DANCECARD.md`.

**Verdict:** **Phase 0 is complete** for stabilization and release planning, aside from the **optional** P0.6 UI polish above and any **process** checks (smokes/CI, mobile spot-check) your team wants before calling it “closed.”

### 3.4 Phase 1 — implementation status (May 2026)

**Product / code:** Core **P1.1–P1.5** behavior is **shipped** in `EastCoast-master` (see table). Remaining gaps are mostly **roadmap stretch** (extra dashboard links, presenter filters, full audit UI) or **Phase 2** (People / Registrants tabs, `Person` / `ProgramSlotPerson`).

**Database / ops:** Migrations **`dancecard_009_program_slot_lifecycle.sql`** and **`dancecard_010_tracks_tags.sql`** must be applied everywhere Phase 1 APIs run (included in **`database/dancecard_full_bundle.sql`** through **020** and `npm run dancecard:apply-migrations` default chain). **`npm run dancecard:smoke`** expects each public schedule slot (when any exist) to include **`tagNames[]`** and **`presenters[]`** (the latter requires **011+** people migrations applied; see §3.5).

| ID | Topic | Status | Where to look |
| --- | --- | --- | --- |
| P1.1 | Organizer dashboard + readiness | **Done (core); partial** | `src/app/api/organizer/dancecard/[eventSlug]/readiness/route.ts`, `OrganizerEventDashboard.tsx`, default **Dashboard** tab in `OrganizerDancecardClient.tsx`. Checklist covers publish state, program count, unpublished slots, locations, **`conflictScanner`** venue/person overlaps, staff/DM coverage (Phase **4**), registration / volunteer-depth items remain partial. Quick links include program, **people**, **registrants**, staff, **DM coverage**, **media**, **badges**, **exports**, **messaging**, import, **integrations**, settings, **venues**, **assignments**, public dancecard (`OrganizerEventDashboard.tsx`). **Partial:** richer “reports” hub beyond exports CSV/print, deeper volunteer coverage math, full URL `?tab=` sync for every tab. |
| P1.2 | Session bulk operations | **Done; minor gap** | `dancecard_009…`; `program-slots/bulk/route.ts`; `ProgramScheduleGrid.tsx` (multi-select, confirm delete, duplicate, tag add/remove). Bulk visibility actions expose **public** and **staff_only** in the toolbar; **secret** is set per-slot in the drawer (API supports bulk `setVisibility`). |
| P1.3 | Session detail drawer | **Done (core); partial** | `SessionDetailDrawer.tsx`; `src/app/api/organizer/dancecard/[eventSlug]/program-slots/[slotId]/route.ts` (**GET** + **PATCH** + **DELETE**). **People** tab is **wired** to **`program-slots/[slotId]/people`** (same APIs called out in Phase 2 §3.5 — shipped here, not a stub). **Registrants** tab remains event-level (see **Registrants** organizer tab). **Notes / audit** shows `updated_at` + placeholder copy (no durable notes table yet). Optional `?slot=` URL state **not** implemented. |
| P1.4 | Tags and tracks | **Done (core); partial** | `dancecard_010…`; `tracks/` + `tags/` organizer APIs; `TracksTagsSettingsSection.tsx` in `EventSettingsPanel.tsx`; organizer grid **search + track + tag** filters. **Organizer** grid does not yet include dedicated **location** or **person** pickers (person directory is a separate **People** tab). |
| P1.5 | Basic public schedule | **Done (core); partial** | `schedule/route.ts` + `publicProgramSlotsData.ts` + `programSlotPublication.ts` — published event, `is_published`, `visibility` (staff sees `staff_only` when session is staff). `DancecardClient.tsx` — **List** view, **search**, **day** + **track/room/presenter** filter dropdowns, **My schedule** count, add/remove on dancecard; `trackDisplay` + `tagNames` + **`presenters`** from API. |

**Verdict:** **Phase 1 is complete** for the “organizer control panel + sched-parity core” slice: lifecycle, bulk, drawer, tracks/tags, and safer public schedule behavior are in production code paths. Treat rows marked **partial** above as the backlog before claiming full Sched parity on filters, dashboard links, and session audit.

### 3.5 Phase 2 — implementation status (May 2026)

**Product / code:** Core **P2.1–P2.5** surfaces are **shipped as an MVP** in `EastCoast-master`: unified **Person** directory, **ProgramSlotPerson** assignments, **registration categories**, **registration form + questions** (settings UI), **registrant list/detail + CSV export + JSON import**, public schedule **`presenters[]`**, and organizer **People** / **Registrants** tabs.

**Database / ops:** Apply **`dancecard_011_people_slot_assignments.sql`** and **`dancecard_012_registration.sql`** (included in **`database/dancecard_full_bundle.sql`** and `npm run dancecard:apply-migrations` through **020**). Smoke expects each public schedule slot to include **`presenters`** (array, possibly empty) when slots exist.

| ID | Topic | Status | Where to look |
| --- | --- | --- | --- |
| P2.1 | Registration form builder | **Done (MVP); partial** | `registration-form/route.ts` (**GET**/**PUT**); `RegistrationSettingsSection.tsx` in `EventSettingsPanel.tsx` — intro/confirmation, draft vs published, question list with types/required/sort/remove. **Not done:** drag-reorder UX, conditional logic engine, field visibility by category beyond stored JSON, dedicated preview route. |
| P2.2 | Registration categories | **Done (MVP)** | `dancecard_012…` **`dancecard_registration_categories`**; `registration-categories/` + `[categoryId]/` APIs; list + add/delete in `RegistrationSettingsSection.tsx`. Capacity enforced on registrant create/import (auto **waitlisted** when full). |
| P2.3 | Registrant console | **Done (MVP); partial** | `registrants/` + `[registrantId]/` APIs; `registrants/export`, `registrants/import`; `RegistrantsPanel.tsx`. Detail modal supports status, pronouns, role-gated notes/vetting, optional policy-acceptance recording (Phase **4**). **Not done:** full answers editor UI, registrant tags UI, bulk CSV column mapping. |
| P2.4 | Person profiles | **Done (MVP); partial** | `dancecard_011…` **`dancecard_persons`** (+ **`dancecard_person_role_assignments`** table unused in UI); `people/` (**GET**, **POST**) + `people/[personId]/` (**GET**, **PATCH**, **DELETE**) APIs; `PeopleDirectoryPanel.tsx`. **Not done:** rich profile editor, photo upload pipeline, `PersonRoleAssignment` CRUD, person-tag picker in directory. |
| P2.5 | Attach people to sessions | **Done (MVP)** | `dancecard_program_slot_persons`; `program-slots/[slotId]/people` (**GET**/**PUT**); `SessionDetailDrawer.tsx` **People** tab; `publicProgramSlotsData.ts` + `schedule/route.ts` **`presenters`**; `DancecardClient.tsx` presenter filter. |

**Verdict:** **Phase 2 MVP is complete** for replacing spreadsheets with structured rows and wiring public presenter credits; treat **partial** rows as the backlog before claiming full Sched parity on registration UX and person-role modeling.

### 3.6 Phase 3 — implementation status (May 2026)

**Product / code:** **P3.1–P3.5** are **shipped as an MVP** in `EastCoast-master`: **location hierarchy** (parent, kind, accessibility, public directions, internal notes), **event maps + pins** with organizer upload + public **`/dancecard/[slug]/map`**, **`conflictScanner`** (venue double-book, presenter/moderator overlap, photographer overlap) wired into **`GET …/readiness`**, organizer **Venue grid** and **Assignments** tabs (HTML5 drag to PATCH slots / slot people), and dashboard quick links for those tabs.

**Database / ops:** Apply **`dancecard_013_location_hierarchy.sql`** then **`dancecard_014_venue_maps_pins.sql`** (both are in **`database/dancecard_full_bundle.sql`** and `npm run dancecard:apply-migrations` through **020**). **Greenfield:** one paste of the full bundle through **020** is fine. **Existing project already on 000–012:** paste **013** and **014** only in the Supabase SQL editor (see `docs/dancecard-first-run.md` — “Upgrading … Phase 3”). **Storage (required for maps):** create bucket **`dancecard-maps`** (or override with **`DANCECARD_MAPS_BUCKET`**) and policies so the server can upload and mint **signed URLs** for public map images (`docs/dancecard-first-run.md` checklist). SQL alone does not create the bucket.

| ID | Topic | Status | Where to look |
| --- | --- | --- | --- |
| P3.1 | Location hierarchy | **Done (MVP)** | `dancecard_013…`; `locations/route.ts`, `locationHierarchyHelpers.ts`, `LocationsSettingsSection.tsx`; cycle-safe `parent_id` PATCH. |
| P3.2 | Floor plan / camp map | **Done (MVP); partial** | `dancecard_014…`; `maps/upload`, `maps/`, `maps/[mapId]/pins`; `MapsSettingsSection.tsx`; **`GET /api/dancecard/[slug]/venue-map`**; attendee **`/map`**. **Not done:** rich multi-map editor, bucket policy templates in-repo only (ops doc). |
| P3.3 | Free venues grid | **Done (MVP); partial** | `VenueAvailabilityGrid.tsx` — day × time × leaf locations; drag moves **`locationId`** / **`room`**. **Not done:** `@dnd-kit` parity with program grid, capacity heatmap, empty-cell create. |
| P3.4 | Conflict scanner | **Done (MVP); partial** | `conflictScanner.ts`; `readiness/route.ts` pushes each scanner finding as its own readiness row (same information as “merged” conflict output); Phase **4** adds DM coverage gaps + photo-policy vs photographer. **Not done:** capacity vs `dancecard_locations.capacity`, attendee personal-schedule overlap. |
| P3.5 | Assignment board | **Done (MVP); partial** | `AssignmentBoardPanel.tsx` — drag **Person** → session, **`program-slots/[id]/people`**. **Not done:** bulk tag drop on multi-select, staff shift drops. |

**Verdict:** **Phase 3 MVP is complete** for hierarchy-aware locations, maps, shared conflict intelligence in readiness, and first organizer drag surfaces for venue/time and people assignment; treat **partial** rows as backlog before claiming full Sched parity on maps UX, venue matrix depth, and assignment bulk actions.

### 3.7 Phase 4 — implementation status (May 2026)

**Product / code:** **P4.1–P4.6** MVP slices are **shipped** in `EastCoast-master`: staff shift **lifecycle** + staff-only notes + **`locationId`** on organizer APIs; attendee **`POST …/staff-shifts/[id]/claim`** for `open` shifts; **DM requirements** + organizer **DM coverage** tab + readiness **`computeDmCoverageGaps`** + **`conflictScanner`** DM-without-location warnings; program slot **`photo_policy`** + organizer **Media** no-photo CSV + scanner warnings for photographers on restricted sessions; **`dancecard_policy_documents`** + **`dancecard_registrant_policy_acceptances`** with organizer CRUD/export and optional **`policyDocumentIds`** on registrant **PATCH**; **`safety`** organizer role with **vetting** fields gated in **`RegistrantsPanel`** + **`npm run test:dancecard-registrant-rbac`**; **Badges** tab + `badge_layout_json` in event settings + checked-in registrant print view.

**Database / ops:** Apply **`dancecard_015`** through **`dancecard_020`** (in `database/dancecard_full_bundle.sql` and `npm run dancecard:apply-migrations`). **`dancecard_event_organizers.role`** may include **`safety`** (019).

| ID | Topic | Status | Where to look |
| --- | --- | --- | --- |
| P4.1 | Volunteer shift board | **Done (MVP); partial** | `dancecard_015…`; `staff-shifts` routes; `StaffShiftsPanel.tsx`; readiness staff checks. **Not done:** peer swap marketplace, push notifications. |
| P4.2 | DM rotation | **Done (MVP); partial** | `016`; `dmCoverageScanner.ts`; `dm-requirements` APIs; `DmCoveragePanel.tsx`. **Not done:** full rotation solver, automated slot generation. |
| P4.3 | Photographer + consent | **Done (MVP); partial** | `017`; `media/no-photo-list`; session drawer `photoPolicy`; `conflictScanner.ts`. **Not done:** deep media assignment board beyond session people. |
| P4.4 | Policy ledger | **Done (MVP)** | `018`; `policy-documents`, `policy-acceptances`, export CSV/JSON; `PolicyLedgerSection.tsx`; registrant PATCH `policyDocumentIds`. |
| P4.5 | Vetting RBAC | **Done (MVP)** | `019`; `organizerRoles.ts`; `RegistrantsPanel.tsx` vetting tab; `scripts/dancecard-registrant-rbac-selftest.mjs` (`npm run test:dancecard-registrant-rbac`). |
| P4.6 | Badges / check-in | **Done (MVP)** | `020`; `BadgesPrintPanel.tsx`; check-in column + status PATCH. **Not done:** QR scanner, server PDF renderer. |

**Verdict:** **Phase 4 MVP is complete** for operational coverage primitives (staff/DM, consent artifacts, ledger, vetting, badges) at organizer depth; treat **partial** rows as backlog before claiming volunteer marketplace or full media ops parity.

### 3.8 Phase 5 — implementation status (May 2026)

**Product / code:** **P5.3–P5.5** and **P5.1–P5.2 (MVP)** slices are **shipped** in `EastCoast-master`: organizer **Exports** tab with CSV links (sessions, presenter directory, volunteer call sheet, existing registrant/policy/media exports), **HTML print** pages for schedule and venue signs, **calendar subscribe** via `GET /api/dancecard/[slug]/feeds/ics?token=…` backed by **`dancecard_calendar_feed_tokens`** (hashed secrets; full / track / room / presenter scopes; same public visibility rules as `fetchPublicProgramSlotsForEvent`), organizer **calendar-feeds** + **Messaging** tab (templates, draft campaigns, **Resend** send + **`dancecard_message_*`** delivery log), attendee **schedule refresh** (visibility + 2‑minute poll), **`stale-while-revalidate`** on `GET …/schedule`, **map deep links** with `?locationId=`, and **personal notes** UI for program selections.

**Database / ops:** Apply **`dancecard_021_calendar_feed_tokens.sql`** and **`dancecard_022_message_outbox.sql`** after **`020`** (included in `dancecard_full_bundle.sql` and `npm run dancecard:apply-migrations`). For outbound email set **`RESEND_API_KEY`** and **`DANCECARD_RESEND_FROM`** (see `docs/dancecard-first-run.md`).

| ID | Topic | Status | Where to look |
| --- | --- | --- | --- |
| P5.3 | Reports / exports hub | **Done (MVP)** | `ExportsHubPanel.tsx`; `exports/sessions`, `exports/presenter-directory`, `exports/volunteer-call-sheet`; print `organizer/dancecard/.../print/schedule` & `.../venue-signs`. **Not done:** server PDF pipeline, XLS beyond CSV. |
| P5.4 | Calendar feeds | **Done (MVP)** | `dancecard_021…`; `feeds/ics/route.ts`; `calendar-feeds` organizer API; `buildDancecardPublishedProgramIcs` in `dancecardIcs.ts`; `publicProgramSlotsData` includes `trackId`. **Not done:** attendee-facing “copy my feed” UI beyond organizer token mint. |
| P5.5 | Attendee mobile polish | **Done (MVP); partial** | `DancecardClient.tsx` schedule refresh + notes + map links; `schedule` route cache headers. **Not done:** service worker / true offline. |
| P5.1–P5.2 | Templates + outbox | **Done (MVP)** | `dancecard_022…`; `message-templates`, `message-campaigns`, `message-campaigns/[id]/send`; `MessagingPanel.tsx`; `resendOutbound.ts`. **Not done:** schedule-change auto-campaign hook from `dancecard_schedule_change_notifications`, segmentation beyond “all registrant emails”. |

**Verdict:** **Phase 5 MVP** is in place for exports/print, tokenized program ICS, lightweight messaging with delivery log, and targeted attendee UX improvements; treat **partial** / **not done** rows as backlog before claiming marketing automation, full PDF server pipeline, or SMS.

### 3.9 Phase 6 — implementation status (May 2026)

**Product / code:** Multi-event **organizer hub** at `/organizer/dancecard` with `GET /api/organizer/dancecard/events`, **create/clone** (`POST …/events`, `POST …/events/clone`, `cloneEvent.ts`), **registrant** external keys + CSV/JSON import upsert, **inbound webhook** `POST /api/webhooks/dancecard/[slug]/registrants`, **Google Sheets** OAuth + encrypted refresh + preview + connection PATCH, **Integrations** organizer tab (API keys, outbound webhooks, inbound secret mint, Sheets), **external API** `GET …/program-slots` and `POST …/registrants/import` with scopes, **outbound webhooks** on registrant import, **`dancecard_audit_log`** hooks.

**Database / ops:** Apply **`023`–`026`** after **`022`** for Phase 6 tables/columns; apply **`027`** for Phase 7 (embed tokens, entitlements, **`next_retry_at`** on webhook deliveries, swap/vetting tables) — see `database/README_DANCECARD.md` and `dancecard_full_bundle.sql`. Env: **`DANCECARD_TOKEN_ENCRYPT_KEY`** (min 16 chars) for Google token ciphertext; **`GOOGLE_OAUTH_CLIENT_ID`** / **`GOOGLE_OAUTH_CLIENT_SECRET`** for Sheets OAuth redirect flow.

| ID | Topic | Status | Where to look |
| --- | --- | --- | --- |
| P6.1 | My Events + hub | **Done (MVP)** | `GET /api/organizer/dancecard/events`; `/organizer/dancecard` hub + chrome; `dancecard_023…`; login default `next` → hub. **Not done:** admin “all events” flag, richer activity sort beyond `updated_at`. |
| P6.2 | Create / clone | **Done (MVP); partial** | `POST …/events`, `POST …/events/clone`, `cloneEvent.ts`. **Not done:** full domain checklist UI, staged clone for very large events, every roadmap copy domain. |
| P6.3 | Google Sheets | **Done (MVP); partial** | `025`; OAuth start/callback; `PATCH …/google-sheets/connection`; `POST …/google-sheets/preview`; **`POST …/google-sheets/create-import-batch`**. **Not done:** scheduled sync, dedicated column-map UI beyond header row, registrant/volunteer sheet sync. |
| P6.4 | External imports | **Done (MVP); partial** | `024`; import upsert; CSV in `RegistrantsPanel`; inbound webhook + `{ eventbrite }` adapter field paths. **Not done:** signed HMAC-only inbound (Bearer hash today), Eventbrite polling, import batch UI parity with schedule imports. |
| P6.5 | Public API + webhooks | **Done (MVP); partial** | `026`; API keys; external program + registrant import; outbound `dispatchDancecardWebhooks`; `DELETE …/webhooks/[id]`; **`027`** `next_retry_at` + **`GET /api/cron/dancecard-webhook-retries`**; **`GET /api/openapi/dancecard-external`**. **Not done:** IP allowlist, broader event types / write matrix. |

**Verdict:** Phase 6 **MVP slices** are in code for multi-event operations, cloning, integrations surface, and external/registrant automation; treat **partial** rows as backlog before claiming full SaaS hardening (queues, HMAC-only inbound, full Sheets auto-sync).

### 3.10 Phase 7 — implementation status (May 2026)

**Product / code:** Public **HTML embeds** at **`/embed/dancecard/[slug]/schedule`** and **`/embed/dancecard/[slug]/map`** (query `token=emb_…`); CSP + `frame-ancestors` on **`/embed/*`** via `next.config.js`. Organizer **embed token** mint/list/revoke (`GET/POST …/embed-tokens`, `DELETE …/embed-tokens/[id]`), **event entitlements** (`GET/PATCH …/event-entitlements`), **usage meter** (`GET …/usage-meter`), **Google sheet → import batch** (`POST …/google-sheets/create-import-batch`), **conflict report CSV** (`GET …/exports/conflict-report`), **ICS busy preview** (`POST …/ical-busy-preview`), **policy summary** (`GET /api/dancecard/[slug]/policy-summary`) + attendee page **`/dancecard/[slug]/policies`**, **shift swap** attendee + organizer approve APIs, **vetting applications** POST + organizer PATCH, shared **`fetchSignedVenueMapsForEvent`** (multi-map JSON up to 20 maps).

**Database / ops:** Apply **`027`** after **`026`** (`dancecard_embed_tokens`, `dancecard_event_entitlements`, `dancecard_webhook_deliveries.next_retry_at`, `dancecard_shift_swap_requests`, `dancecard_vetting_applications`). **Cron:** call **`GET /api/cron/dancecard-webhook-retries`** with **`Authorization: Bearer $DANCECARD_CRON_SECRET`** (or **`CRON_SECRET`**) on a schedule (e.g. every 2 minutes).

| ID | Topic | Status | Where to look |
| --- | --- | --- | --- |
| P7.1 | Sheet-to-Schedule + embed | **Done (MVP); partial** | `create-import-batch`, `googleSheetMatrixToImport`, `importBatchInsert`; embed schedule route; `embed-tokens`, `eventEntitlements`; [`docs/dancecard-embed.md`](./dancecard-embed.md). **Not done:** scheduled sheet sync, dedicated column-map UI. |
| P7.2 | Floor-plan navigator + map embed | **Done (MVP); partial** | `venueMapsSigned`, map embed route; attendee map page multi-map. **Not done:** organizer multi-map polish, deep mobile nav widget extraction. |
| P7.3 | Conflict scanner module | **Done (MVP); partial** | `conflictScanFromEvent`, `exports/conflict-report`; ICS busy parser `parseIcsBusyBlocks`. **Not done:** standalone npm package, full CalDAV ingest. |
| P7.4 | Volunteer shift board | **Done (MVP); partial** | `dancecard_shift_swap_requests` + `POST/GET …/shift-swaps` + organizer PATCH approve. **Not done:** email reminders, full marketplace UX. |
| P7.5 | Consent / release bridge | **Done (MVP); partial** | `policy-summary` + `/dancecard/.../policies`; `policy_public_summary` entitlement. **Not done:** structured policy pack export to attendee cards in main shell. |
| P7.6 | Vetting CRM | **Done (MVP); partial** | `dancecard_vetting_applications` + public POST + organizer list/PATCH. **Not done:** references/vouch workflow, full CRM UI. |
| Commercial | Entitlements + metering | **Done (thin MVP)** | `dancecard_event_entitlements`, `usage-meter`; billing still **not** wired (per plan). |

**Verdict:** Phase 7 delivers **embed + entitlements + metering hooks + library-facing scanner export + swap/vetting/policy bridges**; treat **partial** rows as backlog before claiming full productized modules or billing.

---

## 4. Reference Feature Decisions From Sched

### 4.1 Take From Sched

- Registration form builder with intro, fields, confirmation, required toggles, drag reorder, field types, and conditional questions.
- Registration categories, but not payment tickets.
- Attendee/registrant console.
- Session bulk operations: publish, unpublish, freeze, secret/private, duplicate, tag, delete.
- Session/person/tag filtering.
- Presenter/person directory shell with per-role tabs.
- Attach-people matrix on sessions.
- Free-venues grid.
- Conflict detection for venue and person overlaps.
- Page editors for Landing, About, FAQ, Schedule, Registration, and Map.
- Badges and venue-sign exports.
- Message templates and outbox/logs.
- Reports/exports by schedule, directory, attendees, badges, and venue signs.
- My Events menu and event switching.
- Clone/create event flow.

### 4.2 Do Not Take From Sched

- Stripe or payment processing.
- Coupons as payment discounts.
- Guest buyers as payment buyers.
- ClassLink.
- Native app upsell.
- HubSpot/Userpilot/Amplitude-style invasive analytics.
- AI writing menus as a core dependency.
- Hash-routed editor tabs.
- Custom CSS as a default organizer-facing tool.

### 4.3 Reframe From Sched

- **Tickets** become **Registration Categories**: Full Weekend, Day Pass, Presenter, Photographer, Staff, Volunteer, Comp, Vendor, etc.
- **Coupons** become **Access Codes / Category Codes**.
- **Ticket Holders** become **Registrants**.
- **Guest Buyers** become **Plus-one / Roommate / Companion records**.
- **Badges** become privacy-aware badge printing with scene name, pronouns, role stripe, and optional QR.
- **Eventbrite integration** becomes a generic external attendee import adapter.

---

## 5. Domain Model Direction

This section is not a final schema, but it names the durable concepts every phase should use.

### 5.1 Core Entities

- `Event`
- `EventRoleGrant`
- `EventSettings`
- `RegistrationForm`
- `RegistrationQuestion`
- `RegistrationCategory`
- `Registrant`
- `RegistrantAnswer`
- `Person`
- `PersonRoleAssignment`
- `ProgramSlot`
- `ProgramSlotPerson`
- `Track`
- `Tag`
- `Location`
- `LocationMap`
- `LocationMapPin`
- `VolunteerShift`
- `ShiftAssignment`
- `PhotographerAssignment`
- `BadgeTemplate`
- `MessageTemplate`
- `MessageDelivery`
- `ImportBatch`
- `ImportRow`
- `AuditLog`
- `ScheduleChangeNotification`
- `IncidentReport`
- `VettingRecord`
- `ConsentRecord`

### 5.2 People and Identity

The platform needs a stronger people model than Sched and stronger than current Dancecard.

Each person should support:

- Scene/display name.
- Legal name, private by default.
- Pronouns.
- Email and optional phone.
- Public bio.
- Internal notes.
- Photo/headshot.
- Public/private visibility controls per sensitive field.
- Role assignments: presenter, staff, volunteer, DM, photographer, vendor, admin, attendee, safety lead, etc.
- Tags.
- Vetting status.
- Consent status.
- Schedule relationships.

### 5.3 Locations

Locations should support both simple and hierarchical venues:

- Hotel
- Floor
- Room
- Campground
- Zone
- Cabin
- Barn
- Pavilion
- Outdoor area
- Dining area
- Play space
- Staff-only area

Recommended fields:

- Name
- Short name
- Kind
- Parent location
- Capacity
- Accessibility notes
- Public directions
- Organizer notes
- Map pin coordinates
- Sort order
- Visibility status

### 5.4 Registration Without Payments

Registration should model:

- Form configuration.
- Categories/capacity.
- External payment/import source.
- Imported payment status, if any.
- Attendance status.
- Waiver/code-of-conduct acknowledgment.
- Photo and media consent.
- Emergency contact.
- Accessibility/accommodation needs.
- Allergies/medical notes.
- Roommate/plus-one links.
- Staff/presenter/volunteer category rules.

Do not model payment transactions except as imported reference data from external systems.

---

## 6. Phase Roadmap Overview

Use these phase IDs when asking for future work:

- **Phase 0:** Stabilize current Dancecard foundation.
- **Phase 1:** Organizer basics and Sched-parity core.
- **Phase 2:** Registration and people system.
- **Phase 3:** Rooms, maps, drag-and-drop operations, and conflict intelligence.
- **Phase 4:** Staff, volunteers, photographers, safety, consent, and badges.
- **Phase 5:** Communications, reporting, exports, and attendee polish.
- **Phase 6:** Integrations, cloning, multi-event SaaS readiness.
- **Phase 7:** Extractable modules and commercialization.

Each phase below is broken into epics and smaller implementation slices.

---

## Phase 0 — Stabilize Current Dancecard Foundation

**Goal:** Make the existing app safe, coherent, and ready for larger product work.

**Status (May 2026):** Phase 0 is **complete** in code and documented in **§3.3** (one optional P0.6 UI polish). Per Supabase project: apply **`database/dancecard_full_bundle.sql`** (or `npm run dancecard:apply-migrations` with `DATABASE_URL`), then smoke-test with **`DANCECARD_ORGANIZER_DEV_BYPASS` unset** for real organizer **401** checks.

**Ask later:** "Make a detailed implementation plan for Phase 0."

### P0.1 Fix Attendee Program Browser Access

**Resolved (May 2026):** Program is in attendee `TAB_OPTIONS`; `#program` hash supported. See **§3.3**.

Original gap: `DancecardClient.tsx` had a `program` tab branch but tab options did not expose it.

Tasks:

- Add "Program" to attendee tab options.
- Confirm the default layout can access the program browser.
- Ensure selecting a program slot creates a `program` selection.
- Add basic regression coverage for tab availability.

Acceptance:

- Attendees can browse the event program without organizer access.
- Attendees can add/remove program sessions from their dancecard.
- Program browser works on mobile.

### P0.2 Apply and Verify Migration 007

**Resolved in code (May 2026):** Migration scripts and import UX; operators must still apply SQL per Supabase project. See **§3.3**.

Tasks:

- Confirm `dancecard_007_organizer_import_workflow.sql` has been applied to every target environment.
- Remove or reduce local-prototype fallback paths where production tables now exist.
- Verify import batches, import rows, locations, audit logs, and schedule-change notifications.

Acceptance:

- Organizer import UI persists data instead of falling back to local state.
- Publish no longer depends on prototype-only local data.

### P0.3 Enforce Organizer Role Boundaries

**Resolved (May 2026):** Capability helpers, API checks, `viewer` role + migration 008, read-only organizer UI. See **§3.3**.

Original gap: `owner` and `editor` existed but did not enforce distinct permissions.

Tasks:

- Define owner/editor/viewer permissions.
- Owner: manage grants, delete event, clone event, edit all settings.
- Editor: manage assigned modules, not grants.
- Viewer: read-only organizer access.
- Update organizer APIs to check capability, not only event access.

Acceptance:

- Owners can add/remove organizers.
- Editors cannot change owner grants.
- Viewer accounts cannot mutate event data.

### P0.4 Add RLS or Defense-in-Depth

**Interim complete (May 2026):** Defense-in-depth documented; organizer anonymous checks in `dancecard-smoke.mjs`. Full table RLS not required for this slice. See **§3.3**.

Original note: schema commentary suggested no RLS required for v1.

Tasks:

- Decide between full RLS now or route-handler defense-in-depth plus test coverage as an interim.
- Add a threat model for service-role routes.
- Add API authorization tests for organizer, admin, attendee, staff, and anonymous boundaries.

Acceptance:

- A route bug is less likely to expose another event's data.
- CI checks role boundaries for representative APIs.

### P0.5 Standardize Drag System

**Resolved (May 2026):** Import board on `@dnd-kit` + sortable + keyboard sensor. See **§3.3**.

Tasks:

- Standardize on `@dnd-kit/core` plus `@dnd-kit/sortable`.
- Replace HTML5 drag in organizer import panels.
- Add keyboard fallback patterns.
- Add mobile fallback controls.

Acceptance:

- Program grid and import board use the same drag architecture.
- Keyboard users can reorder and move items.
- Mobile users can use non-drag controls.

### P0.6 Idempotent Re-import

**Resolved for CLI + publish path (May 2026):** CLI upsert + `--dry-run`; publish uses `source_ref_id` update branch. Import UI “diff highlight before publish” remains a small partial — see **§3.3**.

Original issue: CLI importers deleted and reinserted all program rows.

Tasks:

- Add stable external IDs or import keys.
- Implement diff-based update/insert/skip behavior.
- Preserve attendee selections, notes, and notifications where possible.
- Add dry-run preview.

Acceptance:

- Re-importing the same sheet does not duplicate rows or destroy selections.
- Changed rows are highlighted before publish.

---

## Phase 1 — Organizer Basics and Sched-Parity Core

**Goal:** Give organizers the core control panel they expect before building deeper registration/safety features.

**Status (May 2026):** **Shipped in code** — see **§3.4 Phase 1 — implementation status** for the delivery table, file pointers, and documented **partial** follow-ups (extra dashboard links, attendee track/room filter UI, bulk “secret” toolbar, deep link `?slot=`, Phase 2 drawer tabs).

**Ask later:** "Make a detailed implementation plan for Phase 1." *(Plan executed; keep prompt for Phase 2+ or for replanning slices.)*

### P1.1 Organizer Dashboard

Tasks:

- Build event dashboard with setup checklist.
- Show warnings: unpublished event, missing registration form, missing rooms, schedule conflicts, unassigned presenters, volunteer coverage gaps.
- Add quick links to registration, schedule, people, locations, imports, messages, reports.

Acceptance:

- Organizer can understand event readiness from one screen.

### P1.2 Session Bulk Operations

Tasks:

- Add multi-select to program slots.
- Bulk publish/unpublish.
- Bulk secret/staff-only/public.
- Bulk freeze/unfreeze.
- Bulk tag.
- Bulk duplicate.
- Bulk delete with confirmation.

Acceptance:

- Programming lead can manage schedule changes without row-by-row editing.

### P1.3 Session Detail Drawer

Tasks:

- Overview tab.
- Edit tab.
- People tab.
- Location tab.
- Attendees/registrants tab.
- Notes/audit tab.

Acceptance:

- A session can be managed from one drawer without leaving the schedule.

### P1.4 Tags and Tracks

Tasks:

- Create `Track` entity with color and sort order.
- Create `Tag` entity with scope: session, person, registrant, location.
- Add tag manager.
- Add filters by track/tag/location/person.

Acceptance:

- Organizers can group sessions and people without spreadsheet columns.

### P1.5 Basic Public Schedule

Tasks:

- Public event `/list` equivalent.
- Search.
- Filter by day, track, location, presenter, tag.
- "My Schedule" count.
- Add to personal dancecard.

Acceptance:

- Attendees can browse and save sessions on phone.

---

## Phase 2 — Registration and People System

**Goal:** Replace Google Forms and presenter/staff spreadsheets with structured records.

**Ask later:** "Make a detailed implementation plan for Phase 2."

### P2.1 Registration Form Builder

Tasks:

- Three-step wizard: Intro, Fields, Confirmation.
- System fields: scene name, legal name, email.
- Field types: text, long text, email, phone, single choice, multi choice, dropdown, file upload, date, emergency contact, pronouns, consent matrix.
- Required toggles.
- Drag reorder.
- Conditional questions.
- Field visibility by category.
- Preview mode.

Acceptance:

- Organizer can create a registration form without code.
- Form can support event-specific kink/privacy needs.

### P2.2 Registration Categories

Tasks:

- Category records: Full Weekend, Day Pass, Presenter, Staff, Volunteer, Photographer, Vendor, Comp.
- Capacity limits.
- Category-specific required questions.
- Access codes.
- External source reference.
- Imported payment status field.

Acceptance:

- Registration can be tracked without processing payments.

### P2.3 Registrant Console

Tasks:

- Registrant list.
- Status: imported, pending, confirmed, cancelled, waitlisted, checked-in.
- Category.
- Consent summary.
- Form answers.
- Internal notes.
- Tags.
- Bulk import/export.

Acceptance:

- Registration lead can manage attendees without a spreadsheet.

### P2.4 Person Profiles

Tasks:

- Create unified `Person`.
- Support role assignments.
- Add scene/legal name split.
- Add public/private field controls.
- Add photo and bio.
- Add tags.
- Add schedule tab.
- Add notes tab.

Acceptance:

- Presenters, photographers, volunteers, DMs, vendors, and staff can be managed through one people directory.

### P2.5 Attach People to Sessions

Tasks:

- Add `ProgramSlotPerson`.
- Roles: lead presenter, co-presenter, moderator, photographer, DM, volunteer, staff.
- Sort order.
- Public visibility toggle.

Acceptance:

- Session pages can display presenters.
- Organizer can detect presenter conflicts.

---

## Phase 3 — Rooms, Maps, Drag-and-Drop Operations, and Conflict Intelligence

**Goal:** Make Dancecard unusually strong for hotel takeovers and campgrounds.

**Ask later:** "Make a detailed implementation plan for Phase 3."

### P3.1 Location Hierarchy

Tasks:

- Add parent/child locations.
- Add location kind.
- Add capacity and accessibility fields.
- Add public directions and internal notes.
- Add sort/order controls.

Acceptance:

- Event can model hotel floors, conference rooms, barns, cabins, pavilions, and outdoor areas.

### P3.2 Floor Plan / Camp Map

Tasks:

- Upload map image/PDF.
- Place draggable pins.
- Assign pins to locations.
- Public map page.
- Attendee "where is this session?" link.

Acceptance:

- Attendees can navigate the venue from a phone-friendly map.

### P3.3 Free Venues Grid

Tasks:

- Build venue-by-time matrix.
- Show empty blocks.
- Drag sessions into empty cells.
- Show capacity and conflicts.

Acceptance:

- Programming lead can find available rooms visually.

### P3.4 Conflict Scanner

Tasks:

- Venue overlap detection.
- Presenter overlap detection.
- Photographer overlap detection.
- DM/staff coverage overlap detection.
- Attendee personal schedule overlap warnings.
- Capacity warnings.
- Secret/staff-only visibility warnings.

Acceptance:

- Organizer dashboard shows actionable conflicts.
- Conflicts link directly to fix workflows.

### P3.5 Drag-and-Drop Assignment Board

Tasks:

- Drag person chips onto sessions.
- Drag photographer onto session coverage.
- Drag volunteer/DM onto shift.
- Drag session onto room/time.
- Drag tag onto batch of selected items.

Acceptance:

- Most organizer assignment work can be done visually.

---

## Phase 4 — Staff, Volunteers, Photographers, Safety, Consent, and Badges

**Goal:** Cover the operational realities that generic conference tools miss.

**Ask later:** "Make a detailed implementation plan for Phase 4."

### P4.1 Volunteer Shift Board

Tasks:

- Open shifts.
- Self-claim.
- Organizer assignment.
- Swap request.
- Drop request.
- Coverage dashboard.
- Staff-only notes.

Acceptance:

- Volunteer lead can run shifts without a separate spreadsheet.

### P4.2 DM Rotation Builder

Tasks:

- DM role type.
- Coverage matrix by play space/time.
- Minimum coverage warnings.
- Training/certification fields.
- Lead/floater assignment.

Acceptance:

- Safety/staff lead can confirm every play space has coverage.

### P4.3 Photographer Assignment and Consent

Tasks:

- Photographer person role.
- Assign photographers to sessions/locations/time blocks.
- Pull photo consent from registrant answers.
- Generate no-photo list.
- Mark sessions as photo-restricted.

Acceptance:

- Media lead can plan coverage without violating consent.

### P4.4 Consent and Conduct Ledger

Tasks:

- Code of conduct acknowledgment.
- Waiver acknowledgment.
- Photo/recording/marketing consent.
- Emergency contact.
- Timestamped versions.
- Exportable ledger.

Acceptance:

- Organizer can prove who acknowledged which policy version.

### P4.5 Vetting Workflow

Tasks:

- Vetting statuses.
- Reference/vouch records.
- Restricted notes.
- Safety lead-only access.
- Audit trail.

Acceptance:

- Private event admissions can be managed safely inside the app.

### P4.6 Badges and Check-In

Tasks:

- Badge templates.
- Scene name large.
- Pronouns.
- Role/category stripe.
- Optional QR.
- Check-in screen.
- Check-in export.

Acceptance:

- Event can print badges and track arrivals.

---

## Phase 5 — Communications, Reporting, Exports, and Attendee Polish

**Goal:** Make the tool useful during the event, not just before it.

**Status (May 2026):** MVP slices are **shipped** in code; database **`021`–`022`** and env for Resend/feeds are documented in **§3.8** and [`dancecard-first-run.md`](./dancecard-first-run.md). Phase 6 follow-on migrations **`023`–`026`** are documented in **§3.9** and the same first-run guide.

**Ask later:** "Make a detailed implementation plan for Phase 5."

### P5.1 Message Templates

Tasks:

- Welcome message.
- Schedule reminder.
- Schedule change alert.
- Registration confirmation.
- Volunteer shift reminder.
- Staff briefing.
- Policy reminder.

Acceptance:

- Organizer can communicate by category, tag, role, and schedule impact.

### P5.2 Outbox and Logs

Tasks:

- Sent/scheduled message log.
- Recipient counts.
- Failed deliveries.
- Preview.
- Audit trail.

Acceptance:

- Leads can verify what was sent and when.

### P5.3 Reports and Exports

Tasks:

- Schedule print (**HTML today**; server PDF backlog).
- Venue signs print (**HTML today**; server PDF backlog).
- Badges print (**HTML today**; server PDF backlog).
- Sessions XLS/CSV.
- Presenter directory.
- Registrant export.
- Volunteer call sheet.
- DM rotation report.
- Photographer consent report.
- Allergy/accommodation report.

Acceptance:

- Organizer can run the event offline if needed.

### P5.4 Calendar Feeds

Tasks:

- Full-event ICS.
- Per-person ICS.
- Per-room ICS.
- Per-track ICS.
- Per-presenter ICS.
- Subscribe URLs, not just downloads.

Acceptance:

- Attendees and staff can subscribe to relevant calendars.

### P5.5 Attendee Mobile Polish

Tasks:

- Fast mobile schedule.
- Offline-ish cached schedule.
- Map links.
- My Schedule.
- Change notifications.
- Personal notes.

Acceptance:

- Attendee can navigate the event day-of without a printed packet.

---

## Phase 6 — Integrations, Cloning, and Multi-Event SaaS Readiness

**Goal:** Make Dancecard reusable for recurring events and sellable as a platform.

**Status (May 2026):** MVP slices are **shipped** in code; see **§3.9 Phase 6 — implementation status** (table + verdict) and [`dancecard-first-run.md`](./dancecard-first-run.md) (Phase 6 increment: migrations **023–026**, Google OAuth env, API keys, inbound webhook).

**Ask later:** "Make a detailed implementation plan for Phase 6."

### P6.1 My Events

Tasks:

- Organizer event switcher.
- Recently edited events.
- Role display per event.
- Event status indicators.

Acceptance:

- Organizer can manage more than one event without remembering URLs.

### P6.2 Create / Clone Event

Tasks:

- Create event wizard.
- Clone previous event.
- Choose what to copy: settings, locations, tracks, tags, form, pages, people, schedule templates.
- Date shifting.

Acceptance:

- Returning events can bootstrap next year in minutes.

### P6.3 Google Sheets Connector

Tasks:

- Connect sheet.
- Map columns.
- Dry-run import.
- Sync schedule.
- Sync registrants.
- Sync volunteers.
- Diff preview.

Acceptance:

- Existing spreadsheet workflows can migrate gradually.

### P6.4 External Attendee Imports

Tasks:

- CSV import.
- Eventbrite import.
- Generic webhook endpoint.
- Manual upload.
- External ID matching.

Acceptance:

- Payment platforms can remain external while Dancecard receives attendee data.

### P6.5 Public API and Webhooks

Tasks:

- API keys.
- Scoped permissions.
- Webhook events.
- Audit log.
- Docs.

Acceptance:

- Larger events can integrate Dancecard with their own systems.

---

## Phase 7 — Extractable Modules and Commercialization

**Goal:** Identify which pieces can become standalone products or premium modules.

**Status (May 2026):** MVP slices for embeds, entitlements JSON, metering hook, webhook retries, Sheets→import batch, conflict CSV export, ICS busy preview API, policy summary + attendee page, shift-swap and vetting-application APIs are **shipped** in code — see **§3.10** for the acceptance table, file pointers, and **partial / not done** rows. This long-form section describes **product targets and extraction**; it is not a second status source of truth.

**UI / experience backlog (cross-phase):** Ambitious facelift ideas, design-system direction, and “sky’s the limit” UX notes live in [`DANCECARD_UI_FACELIFT_BACKLOG.md`](./DANCECARD_UI_FACELIFT_BACKLOG.md) (updated as the product evolves—not tied to a single phase epic).

**Ask later:** "Make a detailed implementation plan for Phase 7."

### P7.1 Sheet-to-Schedule

Standalone module:

- Google Sheets sync.
- Column mapping.
- Conflict scanner.
- Public schedule embed.

### P7.2 Floor-Plan Navigator

Standalone module:

- Map upload.
- Pins.
- Schedule/location linkage.
- Mobile navigation.
- Embed.

### P7.3 Conflict Scanner

Standalone module:

- iCal/CSV import.
- Venue/person overlap.
- Capacity warnings.
- Exportable report.

### P7.4 Volunteer Shift Board

Standalone module:

- Open shifts.
- Self-claim.
- Swaps.
- Reminders.
- Reports.

### P7.5 Consent and Release Manager

Standalone module:

- Photo/media consent.
- Release forms.
- Policy acknowledgments.
- Exportable ledgers.

### P7.6 Vetting CRM

Standalone module:

- Applications.
- References.
- Vouching.
- Restricted notes.
- Status workflows.

---

## 7. Suggested Implementation Order Inside Each Phase

When making a phase plan, prefer this sequence:

1. **Schema changes** — tables, constraints, indexes, audit fields.
2. **Server APIs** — route handlers, validation, auth/capability checks.
3. **Organizer UI** — internal management screens.
4. **Attendee UI** — public/mobile-facing pieces.
5. **Imports/exports** — data in/out.
6. **Tests/smokes** — auth boundaries, idempotency, regression coverage.
7. **Docs** — update this roadmap, handoff docs, and operational runbooks.

Do not begin a UI-heavy module until its role boundaries are clear.

---

## 8. Recommended Data Safety Defaults

### Sensitive Fields

Treat these as restricted by default:

- Legal name
- Phone
- Emergency contact
- Medical/accommodation notes
- Vetting status
- Incident records
- Safety notes
- Photo/recording restrictions
- Staff-only notes

### Audit Events

Audit at least:

- Organizer grant changes
- Registration status changes
- Vetting status changes
- Consent changes
- Import publish
- Schedule publish
- Session deletion
- Message send
- Badge print batch
- Check-in
- Incident record create/update

### Privacy Defaults

- Public schedule should not expose legal names.
- Share links should not expose private notes.
- Photographer exports should clearly identify no-photo attendees.
- Admin-only and safety-only notes should never appear in regular organizer exports.

---

## 9. Suggested Milestone Names

Use these names when planning, estimating, or creating issues:

- **M0:** Existing Dancecard stabilized.
- **M1:** Organizer control panel usable.
- **M2:** Registration replaces Google Forms.
- **M3:** People directory replaces presenter/staff spreadsheets.
- **M4:** Rooms and maps replace hallway guesswork.
- **M5:** Staff and safety operations covered.
- **M6:** Communications and reports replace manual email blasts.
- **M7:** Multi-event SaaS foundation.
- **M8:** Extractable commercial modules.

---

## 10. Quick Prompt Templates For Future Work

Use these prompts against this file.

### Phase Planning

> Read `docs/DANCECARD_MASTER_PRODUCT_ROADMAP.md`. Make a detailed implementation plan for Phase `<N>`, including schema changes, API routes, UI components, tests, risks, and acceptance criteria. Do not implement yet.

### Phase Implementation

> Read `docs/DANCECARD_MASTER_PRODUCT_ROADMAP.md`. Implement Phase `<N>` slice `<ID>`. Keep changes scoped, follow existing Dancecard patterns, add focused tests/smokes, and update relevant docs.

### Architecture Review

> Read `docs/DANCECARD_MASTER_PRODUCT_ROADMAP.md` and current Dancecard code. Review whether the proposed implementation for Phase `<N>` preserves role boundaries, privacy defaults, import idempotency, and future modular extraction.

### Gap Check

> Read `docs/DANCECARD_MASTER_PRODUCT_ROADMAP.md`. Compare current code against Phase `<N>` and list what is complete, partial, blocked, or not started.

---

## 11. Immediate Recommended Next Actions

1. **Operations:** On each Supabase project, confirm **database** through **020** (full bundle paste, `npm run dancecard:apply-migrations`, or **incremental** slices per `docs/dancecard-first-run.md`). **Then** provision Storage bucket **`dancecard-maps`** (or **`DANCECARD_MAPS_BUCKET`**) for map uploads; SQL does not create the bucket. Run `npm run dancecard:smoke` / `npm run dancecard:smoke:auth` with **`DANCECARD_ORGANIZER_DEV_BYPASS` unset** so organizer anonymous **401** checks run.
2. **Optional CI:** Add a workflow step that runs `dancecard:smoke` against a preview URL or localhost job so Dancecard boundary checks run on Dancecard-touched PRs.
3. **Phase 2–3 follow-ups (optional):** Public attendee registration submit flow; `PersonRoleAssignment` APIs + UI; registrant answers/tags in UI; form question drag-reorder + conditional visibility evaluation; organizer bulk **secret** + drawer **`?slot=`** from Phase 1 notes; Phase **3** partials in **§3.6** (capacity rules, `@dnd-kit` venue grid parity, assignment bulk tag drop, program → map deep link).
4. **Schema direction:** Phase **4+** — volunteer shift depth, messaging, badges (see roadmap Phases 4–6).
5. **Defer:** Badges, messaging, and external ticket adapters remain later phases per roadmap.

---

## 12. Product North Star

The product wins if an event organizer can stop maintaining five disconnected spreadsheets and instead answer these questions from one place:

- Who is coming?
- What did they consent to?
- Who is presenting?
- Where is each session?
- Who is staffing each space?
- What changed since yesterday?
- Who still needs attention?
- What can be safely printed, exported, or shared?

Everything in this roadmap should serve that outcome.
