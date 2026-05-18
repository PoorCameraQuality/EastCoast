# Dancecard — UI facelift & experience backlog

**Purpose:** Living document for **visual redesign**, **interaction patterns**, and **product-feel** ideas that are **out of scope** for individual phase feature work but should converge toward a **major UI facelift** (target horizon: **end of Phase 7** in [`DANCECARD_MASTER_PRODUCT_ROADMAP.md`](./DANCECARD_MASTER_PRODUCT_ROADMAP.md)).

**Audience:** Product, design, and engineering when planning a dedicated “Dancecard shell 2.0” initiative.

**How to update:** Append dated entries under [Changelog](#changelog). Add ideas as bullets under the closest section; tag optional `priority: later` / `risk: high` / `depends: design-system` in prose if helpful.

**Related:** **Planning phases (start here):** [`DANCECARD_UI_UX_MASTER_PLAN.md`](./DANCECARD_UI_UX_MASTER_PLAN.md). Implementation status: roadmap **§3.3–§3.10**. Tactical polish: [`DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md`](./DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md). Visual principles: [`DANCECARD_UI_DESIGN_GUIDE.md`](./DANCECARD_UI_DESIGN_GUIDE.md). **This file** = granular backlog + ticket IDs; master plan = phased schedule.

---

## Changelog

| Date | Source | Summary |
| --- | --- | --- |
| 2026-05-13 | Round 1 — 7 parallel codebase explorations + synthesis | Initial backlog from subagents (attendee shell, organizer shell, print/map/exports, global tokens/Tailwind) plus hand-expanded stubs for auth, registration surfaces, and a11y/perf where runs were incomplete. |
| 2026-05-13 | Round 1b — auth, public/register, a11y/perf explorations | Replaced §5–7 stubs with findings from `OrganizerLoginClient`, `DancecardClient` gate/session, public routes + account `register`, and a11y/perf pass (tabs, toasts, virtualization, skeletons). |
| 2026-05-13 | Phase 6 doc sync | Roadmap **§3.9** + `dancecard-first-run.md` now describe shipped hub (`/organizer/dancecard`), **Integrations** tab, API keys / webhooks / Sheets / inbound registrant paths. Backlog §2–§5 and appendix updated for new routes and components; §5 organizer-login bullet marked **partially addressed** (hub default `next`). |
| 2026-05-14 | Code vs docs audit | §2 mega-tab bullet: `?tab=integrations` already wired; backlog reframed toward **full** query-param tab sync. §3 multi-map bullet aligned with attendee **multi-map tabs** + higher map limits in API code paths. |
| 2026-05-16 | Round 2 — 4 parallel full-code audits + Sched/calendar research | Added **§0 Release readiness** (P0/P1/P2), **§2b Panel inventory**, **§9 ECKE shell & standalone product**, **§10 Phase 7 API-without-UI**; linked **DANCECARD_UI_DESIGN_GUIDE.md**. |
| 2026-05-16 | UI Phase 2 implementation | Shipped organizer `ui/` kit (confirm, toast, pickers, skeletons); native dialog removal; `?tab=` / `?slot=` deep links; viewer banner; ICS busy preview UI; session notes + change log; import diff highlight; program tag filter; per-event OG metadata. |
| 2026-05-16 | UI Phase 3 implementation | Product landing `/dancecard` + `/products/dancecard` redirect; organizer marketing; `GET /api/dancecard/public-events`; `shellRoutes` chrome suppression; Header/Footer discovery links; `DancecardEventCta` on directory events; UserMenu event picker; visual-lab gate; `EAST_COAST_KINK_PLATFORM_AUDIT.md`. |
| 2026-05-16 | UI Phase 4 implementation | `dancecard-tokens.css` + `dc-*` Tailwind; shared `ui/` primitives + `ui/schedule/`; migration **029** `theme_config`; `DancecardThemeProvider` + `GET /api/dancecard/[slug]/theme`; organizer theme editor; styleguide at `/dancecard-visual-lab`; hallway mode toggle; embed CSS vars; [`dancecard-design-tokens.md`](./dancecard-design-tokens.md). UI-P2-01/02 **partial** (full `DancecardClient` consumption = Phase 5–6). |
| 2026-05-16 | UI Phase 5 implementation | Attendee shell (`AttendeeBottomNav`, `AgendaStrip`); program ribbon/sheet/virtual list; API `photoPolicy` + `locationName`; compare carousel/constellation/legend/privacy; map zoom + pin popovers; policies UI-P0-02 body; `@tanstack/react-virtual` pilot; styleguide Compare section. |
| 2026-05-16 | UI Phase 6 implementation | Grouped organizer nav + dashboard next-actions; conflict dock + program list views; grid zoom/`?` legend; session Privacy tab; venue heat; registrants master–detail; registration live preview; messaging test send + delivery chart; export job history; staff mobile timeline; badge visual editor; wide canvas + preview-as-role banner; styleguide Organizer section. |
| 2026-05-16 | UI Phase 7 implementation | GuideRouter + `useGuideState`; vestibule loaders + publish drumroll; `⌘K` palette + `@` fuzzy jump + unified `?` shortcuts; hub setup runway + playing-card readiness; ghost cursor / conflict university / safety questline; conflict sonar, embed skin preview, privacy panic, walking-time whisper; styleguide Delight section. |
| 2026-05-16 | UI Phase 8 — C2K integration | `dancecard-c2k-integration.md`; C2K `DancecardOpsCard` + settings schema; ECKE `chrome=minimal` embed + `ops-summary`; organizer handoff API; `C2kFromBanner`; C2K schedule/dancecard attendee routing; `dc-session-title` parity on native panels. |

---

## 0. Release readiness — UI work queue (May 2026)

*From line-by-line audit of all Dancecard + ECKE shell touchpoints. **Backend Phases 0–7 are largely shipped; UI is the release gate.***

### P0 — Blocks trustworthy standalone release

| ID | Item | Where / notes |
| --- | --- | --- |
| UI-P0-01 | **Phase 7 organizer surfaces** — entitlements editor, usage meter display, shift-swap inbox, vetting application queue | APIs exist; **no `.tsx` consumers** (`event-entitlements`, `usage-meter`, `shift-swaps`, `vetting-applications`) |
| UI-P0-02 | **Policies in main attendee shell** — link from `DancecardTopBar` / Program; `/policies` page exists but orphaned | `policies/page.tsx` lists metadata only; no body text |
| UI-P0-03 | **Schedule-change notifications** — attendee list + ack UI | Written on import publish; **no attendee UI** |
| UI-P0-04 | **Staff open-shift claim** — attendee/staff UI for `POST …/staff-shifts/[id]/claim` | API only |
| UI-P0-05 | **Silent organizer tabs** — `program`, `venues`, `dm`, `import` render `null` when event window unset | `OrganizerDancecardClient.tsx` — show shell + checklist + jump to settings |
| UI-P0-06 | **Gate / schedule error trust** — don’t imply product disabled on network/404 | `DancecardClient.tsx` gate + `loadErr` copy |
| UI-P0-07 | **ECKE product landing** `/dancecard` or `/products/dancecard` | No discovery path today |
| UI-P0-08 | **Organizer marketing + login CTA** | Footer/header have no link to `/organizer/login` |
| UI-P0-09 | **Event directory → Dancecard** — `dancecardSlug` on event record + CTA on `/events/[slug]` | `events.js` has no dancecard field; slug mismatch `paf26` vs `primal-arts-festival` |

### P1 — Release polish (ship soon after P0)

| ID | Item |
| --- | --- |
| UI-P1-01 | Replace **`window.alert` / `confirm` / `prompt`** across organizer (registrants import, exports calendar feeds, messaging, deletes) |
| UI-P1-02 | **Session drawer** — durable notes/audit or remove placeholder tab |
| UI-P1-03 | **Registration** — form preview, drag-reorder questions, public submit flow (when product-ready) |
| UI-P1-04 | **Registrant** — answers editor, tags UI, structured import result panel |
| UI-P1-05 | **Full `?tab=` URL sync** for all organizer tabs (only `integrations` today) |
| UI-P1-06 | **`?slot=` deep link** to open session drawer |
| UI-P1-07 | **Skeleton loaders** — attendee gate/schedule; organizer program/registrants/settings |
| UI-P1-08 | **Dedicated tag filter** on public program (not search-only) |
| UI-P1-09 | **Bulk secret visibility** on program grid toolbar |
| UI-P1-10 | **Chrome policy** — hide ECKE Header/Footer/SupportBanner on `/organizer/dancecard/*`; hide Footer on `/dancecard/*` |
| UI-P1-11 | **UserMenu** — event picker or slug entry, not hardcoded `/dancecard/paf26` |
| UI-P1-12 | **ICS busy preview** wire-up in organizer UI (`POST …/ical-busy-preview`) |
| UI-P1-13 | **Per-event Open Graph** metadata on attendee pages |
| UI-P1-14 | **Ops copy** — no migration SQL filenames in organizer-facing UI (Integrations, Exports) |
| UI-P1-15 | **Import diff highlight** before publish (import board) |

### P2 — Post-release delight (facelift + design guide)

| ID | Item |
| --- | --- |
| UI-P2-01 | Merge **`dancecard-visual-lab`** (~1.5k LOC prototype) into production tokens/components |
| UI-P2-02 | Design system unification (§4 below) + **event skin** variables |
| UI-P2-03 | **Command palette** (`⌘K`) for organizer |
| UI-P2-04 | **Setup runway** checklist on organizer hub (3–5 items) |
| UI-P2-05 | **Vestibule loaders** + publish “doors opening” moment (see design guide) |
| UI-P2-06 | **Badge visual editor** (replace raw JSON textarea) |
| UI-P2-07 | **Messaging** — segments, test send, delivery charts |
| UI-P2-08 | **Map** — zoom/pan/lightbox, pin clustering, signed-URL expiry UX |
| UI-P2-09 | **Embed themes** for iframe consumers |
| UI-P2-10 | **Questline tutorials** (organizer + attendee compare carousel) |
| UI-P2-11 | **Virtualization** (`@tanstack/react-virtual`) on program + registrant lists |
| UI-P2-12 | **Pricing / public docs** site for standalone product |

---

## North-star (standalone product → C2K)

- **See [`DANCECARD_UI_DESIGN_GUIDE.md`](./DANCECARD_UI_DESIGN_GUIDE.md)** for competitive inspiration, vestibule loaders, tutorials, command palette, and signature moments.
- **One product, two modes:** Attendee dancecard and organizer console should feel like **one design system** (shared chrome, typography, elevation, motion), not two unrelated dark apps.
- **Conference-grade day-of UX:** Program, map, and “my schedule” should be legible **on a phone in a hallway**, offline-aware where possible, and **glanceable** under stress.
- **Operator-grade density:** Organizer grids (program, venues, registrants) get **wide-canvas** layouts, keyboard power use, and **recoverable** bulk actions—not only mouse-first forms.
- **Trust & clarity:** Auth, gates, compare privacy, and email/messaging surfaces explain **what is shared, to whom, and when** in plain language (no raw UUIDs, no migration filenames for end users).

---

## 1. Attendee dancecard (`DancecardClient`, top bar, compare, reservations)

*Round 1 exploration: `src/components/dancecard/DancecardClient.tsx`, `DancecardTopBar.tsx`, `DancecardCompactList.tsx`, `CompareAvailabilityPanel.tsx`, `MutualAvailabilityStrip.tsx`, `MutualReserveTogetherModal.tsx`, `src/app/dancecard/[eventSlug]/layout.tsx`.*

- **Event-aware shell in the top bar** — Replace or augment static marketing chrome with live event title, timezone, and “you are planning for …” using schedule meta already loaded.
- **Contextual secondary row** — Smart strip: offline/slow hint, “last refreshed” for schedule, compact link to map when program references locations.
- **Program tab as a con guide** — Hero day picker, “happening now / next up” ribbon, saved-sessions-only toggle; elevate program beyond filters-only.
- **Dedicated tag filter UX** — Visible multi-select for `tagNames` (align with [`DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md`](./DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md)) instead of substring search only.
- **Presenter-first discovery** — Directory with avatars/roles and deep-links into filtered program views.
- **Session detail sheet** — Bottom sheet (mobile) / drawer (desktop) for full description, policy chips, map CTA, related slots; keep list scannable.
- **“My schedule” narrative mode** — Read-only story view of program selections with overlap warnings and walking-time nudges between rooms.
- **Grid view that scales** — Horizontal virtualization, sticky room columns, pinch-zoom for venue grid at real con density.
- **Compare tab onboarding carousel** — Replace dense `text-[11px]` walls with swipeable explainers + persistent “tips”.
- **Mutual strip as zoomable timeline** — Collapse to event window, 15-minute zoom steps, numeric summaries for free runs (not only per-cell `title`).
- **Color-blind safe mutual legend** — Patterns/icons + optional high-contrast theme.
- **Keyboard / SR path for strips** — Arrow-key grid, `aria-describedby`, list alternative for heatmap-averse users.
- **Reserve-together wizard** — Stepped flow with validation and partner timezone callouts instead of raw datetime fields.
- **Post-reservation ritual** — One-tap messaging deep links, ICS for slot, countdown in Reservations tab.
- **Reservations + program unified agenda** — Pinned “Agenda” widget across tabs mirroring merged timeline from `DancecardCompactList`.
- **Compact list density modes** — Cozy / comfortable / spacious for accordion rows.
- **Accessible note affordance** — Replace `aria-hidden`-only note dot with visible icon + `sr-only` label.
- **Bottom nav upgrade** — Icons, badges (pending reservations / compare loaded), long-press for tab blurbs.
- **Desktop tab rail** — Vertical or horizontal segmented control, keyboard shortcuts (`1–4`), visible `aria-current`.
- **Skeleton choreography** — Structured skeletons matching `SessionCard` + filters; stagger reveal.
- **Empty / error recovery** — Pull-to-refresh, CTAs when schedule API empty (“browse availability anyway”).
- **Typography scale token** — Unify `font-serif` headlines and micro-labels across glass panels.
- **Safe-area & z-index matrix** — Document stacking for toast, undo bar, modals, `MobileDayStripBar` vs notches.

---

## 2. Organizer console (`OrganizerDancecardClient`, dashboard, major panels)

*Round 1 exploration plus Phase 6 hub: `src/app/organizer/dancecard/page.tsx`, `OrganizerDancecardChrome.tsx`, `OrganizerHubClient.tsx`, `IntegrationsPanel.tsx`, `src/app/api/organizer/dancecard/events/route.ts`; per-event `OrganizerDancecardClient.tsx`, `OrganizerEventDashboard.tsx`, `ProgramScheduleGrid`, `RegistrantsPanel`, `StaffShiftsPanel`, `EventSettingsPanel`, `ExportsHubPanel`, `MessagingPanel`, `BadgesPrintPanel`.*

- **Flattened mega-tab strip** — Long horizontal pill strip (incl. **Integrations** after Phase 6) → grouped nav (Operate / Plan / People / Comms / Data / Integrations), overflow menu, **full** URL-synced tabs for every tab (today `?tab=integrations` is honored after Google OAuth return; other tabs remain mostly in-component state).
- **Silent empty tabs** — When event window missing, tabs render `null`; replace with shell + checklist + jump to settings.
- **Duplicate nav: tabs vs dashboard tiles** — Dashboard should be status + next actions; tiles become dynamic shortcuts from readiness gaps.
- **Unified feedback system** — One toast/banner contract (`loadErr` vs `notice` vs per-panel `err` today).
- **Global read-only affordance** — Persistent viewer badge; avoid opacity-only “looks editable” tables.
- **Program grid: build mode** — Collapsible toolbar, day/hour zoom, conflict highlights, undo toast, errors drawer.
- **Read-only program: useful actions** — Export selection / copy link instead of dead-looking grid.
- **Registrants: master–detail** — Split view, column chooser, saved views, mobile cards + swipe; guided empty state.
- **Registrants import UX** — Structured result panel; replace `window.alert` for import counts (JSON + CSV paths still use alerts today after Phase 6 CSV MVP).
- **Staff shifts: not a spreadsheet on phone** — Timeline / day cards, bulk paste, DM coverage hints, human location labels (no raw ids).
- **Event settings hub** — Left nav / accordions, explicit save vs autosave, separated danger zone.
- **Badge designer** — Replace raw `badgeLayoutJson` with visual editor + presets + live print preview.
- **Exports / calendar feeds** — Searchable pickers for track/room/person instead of `window.prompt` UUIDs; copy feedback; export job history.
- **Messaging: campaign-grade** — Merge tags, test send, segments, scheduled send, delivery charts; replace `window.confirm`/`alert` flows.
- **Starter templates & setup checklist** — Empty states become wizards; Resend health as a setup step.
- **Ops messaging without SQL filenames** — Feature flags + “not enabled” copy for organizers; migration names admin-only.
- **Shared data-display kit** — Tables ↔ cards at breakpoints; sticky headers; consistent row actions.
- **Wide canvas layouts** — `max-w-6xl` vs data-heavy grids: per-route full-width or toggle.
- **Keyboard & a11y for organizer** — Replace native dialogs; shortcuts legend for grid ops.

---

## 3. Print, map, wayfinding, exports surface

*Round 1 exploration: `src/app/organizer/dancecard/[eventSlug]/print/*`, `src/app/dancecard/[eventSlug]/map/page.tsx`, `venue-map` route, `ExportsHubPanel`, map links in `DancecardClient`.*

- **Print `@page` + margins** — Letter/A4, landscape option for wide schedule tables.
- **Repeating table headers** — `thead` repeat per page; avoid awkward mid-row breaks.
- **Print metadata block** — Event title, timezone, generated-at in header/footer.
- **`print-color-adjust`** — Predictable black/white vs ink-saving browsers.
- **Schedule print variants** — Optional column sets (hide internal “Published” for public handouts).
- **Day-per-page or track-grouped print** — Large program pagination strategies.
- **Venue sign templates** — Half-page / tent-card presets with fold guides.
- **Sign hierarchy** — Iconography separating title, directions, accessibility blocks.
- **Multi-map UI** — Public venue JSON supports many maps (see `venueMapsSigned.ts` / attendee `map/page.tsx` tabs); refine carousel/floor selector and organizer multi-map polish.
- **Map zoom / pan / lightbox** — Especially for `max-w-3xl` floor plans on phones.
- **Signed URL expiry UX** — Surface ~1h image TTL; refresh affordance during con day.
- **Pin hit targets + popovers** — Larger taps, focus rings, sheet with label + directions (not `title` only).
- **Deep link polish** — Human location name instead of raw UUID in focus copy.
- **Pin collision UX** — Clustering, leader lines, or synced list selection.
- **Cross-surface naming alignment** — Schedule room chips ↔ print signs ↔ map labels share one naming model.
- **Offline / field ops copy** — Exports hub: print needs session + network; suggest PDF-ahead for dead zones.
- **Attendee map offline hint** — Screenshot / print sign QR pattern when URLs expire.
- **Exports hub visual hierarchy** — Icons for CSV vs print; optional query params (compact, single-day) when implemented.

---

## 4. Design system & global styling (site-wide + dancecard)

*Round 1 exploration: `tailwind.config.js`, `src/app/globals.css`, `src/styles/tokens.css`, root `layout.tsx`, `src/app/dancecard/[eventSlug]/layout.tsx`, `src/app/organizer/dancecard/[eventSlug]/layout.tsx`, cyan/slate grep density.*

- **Unify canvas tokens** — Align `brand-void` / `brand-surface` with dancecard `bg-slate-950` so shells share one semantic background.
- **Semantic Tailwind theme** — Map `slate-*` / `cyan-*` sprawl to `surface`, `elevated`, `accent`, `border-subtle` (CSS vars).
- **Primary vs cyan discipline** — Pick one interactive accent scale (`primary-*` vs `cyan-*`) and migrate the other.
- **Typography roles** — Display serif vs UI sans vs **tabular** numerals for schedule/time.
- **Heading cleanup** — Rely on global `h*` rules; explicit `font-serif` only where needed.
- **Elevation ladder + contrast** — Document panel → popover → modal steps; audit translucent borders on teal/cyan.
- **Organizer ↔ attendee chrome parity** — Shared `DancecardChrome` primitives (top bar, links, spacing).
- **Extract primitives** — `Panel`, `PillTab`, `InsetRow`, `StickySubheader`, shared destructive/secondary buttons.
- **Schedule primitives package** — Time rail, session card, availability block with shared hover/focus/disabled.
- **Motion system** — Enter/exit, staggered lists, layout transitions on tab change; honor `prefers-reduced-motion`.
- **Focus & z-index enforcement** — Use documented `tokens.css` z layers for modals/drawers/dense controls.
- **Density mode** — Organizer “compact / comfortable” for grids (reduce one-off `text-[10px]`).
- **Print token set** — Paper/ink tokens separate from screen dark theme.
- **Role/location color semantics** — Legend + non-color cues for `roleColors` / `locationColors`.
- **`dancecard-visual-lab` as contract** — Styleguide gate before rolling changes into production dancecard.
- **Optional light / high-contrast theme** — Plan `data-theme` early if roadmap requires it.

---

## 5. Auth, gate, and trust surfaces

*Round 1b exploration: `src/app/organizer/login/page.tsx`, `OrganizerLoginClient.tsx`, `DancecardClient.tsx` gate + `checkSession` (`/me`), `DancecardTopBar.tsx`, `ShareDancecardClient.tsx`; `src/app/dancecard/[eventSlug]/page.tsx` metadata shell.*

- **Gate failure must not read as success** — If `/gate` errors, avoid unlocking the attendee surface without explicit “offline / verify later” copy and a retry path (trust-critical).
- **Vocabulary: event password vs registration vs RSVP** — Align labels with what organizers actually distribute (`registrationAccessCode`, entry gate, dancecard account).
- **`sessionStorage` semantics in UI** — Plain-language note for new tab, incognito, shared device, and “why I lost my code.”
- **Logout vs entry gate** — Policy for `eck_dc_entry_gate_*` vs `eck_dc_reg_code_*`: when logout clears one key but not the other, explain why the gate can reappear.
- **Schedule `loadErr` vs “disabled”** — Do not imply the product is shut off when the failure is network, 404, or deploy; separate copy + retry/diagnostics.
- **Named loading phases** — Replace indistinguishable full-page waits with steps (“Checking access,” “Loading schedule,” “Restoring session”).
- **Pre-auth landing progressive disclosure** — Signed-out marketing + access card: lead with one primary CTA; tuck “how it works” behind expand/link.
- **Consistent API error shaping** — Use one formatter (e.g. `formatDancecardApiMessage`) for login/register and other paths so users never see raw JSON bodies.
- **Post-register success panel** — After account create + forced sign-in, dedicated “next: these two fields” state to cut drop-off.
- **“No password reset” on sign-in too** — Not only on register; short trust line + support / password-manager guidance for returning users.
- **Organizer login “backstage” brand** — Distinct from marketing; optional event context once slug is known.
- **Organizer `next` fallback** — **Partially done (Phase 6):** safe default is `/organizer/dancecard` (hub), not a hardcoded event slug. **Remaining:** copy when `next` is missing/invalid, optional post-login event picker for deep links.
- **Organizer eligibility copy** — What “listed as an organizer” means, typical failure modes, session expectations—without leaking internals.
- **Supabase misconfiguration** — User-safe generic error + support path instead of developer-only wording on production forms.
- **Per-event Open Graph** — `generateMetadata` should reflect slug/event title when available so forwarded links feel legitimate.
- **“DANCECARD BETA” expectation** — Link or tooltip to stability, data handling, and feedback channel—not only site root.
- **Gate field affordances** — Balance `autoComplete` / password-manager friendliness with security messaging for event entry fields.
- **Dev bypass banner** — When `DANCECARD_ORGANIZER_DEV_BYPASS` is on, impossible-to-miss production risk + optional ops audit link.
- **Session expiry / re-auth** — Soft re-auth or refresh before silent save failures.
- **Compare / share trust** — Persistent panel of what peers see; deep link from compare tab to privacy doc.
- **Magic link / passkey placeholders** — Empty states and copy hooks if auth model expands later.

---

## 6. Registration, public shell, and policy (attendee-visible)

*Round 1b exploration: `src/app/dancecard/[eventSlug]/page.tsx`, `layout.tsx`, `map/page.tsx`, `s/[token]/page.tsx` → `ShareDancecardClient`; `DancecardClient` auth/register; `POST …/api/dancecard/[eventSlug]/register`; `PROGRAM_POLICY_RULES` chips; `DancecardTopBar` legal links. Organizer-only policy UI (`PolicyLedgerSection`, settings) stays out of attendee path but informs future explicit slot fields.*

- **Dancecard account ≠ event registration** — Sign in / Register toggle copy should state this creates a **Dancecard login**, distinct from organizer “registration categories/forms” and any future event RSVP flow.
- **Unify minimal vs classic layout** — `useMinimalLayout` vs default `DancecardClient` branches should share typography, spacing, and chrome so one product identity.
- **Event password gate** — “Where to get this,” validation hints, calmer errors than a single rose line.
- **No-recovery acknowledgment** — Checkbox (“I understand there is no password recovery”) before register submit, plus PM guidance link.
- **Register form polish** — Dedupe show/hide on password vs confirm; single control affecting both fields where possible.
- **SEO / sharing** — Per-event title/description in metadata when schedule or server data allows (Slack/iMessage previews).
- **Loading ladder** — Replace repeated full-screen spinners (“Loading…”, “Preparing your private planning view…”) with skeletons that mirror final chrome.
- **Heuristic policy chips** — Tooltip (“Detected from session text”) or migrate to **explicit organizer fields** on `ProgramSlot` for trustworthy, localizable chips.
- **Photo policy on cards** — When API exposes `photo_policy` to public slots, badge on `SessionCard` and in export/calendar flows.
- **Share token surface** — Align `ShareDancecardClient` colors, type scale, and density with main dancecard.
- **Contextual top bar** — Inside an event, show event name/slug and quick actions (Program / Map), not only global marketing links.
- **Hash deep links** — “Copy link to this tab” for `#program`, `#compare`, `#reservations` for staff/share workflows.
- **Policy ledger vs chips (long-term)** — If product moves to structured policies, bridge organizer ledger → attendee-readable summaries (cards, progress), not wall-of-text alone.
- **Integrations vs Exports/Messaging** — Phase 6 adds an **Integrations** tab (API keys, outbound webhooks, inbound registrant secret, Google Sheets connect); align discoverability with Exports / Messaging (cross-links or one “Data & connections” hub in a future shell pass).

---

## 7. Accessibility & performance UX

*Round 1b exploration: `DancecardClient`, `DancecardCompactList`, compare/mutual components, `OrganizerDancecardClient`, drawers/modals, `package.json` (no list virtualization lib today).*

- **ARIA tabs end-to-end** — Desktop `tablist`/`tab`: add roving tabindex, `aria-controls` + panel `id`, keyboard arrows; reconcile mobile bottom `nav` (`aria-current="page"`) with either true tabs pattern or explicit `navigation` landmark semantics.
- **Organizer mega-strip** — Same keyboard/SR contract as public dancecard: `aria-selected`, shortcuts, focus order.
- **Mobile day chips** — `aria-selected` and/or `toolbar` / sub-`tablist` with arrow keys for `HostMobileDayChipsRow` / `MobileDayStripBar`.
- **Mutual grid focus budget** — Skip link, `role="grid"` + arrow keys, or fewer focusable cells with preserved pointer targets for dense half-hour buttons.
- **Compare “Advanced” disclosure** — Pair `aria-expanded` with `aria-controls` + region `id`.
- **Compact list accordions** — `aria-expanded` / `aria-controls` on expand toggles in `DancecardCompactList`.
- **Modal parity** — `MutualReserveTogetherModal`, manual busy sheet, and other overlays: `aria-modal`, labelled heading, focus trap, Escape—match `SessionDetailDrawer` / `ShareDancecardClient` where those are correct.
- **Non-color status** — Free/busy/mutual: visible icons/text in addition to green/teal/red (WCAG 1.4.1).
- **Pick virtualization stack** — Add `@tanstack/react-virtual` or `react-window` and apply first to longest lists (program, merged agenda, registrants, import grids).
- **Filter + visible window** — Pair virtualization with search/day/track filters so DOM work stays proportional to viewport.
- **Initial load skeleton** — Replace centered spinner (`!schedule || !authChecked`) with tab + schedule-shaped skeleton; reduce CLS.
- **Organizer panel skeletons** — `ProgramScheduleGrid`, `RegistrantsPanel`, etc.: row/column placeholders instead of blank-to-grid jump.
- **Extend optimistic patterns** — Reservations, mutual submit, staff unlock, settings: same idempotent client model as program selections; uniform “syncing / saved / error” surfacing.
- **Undo in the toast** — Where copy says “Undo?”, provide an actual primary action in the snackbar—not dismiss-only.
- **Live region for toasts** — `role="status"` / `aria-live` for transient attendee feedback while preserving safe-area positioning.
- **Unified feedback channel** — Map `toast`, `authNotice`, organizer `notice`, and panel `err` into one severity + persistence + dedupe model (rapid debounced saves).
- **RUM / long tasks (optional)** — Measure client jank on program tab post-virtualization.
- **`forced-colors` / high contrast** — Mutual strip, map pins, print CSS paths.

---

## 8. Wild ideas (no constraint backlog)

_Use this list for brainstorm sessions; not commitments._

- **AR wayfinding** — Floor plan anchors + device orientation for “which hallway” (extreme; depends on P7 map module).
- **Wearable glance** — Apple Watch / Wear OS “next session” companion via web push or native shell.
- **Live activity / push** — Web push for schedule changes (policy + infra heavy).
- **AI concierge** — On-device or server “where should I be now?” using public schedule + personal selections (legal + safety review).
- **Sponsor & art pack** — Event-branded skins per slug (organizer-uploaded CSS variables within guardrails).
- **Embeddable schedule widget** — iframe / oEmbed for chapter websites (pairs with roadmap P7 embed themes).

---

## 2b. Organizer panel inventory (code audit, May 2026)

*Status for each shipped panel — use when scoping facelift vs release blockers.*

| Tab / area | Component | ~LOC | UI status | Top gaps |
| --- | --- | ---: | --- | --- |
| Dashboard | `OrganizerEventDashboard.tsx` | 195 | Shipped | Duplicates tab nav; loading text only |
| Program | `ProgramScheduleGrid.tsx` | 762 | Shipped MVP | No bulk secret; `confirm` on delete; pointer-only DnD |
| | `SessionDetailDrawer.tsx` | 504 | Partial | Notes/audit placeholder; no `?slot=` URL |
| Venue grid | `VenueAvailabilityGrid.tsx` | 218 | MVP | HTML5 DnD; no capacity heatmap |
| Assignments | `AssignmentBoardPanel.tsx` | 164 | MVP | No bulk tag/staff drops |
| People | `PeopleDirectoryPanel.tsx` | 180 | MVP | No photos, tags, role assignments |
| Registrants | `RegistrantsPanel.tsx` | 547 | MVP | No answers/tags UI; `alert` on import |
| Staff | `StaffShiftsPanel.tsx` | 299 | MVP | Raw location ids in places |
| DM coverage | `DmCoveragePanel.tsx` | 363 | MVP | Hidden if no event window |
| Media | `MediaPanel.tsx` | 42 | **Thin** | CSV download only |
| Exports | `ExportsHubPanel.tsx` | 267 | MVP | `prompt` for feed UUIDs |
| Messaging | `MessagingPanel.tsx` | 211 | MVP | `confirm`/`alert`; no segments |
| Badges | `BadgesPrintPanel.tsx` | 111 | MVP | JSON layout in settings; browser print |
| Import | `ScheduleImportPanel.tsx` | 1425 | Shipped MVP | No diff highlight; migration copy |
| Integrations | `IntegrationsPanel.tsx` | 535 | Partial | SQL in UI; sheet batch `alert` |
| Settings | `EventSettingsPanel.tsx` + sections | 261–374 | Shipped | Registration “MVP” copy; badge JSON textarea |
| Hub | `OrganizerHubClient.tsx` | 218 | Shipped | Create/clone forms |
| Chrome | `OrganizerDancecardChrome.tsx` | 76 | Partial | No grouped nav |

**Attendee core:** `DancecardClient.tsx` (~4881 LOC) — Shipped MVP; dual layouts; no skeletons; heuristic policy chips vs API `photo_policy`.

**Non-production:** `dancecard-visual-lab/page.tsx` (~1541) — style prototype; full ECKE chrome; treat as P2 design contract.

---

## 9. ECKE shell & standalone product UI

*Touchpoints outside `src/components/dancecard/` that affect release as **Dancecard the product**.*

### Current ECKE integration

| Route | ECKE Header | Support banner | ECKE Footer | Product chrome |
| --- | --- | --- | --- | --- |
| `/dancecard` (landing), `/dancecard/organizers` | Shown | Shown | Shown | Marketing (ECKE chrome) |
| `/dancecard/[slug]/*` | Hidden | Hidden | Hidden | `DancecardTopBar` |
| `/organizer/dancecard/*` | Hidden | Hidden | Hidden | `OrganizerDancecardChrome` |
| `/dancecard-visual-lab` | Shown | Shown | Shown | Lab header |
| Rest of site | Shown | Shown | Shown | — |

- **UserMenu** → public-events picker + enter code (`DancecardHeaderNav`); demo fallback `paf26`.
- **Event pages** — `dancecardSlug` on `events.js` + `DancecardEventCta` (e.g. `primal-arts-festival` → `paf26`).
- **Metadata** — attendee pages still `siteName: East Coast Kink Events`.

### Shell UI to build (standalone release)

| ID | Item | Priority |
| --- | --- | --- |
| DC-SHELL-01 | Product landing `/dancecard` — what it is, attendee vs organizer, beta | P0 |
| DC-SHELL-02 | Organizer marketing page → `/organizer/login` | P0 |
| DC-SHELL-03 | Event directory field `dancecardSlug` + CTA on `/events/[slug]` | P0 |
| DC-SHELL-04 | Slug registry (`primal-arts-festival` ↔ `paf26`) | P0 |
| DC-SHELL-05 | Chrome suppression on organizer + attendee dancecard routes | P1 |
| DC-SHELL-06 | Global nav/footer: Dancecard + Organizer console links | P1 |
| DC-SHELL-07 | UserMenu: event list / enter code, not demo slug only | P1 |
| DC-SHELL-08 | Sub-brand metadata (OG, `siteName`) for Dancecard routes | P1 |
| DC-SHELL-09 | Public organizer docs (embed, first-run) | P2 |
| DC-SHELL-10 | Visual lab: `noindex` + auth or dev-only | P2 |
| DC-SHELL-11 | Attendee “Back to events calendar” in top bar | P2 |
| DC-SHELL-12 | Update `EAST_COAST_KINK_PLATFORM_AUDIT.md` with Dancecard section | P2 |

### Recommended chrome contract

```text
/dancecard/*           → DancecardTopBar only; no ECKE footer
/organizer/dancecard/* → OrganizerDancecardChrome only; no ECKE header/footer/banner
/embed/dancecard/*     → unchanged (iframe CSP)
```

---

## 10. Phase 7 — API shipped, UI missing

| API | Organizer UI | Attendee UI | Priority |
| --- | --- | --- | --- |
| `GET/PATCH …/event-entitlements` | **Missing** | — | P0 |
| `GET …/usage-meter` | **Missing** | — | P0 |
| `GET/PATCH …/shift-swaps` | **Missing** inbox | **Missing** | P0 |
| `GET/PATCH …/vetting-applications` | **Missing** queue | POST only, no form | P0 |
| `POST …/ical-busy-preview` | **Missing** | — | P1 |
| Embed tokens | Shipped (`IntegrationsPanel`) | — | — |
| `GET …/policy-summary` | — | Page thin; not in main nav | P0/P1 |
| `GET …/exports/conflict-report` | Link in Exports hub | — | Shipped |

---

## Appendix — File index (Round 1)

| Area | Key paths |
| --- | --- |
| Attendee | `src/components/dancecard/DancecardClient.tsx`, `DancecardTopBar.tsx`, `DancecardCompactList.tsx`, `CompareAvailabilityPanel.tsx`, `MutualAvailabilityStrip.tsx`, `MutualReserveTogetherModal.tsx`, `ShareDancecardClient.tsx`, `src/app/dancecard/[eventSlug]/layout.tsx`, `src/app/dancecard/[eventSlug]/page.tsx` |
| Organizer hub (multi-event) | `src/app/organizer/dancecard/page.tsx`, `layout.tsx`, `OrganizerHubClient.tsx`, `OrganizerDancecardChrome.tsx`, `src/app/api/organizer/dancecard/events/route.ts` |
| Organizer (per event) | `src/app/organizer/dancecard/[eventSlug]/OrganizerDancecardClient.tsx`, `src/components/dancecard/organizer/*` (incl. `IntegrationsPanel.tsx`) |
| Auth | `src/app/organizer/login/page.tsx`, `src/app/organizer/login/OrganizerLoginClient.tsx`, `src/app/organizer/dancecard/[eventSlug]/layout.tsx` |
| Integrations / external API (Phase 6) | `src/app/api/organizer/dancecard/[eventSlug]/api-keys`, `webhooks`, `registrant-inbound-secret`, `google-sheets/*`; `src/app/api/external/dancecard/[eventSlug]/*`; `src/app/api/webhooks/dancecard/[eventSlug]/registrants` |
| Account API | `src/app/api/dancecard/[eventSlug]/register/route.ts` |
| Print / map | `src/app/organizer/dancecard/[eventSlug]/print/schedule/page.tsx`, `.../venue-signs/page.tsx`, `src/app/dancecard/[eventSlug]/map/page.tsx`, `src/app/api/dancecard/[eventSlug]/venue-map/route.ts` |
| Globals | `tailwind.config.js`, `src/app/globals.css`, `src/styles/tokens.css`, `src/app/layout.tsx` |

When adding new bullets, append the **smallest set of paths** that grounds the idea.
