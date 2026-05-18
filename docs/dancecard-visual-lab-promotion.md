# Dancecard visual lab → design system promotion map

> **Historical (2026-05-18):** The visual lab, prototype, and styleguide **routes were removed** from the repo in commit `931bc94`. Patterns below were promoted to production components; use `src/components/dancecard/ui/*` as the source of truth.

Source (removed): `src/app/dancecard-visual-lab/page.tsx`. Target: `src/components/dancecard/ui/*`.

## Promote → `ui/*`

| Lab section / pattern | Target component | Notes |
|----------------------|------------------|-------|
| `schedulePalette` page/card shells | `Panel` variants | `default`, `muted`, `inset` |
| Primary / soft action chips | `Button` | `primary`, `secondary`, `ghost`, `danger` |
| Segmented controls, tone chips row | `PillTab` | `aria-selected`, roving tabindex |
| Settings-style rows | `InsetRow` | Organizer settings, lists |
| Sticky section headers in panels | `StickySubheader` | z-index `z-dc-chrome` |
| Snackbar with undo | `Toast` / `DancecardToastProvider` | Was `OrganizerToast` |
| Hour column labels | `schedule/TimeRail` | `font-tabular` |
| `CalendarBlockCard` / session tiles | `schedule/SessionCard` | Track rail, chip slot |
| Availability grid cells | `schedule/AvailabilityBlock` | WCAG 1.4.1 patterns |
| Loading session tiles | `schedule/SessionCardSkeleton` | Matches card geometry |
| `StatusChip` / tone rails | SessionCard `chip` prop + track classes | Phase 5: shared tone map |

## Keep in lab / styleguide only

| Pattern | Reason |
|---------|--------|
| Conflict sonar mock | Not production API yet |
| Share payload / gate copy variants | Fixture-driven demos |
| `mockNowPresets` time travel | Dev styleguide only |
| Vestibule loader animation | Phase 7 |
| Command palette mock | Phase 6–7 |

## Defer → Phase 5+

| Pattern | Phase |
|---------|-------|
| Full compare / mutual strips | 5 |
| `DancecardClient` inline session cards (~L4588) | 5 |
| `ProgramScheduleGrid` | 6 |
| Grouped nav / command palette | 6–7 |
| Vestibule entry loaders | 7 |

## Styleguide contract (Phase 4)

Route: `/dancecard-visual-lab` (dev gate). Imports **real** `ui/*` and token CSS vars — not duplicate `schedulePalette` strings in new code.
