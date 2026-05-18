# Dancecard UI Design Guide

**Purpose:** North-star reference for designing a **standalone, distinctive** Dancecard product—before C2K integration. Use alongside implementation backlogs; this doc is **inspiration and principles**, not a sprint ticket list.

**Audience:** Product, design, engineering.

**Inputs:** Sched recon (`SCHED_REGISTRATION_EDITOR_REBUILD_MASTER.md`), competitive research (Swoogo, Whova, Guidebook, Eventeny, Attendify), calendar/productivity patterns (Google Calendar, Notion, Linear, Airtable, Stripe/Vercel), and Dancecard roadmap principles.

**Companion docs:** [`DANCECARD_UI_UX_MASTER_PLAN.md`](./DANCECARD_UI_UX_MASTER_PLAN.md) — phased planning. [`DANCECARD_UI_FACELIFT_BACKLOG.md`](./DANCECARD_UI_FACELIFT_BACKLOG.md) — granular tickets. **This doc** — how it should feel.

---

## 1. Brand stance (not safe)

Dancecard is **not** another gray conference SaaS sidebar.

| We are | We are not |
|--------|------------|
| A **vestibule** into an event (loading, tutorials, trust copy) | A spreadsheet with a dark theme |
| **Privacy-first** kink ops (scene name, photo policy, vetting) | Real-name-first attendee directories |
| **Operator-grade** density with keyboard power | Mouse-only admin panels |
| **Conference hallway** legibility on a phone | Desktop-only program builders |
| **One product, two modes** (attendee + organizer) | Two unrelated apps sharing a database |

**Signature metaphor:** Attendees carry a **literal dancecard**—swipeable commitments, not a corporate agenda widget. Organizers run a **stage manager’s call board**—fast, accountable, recoverable.

---

## 2. Competitive landscape (2025–2026)

| Platform | Steal-worthy | Reject / elevate past |
|----------|--------------|------------------------|
| **Sched** | List + inspector drawer; bulk publish/freeze/secret; Free Venues matrix; Device Preview; My Schedule counter; embed view modes | Misrouting to marketing `/`; single Save on Settings; Userpilot/HubSpot over CTAs; shallow filters; conflicts without fix CTAs |
| **Swoogo** | Drag form builder; page-level conditionals; live preview beside builder | Enterprise complexity; payments-first |
| **Whova** | Import → schedule; back-to-back batch; conflict checker | Generic conference chrome |
| **Guidebook** | Template library → feature toggles onboarding spine | Less schedule-first for multi-track festivals |
| **Eventeny** | Application-type as first-class nav (vendor/volunteer/sponsor) | Smaller ecosystem |
| **Linear** | Command palette; skeleton = final layout; restrained status colors | Issue tracker IA literally |
| **Notion** | Empty state = 3 templates + “start blank”; slash hints | Wiki navigation |
| **Google Calendar** | Drag-to-create duration; side panel edit; color = category | Consumer simplicity only |
| **Airtable** | Saved views; grouped rows; filter builder | Spreadsheet aesthetic as default |

**Dancecard wins on:** kink-event privacy, room/place modeling, role-split organizer leads, audit trails, import-with-diff—not on payments or generic chat.

---

## 3. Sched deep-dive (actionable)

### Adopt (with Dancecard elevation)

- **Event-scoped control room** + **Preview as role** (attendee / presenter / staff / DM / safety)—not one preview for everyone.
- **URL-honest modules** — every sidebar item matches a stable route (publish a route catalog; never silent redirect to marketing home).
- **List + session drawer** with operational tabs; add **Privacy** tab (who sees this slot, photo policy, content warnings).
- **Bulk state machine** on grid: publish, visibility, freeze, tag, enroll-by-tag—with **keyboard shortcuts** and **undo toast**.
- **Free-venues matrix** (date × room) + **capacity heat** + **content-warning** chips on cells.
- **Conflict dock** on program tab (not orphan page): overlap type, severity, **Open both | Nudge time | Reassign room**.
- **Import → diff → apply** with column mapping preview before commit.
- **Registration 3-act structure:** welcome → fields → confirmation, with **live attendee preview** beside builder.
- **Readiness checklist** grouped by organizer role (Programming / Registration / Staff / Safety / Media).

### Reject outright

- Misrouting unknown `/editor/*` to public marketing home.
- Session replay / invasive analytics on registration or vetting surfaces.
- Trial upsell strips on check-in or safety paths.
- `window.prompt` for UUIDs (calendar feeds, exports)—use searchable pickers.
- Real-name-first public directory defaults.
- Conflicts page that detects but doesn’t resolve.
- Full-page reload on save (use optimistic PATCH + toast).

---

## 4. Loading & transition spec

### Decision matrix

| Wait type | Duration | Pattern |
|-----------|----------|---------|
| Shell known, data loading | 0.3–2s | **Staggered skeleton** matching final layout |
| Import / conflict scan | 2–30s | **Progress narrative** + cancel + error report download |
| Tiny action | &lt;400ms | No spinner; button pulse only |
| Auth / gate | 0.5–3s | Named phases: “Checking access” → “Loading schedule” → “Restoring session” |
| Brand moment | ≤1.2s, rare | **Vestibule** animation (see below)—first hub visit or post-publish only |

### Vestibule loaders (signature)

**Organizer — “Doors opening”**
- Floor plan outline fills room-by-room as modules hydrate.
- Rotating role tips: *“Programming: drag a session—conflicts show in amber.”*
- **Publish milestone:** day columns flip draft → live (optional celebration; disable for serious events).

**Attendee — “Shuffling your dancecard”**
- Cards fan from a deck; **never** show other attendees’ names during load.
- Failure copy: *“The dungeon Wi-Fi stumbled. Your dancecard is safe offline.”*

**Import — “Spreadsheet dissolve”**
- Progress: `47 rows validated · 3 conflicts queued` with downloadable error report.

### Skeleton rules

1. Attendee: bottom nav + day strip + 3 session rows (50ms stagger).
2. Program grid: sticky headers + hour rows + 2–3 slot rectangles at real `ROW_H`.
3. Registrants: master column + detail pane placeholders.
4. Command palette: grouped rows with icon + shortcut gray bars.

**Motion:** 150ms tab cross-fade; drawer slide; honor `prefers-reduced-motion` (opacity only).

---

## 5. Onboarding & tutorials

### Research guardrails

- **3–5 checklist items** max per persona; completion past five items drops sharply.
- **Action-based** steps beat slideshows (user must import, publish, or share—not click Next × 12).
- Measure **time-to-first-published-slot**, not checkbox rate.

### Organizer — “Setup runway”

Persistent hub checklist until done:

1. Set event window + timezone → Settings  
2. Import or build program → Program (highlight blank path)  
3. Connect email (Resend) or skip → Integrations  
4. Share attendee link / embed → copy + QR  

Optional: **90s ghost-cursor rehearsal** on first Program visit only (3 steps, dismiss forever).  
**Role branches:** `viewer` sees read-only checklist; `safety` sees vetting-focused subset.

### Attendee — “Planning ritual”

- 3-card swipeable **Compare** explainer (replace `text-[11px]` walls).
- Program first-run: highlight “Happening now” once.
- **Tips** in overflow menu to reopen; no blocking modal on mobile.

### Tutorial systems (full, not tooltips)

| System | Use for |
|--------|---------|
| **Questline** | First-time organizer: branch “First rope con?” vs “Hotel takeover veteran” — 5–7 scenes, skippable |
| **Ghost cursor** | Real UI overlay: user performs drag to advance (muscle memory, not passive tour) |
| **Conflict university** | Intentional double-book → fix via matrix + conflict dock (90s interactive) |
| **Safety lead track** | Separate tone: vetting queues, restricted notes, **no screenshots** chrome |
| **Deep links** | `?guide=registration` for co-organizers |

**Avoid:** Intercom-style full-screen tours on dense grids; 8+ item checklists; video before first interaction.

---

## 6. Command palette & power users

**Invoke:** `⌘K` / `Ctrl+K` globally in organizer shell; `/` focuses panel search.

**Context groups**

| Context | Commands |
|---------|----------|
| Program | New slot, Duplicate, Move to track…, Publish day, Open conflicts, Export selection |
| Registrants | Filter…, Import CSV, Copy emails |
| Any | Go to tab…, Switch event…, Shortcuts `?` |

**`@` fuzzy jump:** people, rooms, tracks by name—**no UUID prompts**.

**Natural language (stretch):** `>publish sunday` with confirmation chip.

**Shortcut legend (`?`):** printable PDF for volunteer leads.

---

## 7. Dense data & program grid

**Layer cake (back → front):** grid lines → sticky room/track headers → slots (4px track accent rail) → conflict hatch → selection ring → drag ghost + time tooltip.

**Views for same data:** Grid (build) · List (bulk edit) · Timeline (single-track Gantt) · Board (draft/scheduled/published).

**Density:** 15 / 30 / 60 min row height; attendee list cozy / comfortable / spacious.

**Color:** Track = hue + **pattern** on rail; status = semantic family (4 max)—not rainbow per field. **WCAG:** icons + text for free/busy/mutual, not color alone.

---

## 8. Theming

| Layer | Behavior |
|-------|----------|
| System | `prefers-color-scheme` default |
| User | Light / dark / system |
| **Event skin** | Organizer sets 3–5 CSS vars: accent, surface, slot-published |
| **Hallway mode** | High contrast: thicker borders, 44px tap targets, larger type |

Unify `slate-*` / `cyan-*` sprawl → semantic tokens: `surface`, `elevated`, `accent`, `danger`, `success`, `muted`.

Embeds respect **visibility**—never leak secret tracks in public iframe.

---

## 9. Signature moments (prioritize for v1)

1. **Happening now** ribbon on attendee program (tap → hallway mode).  
2. **Conflict sonar** — grid briefly highlights overlapping slots when scanner runs.  
3. **Compare constellation** — zoomable mutual timeline, not spreadsheet heatmap.  
4. **Walking-time whisper** between saved sessions using location hierarchy.  
5. **Scene name / legal name dual typography** — legal behind privacy veil until staff logs reason.  
6. **Content-warning stamps** on session cards (shared: app, embed, print).  
7. **Privacy panic button** (attendee) — one tap blurs names/photos; restore with PIN.  
8. **Undo toast** on every destructive grid action (8s, primary Undo).  
9. **Event hub as playing cards** — readiness ring per event (program %, integrations ✓).  
10. **My Schedule as literal dancecard** — swipeable cards; optional haptic on add/remove.

---

## 10. Accessibility without corporate blandness

- Visible note icons (not `aria-hidden` dots only).  
- Arrow keys on mutual grid; `1–4` for attendee tabs; roving tabindex on organizer nav.  
- Plain-language trust: *“Only people you share with see busy times.”*  
- `forced-colors` / high-contrast paths for mutual strip and map pins.  
- Live regions for toasts and publish success.  
- Skip links: “Skip to program”, “Skip to grid”.

---

## 11. Anti-patterns (boring SaaS defaults)

- Purple-gradient hero empty states.  
- 8+ item “Getting started” checklists.  
- Full-page “Loading…” spinners (use skeletons).  
- `alert` / `prompt` / `confirm` for ops workflows.  
- 15-tab horizontal strip without grouping.  
- Mouse-only DnD.  
- Fake progress bars not tied to server steps.  
- Light gray on gray (illegible in hotel lighting).  
- Attendee vs organizer as visually unrelated products.  
- Corporate clipart empty folders—use **template previews** of real grids instead.

---

## 12. C2K integration appendix (shipped May 2026)

When embedding in Coast to Coast Kink:

- **Reduced chrome:** Manage tab `DancecardOpsCard` — 2-item checklist, ops + attendee links, optional ops-summary iframe; schedule embed uses `?chrome=minimal`.  
- **Auth:** `POST` handoff code (60s TTL) from C2K → ECKE `/organizer/dancecard/handoff`; fallback sign-in with `?from=c2k&convention=` banner.  
- **Event skin** applies inside embed boundary only.  
- Do not duplicate C2K org hub (forums, chat)—Dancecard = **ops layer** under convention.  
- **Attendee split:** mutual availability on C2K; festival program on ECKE (`dancecard-c2k-integration.md`).

---

## 13. Reference links

### Sched
- [Sched features](https://sched.com/features/) · [Organizer getting started](https://support.sched.com/knowledge/a-simplified-getting-started-guide-for-event-organizers) · [Personalized schedule](https://sched.com/guide/your-personalized-schedule/)

### Competitors
- [Swoogo platform](https://swoogo.events/platform/) · [Whova agenda center](https://whova.com/event-management-software/event-agenda-center/) · [Guidebook features](https://www.guidebook.com/features/) · [Eventeny form building](http://eventeny.com/form-building/)

### Workspace
- `c:\Users\shkin\Desktop\eastcoast\SCHED_REGISTRATION_EDITOR_REBUILD_MASTER.md`
- `c:\Users\shkin\Desktop\eastcoast\sched_routing_table.json`
- `c:\Users\shkin\Desktop\eastcoast\EastCoast-master\docs\DANCECARD_MASTER_PRODUCT_ROADMAP.md`

---

## Changelog

| Date | Summary |
| --- | --- |
| 2026-05-16 | Initial guide: competitive synthesis, vestibule loaders, tutorial architecture, command palette, signature moments, C2K appendix. |
| 2026-05-16 | §12 updated for shipped C2K integration (ops card, handoff, embed minimal chrome, attendee/program split). |
