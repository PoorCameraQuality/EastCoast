# Dancecard — Master UI/UX Plan (phased)

**Purpose:** Single planning document for **all UI/UX work** from standalone release through C2K integration. Point sprints, design reviews, and hiring at **UI Phases 1–8** below.

**Status:** Planning baseline — May 2026. Backend product phases **0–7 are implemented**; this plan covers **interface and experience** only.

**Companion docs (do not duplicate here):**

| Doc | Role |
| --- | --- |
| [`DANCECARD_UI_DESIGN_GUIDE.md`](./DANCECARD_UI_DESIGN_GUIDE.md) | How it should look and feel (loaders, tutorials, competitive steals) |
| [`DANCECARD_UI_FACELIFT_BACKLOG.md`](./DANCECARD_UI_FACELIFT_BACKLOG.md) | Granular ideas + ticket IDs (`UI-P0-xx`, panel inventory) |
| [`DANCECARD_MASTER_PRODUCT_ROADMAP.md`](./DANCECARD_MASTER_PRODUCT_ROADMAP.md) | Backend/feature phases (done) |
| [`DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md`](./DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md) | Non-UI tactical polish |

**How to use this plan**

1. Pick the **current UI phase** (only one “active” phase at a time per track if possible).
2. Pull work items from the phase section; cross-check IDs in the facelift backlog.
3. Apply visual principles from the **design guide** for every new screen.
4. Mark phase **exit criteria** before advancing.

---

## At a glance

```text
UI Phase 1  Ship-ready surfaces     ████████░░  APIs exist, UI missing + trust gaps
UI Phase 2  Release polish          ██████░░░░  Dialogs, skeletons, deep links
UI Phase 3  Standalone product shell ████████░░  Landing, discovery, chrome
UI Phase 4  Design system           ██████████  Tokens, primitives, lab merge
UI Phase 5  Attendee experience 2.0 █████████░  Program, compare, map, dancecard
UI Phase 6  Organizer experience 2.0 █████████░  Nav, grid, registration, ops
UI Phase 7  Onboarding & delight    ████████░░  Vestibule, palette, tutorials, signatures
UI Phase 8  C2K integration UI      ██████████  Shipped (May 2026)
```

| UI Phase | Name | Goal | Rough effort |
| --- | --- | --- | --- |
| **1** | Ship-ready surfaces | Expose shipped backend; fix trust blockers | 2–3 weeks |
| **2** | Release polish | Professional ops UX; no native dialogs | 2–3 weeks |
| **3** | Standalone product shell | Dancecard discoverable as its own product | 1–2 weeks |
| **4** | Design system | One visual language (attendee + organizer) | 2–4 weeks |
| **5** | Attendee experience 2.0 | Hallway-grade mobile program + dancecard | 3–5 weeks |
| **6** | Organizer experience 2.0 | Stage-manager console; Sched-class grid | 4–6 weeks |
| **7** | Onboarding & delight | Tutorials, vestibule loaders, signature moments | 3–4 weeks |
| **8** | C2K integration UI | Embed/port without duplicate chrome | 2–4 weeks |

*Effort assumes 1–2 engineers + part-time design; adjust for team size.*

---

## UI Phase 1 — Ship-ready surfaces

**Goal:** A real organizer and attendee can use **everything already built on the API** without hitting dead ends, silent tabs, or misleading errors.

**Depends on:** Migrations 000–027 applied in target environment.

### 1.1 Organizer — Phase 7 UI (API → screen)

| ID | Deliverable | Key files / APIs |
| --- | --- | --- |
| 1.1a | **Event entitlements** panel — toggle modules (`schedule_embed`, `map_embed`, `shift_swaps`, `vetting_applications`, `policy_public_summary`) | `IntegrationsPanel` or new section; `GET/PATCH …/event-entitlements` |
| 1.1b | **Usage meter** readout — embed/importer counts for ops | `GET …/usage-meter` |
| 1.1c | **Shift swap inbox** — list pending swaps, approve/deny | `shift-swaps` routes; new `ShiftSwapsPanel.tsx` |
| 1.1d | **Vetting queue** — list applications, status PATCH, safety-role gating | `vetting-applications` routes; new `VettingQueuePanel.tsx` |

**Backlog refs:** UI-P0-01, §10 Phase 7 table.

### 1.2 Attendee — missing surfaces

| ID | Deliverable | Key files / APIs |
| --- | --- | --- |
| 1.2a | **Policies** in main shell — nav link; render policy body/summary; entitlement-aware empty state | `DancecardTopBar`, `policies/page.tsx`, `policy-summary` |
| 1.2b | **Schedule-change notifications** — list + ack | `schedule-change-notifications` routes |
| 1.2c | **Staff open-shift claim** — UI on staff mode for `open` shifts | `POST …/staff-shifts/[id]/claim` |
| 1.2d | **Shift swap request** (if entitlements on) — minimal request form + status | `shift-swaps` attendee routes |
| 1.2e | **Vetting application** (if entitlements on) — apply form | `vetting-applications` POST |

**Backlog refs:** UI-P0-02, UI-P0-03, UI-P0-04.

### 1.3 Trust & empty states (both personas)

| ID | Deliverable |
| --- | --- |
| 1.3a | **Silent organizer tabs** → checklist shell when event window unset (`program`, `venues`, `dm`, `import`) |
| 1.3b | **Gate / schedule errors** — distinguish offline, 404, closed event; retry paths (`DancecardClient`) |
| 1.3c | **Named loading phases** — “Checking access” / “Loading schedule” (not generic spinner wall) |

**Backlog refs:** UI-P0-05, UI-P0-06; design guide §4.

### Exit criteria (Phase 1)

- [ ] All rows in [`DANCECARD_UI_FACELIFT_BACKLOG.md` §10](./DANCECARD_UI_FACELIFT_BACKLOG.md) have a corresponding UI.
- [ ] Organizer can manage entitlements, swaps, and vetting without raw API calls.
- [ ] Attendee can see policies, schedule changes, and claim open shifts where enabled.
- [ ] No organizer tab renders blank without explanation when setup is incomplete.
- [ ] `dancecard:smoke` + manual walkthrough of PAF26 (or demo slug) pass.

---

## UI Phase 2 — Release polish

**Goal:** Product feels **intentional**, not MVP-hacked—replace browser dialogs, add skeletons, wire deep links, tighten copy.

### 2.1 Replace native dialogs (organizer)

| Area | Change |
| --- | --- |
| Registrants | Import result panel (not `alert`) |
| Exports | Searchable pickers for track/room/person on calendar feeds (not `prompt`) |
| Messaging | Confirm modals + toast feedback (not `confirm`/`alert`) |
| Program grid | Delete confirm component; **undo toast** on destructive actions |
| Integrations | Sheet→batch success inline (not `alert`) |

**Backlog refs:** UI-P1-01.

### 2.2 Deep linking & navigation

| ID | Deliverable |
| --- | --- |
| 2.2a | **Full `?tab=`** sync for all organizer tabs |
| 2.2b | **`?slot=`** opens session drawer |
| 2.2c | Attendee **`#program`**, `#compare`, `#reservations`** “copy link to tab” |
| 2.2d | **Bulk secret** on program grid toolbar |

**Backlog refs:** UI-P1-05, UI-P1-06, UI-P1-09; facelift §6.

### 2.3 Loading & metadata

| ID | Deliverable |
| --- | --- |
| 2.3a | **Skeleton loaders** — attendee gate/schedule; organizer program, registrants, settings |
| 2.3b | **Per-event Open Graph** on `/dancecard/[slug]` |
| 2.3c | **No SQL migration filenames** in organizer-facing copy |
| 2.3d | **ICS busy preview** in Integrations or Exports (`ical-busy-preview`) |

**Backlog refs:** UI-P1-07, UI-P1-12, UI-P1-13, UI-P1-14.

### 2.4 Session & import polish

| ID | Deliverable |
| --- | --- |
| 2.4a | Session drawer — **real notes/audit** or remove placeholder tab |
| 2.4b | Import board — **diff highlight** before publish |
| 2.4c | Public program — **dedicated tag filter** (multi-select) |

**Backlog refs:** UI-P1-02, UI-P1-08, UI-P1-15.

### Exit criteria (Phase 2)

- [x] Zero `window.alert` / `prompt` / `confirm` on organizer critical paths.
- [x] Shared organizer URL with `?tab=` and `?slot=` works after refresh.
- [x] First paint uses skeletons on attendee + program grid (no full-page “Loading…” only).
- [x] Viewer role: persistent read-only badge; no “looks editable” grids.

---

## UI Phase 3 — Standalone product shell

**Goal:** Dancecard is **discoverable and credible** as its own product—not a hidden route on the ECKE directory.

### 3.1 Marketing & discovery pages

| ID | Deliverable | Route (suggested) |
| --- | --- | --- |
| 3.1a | **Product landing** — attendee vs organizer paths, beta disclaimer, screenshot/video | `/dancecard` or `/products/dancecard` |
| 3.1b | **Organizer landing** — CTA → `/organizer/login`, feature list (program, registration, staff, safety) | `/dancecard/organizers` |
| 3.1c | **Footer/header links** — Dancecard + Organizer console | `Header.tsx`, `Footer.tsx` |

**Backlog refs:** UI-P0-07, UI-P0-08, DC-SHELL-01–02, DC-SHELL-06.

### 3.2 Directory integration

| ID | Deliverable |
| --- | --- |
| 3.2a | `dancecardSlug` + `dancecardEnabled` on event records (`events.js` or future CMS) |
| 3.2b | Event detail CTA: “Open schedule & dancecard” → `/dancecard/{slug}` |
| 3.2c | Slug registry / mapping doc (`primal-arts-festival` ↔ `paf26`) |

**Backlog refs:** UI-P0-09, DC-SHELL-03–04.

### 3.3 Chrome contract (ECKE monolith)

| Route | Rule |
| --- | --- |
| `/dancecard/*` | `DancecardTopBar` only; **hide ECKE Footer** |
| `/organizer/dancecard/*` | `OrganizerDancecardChrome` only; **hide ECKE Header, Footer, SupportBanner** |
| `/embed/dancecard/*` | Unchanged (iframe CSP) |

| ID | Deliverable |
| --- | --- |
| 3.3a | Implement chrome suppression per table above |
| 3.3b | **UserMenu** — event picker / enter code (not hardcoded `paf26`) |
| 3.3c | **Dancecard-branded metadata** — `siteName`, OG images on product routes |
| 3.3d | Attendee top bar — “Back to events calendar” (optional ECKE link) |

**Backlog refs:** UI-P1-10, UI-P1-11, DC-SHELL-05–08, DC-SHELL-11.

### 3.4 Visual lab & docs (light)

| ID | Deliverable |
| --- | --- |
| 3.4a | `/dancecard-visual-lab` — `noindex`, auth or dev-only |
| 3.4b | Public **first-run** doc page for organizers (link from hub) — optional |

**Backlog refs:** DC-SHELL-10, UI-P2-12 (partial).

### Exit criteria (Phase 3)

- [x] New user can reach Dancecard from ECKE home or event page without a direct URL.
- [x] Organizer console has no double header/footer.
- [x] Product landing explains beta + links to demo event.
- [x] `EAST_COAST_KINK_PLATFORM_AUDIT.md` updated with Dancecard subsection (DC-SHELL-12).

**Milestone:** **Standalone release candidate** — ship after Phases 1–3 complete.

---

## UI Phase 4 — Design system

**Goal:** **One product, two modes** — shared tokens, primitives, and motion before large attendee/organizer rewrites.

**Design guide refs:** §8 Theming, §10 Anti-patterns; facelift §4.

### 4.1 Tokens & primitives

| ID | Deliverable |
| --- | --- |
| 4.1a | Semantic tokens: `surface`, `elevated`, `accent`, `border-subtle`, `danger`, `success` (replace ad-hoc `slate-*` / `cyan-*` sprawl) |
| 4.1b | Shared primitives: `Panel`, `PillTab`, `InsetRow`, `Button` variants, `Toast` |
| 4.1c | Schedule primitives: time rail, session card, availability block |
| 4.1d | Elevation + z-index matrix (modals, drawers, toasts, day strip) |
| 4.1e | Typography roles: display serif, UI sans, **tabular** time numerals |

### 4.2 Visual lab merge

| ID | Deliverable |
| --- | --- |
| 4.2a | Promote proven patterns from `dancecard-visual-lab/page.tsx` into `src/components/dancecard/ui/*` |
| 4.2b | Visual lab becomes **styleguide route** (components + tokens), not alternate app |

**Backlog refs:** UI-P2-01, UI-P2-02; facelift §4.

### 4.3 Event skin (foundation)

| ID | Deliverable |
| --- | --- |
| 4.3a | Organizer sets 3–5 CSS variables per event (`--event-accent`, etc.) |
| 4.3b | Attendee + embed respect event skin inside app boundary |
| 4.3c | Optional **hallway mode** (high contrast, larger taps) |

### Exit criteria (Phase 4)

- [x] New screens use primitives only (no one-off `text-[10px]` panels without token).
- [x] Attendee and organizer share accent/surface rules.
- [x] `prefers-reduced-motion` honored globally.

---

## UI Phase 5 — Attendee experience 2.0

**Goal:** **Conference hallway** UX — glanceable program, literal dancecard, trustworthy compare/reserve.

**Design guide refs:** §9 signature moments 1, 3, 6, 7, 10; facelift §1, §6.

### 5.1 Shell & program

| ID | Deliverable |
| --- | --- |
| 5.1a | Event-aware top bar (title, timezone, Map / Policies links) |
| 5.1b | **Happening now / next up** ribbon on program |
| 5.1c | **Session detail sheet** (bottom sheet mobile / drawer desktop) |
| 5.1d | **My schedule** narrative view + overlap warnings |
| 5.1e | `photo_policy` badges on cards (API-driven, not text heuristics only) |
| 5.1f | Presenter discovery directory + deep links |

### 5.2 Compare & mutual availability

| ID | Deliverable |
| --- | --- |
| 5.2a | **3-card onboarding carousel** (replace dense microcopy) |
| 5.2b | **Zoomable mutual timeline** (constellation, not spreadsheet only) |
| 5.2c | Color-blind safe legend + optional high-contrast |
| 5.2d | **Reserve-together wizard** (stepped, timezone-aware) |
| 5.2e | Compare privacy panel — what peers see |

### 5.3 Map & wayfinding

| ID | Deliverable |
| --- | --- |
| 5.3a | Map zoom / pan / lightbox |
| 5.3b | Pin popovers (not `title` only); 44px hit targets |
| 5.3c | Deep link shows **location name**, not raw UUID |
| 5.3d | Signed-URL expiry refresh affordance |

**Backlog refs:** facelift §3; UI-P2-08 (partial).

### 5.4 Dancecard core

| ID | Deliverable |
| --- | --- |
| 5.4a | **Swipeable dancecard cards** for My Schedule selections |
| 5.4b | Unified **Agenda** strip across tabs |
| 5.4c | Bottom nav icons + badges; desktop tab shortcuts `1–4` |
| 5.4d | Pull-to-refresh + empty-state CTAs |

### Exit criteria (Phase 5)

- [x] Program usable one-handed on 390px width in hallway lighting (hallway mode tested).
- [x] Compare flow completable without reading 11px walls of text.
- [x] Map usable from program card in ≤2 taps.

---

## UI Phase 6 — Organizer experience 2.0

**Goal:** **Stage-manager console** — grouped nav, power grid, registration depth, conflict dock.

**Design guide refs:** §3 Sched adopt list, §6 Command palette, §7 Dense data; facelift §2.

### 6.1 Navigation & shell

| ID | Deliverable |
| --- | --- |
| 6.1a | **Grouped nav**: Operate / Plan / People / Comms / Data / Integrations (replace 15-pill strip) |
| 6.1b | Dashboard = readiness + **next actions** (not duplicate of all tabs) |
| 6.1c | **Wide canvas** toggle on program + registrants |
| 6.1d | **Preview as role** (attendee / staff / safety / public) |

### 6.2 Program operations

| ID | Deliverable |
| --- | --- |
| 6.2a | **Conflict dock** on program tab (open both, nudge, reassign) |
| 6.2b | Grid: drag-to-create duration, day/hour zoom, keyboard shortcuts |
| 6.2c | Session drawer **Privacy** tab (visibility, photo policy, warnings) |
| 6.2d | Free-venues matrix: capacity heat + warning chips |
| 6.2e | Saved views / filters (Airtable-style) on program list alternate view |

### 6.3 People & registration

| ID | Deliverable |
| --- | --- |
| 6.3a | Registrants **master–detail** + column chooser + saved views |
| 6.3b | Registration builder: **live preview**, drag-reorder, page conditionals (stretch) |
| 6.3c | **Public registration submit** flow (when product approves) |
| 6.3d | People directory: photos, tags, role assignments UI |
| 6.3e | Badge **visual editor** + print preview |

### 6.4 Comms & data

| ID | Deliverable |
| --- | --- |
| 6.4a | Messaging: test send, segments, delivery chart |
| 6.4b | Exports: job history, print variants |
| 6.4c | Media panel beyond CSV — assignment board depth |
| 6.4d | Staff: timeline view on mobile; human location labels |

**Backlog refs:** UI-P1-03, UI-P1-04, UI-P2-06, UI-P2-07; facelift §2.

### Exit criteria (Phase 6)

- [x] Programming lead can publish a day without mouse-only bulk pain.
- [x] Safety lead can process vetting queue entirely in UI.
- [x] Registration lead can preview form as attendee before publish.

---

## UI Phase 7 — Onboarding & delight

**Goal:** **Memorable, teachable product** — vestibule loaders, tutorials, command palette, signature moments.

**Design guide refs:** §4–5 full sections; §9 all signature moments.

### 7.1 Loading & transitions

| ID | Deliverable |
| --- | --- |
| 7.1a | **Vestibule loaders** (attendee shuffle, organizer doors opening, import dissolve) |
| 7.1b | **Publish drumroll** optional milestone animation |
| 7.1c | Staggered skeleton choreography everywhere (norm from Phase 2) |

### 7.2 Tutorials

| ID | Deliverable |
| --- | --- |
| 7.2a | Organizer hub **setup runway** (3–5 items, role-aware) |
| 7.2b | **Ghost-cursor** rehearsal on first program visit |
| 7.2c | **Conflict university** interactive lesson |
| 7.2d | Safety lead **questline** (separate tone) |
| 7.2e | Deep links `?guide=registration` for co-organizers |

### 7.3 Power user

| ID | Deliverable |
| --- | --- |
| 7.3a | **`⌘K` command palette** with `@` fuzzy jump |
| 7.3b | Shortcut legend modal (`?`) + printable PDF |
| 7.3c | **Undo toast** on all destructive grid actions (8s) |

### 7.4 Signature moments (pick 5+ for this phase)

- Privacy panic button (attendee)
- Event hub as playing cards with readiness rings
- Conflict sonar on grid scan
- Walking-time whisper between sessions
- Scene name / legal name dual typography
- Embed skin preview before copy

**Backlog refs:** UI-P2-03 through UI-P2-05, UI-P2-09, UI-P2-10.

### Exit criteria (Phase 7)

- [x] Vestibule loaders, command palette (`⌘K` / `@`), setup runway, hub playing cards shipped.
- [x] Ghost-cursor, conflict university, safety questline, `?guide=` deep links wired.
- [x] Signature set: conflict sonar, embed preview, privacy panic, walking-time whisper, publish drumroll.
- [ ] New organizer completes setup runway without external doc (usability validation).
- [ ] First-time attendee understands compare in &lt;60s (usability test).
- [ ] Command palette covers top 20 actions from analytics or interviews.

**Milestone:** **Dancecard 2.0 experience** — market as major UX release.

---

## UI Phase 8 — C2K integration UI

**Goal:** After standalone release, **port/embed** into Coast to Coast Kink without duplicate chrome or confused auth.

**Depends on:** C2K repo access; `vendor/dancecard-eastcoast-export` or HTTP module boundaries (`dancecard-phase7-module-boundaries.md`).

### 8.1 Integration modes (pick one path per surface)

| Mode | Use when |
| --- | --- |
| **A. Link out** | C2K convention page → `dancecard.{host}/{slug}` (fastest) |
| **B. Embed** | iframe schedule/map with `emb_` tokens (shipped) |
| **C. Port UI** | Drizzle + Fastify routes; reuse React components |

### 8.2 UI work items

| ID | Deliverable |
| --- | --- |
| 8.2a | C2K convention **Manage** tab: “Open Dancecard ops” + readiness summary iframe or link |
| 8.2b | **Reduced chrome** in embed: 2-item checklist, no duplicate account creation |
| 8.2c | **Auth bridge** copy: C2K session → organizer hub (skip duplicate signup) |
| 8.2d | Convention slug ↔ `dancecard_events.slug` contract documented in UI |
| 8.2e | Native C2K dancecard (mutual availability) — **visual parity** with ECKE attendee cards or deliberate merge |
| 8.2f | Org hub does **not** duplicate Dancecard ops (forums/chat stay C2K) |

**Design guide refs:** §12 C2K appendix.

### Exit criteria (Phase 8)

- [x] One production convention runs ops on Dancecard from C2K navigation (`DancecardOpsCard`, organizer handoff, `?from=c2k` banners).
- [x] Attendee sees one dancecard experience — mutual/bookings on C2K Dancecard tab; program on ECKE via Schedule CTA + embed (`dancecard-c2k-integration.md`).
- [x] No double schedule entry — Manage program CRUD gated when `dancecardSlug` set; schedule ADR in integration doc.

**Implementation:** [`dancecard-c2k-integration.md`](./dancecard-c2k-integration.md), C2K `conventionSettingsSchema` dancecard fields, ECKE embed `chrome=minimal` + `ops-summary`.

---

## Cross-phase workstreams

Run these **in parallel** with whichever UI phase is active:

| Workstream | Owner | Notes |
| --- | --- | --- |
| **Accessibility** | Eng + QA | ARIA tabs, keyboard grid, `forced-colors`, live regions — facelift §7 |
| **Performance** | Eng | Virtualization (Phase 5/6), RUM on program tab — UI-P2-11 |
| **Content design** | Product | Trust copy, no UUIDs, scene-name defaults — design guide §10 |
| **QA smoke** | Eng | `dancecard:smoke`, `dancecard:smoke:auth` each phase exit |
| **Design critique** | Design | Every new screen vs design guide brand stance |

---

## Ticket ID crosswalk

| UI Phase | Primary backlog IDs |
| --- | --- |
| 1 | UI-P0-01 … UI-P0-06, §10 |
| 2 | UI-P1-01 … UI-P1-15 |
| 3 | UI-P0-07 … UI-P0-09, DC-SHELL-* |
| 4 | UI-P2-01, UI-P2-02, facelift §4 |
| 5 | Facelift §1, §3, §6 |
| 6 | Facelift §2, UI-P1-03, UI-P1-04, UI-P2-06, UI-P2-07 |
| 7 | UI-P2-03 … UI-P2-05, UI-P2-09, UI-P2-10, design guide §4–5 |
| 8 | Design guide §12, `dancecard-phase7-module-boundaries.md` |

---

## Suggested sequencing (planning default)

```text
NOW     ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► [STANDALONE RELEASE]
                                              │
                    Phase 4 ◄─────────────────┘ (can start during Phase 2–3)
                         │
              Phase 5 + 6 (parallel tracks: attendee | organizer)
                         │
                    Phase 7 (delight; needs Phase 4 tokens)
                         │
                    Phase 8 (C2K; after standalone stable)
```

**Minimum viable standalone:** Phases **1 + 2 + 3** only.  
**Differentiated product:** Add **4 → 7** before major marketing push.  
**Ecosystem:** Phase **8** when C2K team is ready.

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-05-16 | Initial master plan: UI Phases 1–8, exit criteria, crosswalk to backlog IDs. |
| 2026-05-16 | UI Phase 3: product landing `/dancecard`, organizer marketing, public-events API, ECKE chrome contract, directory CTAs, platform audit doc. |
