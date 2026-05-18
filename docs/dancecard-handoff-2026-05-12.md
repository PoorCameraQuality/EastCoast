# Dancecard Handoff - 2026-05-12

## Current State

Dancecard has moved from attendee-only schedule views toward a broader organizer workflow. The active prototype lives in the organizer Dancecard import tab and supports spreadsheet import, local demo data, drag/drop placement, locations, duty templates, staff assignment, workload counters, and conflict review.

The main UI work is in `src/components/dancecard/organizer/ScheduleImportPanel.tsx`. It currently handles:

- Program/class draft rows that can start unscheduled and be dragged onto a day/time/location board.
- Location creation and draggable location chips.
- Duty templates that organizers create and drag onto the board to make staff shifts.
- Staff roster chips that can be dragged onto existing duty shifts.
- Staff counters for shift count, total hours, and detected overlap conflicts.

The organizer shell is wired through `src/app/organizer/dancecard/[eventSlug]/OrganizerDancecardClient.tsx`, which exposes dashboard, program, venues, assignments, people, registrants, staff, DM coverage, media, exports, messaging, badges, import, integrations, and settings tabs (import is one tab among many).

- Conflict resolution actions on selected shifts: view conflict, unassign this shift, unassign the other shift, or nudge the selected shift **+30 minutes** or **+1 hour**.

## Backend And Schema Work

New organizer import workflow APIs and migrations were added but are still effectively prototype-gated until the migration is applied in the target database.

Key files:

- `src/lib/dancecard/organizerImport.ts`
- `database/dancecard_007_organizer_import_workflow.sql`
- `supabase/migrations/20260513010000_dancecard_organizer_import_workflow.sql`
- `src/app/api/organizer/dancecard/[eventSlug]/imports/route.ts`
- `src/app/api/organizer/dancecard/[eventSlug]/imports/[batchId]/route.ts`
- `src/app/api/organizer/dancecard/[eventSlug]/imports/[batchId]/draft-rows/[rowId]/route.ts`
- `src/app/api/organizer/dancecard/[eventSlug]/imports/[batchId]/publish/route.ts`
- `src/app/api/organizer/dancecard/[eventSlug]/locations/route.ts`
- `src/app/api/organizer/dancecard/[eventSlug]/locations/[locationId]/route.ts`

The API routes return migration-aware fallback responses so the organizer UI can keep running as a local prototype before `dancecard_007` is applied.

Other organizer surfaces also depend on later migrations (maps **014**, calendar feeds **021**, messaging **022**, embeds **027**, etc.); see `database/README_DANCECARD.md` and `dancecard-first-run.md`.

## UX Decisions Captured So Far

- Organizer-facing time should use a simple 24-hour clock.
- Imported programs/classes should be allowed to start as an unscheduled library.
- Staff scheduling should be duty-first: organizers create duty names, drag duties into the schedule, then assign people by dragging staff onto those duties.
- Staff should show workload counters and conflict signals before publish.
- Conflicts must have an obvious resolution path, not just a warning.
- The palette should stay warm-dark and calmer than the earlier saturated prototype.

## Known Gaps

- The current organizer prototype is still mostly local-state based for drag/drop actions when the migration is absent.
- Publish is blocked for **local** demo batches (batch ids prefixed with `local-`).
- Mixed first-run event setup needs a smoother path than the original import-first program/staff toggle.
- Drag/drop is functional but should eventually move to one consistent drag system and better keyboard/mobile alternatives.
- Attendee-facing notifications and mutual approval flows have API/prototype coverage but still need full product integration.

## Recommended Next Steps

1. Polish or extend the **blank first-run** path (`ScheduleImportPanel` includes **Start blank event demo**); tighten onboarding if gaps remain after trying that flow end-to-end.
2. Apply and verify the organizer import workflow migration in a real Supabase environment.
3. Convert local drag/drop changes into persisted draft row mutations for the mixed event setup.
4. Add focused tests for parser validation, publish summary behavior, staff overlap detection, and notification acknowledgement.
5. Run a mobile pass on the organizer board and selected-card panel after the first-run flow is stable.
