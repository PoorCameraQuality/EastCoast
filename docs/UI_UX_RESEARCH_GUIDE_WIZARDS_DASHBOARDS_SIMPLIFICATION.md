# UI/UX Research Guide — Wizards, Dashboards & Simplifying Complexity

**Purpose:** Shared reference for humans and AI agents building the Dancecard organizer console and related ECKE surfaces.  
**Research date:** 2026-05-17 (web sources, design systems, NN/g, GOV.UK, industry patterns).  
**Companion docs:** [GENERIC_DANCECARD_PRODUCT_VISION.md](./GENERIC_DANCECARD_PRODUCT_VISION.md), [dancecard-handoff-2026-05-17.md](./dancecard-handoff-2026-05-17.md), [dancecard-design-tokens.md](./dancecard-design-tokens.md)

---

## How to use this guide

| When you are… | Start here |
| --- | --- |
| Designing event setup / settings | [Part 1 — Wizards](#part-1-building-wizards) |
| Designing Home / readiness / ops overview | [Part 2 — Dashboards](#part-2-building-dashboards) |
| Reducing nav sprawl or dense screens | [Part 3 — Simplification](#part-3-simplifying-complex-ui) |
| Reviewing an existing screen | [Master audit checklist](#master-audit-checklist) |
| Implementing in Dancecard | [Dancecard application map](#dancecard-application-map) |

---

## Executive summary (all three topics)

1. **Wizards** are for **infrequent, high-stakes, branching** workflows—not for daily power-user work. Prefer a **task list** (non-linear, save/resume) over a locked stepper when setup spans days.
2. **Dashboards** should answer **one job per visit** in ~5 seconds (glanceable zone). Operational consoles prioritize **actions + status**, not chart galleries.
3. **Complexity** is managed, not removed: **progressive disclosure**, **hub-and-spoke IA**, **command palette** for experts, **opt-in** onboarding—never full-screen blocking tours by default.
4. **Three layers of UI:** (A) always visible essentials, (B) one-click secondary, (C) advanced / expert—map Dancecard features into these layers explicitly.
5. **Measure:** task completion, time-on-task, drop-off per wizard step, dashboard “time to first action,” and support tickets—not vanity metrics count.

---

# Part 1 — Building wizards

## 1.1 Definitions (cite-worthy)

| Term | Definition | Source |
| --- | --- | --- |
| **Wizard** | Step-by-step process; order prescribed; later steps may depend on earlier input; often perceived as linear | [NN/g — Wizards](https://www.nngroup.com/articles/wizards/) |
| **Task list** | Non-linear checklist of tasks; user chooses order; status per task (complete / incomplete) | [GOV.UK — Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/) |
| **Multistep form** | Form split across pages; validation per step; may or may not branch | [Smashing — Multistep forms](https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/) |

## 1.2 Decision framework: which pattern?

```
START: User must complete a multi-part process
│
├─ Done in one sitting (<10 min)? 
│   ├─ YES → Strong dependencies between steps?
│   │   ├─ YES → Linear WIZARD (stepper + Next/Back)
│   │   └─ NO  → MULTISTEP FORM or single scrollable page with sections
│   └─ NO  → TASK LIST (GOV.UK pattern) + save state per task
│
├─ Expert repeats weekly?
│   └─ YES → Do NOT use wizard; use settings page + command palette + templates
│
├─ Needs review before commit?
│   └─ YES → Add explicit REVIEW step + summary of edits
│
└─ Blocks rest of app?
    └─ Avoid modal wizard; use full-page or dedicated route (/setup/…)
```

### When **not** to use a wizard (NN/g + LogRocket)

- Repeatable workflows (program editing, daily ops).
- Users are domain experts with their own mental model.
- Process needs comparing info across steps (spreadsheet/table is better).
- Wizard would **hide** data already in the app (e.g. credit score elsewhere).
- More than ~7 steps without save/resume—interaction cost dominates benefit.

### When a wizard **is** appropriate

- First-time **event setup** (timezone, window, venue skeleton).
- **Agreements** configuration (legal + provider choice).
- **Import** first run (connect source → map columns → preview → publish).
- Infrequent **integrations** (RabbitSign, embed, calendar feed).

## 1.3 Recommended wizard patterns

### A. Orientation (always)

- Show **steps remaining** and **current step** (stepper or task list status).
- Use **descriptive** Next labels where possible (“Continue to venue” vs “Next”).
- Enforce **sequential order** only when steps truly depend on prior data; otherwise use task list.

### B. State & recovery

- **Autosave** each step; allow exit and resume (localStorage + server).
- On return, show **summary of completed steps** and what’s left.
- **Review** step before irreversible actions (publish schedule, send blast).

### C. Validation

- Validate **on step exit**, not only at end (Smashing, NN/g).
- Inline errors next to fields; don’t clear unrelated steps.
- Branching: compute path server-side or from canonical rules—don’t ask users to pick a “path.”

### D. Accessibility

- Focus moves to **step heading** on step change (`aria-live` polite).
- Trap focus inside **modal** wizards only; full-page wizards need not trap.
- Progress: `aria-current="step"` on active step.
- Keyboard: Enter = Next only when safe; Esc = cancel with confirm if dirty.

### E. Mobile

- One primary action per step at bottom (thumb zone).
- Avoid horizontal steppers >5 steps on narrow screens—use vertical list or “Step 2 of 6” text.

## 1.4 Wizard vs task list (GOV.UK insight)

**Task list** fits Dancecard **event readiness** better than a rigid wizard:

| Task list row | Dancecard example |
| --- | --- |
| Set event window & timezone | Settings → Event |
| Add rooms / locations | Settings → Venue |
| Import or create program | Schedule → Import / Program |
| Load staff shifts | People → Staff |
| Configure agreements | Settings → Agreements |
| Publish program | Program → bulk publish |

Each row: **Completed** / **Incomplete** / **Cannot start yet** (dependency). User can jump to the relevant tool—no modal prison.

**Reference:** [GOV.UK task list component](https://design-system.service.gov.uk/components/task-list/)

## 1.5 Design system references

| System | Pattern | URL |
| --- | --- | --- |
| NN/g | Wizard definition, pros/cons, 10 recommendations | https://www.nngroup.com/articles/wizards/ |
| GOV.UK | Complete multiple tasks / task list | https://design-system.service.gov.uk/patterns/complete-multiple-tasks/ |
| Carbon | Progress indicator; create flows (prefer tearsheet over modal for complex create) | https://carbondesignsystem.com/components/progress-indicator/usage |
| Carbon | Create flows community pattern | https://v10.carbondesignsystem.com/community/patterns/create-flows/ |
| Smashing | Multistep forms (2024) | https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/ |
| LogRocket | When **not** to use setup wizard | https://blog.logrocket.com/ux-design/creating-setup-wizard-when-you-shouldnt/ |
| Stripe | Onboarding: minimal steps, post-install, customizable depth | https://docs.stripe.com/stripe-apps/patterns/onboarding-experience |

## 1.6 Anti-patterns

| Anti-pattern | Why it hurts |
| --- | --- |
| Auto-blocking fullscreen tour on first visit | Kills clicks; users abandon (we fixed this in program grid—tours opt-in) |
| Generic “Next” on every step | Weak information scent |
| No save mid-flight | Lost work → rage quit |
| Wizard in modal over data you need | Mint/credit-score pattern (NN/g) |
| 12-step linear for optional config | Use task list + defaults |
| Re-asking for data already in system | Breaks trust |

## 1.7 Wizard checklist (build review)

- [ ] Process is infrequent or novice-oriented
- [ ] Step count ≤7 or save/resume enabled
- [ ] Progress visible; current step obvious
- [ ] Validation per step; review before commit
- [ ] Back works; data preserved
- [ ] Exit saves draft; resume restores context summary
- [ ] No blocking modal over required background info
- [ ] Descriptive CTAs; keyboard + screen reader tested
- [ ] Expert path exists (skip wizard / edit in settings later)

---

# Part 2 — Building dashboards

## 2.1 Dashboard types

| Type | Question it answers | Primary user | Dancecard fit |
| --- | --- | --- | --- |
| **Operational** | What needs my attention **now**? | Organizer, stage manager | **Home / dashboard tab** — readiness, conflicts, unpublished count |
| **Analytical** | How did we perform / trend? | Owner, post-event | Exports, future analytics—not v1 home |
| **Strategic** | Are we on track to goals? | Leadership | Out of scope for per-event console |

**Rule:** One screen = one **decision job**. If the user can’t act within 5 seconds, it’s wallpaper.

Sources: [Dashboard Design Patterns (academic)](https://dashboarddesignpatterns.github.io/processguidelines.html), [Smashing — dashboard research](https://www.smashingmagazine.com/2021/11/dashboard-design-research-decluttering-data-viz/)

## 2.2 Cognitive load & the glanceable zone

- Miller’s chunking: users struggle beyond **~4±2 KPI cards** in the hero zone (industry synthesis; see [dashboard overload articles](https://www.sanjaydey.com/saas-dashboard-design-information-architecture-cognitive-overload/)).
- **Glanceable zone:** top-left / top band—what matters **today**.
- **30 metrics = zero metrics**—users scan and leave.

### Layout hierarchy (F-pattern for LTR)

1. **Critical alerts** (blocking issues)—max 3–5, grouped
2. **Primary actions** (“Import schedule”, “Resolve conflicts”)
3. **Status at a glance** (published %, staff loaded, agreements gap)
4. **Secondary lists** (recent changes, upcoming sessions)
5. **Charts** only if they change a decision—otherwise table or number

## 2.3 Operational dashboard anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ Context: Event name · role · switcher          ⌘K  Preview  │
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │  H1: Home / Overview                            │
│ (IA)     │  ┌─────────┐ ┌─────────┐ ┌─────────┐  ← max 3-5 │
│          │  │ Urgent  │ │ Ready   │ │ Stats   │    KPI cards│
│          │  └─────────┘ └─────────┘ └─────────┘              │
│          │  ▼ Action list (grouped by urgency)               │
│          │  ▼ Optional: timeline / “happening now”           │
└──────────┴──────────────────────────────────────────────────┘
```

### Component catalog (event ops)

| Component | Use when | Avoid when |
| --- | --- | --- |
| **Urgency groups** | Blocking readiness (import stale, conflicts, unsigned agreements) | Everything is “high” priority |
| **Progress bars** | % published, % staff assigned | Precise analytics |
| **Count + link** | “12 drafts” → click to filter program | Standalone number with no action |
| **Empty state + CTA** | First visit / missing data | Hiding problems |
| **Activity feed** | Audit, recent publishes | Replacing task list |
| **Charts** | Trend over time (post-event) | Real-time ops (use status list) |

## 2.4 Navigation models (combine, don’t pick one)

| Model | Best for | Dancecard |
| --- | --- | --- |
| **Sidebar sections** | Stable IA, 5–9 top-level areas | Home, Schedule, People, Comms, Settings, Tools |
| **Hub + sub-tabs** | Many related entities | People hub (`peopleTab`) |
| **Command palette (⌘K)** | Power users, jump to entity | `OrganizerCommandShell` |
| **Contextual drill-down** | Slot → drawer; registrant → detail | Program grid, Signups |
| **Breadcrumbs / switcher** | Multi-event organizers | Event switcher in chrome |

**Reference:** [Command palette pattern](https://uxpatterns.dev/patterns/advanced/command-palette), Linear/Notion keyboard-first ops.

## 2.5 Role-based dashboards

| Role | See | Don’t see |
| --- | --- | --- |
| Admin / editor | All urgency + actions | — |
| Viewer | Read-only status; no publish CTAs | Destructive actions |
| Specialist (future) | Subset IA (e.g. program only) | Billing, agreements |

Design **RBAC at IA layer**, not only button `disabled`—reduces noise.

## 2.6 Data & loading

- **Skeleton** for slow sections; don’t block entire page.
- **Stale indicators** (“Import 3 days ago”) > silent old data.
- **Real-time** only where it changes action (live check-in)—not everywhere.
- **Humanized errors** on dashboard tiles (we do this for program load failures).

## 2.7 Exemplar comparison

| Product | Strength | Lesson for Dancecard |
| --- | --- | --- |
| **Linear** | Speed, ⌘K, minimal chrome | Command palette + keyboard shortcuts legend |
| **Stripe Dashboard** | Clear hierarchy, actionable rows | Readiness rows → deep link to fix |
| **Retool / internal ops** | Dense tables + side panel | People hub master-detail |
| **Grafana** | Monitoring at scale | Don’t copy—organizers aren’t SREs |
| **GOV.UK task list** | Setup completeness | Event readiness as task list |

## 2.8 Dashboard anti-patterns

- Chart junk on home “because dashboards have charts”
- Equal visual weight for urgent vs nice-to-know
- No deep links from metric → fix screen
- Dashboard as **marketing** (big hero, no ops)
- Reload entire page on tab switch
- 67 data points above fold (industry failure mode)

## 2.9 Dashboard checklist

- [ ] Stated **one job** for this dashboard view
- [ ] ≤5 primary metrics in hero; each links to action
- [ ] Urgency grouping (blocking / soon / ok)
- [ ] Empty and error states per widget
- [ ] Role-appropriate CTAs
- [ ] Loads progressively; no full-page spinner >300ms without skeleton
- [ ] ⌘K or search for cross-entity jump
- [ ] Validated with 3 real organizer tasks (timed)

---

# Part 3 — Simplifying complex UI

## 3.1 Core principles (named)

| Principle | Meaning | Source |
| --- | --- | --- |
| **Progressive disclosure** | Show essentials; reveal detail on demand | [IBM Design](https://medium.com/design-ibm/designing-patterns-that-scale-with-progressive-disclosure-9341d53644ae), [Microsoft UX Guide](https://learn.microsoft.com/en-us/windows/win32/uxguide/ctrl-progressive-disclosure-controls) |
| **Recognition over recall** | Visible options beat hidden menus | NN/g heuristics |
| **Hub-and-spoke** | Deep modules; shallow top nav | Enterprise IA practice |
| **Progressive reduction** | UI simplifies as user gains expertise (hide tips, collapse help) | Apple HIG-adjacent practice |
| **Opt-in acceleration** | Tours, shortcuts—for experts, not blockers | Dancecard 2026-05-17 fix |
| **Chunking** | Group by user mental model (People), not DB tables | Cognitive psychology |

**Research claim:** Progressive disclosure can improve comprehension (~40%) and task completion (~25–30%) in complex apps (synthesis from [ValidateThat glossary](https://validatethat.io/glossary/progressive-disclosure) and enterprise UX literature—treat as directional, validate per feature).

## 3.2 Three-layer model (use in design reviews)

| Layer | Visibility | Dancecard examples |
| --- | --- | --- |
| **L1 Essential** | Always | Program grid, sidebar, publish status, sign-in |
| **L2 Secondary** | 1 click (tab, expand, drawer section) | Track filters, bulk toolbar, registrant detail |
| **L3 Advanced** | Mode, settings, or ⌘K | Import diff, agreements hybrid, embed skin, coverage roles |

**Rule:** If a feature is L3, it must not occupy L1 nav.

## 3.3 Tactical playbook (10 techniques)

| # | Technique | When to use | Example |
| --- | --- | --- | --- |
| 1 | **Consolidate nav into hubs** | >7 top-level items | People hub vs 6 separate tabs |
| 2 | **Task list for setup** | Multi-day configuration | Event readiness |
| 3 | **Drawer / sheet** | Edit one entity without leaving context | Session detail drawer |
| 4 | **Collapsible sections** | Long settings pages | Attendee guide JSON sections |
| 5 | **Smart defaults** | 80% users pick same option | Timezone from venue |
| 6 | **Templates / duplicate** | Repeatable structures | Duplicate class, duty templates |
| 7 | **Inline validation** | Forms with costly errors | Import mapping |
| 8 | **Command palette** | >20 navigable destinations | ⌘K → Program, person, room |
| 9 | **Contextual help** | Jargon or policy | “What is ECKE Sign?” link, not tour |
| 10 | **Density toggle** | Power vs novice | Wide layout / compact list |

## 3.4 Navigation simplification matrix

| Pattern | Complexity feel | Power-user fit | Dancecard |
| --- | --- | --- | --- |
| Flat 15-tab nav | High | Medium | **Retired** → regrouped sidebar |
| Grouped sidebar (6) | Medium | High | **Current** |
| Hub + query param | Low–medium | High | `?tab=people&peopleTab=` |
| Wizard-only setup | Low initially | Low later | Task list preferred |
| Command-driven | Low visible chrome | Very high | ⌘K palette |

## 3.5 Onboarding without blocking

| Approach | Do | Don’t |
| --- | --- | --- |
| **Tooltip coach marks** | Single feature, dismissible | Cover entire grid |
| **Checklist panel** | Side card “Getting started” | Modal over work area |
| **Opt-in tour** | “Grid tour” button | Auto fullscreen on first visit |
| **Empty states** | CTA to first action | Wall of text |

## 3.6 Language & choice reduction

- **Plain labels:** “Signups” not “Registrant master-detail.”
- **Event profile labels:** `useEventProfileLabels` for campout vs hotel wording.
- **Limit concurrent choices:** 3–5 track filters, not 20 tag chips visible.
- **Sensible defaults** in dropdowns (All, Published, This day).

## 3.7 Simplification audit checklist (existing screen)

Score each 1–5 (1 = failing, 5 = excellent):

- [ ] Can a new organizer complete the **primary task** in <2 minutes without docs?
- [ ] Are there **≤7** top-level nav items?
- [ ] Does every visible metric/link have a **clear next action**?
- [ ] Is advanced config **off** the critical path?
- [ ] Are modals/drawers **dismissible** (backdrop, Esc)?
- [ ] Do experts have **keyboard** paths?
- [ ] Is terminology consistent with [productCopy](./GENERIC_DANCECARD_PRODUCT_VISION.md)?
- [ ] Does mobile degrade gracefully (not broken layout)?
- [ ] Any **fullscreen blockers** on repeat visits?
- [ ] Could anything be merged into a **hub**?

**<35 total:** simplify before adding features.

## 3.8 Anti-patterns (complexity debt)

- Settings sprawl (12 panels, no grouping)
- Modal stacking (confirm on confirm)
- Hamburger hiding **primary** nav
- Feature flags visible to all roles
- Identical gray cards (no track/status encoding)—**fixed in program grid via roleColor**
- Blocking tours
- Tooltip walls on first load

## 3.9 References (simplification)

| Resource | URL |
| --- | --- |
| IBM — Progressive disclosure at scale | https://medium.com/design-ibm/designing-patterns-that-scale-with-progressive-disclosure-9341d53644ae |
| Microsoft — Progressive disclosure controls | https://learn.microsoft.com/en-us/windows/win32/uxguide/ctrl-progressive-disclosure-controls |
| Laws of UX (chunking, Hick’s law) | https://lawsofux.com/ |
| NN/g — Interaction cost | https://www.nngroup.com/articles/interaction-cost-definition/ |
| NN/g — Cognitive load | https://www.nngroup.com/articles/minimize-cognitive-load/ |

---

# Master audit checklist

Use before shipping a major organizer feature:

### IA & navigation
- [ ] Top nav ≤7 groups; related items hubbed
- [ ] URL reflects state (`?tab=`, `?peopleTab=`, `?slot=`)
- [ ] ⌘K finds people, rooms, tracks

### Setup & wizards
- [ ] Infrequent setup uses task list or short wizard with save
- [ ] No auto-blocking tours

### Dashboard / home
- [ ] ≤5 hero metrics; urgency grouped; each links to fix

### Density & disclosure
- [ ] L1/L2/L3 layers assigned
- [ ] Drawers dismiss on backdrop/Esc

### Visual encoding
- [ ] Status/color carries meaning (track, publish, conflict)
- [ ] Not monochrome for categorical data

### Accessibility
- [ ] Focus order, labels, live regions on step change

---

# Dancecard application map

Concrete recommendations aligned with current codebase:

| Area | Current | Research-backed target |
| --- | --- | --- |
| **Event Home** | `OrganizerEventDashboard` | Operational dashboard: 3–5 readiness cards + urgency groups + deep links |
| **Setup** | `EventSetupWizard`, settings panels | Prefer **GOV.UK task list** on Home; wizard only for truly linear flows |
| **Program** | Grid + list + drawer | Keep; track colors via `roleColor`; opt-in tour only |
| **People** | Hub + `peopleTab` | Textbook hub-and-spoke—extend pattern to Tools if needed |
| **Import** | `ScheduleImportPanel` | Wizard OK for first run; diff preview = review step |
| **Agreements** | Settings + ECKE Sign + RabbitSign | Branching wizard OR settings sections; not both duplicated |
| **Navigation** | Sidebar + ⌘K | Add task-list “Readiness” on Home tying to tabs |
| **Onboarding** | `GhostCursorRehearsal`, guides | Opt-in only (`useGuideState` localStorage `0` = show) |

### Suggested next UX builds (priority)

1. **Event readiness task list** on dashboard (GOV.UK pattern).
2. **Home urgency groups** with links (`import stale`, `conflicts`, `agreements gap`).
3. **Setup route** `/organizer/dancecard/[slug]/setup` as task list host—not modal.
4. **Progressive reduction:** hide “Grid tour” after first completion; show checklist instead.
5. **Dashboard metrics audit:** remove chart-less KPIs; every number clicks through.

---

# Bibliography (top sources)

### Wizards & multistep flows
1. Nielsen Norman Group — *Wizards: Definition and Design Recommendations* — https://www.nngroup.com/articles/wizards/
2. GOV.UK Design System — *Complete multiple tasks* — https://design-system.service.gov.uk/patterns/complete-multiple-tasks/
3. Smashing Magazine (2024) — *Creating An Effective Multistep Form* — https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/
4. LogRocket — *Creating a setup wizard (and when you shouldn't)* — https://blog.logrocket.com/ux-design/creating-setup-wizard-when-you-shouldnt/
5. Carbon Design System — *Progress indicator* — https://carbondesignsystem.com/components/progress-indicator/usage

### Dashboards
6. Dashboard Design Patterns (research) — https://dashboarddesignpatterns.github.io/
7. Smashing Magazine — *From Good To Great In Dashboard Design* — https://www.smashingmagazine.com/2021/11/dashboard-design-research-decluttering-data-viz/
8. Veld Systems — *SaaS admin dashboard ops teams love* — https://veldsystems.com/blog/saas-admin-dashboard-design

### Simplification & complexity
9. IBM Design — *Progressive disclosure at scale* — https://medium.com/design-ibm/designing-patterns-that-scale-with-progressive-disclosure-9341d53644ae
10. UX Patterns for Developers — *Command palette* — https://uxpatterns.dev/patterns/advanced/command-palette
11. Nielsen Norman Group — *Minimize cognitive load* — https://www.nngroup.com/articles/minimize-cognitive-load/

### Industry onboarding
12. Stripe — *Onboarding experience patterns* — https://docs.stripe.com/stripe-apps/patterns/onboarding-experience

---

# For AI agents

When implementing organizer UI:

1. Read this guide + `GENERIC_DANCECARD_PRODUCT_VISION.md` + `dancecard-design-tokens.md`.
2. Classify the feature: **wizard**, **dashboard widget**, or **simplification/refactor**.
3. Run the relevant checklist section before coding.
4. Never add auto-blocking fullscreen overlays.
5. Prefer task list + deep links over linear modals for event setup.
6. Every dashboard metric must link to a remediation screen.

---

*Maintainers: update bibliography URLs if links rot; add Dancecard-specific screenshots when readiness task list ships.*
