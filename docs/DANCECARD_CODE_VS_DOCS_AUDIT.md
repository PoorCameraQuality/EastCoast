# Dancecard — code vs documentation audit (2026-05-14)

**Purpose:** Consolidate **ten parallel read-only codebase passes** against:

- `docs/DANCECARD_MASTER_PRODUCT_ROADMAP.md` (especially **§3.2–§3.10**, long-form Phases **5–7**, and **§4**)
- `docs/DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md`
- `docs/DANCECARD_UI_FACELIFT_BACKLOG.md`
- `docs/DANCECARD_PHASE7_HANDOFF.md`, `docs/dancecard-handoff-2026-05-12.md`, `docs/dancecard-handoff-2026-04-30.md`

**Method:** Explore subagents verified file paths, routes, migrations, and high-level behavior claims; this document merges their findings and records **editorial fixes already applied** in-repo the same day.

**Artifacts added:** `database/dancecard_verify_schema.sql` (Postgres read-only checklist through **027**), linked from `database/README_DANCECARD.md` and `docs/dancecard-first-run.md`.

---

## Executive summary

- **§3.3–§3.10 implementation tables** broadly match `EastCoast-master` for named components and API segments. Notable **doc-only** clarifications: dynamic segments are **`[slotId]`** / **`[shiftId]`** (not `[id]`); policy export CSV lives under **`policy-acceptances/export`**; conflict report uses **`scanDancecardConflictsForEvent`** from `conflictScanFromEvent.ts` (not a function literally named `conflictScanFromEvent`).
- **§3.2** was previously stale on email, ICS, and external imports; it is now aligned with shipped Phase **5–6** work while keeping honest backlog language.
- **Post-roadmap polish backlog** had several rows predating Messaging/Exports/DM scanner split/CSV import; those rows and **§5.1** were refreshed.
- **UI facelift backlog** overstated “future `?tab=integrations`” and “three maps / first only”; both were corrected to match **`OrganizerDancecardClient`** and multi-map attendee UI.
- **Phase 6 vs 7 SQL:** `README_DANCECARD.md` already split **023–026** vs **027**; **`DANCECARD_MASTER_PRODUCT_ROADMAP.md` §3.9** and **`dancecard-first-run.md`** Phase 6 increment now use the same split (no longer “apply **023–027**” as Phase 6 only).
- **Long-form Phase 7** header lacked a shipped pointer; it now references **§3.10** and states long-form bullets are **target / extraction** narrative. **P5.3** long-form tasks now say **HTML print today**, PDF as backlog.

---

## §3.2 Important Current Gaps

Cross-check conclusion: bullets are **directionally accurate** after the **2026-05-14** edit (prefs hold `availability_*`; Resend + `dancecard_message_*`; tokenized program ICS; inbound webhook + Eventbrite-shaped adapter; `dmCoverageScanner` separate from `conflictScanner`). One subtle nuance: **personal** dancecard ICS is still mostly **download UX** in the client, not webcal subscribe parity with organizer program feeds.

---

## §3.3–§3.7 (Phases 0–4)

All table “Where to look” entries resolve under the repo. **P1.1** row updated: dashboard quick links **do** include Messaging and Exports; partials reframed (URL tab sync for all tabs, deeper “reports” than CSV/print). **P0.6** publish idempotency involving `source_ref_id` lives primarily in **`imports/[batchId]/publish`** (CLI still does upsert/dry-run).

---

## §3.8–§3.10 (Phases 5–7)

All referenced migrations **021–027**, panels (`ExportsHubPanel`, `MessagingPanel`, `IntegrationsPanel`), routes (`feeds/ics`, `calendar-feeds`, embed routes, `shift-swaps`, `vetting-applications`, cron **`dancecard-webhook-retries`**, **`openapi/dancecard-external`**), and core libraries match the tree.

---

## §4.1 “Take From Sched” vs code

High-level mapping (detail in agent output): most bullets are **Shipped MVP** or **Partial**; weakest parity clusters are **public registration checkout**, **Sched-style CMS page editors** (Landing/About/FAQ), **bulk `secret` visibility** on the program grid, **per-role tabs** on the person directory, and **conditional registration** logic.

---

## Post-roadmap polish backlog

Edits applied in **`DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md`:**

- §3 dashboard row reframed (Messaging/Exports exist; “reports” = deeper analytics/PDF pipeline).
- §4 P2.3: CSV import + policy acceptance nuance.
- §4 P2.5: presenter conflicts + **DM coverage** split (`dmCoverageScanner` vs `conflictScanner`).
- §5 cross-cutting row: badges/messaging/calendar/staff depth partially shipped; polish list narrowed.
- §5.1: split capacity row vs DM matrix row.
- Changelog: **2026-05-14** entry for verify SQL + doc sweep.

---

## UI facelift backlog

Edits in **`DANCECARD_UI_FACELIFT_BACKLOG.md`:**

- §2 mega-tab strip: **`?tab=integrations`** is already honored; backlog targets **full** query-param sync for all tabs.
- §3 multi-map: aligned with **multi-map tabs** on attendee map and higher map limits in API helpers.
- Changelog **2026-05-14** row.

---

## Handoff documents

- **`DANCECARD_PHASE7_HANDOFF.md`:** §5 drift list updated (split docs fixed); §6–§8 section order repaired; §8 points here.
- **`dancecard-handoff-2026-04-30.md`:** meal presets updated to **Break / Lunch / Dinner / Sleep** to match `DancecardClient.tsx`.
- **`dancecard-handoff-2026-05-12.md`:** organizer shell description expanded; conflict nudge **+30m / +1h**; backend note for migrations beyond **007**; recommended step 1 softened; publish guard clarified for **`local-`** batch ids.

---

## Environment example

**`.env.example`:** comment added that **`CRON_SECRET`** is an alias for the webhook retry cron route when **`DANCECARD_CRON_SECRET`** is unset.

---

## Suggested next doc passes (low cost)

1. Grep the repo for any remaining **“023–027”** as “Phase 6 only” phrasing outside files touched today.
2. **P1.3** roadmap row could mention `dancecard_schedule_audit_log` (007) if you want parity between “audit table exists” vs “drawer shows placeholder.”
3. When organizer UI ships for entitlements / usage meter / swap inbox, trim matching bullets in **`DANCECARD_PHASE7_HANDOFF.md` §7**.

---

*This audit is a snapshot; update or supersede it when major features land.*
