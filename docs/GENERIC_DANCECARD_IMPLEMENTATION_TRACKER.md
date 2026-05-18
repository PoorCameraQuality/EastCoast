# Generic Dancecard — Implementation Tracker

**North star:** [GENERIC_DANCECARD_PRODUCT_VISION.md](./GENERIC_DANCECARD_PRODUCT_VISION.md)  
**Deploy status (2026-05-18):** Code on GitHub `master` @ `931bc94`. Production deploy + Supabase migrations **007–040** still pending — [dancecard-handoff-2026-05-18.md](./dancecard-handoff-2026-05-18.md).

| Agent | Scope | Status |
| --- | --- | --- |
| Wave 0 | Migrations 030–031, eventProfile, productCopy, agreementsConfig, nav schema, event API | done |
| Agent 1 | Copy pass (no attendee "session") | done |
| Agent 2 | Readiness: import fresh, staff loaded, agreements gap | done |
| Agent 3 | Import runbook card | done |
| Agent 4 | Import diff preview | done |
| Agent 5 | Sidebar regroup | done |
| Agent 6 | People hub shell | done |
| Agent 7 | Signups + roster link | done |
| Agent 8 | Messaging preview/recipients | done |
| Agent 9 | Settings: guide + profile + agreements | done |
| Agent 10 | AttendeeWeekendGuide accordion | done |
| Agent 11 | Public landing stubs | done |
| Agent 12 | Event profile labels in UI | done |
| Agent 13 | ECKE Sign attendee + Agreements panel | done |
| Agent 14 | RabbitSign integration + webhook | done |
| Wave 2 | OrganizerDancecardClient integration | done |
| Vision doc | Agreements dual-path in GENERIC vision | done |

**Migrations to apply (production):** full set **`dancecard_007` … `040`** — see [database/README_DANCECARD.md](../database/README_DANCECARD.md) and `dancecard_full_bundle.sql`. Wave 0 slices **030–031** are included.

**Verify locally:** `npm run build` (no `DANCECARD_ORGANIZER_DEV_BYPASS`), `npm run test:dancecard-conflicts`, `npm run test:dancecard-registrant-rbac`, then `npm run dancecard:smoke:prod` **after** Vercel deploy.

**Dead-code cleanup (2026-05-18):** prototype/visual-lab routes removed; see handoff § “Removed dev islands”.
