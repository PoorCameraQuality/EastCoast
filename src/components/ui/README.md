# UI primitives

React wrappers around global design utilities (`btn-primary`, `card-elegant`, etc.) from `src/app/globals.css` and tokens in `src/styles/tokens.css`.

Use these for new screens or refactors when you want typed props and consistent class composition. Existing pages may still use raw `className` strings; migrate opportunistically.

Import from `@/components/ui/...`.

## Card tiers (intentional variants)

The site uses **several card vocabularies** on purpose: hubs need strong marketing contrast, while directory rows stay subdued. Pick the tier that matches the surface; do not invent a fourth style without updating this table.

| Tier | Where | Role |
|------|--------|------|
| **`Card` (`@/components/ui/Card`)** | New forms, settings, small panels | Typed wrapper: `variant="solid"` → `card-elegant`; `variant="glass"` → frosted panel (matches home hub link cards). Prefer for **new** UI. |
| **`.card-elegant` / `.card`** | `globals.css` — `EventCard`, discovery grids | Default directory cards: teal shadow, dark surface, hover lift. Use for **listings and data-dense** grids. |
| **`EventHubCard`** | Events hub (`EventsPageClient`) | Large gradient border / category tiles — **hub marketing only**, not for generic lists. |
| **`SwingClubCard`** | Swing discovery flows | Violet gradient accent — **swing vertical only** to distinguish from dungeon/event teal. |

**Guidelines**

- Prefer `Card` or `card-elegant` for anything new unless the design explicitly matches `EventHubCard` / `SwingClubCard`.
- Keep **one accent system per vertical** (teal vs violet) so users learn geography of the site.
- Clickable full-card links: use stretched-link patterns from the masterclass (single primary link, `z-index` for nested buttons).

| Component | Maps to |
|-----------|---------|
| `Button` | `btn-primary`, `btn-secondary`, `btn-outline`, ghost |
| `Card` | `card-elegant` (solid) or glass panel |
| `Badge`, `Input`, `Field` | Composed Tailwind + shared primitives |
