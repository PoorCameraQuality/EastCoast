# Dancecard design tokens

Semantic tokens for attendee and organizer shells. Implementation: [`src/styles/dancecard-tokens.css`](../src/styles/dancecard-tokens.css), Tailwind `dc-*` in [`tailwind.config.js`](../tailwind.config.js).

## Color roles

| Token | CSS variable | Tailwind | Use |
| --- | --- | --- | --- |
| Surface | `--dc-surface` | `bg-dc-surface` | Page canvas |
| Elevated | `--dc-elevated-solid` | `bg-dc-elevated` | Cards, panels |
| Accent | `--dc-accent` | `text-dc-accent`, `bg-dc-accent` | Primary actions, links |
| Border subtle | `--dc-border-subtle` | `border-dc-border` | Default borders |
| Danger / Success / Warning | `--dc-danger`, etc. | `text-dc-danger` | Status |
| Muted text | `--dc-text-muted` | `text-dc-muted` | Secondary copy |

Per-event overrides: `DancecardThemeProvider` sets `--event-accent`, `--event-surface`, `--event-elevated`, `--event-slot-published` from `theme_config` (migration 029).

## Z-index stack

| Layer | Value | Variable | Examples |
| --- | ---: | --- | --- |
| Sticky chrome | 40 | `--z-dc-chrome` | `DancecardTopBar`, organizer header |
| Day strip | 45 | — | `MobileDayStripBar` |
| ECKE drawer | 70 | `--z-ecke-drawer` | Shared with site |
| Modal | 80 | `--z-dc-modal` | Confirm, EntityPicker |
| Toast | 90 | `--z-dc-toast` | Dancecard toast stack |

ECKE site layers: see [`src/styles/tokens.css`](../src/styles/tokens.css) (`--z-ecke-drawer`, `--z-ecke-modal`).

## Typography

- **Display:** `font-serif` / `dc-display` — headlines
- **UI:** `font-sans` — body
- **Tabular:** `font-tabular` or `tabular-nums` — schedule times
- **Micro:** minimum `text-dc-micro` (11px); avoid `text-[10px]` in new code

## Motion

- Tab cross-fade: 150ms (`dc-transition-tab`)
- Drawer: 300ms (`dc-transition-drawer`)
- Vestibule loaders: `dc-vestibule-pulse` (organizer doors), `dc-vestibule-fan` (attendee shuffle); max ~1.2s, skippable
- Skeleton stagger: `dc-skeleton-stagger` children delay 0–250ms in 50ms steps (hub cards, registrants, program)
- Conflict sonar: `dc-conflict-sonar` amber pulse on conflicting slots after scan (2 cycles, 0.8s)
- `prefers-reduced-motion: reduce` → opacity-only, no transform animations ([`dancecard-motion.css`](../src/styles/dancecard-motion.css))

## Hallway mode

`data-dc-hallway="true"` on attendee root — thicker borders, 44px touch targets, larger session titles. Toggle in attendee top bar; persisted per event slug in `localStorage`.

## Styleguide

Dev-only: `/dancecard-visual-lab` (requires `NODE_ENV=development` or `DANCECARD_VISUAL_LAB=1`).
