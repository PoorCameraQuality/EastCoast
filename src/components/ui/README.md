# UI primitives

React wrappers around global design utilities (`btn-primary`, `card-elegant`, etc.) from `src/app/globals.css` and tokens in `src/styles/tokens.css`.

Use these for new screens or refactors when you want typed props and consistent class composition. Existing pages may still use raw `className` strings; migrate opportunistically.

| Component | Maps to |
|-----------|---------|
| `Button` | `btn-primary`, `btn-secondary`, `btn-outline`, ghost |
| `Card` | `card-elegant` (solid) or glass panel |
| `Badge`, `Input`, `Field` | Composed Tailwind + shared primitives |

Import from `@/components/ui/...`.
