# Camp community replacement roadmap (for later)

**Status:** Planning / deferred  
**Date:** 2026-05-17  
**Context:** Replace Event-Systems (esys) **community** features in Dancecard while keeping **registration** on esys, RegFox, or similar. See [DARK_ODYSSEY_EVENT_SYSTEMS_COMPARISON.md](./DARK_ODYSSEY_EVENT_SYSTEMS_COMPARISON.md) for competitive notes.

**Goal:** “Everything but registration” — sync identity from their reg system; run program, guide, chores, cabins, and home in Dancecard.

---

## What you are actually building

Three layers, not one clone:

```text
[esys / RegFox / etc.]  →  identity + paid status + package flags (sync in)
[Dancecard core]        →  program, guide, compare/reserve (mostly done)
[Dancecard community]   →  chores, cabins, profiles, home, optional inbox (new)
```

The middle layer is largely shipped. The work is **identity bridge** + **community modules**, prioritized for camp ops (chores first, cabins second, social optional).

---

## Phase 0 — Identity bridge (do first)

Without this, nothing behaves like esys (no resort skip, no reg # on home, no badge-to-account match).

### Requirements

| Piece | Approach |
| --- | --- |
| **Registrant upsert** | Use existing `external_source` + `external_id` on `dancecard_registrants` (migration 024). Example: `external_source = 'esys'`, `external_id` = esys `atnd=` id or reg number (`753-1`). |
| **Sync mechanism** | esys likely has **no public API**. Plan for: (1) nightly **CSV export** + import job, (2) scheduled DB pull only if customer provides access, (3) manual CSV after reg waves, (4) scraper only with permission (fragile). Webhook if registrar can send one. |
| **Fields to sync** | Email, badge/scene name, package label, flags (`resort_option`, `cabin_bed`, `pamporium_chores`, status), reg number, phone. Store extras in `registrant_answers` or JSON. |
| **Account ↔ registrant link** | **Known gap today.** Add e.g. `linked_account_id` on registrant or firm `person_id` link. On sign-in: match email (primary) or badge name; attach account; set entitlements. |
| **Access gate** | Only `confirmed` registrants get volunteer/cabin modules; resort/skip-chore from category or tag. |

**Effort:** ~1–2 weeks (schema + import adapter + sign-in linking + “last sync” on organizer Home).

Attendees do **not** need esys passwords in Dancecard if they sign in via magic link/email and match the reg list.

---

## Phase 1 — Attendee volunteer / chore picker (highest value)

Main gap vs “replace community” (DO Chore Guide screenshots in comparison doc §3.1).

### Extend existing staff shifts (do not greenfield)

`dancecard_staff_shifts` already has `shift_status`, `open`, `claimed_by_account_id`, organizer import, coverage. Extend:

| Column / concept | Purpose |
| --- | --- |
| `shift_kind` or `audience` | `staff` \| `volunteer` (all paid attendees) |
| `volunteer_area` | Gate Keeper, InFusion Cafe, Floater, … |
| `capacity_max` | Real cap for `(n / max)` |
| `coordinator_person_id` (optional) | Staff lead on detail page |

### Organizer

- Import: same spreadsheet path as staff grid (`ScheduleImportPanel` staff type).
- UI: extend `StaffShiftsPanel` or add `VolunteerShiftsPanel`.
- Publish open shifts to all **linked registrants** (not `is_staff` only).

### Attendee

- **Volunteer hub:** new tab or guide section; **list + filters first**, optional area×time grid later.
- **Claim:** like `StaffOpenShiftsPanel` but gated on linked registrant + not `resort_option`.
- **My duties:** home widget + show on My card / plan.
- **Policy:** `hours_required` (e.g. 4) + progress (“2h / 4h”).

### API

- New `/volunteer-open-shifts` or relax staff-only check on existing routes.
- Claim: enforce capacity, eligibility, conflict rules.

**Effort:** ~3–5 weeks MVP (import + claim + my list + hours). +2–3 weeks for full DO-style panning grid.

**Today:** `StaffOpenShiftsPanel` + claim API require `isStaff` — wrong audience for mandatory camper chores.

---

## Phase 2 — Attendee home (esys dashboard)

Compose on `PublicDancecardLanding` / post-login home:

| Widget | Source |
| --- | --- |
| Registration summary | Synced registrant + category |
| Important links | Attendee guide JSON |
| My chores | Phase 1 |
| My classes | Existing my plan |
| Badge preview | Scene name + reg # + pronouns/comment |
| Discord hint | Guide copy (badge name + reg #) |

**Effort:** ~1–2 weeks after Phase 0–1.

---

## Phase 3 — Cabin / social invites

DO uses one `subes` (“Invites”) nav for chores + cabins + play dates. Prefer **split domains** in Dancecard:

| v1 (light) | v2 (DO-like) |
| --- | --- |
| Guide section + external sheet/FetLife link | `dancecard_community_invites`: type, title, host, body, capacity, status |
| Optional “cabin interest” → organizer email | Browse by type, join/request, host creates post |

**Effort:** v1 = days; v2 = ~2–4 weeks.

---

## Phase 4 — Attendee profiles directory

- Public fields: bio, pronouns, badge comment, visibility.
- Browse / search / recent (opt-in only).
- Never expose email on public directory.

**Effort:** ~2–3 weeks. Unify with “Your Info” edit flow.

---

## Phase 5 — Defer or stub

| esys feature | Recommendation |
| --- | --- |
| Inbox | Skip v1; Discord + organizer messaging |
| News | Guide section or simple announcements table |
| Blog | Skip unless paid scope |
| Your Info | Edit in Dancecard; one-way sync from esys for legal fields |

---

## Already covered (no need to rebuild)

- Workshop program grid, publish, import
- Compare / reserve
- Organizer Home, readiness, People hub, coverage, swaps
- Policies / ECKE Sign
- Badge print exports (on-screen preview = Phase 2)

---

## Module flags (`camp` profile)

Per-event toggles, e.g.:

- `modules.volunteerSignup` → Phase 1
- `modules.cabinBoard` → Phase 3
- `modules.attendeeDirectory` → Phase 4
- `modules.compareReserve` → existing (can hide for camp)

Resort / opt-out of chores → registration **category** or tag from sync (`skip_volunteer_hours`).

---

## Reg sync playbook

1. Agree CSV columns with registrar: email, badge name, reg number, package, flags, esys id.
2. Build `esys` import adapter → upsert `dancecard_registrants` with `external_source` / `external_id`.
3. Schedule nightly (or post-wave) job.
4. Attendee login: magic link → link registrant → unlock modules.
5. Later: RegFox webhook, Google Sheet pull (migration 025), if export lands in a sheet.

Direct DB access to vendor-hosted esys is unlikely unless the customer owns infra.

---

## Schema direction (recommended)

```text
dancecard_staff_shifts
  + shift_kind: 'staff' | 'volunteer'
  + volunteer_area, capacity_max
  + claim rules from registrant tags

dancecard_community_invites   (Phase 3+)
  + type: cabin | play_date | party | other
```

Separate chores from social invites — avoid DO’s confusing single “Invites” nav.

---

## Timeline (one strong full-time dev)

| Phase | Scope | Calendar |
| --- | --- | --- |
| 0 | Reg sync + account link | 1–2 wk |
| 1 | Attendee volunteer/chores MVP | 3–5 wk |
| 2 | Home dashboard | 1–2 wk |
| 3 | Cabins lite → full board | 1–4 wk |
| 4 | Profiles directory | 2–3 wk |
| **MVP “replace community for camps”** | 0 + 1 + 2 | **~6–9 wk** |
| **DO parity-ish** | + 3 + 4 | **~10–16 wk** |

---

## Minimum “turn off esys community” checklist

- [ ] Registrants sync on schedule; account links on login
- [ ] Non-resort attendees can claim open volunteer shifts to required hours
- [ ] Organizer can import/publish chore grid
- [ ] Home shows reg summary + my chores + guide links
- [ ] Program + policies only in Dancecard
- [ ] Cabins: guide + external link minimum, or in-app board
- [ ] Registrar runbook: “Register on esys; everything else on Dancecard”

---

## Replacement tiers (summary)

| Tier | Scope | Dancecard ready? |
| --- | --- | --- |
| **A** | Program + guide + organizer ops | Yes (hybrid with esys reg/chores today) |
| **B** | + Attendee chores + home + reg sync | After Phase 0–2 |
| **C** | + Cabins + profiles + inbox | After Phase 3–5; inbox optional |

**Full esys replacement (reg + community):** not planned — payments stay external by design.

---

## Related docs

| Doc | Purpose |
| --- | --- |
| [DARK_ODYSSEY_EVENT_SYSTEMS_COMPARISON.md](./DARK_ODYSSEY_EVENT_SYSTEMS_COMPARISON.md) | esys crawl, Chore Guide UX |
| [GENERIC_DANCECARD_PRODUCT_VISION.md](./GENERIC_DANCECARD_PRODUCT_VISION.md) | North star, Phase C integrations |
| [dancecard-handoff-2026-05-17.md](./dancecard-handoff-2026-05-17.md) | Current shipped state |
| `docs/esys-crawl-sc25/` | HTML snapshots from sc25 crawl |
| `scripts/esys-crawl.mjs` | Re-run community crawl |

---

*Deferred implementation — revisit when pursuing camp customers or esys community sunset.*
