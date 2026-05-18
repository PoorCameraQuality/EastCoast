# Dancecard core reduction — shipped inventory

This document tracks what was delivered in the **Dancecard Core Reduction** push (May 2026). It complements [UI_UX_RESEARCH_GUIDE_WIZARDS_DASHBOARDS_SIMPLIFICATION.md](./UI_UX_RESEARCH_GUIDE_WIZARDS_DASHBOARDS_SIMPLIFICATION.md) and [GENERIC_DANCECARD_PRODUCT_VISION.md](./GENERIC_DANCECARD_PRODUCT_VISION.md).

## Organizer information architecture (shipped)

| Area | End state |
|------|-----------|
| **Home** | KPI row + GOV.UK-style setup task list (`setupTasks.ts` / `SetupTaskList.tsx`); dynamic readiness warnings below |
| **Schedule** | Program · Room availability · Import (schedule credits removed from sidebar; link from Conflict dock) |
| **People** | Single hub with `?peopleTab=` |
| **Communications** | Messaging |
| **Settings** | Essentials / More / Advanced tiers; merged **Policies & agreements** panel |
| **Tools** | Exports · Integrations only (Media merged into Exports; Coverage removed from Tools) |

## Wave checklist

| Wave | Status | Notes |
|------|--------|-------|
| W0 Cleanup | Done | Nav trim, dead code removed, default `?tab=dashboard`, Media→Exports, PublishDrumroll listener removed |
| W1 Home | Done | Task schema, resolver, dashboard reshape, wizard demoted (optional quick setup link) |
| W2 Settings | Done | Tiered settings, `PoliciesAgreementsPanel`, event profile in Basics |
| W2 Schedule/guides | Done | Credits link in Conflict dock; ConflictUniversity auto-launch removed |
| W3 Power/RBAC | Done | ⌘K setup commands, URL `publishFilter`, viewer read-only Home |
| W4 Attendee | Done | Guide-first landing, map/policies redirect, profile-gated bottom nav |
| W5 Import | Done | Staging copy, skip import (localStorage), Home task resolver |
| W6 Docs/QA | Done | This file; `npm run build` clean |

## Key files

- `src/lib/dancecard/setupTasks.ts` — stable task IDs and deep links
- `src/lib/dancecard/resolveSetupTasks.ts` — client-side completion from event + `/readiness`
- `src/components/dancecard/organizer/home/SetupTaskList.tsx` — GOV.UK row UI
- `src/components/dancecard/organizer/settings/PoliciesAgreementsPanel.tsx` — merged policies UI

## Deferred (Phase 3 — not in this push)

- `DancecardClient` split (tech debt)
- RegFox API pull
- Unified import drag-board with program grid UI
- Enterprise items in vision doc Phase 3

## Verification

```bash
npm run build
npm run dancecard:smoke
```

Organizer sandbox: `http://localhost:3000/organizer/dancecard/sandbox?tab=dashboard` with `DANCECARD_ORGANIZER_DEV_BYPASS=1`.
