# Dancecard Handoff (2026-04-30)

## Current status

- Host schedule UI was heavily simplified and made mobile-first.
- Host view now groups availability by day (calendar style), not one long list.
- Shared claim flow is no-login and supports name + description.
- Confirmed claims now mark host slots unavailable.
- Buffer logic now applies to both manual unavailable blocks and reservations.
- Buffer presets include: 0, 15, 30, 45, 60.
- Date range is now day-based and normalized to midnight-to-midnight behavior.
- Meal presets in `DancecardClient.tsx` are fixed to:
  - Break 10:30 AM - 11:00 AM
  - Lunch 12:00 PM - 1:00 PM
  - Dinner 6:00 PM - 7:00 PM
  - Sleep 11:00 PM - 8:00 AM (cross-midnight)
- Added "every event day" meal preset actions.
- Added edit/delete tools for unavailable entries (mobile-friendly tap targets).
- Added UX improvements: onboarding hint, undo actions, bulk clear/duplicate actions, timezone labels, shared-page last-updated indicator.

## Latest fix in progress verified

- Timezone day-bucketing bug was fixed so day cards use event-timezone day keys.
- Symptom before fix: some day cards started at 8:00 PM.
- Fix location: `src/components/dancecard/DancecardClient.tsx` availability day grouping.

## What to check first next session

1. Hard refresh `/dancecard/paf26` (`Ctrl+F5`).
2. Confirm each day card starts at `12:00 AM` and progresses correctly.
3. Confirm meal presets still apply correctly across all days.
4. Confirm mobile edit/delete still works in unavailable modal.

## Quick reference

- Main working file: `src/components/dancecard/DancecardClient.tsx`
- Shared page file: `src/components/dancecard/ShareDancecardClient.tsx`
- Claim API messaging: `src/app/api/dancecard/[eventSlug]/claim/route.ts`

