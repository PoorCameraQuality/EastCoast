# Parallel agent workflow (merge ownership)

This document implements the plan’s **parallel sub-agent execution** rules so multiple contributors (human or agent) can work quickly without destructive merge conflicts.

## Principles

1. **One orchestrator** owns final merges and conflict resolution.
2. **Parallelize by file boundary**: no two agents edit the same file in the same wave.
3. **Ordered waves**: foundation → route families → quality pass (see mobile uplift plan).

## Wave 1 (non-overlapping tracks)

| Track | Scope (examples) |
|-------|-------------------|
| A | `tailwind.config.js`, `src/app/globals.css` |
| B | `src/components/ui/*`, `src/lib/cn.ts` |
| C | `Header`, `Footer`, `SupportBanner`, `PromotionalNews`, `layout.tsx` |

**Merge order:** A → B → C (or A+B then C), then run `npm run build` before Wave 2.

## Wave 2 (route families)

| Track | Scope |
|-------|--------|
| D | Home + events list/detail |
| E | Dungeons + states |
| F | Vendors + education |
| G | Calendar client |

Merge **one family at a time** if any shared component is touched; otherwise two families are safe when paths are disjoint.

## Wave 3 (quality)

| Track | Scope |
|-------|--------|
| H | Accessibility semantics (forms, combobox/search, focus) |
| I | Performance (decorative motion, heavy client bundles) |
| J | Visual consistency spot-check |

## Agent handoff template

Each sub-agent returns:

- **Files changed** (paths)
- **UI / a11y rationale** (1–3 bullets)
- **Validation** (`npm run build`, targeted lint, or manual viewport checks)
- **Risks / open questions**

## Idempotency

UI changes should be safe to re-apply: prefer additive tokens and class changes over destructive asset renames. Never recreate assets to rename (preserves references/GUIDs in non-Next assets).
