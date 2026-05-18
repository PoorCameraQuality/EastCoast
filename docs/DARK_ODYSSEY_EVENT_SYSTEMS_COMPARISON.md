# Dark Odyssey / Event-Systems.com — competitive notes vs Dancecard

**Date:** 2026-05-17  
**Analyst:** ECKE agent (browser review + public Dark Odyssey docs)  
**Systems reviewed:**

| System | URL | Event / year |
|--------|-----|----------------|
| Registration (Fusion) | [event-systems.com/esys/fn2026/register](https://www.event-systems.com/esys/fn2026/register) | Dark Odyssey Fusion, June 23–29, 2026 |
| Community (“esys”) | [event-systems.com/esys/sc25/](https://www.event-systems.com/esys/sc25/) | Dark Odyssey Summer Camp community (2025 instance) |
| Public FAQ | [darkodyssey.com/fusion/faq/](https://darkodyssey.com/fusion/faq/) | Describes community + chores + cabins |

**Community crawl:** Logged in successfully to `sc25` (May 2026) via programmatic POST (`submittal=login`, fields `login` + `password`). Browser automation failed on the readonly submit control; see `scripts/esys-login-probe.mjs` and `scripts/esys-crawl.mjs`. HTML snapshots: `docs/esys-crawl-sc25/`.

---

## 1. What Event-Systems (“esys”) appears to be

- **Vendor-hosted, per-event subpaths** (`/esys/{eventCode}/`) — registration and community are separate apps on the same host.
- **Registration** is a classic multi-step web form (server-rendered HTML, table layout, early-2000s visual language).
- **Community** is a separate login portal created at registration time (badge name → username; password set on first screen).
- **Payments and legal identity** live in registration; **social + ops** (cabins, chores, invites) live in community after pay.

This is closer to **RegFox + custom PHP community** than to a single modern SPA — which is exactly the gap Dancecard targets with one branded attendee surface + one organizer console.

---

## 2. Registration flow (Fusion 2026)

### Layout and navigation

- **Visual design:** Black background, blue header bars, circuit-board banner, centered narrow column. High contrast but dated typography and table-based layout.
- **Progress model:** Breadcrumb-style steps (all on one long “Start” page for step 1):
  - Start → Personal Info → Attendee Options → Invoice → Payment → Complete
- **Readability:** Policy walls of text (COVID, parking cash-only, cancellation, privacy, gift rules) before form fields — thorough but exhausting on mobile.
- **Start Over** link at top — good escape hatch for multi-person mistakes.

### Fields observed on Start (step 1)

| Field | Purpose |
|-------|---------|
| How many people (1–4) | Household / group registration on one transaction |
| Legal first/last name | Required for compliance |
| Badge name | Scene name; **only name visible** to other attendees; becomes **community username** |
| Badge comment | 5–10 words printed on badge |
| Pronouns | Printed on badge (with “no joke pronouns” guidance) |
| Password + confirm | **Creates community account** immediately |
| Birthdate | 19+ gate |
| Email + confirm | Account recovery |
| Phone | Contact |
| Registration package | Arrival window tiers (Tue–Mon … Fri–Mon) |
| Participating group | Long dropdown (~54+ munches/groups) + membership ID |
| Discount code | Staff-provided |
| Full mailing address | Legal requirement |

### Registration options (from copy + FAQ)

- **À la carte pricing:** entrance by day span, cabin bed, meal plan, RV slot, extra pre-days, **resort option** (skip chores fee).
- **Participating group discounts** tied to org membership ID.
- **Gift registrations** become property of named registrant (airline-ticket model).
- **Post-register:** email with directions; community + Discord + FetLife called out explicitly.

### UX assessment (registration)

| Strength | Weakness |
|----------|----------|
| Single flow covers pay + account creation | Very long first page; policies before action |
| Clear step labels | Not mobile-first; small tap targets |
| Multi-person up to 4 | No live price summary visible on step 1 |
| Badge = community identity | Password on same page as PII feels heavy |
| Group discount plumbing built-in | Participating group list overwhelming |

---

## 3. Community system (live-crawled `sc25`, May 2026)

### Global chrome

- Header: **badge name + reg number** (e.g. `Brax (753-1)`).
- Left nav (persistent): **Home**, **News**, **Inbox**, **Invites**, **Profiles**, **Your Info**, **Logout**.
- Secondary link from home: **Your Blog** (`func=messages`).
- Layout: table-based columns, “box” widgets, YUI calendar scripts — same vintage as registration.

### Home dashboard (two columns)

| Widget | Content |
|--------|---------|
| Event Registration | Read-only summary from reg: package, Pamporium chores flag, cabin/RV/resort/meal/linens |
| Important Stuff | Mailchimp PDFs/links: program booklet, workshop schedule, chore sign-ups (external), map, FAQ |
| Social Media | Discord invite (needs badge name + reg #), FetLife group |
| Blogs | Link to personal blog |
| Profiles | Browse / search / recent personal profiles |
| Schedule | **Your** upcoming invites/chores (not full program grid) |
| Chores | Single link → **Chore Guide** grid (`?func=subes&tfunc=grid`) |
| Badge | Live preview + link to edit info |

Program content is mostly **external PDFs** (program booklet, tinyurl schedule); in-app schedule on home is **personal commitments** (invites/chores), not the workshop catalog.

### Invites (`func=subes`) — social + chores + cabins

Sub-nav under Invites:

- **Browse Invites** — filter by type: Cabin Group, Other, Play Date, Tent City, Party
- **Create An Invite**
- **Show Invites** — list **your** signed-up items by day

**Cabin groups:** Public posts with host profile link, long description, “FULL” in title when closed. Examples: The Juke Joint, Island of Misfit Toys, THAT Cabin, Green Carnation, etc. Host links to `profiles` with `atnd=` id.

**Chores:** Implemented as **invite records** titled `Chore: …` (e.g. Cafe Worker, Fire Tender). Same `sube=` detail URLs as social invites.

**Chore Guide** (`tfunc=grid`): See §3.1 below (screenshots + detail flow).

**Dual chore signup paths:**

1. **In-app:** Chore Guide grid + Show Invites (self-serve pick shifts).
2. **External:** Home → Important Stuff → “Chore Sign-ups (Att Update 2)” Mailchimp link (organizer blast, not only in-app).

Registration option **“Do you want to do your chores at the Pamporium?”** appears on home reg summary — ties chores to venue choice.

### 3.1 Chore Guide UX (attendee “chore picker”)

The chore picker is **not** a separate product — it reuses the **Invites** subsystem (`func=subes`). Chores are typed invites with a parent **Chore Area** row on the grid.

#### A. Grid view (`?func=subes&tfunc=grid`)

| Control | Behavior |
|---------|----------|
| **Show** | Dropdown (e.g. “24 Hours”) — viewport length |
| **Time** | Anchor datetime + **[Change]** — pans the horizontal timeline (`start` + `scale` query params) |
| **Columns** | Four visible blocks per day slice (e.g. 08-26-2025 10:00, 14:00, 18:00, 22:00) with `<<` / `>>` to shift window |
| **Rows** | One or more rows per **area**: Gate Keeper, InFusion Cafe, Special Skill, Floater, Registration, Special Events, Pamporium (filter typo “Roater” in UI) |
| **Cells** | Colored blocks: title (often same as role), **Time:** range, **Members:** linked badge names + **`(signed / capacity)`**, **Location:** (usually empty) |
| **Cell states** | Open slots are links to detail; **full** shifts render as plain text (no link) — e.g. “Registration” at capacity |
| **Bottom filter** | Checkboxes per area + **[Change]** — `areas=` multi-select on same grid URL |

**Mental model:** A **resource calendar** (areas × time) where each cell is a bookable shift. Same visual language as old conference room schedulers — dense, high information, low polish.

#### B. Shift detail (`?func=subes&tfunc=show&sube={id}`)

Clicking a grid cell opens a **Community Page** for that shift. Layout: **Details** | **Description** | **Actions** | **Members**.

**Details table (observed):**

| Field | Example |
|-------|---------|
| Type | `Chore` |
| Child to | `Chore Area: Special Skill` (or Floater, etc.) |
| Coordinator | `fuzzy` / `Fuzzy` (staff profile) |
| Starts / Ends | Full datetime (2h blocks typical) |
| Location | Often blank |
| Public / Private | `Public` |
| Require Invitation | `No` |
| Who Can Invite | `Members` |
| Capacity | e.g. `2` or `3` |

**Actions:**

| State | Copy |
|-------|------|
| Open slot, not signed up | “You are not a member of this Invite” → **You May: Join** |
| Locked / full / past | “This invite is locked. You May:” (no join) |
| Member | (implied: leave or locked — not captured in crawl) |

**Members:** List of badge names (profile links); grid and detail stay in sync with `(n / capacity)`.

Examples from live UI: **Bartender (DO Happy Hour)** under Special Skill (capacity 2, locked when full); **Floater** 2–4pm with Kappa, Hook and one seat left → **Join**.

#### C. Data model (inferred)

```text
Chore Area (row on grid, filter checkbox)
  └── Chore shift (sube= invite record)
        ├── time range, capacity, coordinator
        └── members[] (attendee profiles)
```

Cabins and play dates use the **same** `sube` invite type with different `sfunc` / titles — only chores use the grid + “Chore Area” parent.

#### D. UX strengths / weaknesses (for Dancecard borrowing)

| Strength | Weakness |
|----------|----------|
| One screen shows **all areas** and **open vs full** | Table layout; poor mobile; overwhelming color blocks |
| **Self-serve Join** with explicit capacity | Locked state unclear until you open the shift |
| Coordinator + public metadata | No “hours completed toward 4h” progress on grid |
| Area filter reduces noise | Mixed with social “Invites” nav — chores aren’t named “Volunteer” |
| Profile links on members | No conflict check vs personal workshop schedule |

**Dancecard analog (if we build it):** Attendee **Volunteer** hub — area × time grid or simplified list, **Join** CTA, capacity badge, hours-remaining toward camp policy; keep separate from **Compare/Reserve** and cabin social layer. Organizer side already has shift/coverage concepts; this is the **attendee-facing half** of DO’s Chore Guide.

### Profiles (`func=profiles`)

- Edit / view your profile
- Browse **Personal** profiles: show all, search, recent
- Profile URLs use `atnd=` attendee id (linked from chores, cabins, grid)

### Inbox (`func=mail`)

- Inbox + **Sent Messages** (`sent=1`) — lightweight on-site mail, not Discord.

### Your Info (`func=info`)

- Multi-section **Edit YourInfo** form (badge fields, contact, options) — mirrors registration data editable post-pay.

### News / Blog

- **News** (`func=news`): community announcements page shell.
- **Your Blog** (`func=messages`): user-authored posts; create via `tfunc=blog&sfunc=create`.

### Cabins / housing (confirmed)

- FAQ pattern holds: **Invites → Browse → Cabin Group** is the cabin invite board.
- Paid **cabin bed** is on reg summary; matching happens via public cabin posts + host contact.

**Dancecard today:** Housing/cabin matrix is **out of scope** (spreadsheet link-out). High gap for camp profile.

### Chores vs Dancecard staff tools

| DO / esys | Dancecard |
|-----------|-----------|
| Attendee self-serve grid with capacity | Organizer staff shifts + coverage (backstage) |
| 4h requirement + resort opt-out (reg/FAQ) | No attendee chore board; no “resort skip” ticket hook |
| Chores as “invites” mixed with play dates/cabins | Separate domains (no social invite feed) |

**Product gap:** Attendee **volunteer block signup** with opt-out category flag — closest analog to DO Chore Guide + home “Schedule” widget.

### Feature matrix (community — observed)

| Feature | DO / esys `sc25` | Dancecard |
|---------|------------------|-----------|
| Workshop program grid | External PDF + tinyurl; not in-app catalog | **Program** tab + publish |
| Personal schedule | Home + Show Invites (chores/social) | **My plan** + reservations |
| Chore signup grid | **Chore Guide** (`subes` grid) | Staff shifts only |
| Cabin invite board | **Invites** browse by type | Deferred |
| Attendee directory | Profiles browse/search | Registrants (organizer); limited public |
| Compare / reserve mutual time | No | **Yes** (differentiator) |
| On-site messaging | Inbox | Messaging templates |
| Badge preview | Home widget | Badges export |
| Off-platform social | Discord + FetLife linked on home | Optional links in guide |

---

## 4. Community login (`sc25`)

Public page: [event-systems.com/esys/sc25/](https://www.event-systems.com/esys/sc25/) — username/password, lost-password email (no on-page confirmation).

**Login form (required for automation):**

| Field | Name |
|-------|------|
| Username | `login` |
| Password | `password` |
| Hidden | `submittal=login` |
| Submit | `Login=Login` |

Browser tools often fail because submit is `<input type="submit" readonly>`. POST to `/esys/sc25/` with cookie jar works.

**Logged-in IA (URL map):**

```text
/esys/sc25/                          Home (dashboard widgets)
?func=news                           News
?func=mail                           Inbox (?func=mail&sent=1 sent)
?func=subes                          Invites (default: browse cabin)
  ?tfunc=browse&sfunc={type}         Cabin Group | Other | Play Date | Tent City | Party
  ?tfunc=create                      Create invite
  ?tfunc=show                        Your invites / chores list
  ?tfunc=grid                        Chore Guide (shift grid)
?func=profiles                       Profiles hub
  ?tfunc=edit|show                   Your profile
  ?tfunc=browse&sfunc=Personal&qfunc=show|search|recent
?func=info                           Edit Your Info
?func=messages                       Your Blog
/esys/sc25/?logout=1                 Logout
```

**Fusion 2026:** Reg is `fn2026`; community instance for new registrants may differ from `sc25` (Summer Camp 2025). Compare behavior, not necessarily URLs.

---

## 5. Information architecture comparison

### Dark Odyssey (two products)

```text
Marketing site (darkodyssey.com)
    → Registration (esys/fn2026/register)  — pay, legal, options
    → Community (esys/sc25/)               — cabins, chores, social, schedule?
    → Discord / FetLife                    — off-platform community
```

### Dancecard (one product)

```text
ECKE / event marketing
    → Public dancecard landing (guide-first)
    → Sign-in dancecard (program, my plan, compare, reserve, staff)
Organizer console
    → Home (setup tasks + readiness)
    → Schedule / People / Messaging / Settings / Tools
```

**Takeaway:** DO splits **money** and **social ops** across two UIs and three channels. Dancecard consolidates **schedule + guide + availability**; we intentionally **link out** for ticketing and cabin spreadsheets.

---

## 6. Feature matrix (high level)

| Capability | Event-Systems / DO | Dancecard | Notes |
|------------|-------------------|-----------|-------|
| Integrated card payment | Yes (Invoice/Payment steps) | Link-out + CSV | We avoid being a merchant of record |
| Multi-step reg wizard | Yes (7 steps) | Registration settings + external | Our form is lighter |
| Community account at reg | Yes (password on step 1) | Dancecard login separate | Could unify with magic link |
| Participating org discounts | Yes (dropdown + ID) | Ticket categories | Similar concept |
| Cabin invite board | Yes (`subes` browse) | No (defer) | High value for camps |
| Chore signup + opt-out fee | Yes (grid + Mailchimp) | Staff shifts only | Product gap for volunteer-heavy camps |
| Program grid | External PDF; personal grid in-app | Core strength | Our DnD publish flow is stronger |
| Personal “my plan” | Unknown | Yes | |
| Compare mutual free time | No | Yes | Unique to Dancecard |
| Reserve time slots | No | Yes | Unique to Dancecard |
| Organizer readiness dashboard | No | Home + task list | Post core-reduction |
| Policy e-sign | Unknown | ECKE Sign + RabbitSign | |
| Import schedule from sheet | Unknown | Yes (staging → program) | |
| Role-based organizer access | Unknown | Yes (owner/editor/viewer) | |
| Mobile UX | Weak | Improving (guide-first) | Major differentiator |

---

## 7. What we could borrow (prioritized)

### High value for campout profile

1. **Attendee chore / volunteer signup** — 2×2h blocks, catalog of roles (gate, DM, desk), confirmation email; mirror “resort option” as a registrant category flag.
2. **Cabin invite board (lightweight)** — Not full housing admin: public “join our cabin” posts + link to external matrix; or simple “cabin group name” field on registrant.
3. **Participating group + member ID** — Already close to ticket categories; add optional org dropdown + validation code.
4. **Badge comment + pronouns on badge export** — Small attendee profile fields surfaced on print layout.

### Medium value (registration UX patterns)

5. **Step breadcrumb** on long forms — We could use this on Registration settings or a future embedded reg flow without copying the wall-of-text pattern.
6. **Multi-person cart (1–4)** — Family/partner registration in one checkout session (external payment still).
7. **“Start over”** on wizard — Good pattern for import + setup wizard.

### Low priority / avoid copying

8. **Table-layout, timestamp header, readonly submit buttons** — Do not emulate.
9. **Password on same screen as 2000 words of policy** — Prefer: pay → email magic link → set password.

---

## 8. Where Dancecard is already stronger

- **Single attendee brand** — guide, program, compare, reserve in one app; DO splits community vs marketing.
- **Organizer operational center** — Home setup tasks, readiness, conflict dock, publish workflow.
- **Program authoring** — Grid, import staging, publish per class, room linkage.
- **Availability science** — Mutual compare and reservations (DO FAQ never mentions this).
- **Modern accessibility path** — React, tokens, reduced-motion, mobile bottom nav (even if still evolving).
- **Generic platform** — Event profiles, entitlements, not one festival’s PHP instance.

---

## 9. Open questions / follow-up

1. **Confirm community URL** for Fusion 2026 registrants (`fn2026` community path vs `sc25`).
2. ~~**Map logged-in menu**~~ — Done for `sc25` (see §4, `docs/esys-crawl-sc25/crawl-report.json`).
3. **Attendee Options step** (Fusion reg) — meal plan, cabin bed, RV, resort option — field-level screenshot.
4. **Does esys expose APIs** or only HTML forms?
5. ~~**Chore assignment**~~ — **Self-serve** via Chore Guide grid (capacity-limited cells); organizer also pushes Mailchimp sign-up link.
6. **Workshop schedule in community** — Is there a `func=` for classes, or only external PDF/tinyurl for SC25?
7. ~~**Invite detail flow**~~ — **Join** on open shifts; **locked** when full/closed (see §3.1B).
8. **Hours tracker** — Is 4h requirement enforced in-app or only via honor + Mailchimp?

---

## 10. Suggested Dancecard roadmap hooks

| Idea | Profile | Effort |
|------|---------|--------|
| Volunteer chore board (attendee) | `camp`, volunteer-heavy | M |
| “Resort option” = ticket category skips chore task | camp | S |
| Cabin invites (read-only social layer) | camp | M |
| Participating group picker on registration | all | S |
| Badge comment + pronouns fields | all | S |
| Post-pay “activate dancecard” email (instead of password on step 1) | all | S |

Link internally: [GENERIC_DANCECARD_PRODUCT_VISION.md](./GENERIC_DANCECARD_PRODUCT_VISION.md), [DANCECARD_CORE_REDUCTION_PLAN.md](./DANCECARD_CORE_REDUCTION_PLAN.md), [CAMP_COMMUNITY_REPLACEMENT_ROADMAP.md](./CAMP_COMMUNITY_REPLACEMENT_ROADMAP.md) (deferred build plan — community without registration).

---

## Appendix: Registration step labels (Fusion 2026)

`Start Over >> Start >> Personal Info >> Attendee Options >> Invoice >> Payment >> Complete`

First-screen copy emphasizes: register + pay here, then use **Community system**, **Discord**, and **Fetlife** for pre-event social life.

---

## Appendix B: Crawl artifacts (`sc25`, May 2026)

| File | Description |
|------|-------------|
| `docs/esys-crawl-sc25/00-home.html` | Logged-in dashboard |
| `docs/esys-crawl-sc25/func-*.html` | news, mail, subes, profiles, info, messages |
| `docs/esys-crawl-sc25/extra--func-subes-tfunc-grid.html` | Chore Guide grid |
| `docs/esys-crawl-sc25/extra--func-subes-tfunc-show.html` | Your invites list |
| `docs/esys-crawl-sc25/crawl-report.json` | Titles, nav samples, chore flags |

Re-run: `node scripts/esys-crawl.mjs` from `EastCoast-master/` (credentials via env/args; do not commit).
