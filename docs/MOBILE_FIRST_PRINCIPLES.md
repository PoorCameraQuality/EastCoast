# Mobile-first design principles (ECKE)

Grounded in NN/g mobile UX research and GOV.UK-style system discipline. Use these as the bar for refactors and new UI.

## Constraints

- **Small screen first:** Design for the narrowest target width, then enhance at `md` / `lg`. Assume short sessions and fragmented attention.
- **Content over chrome:** Maximize readable content; minimize persistent fixed UI competing for vertical space.
- **Touch targets:** Interactive controls meet at least ~44×44px effective hit areas (padding counts).
- **Single-window focus:** Primary tasks complete without relying on side-by-side comparison or external props.

## Execution

- **One focus system:** Keyboard `focus-visible` uses a single high-contrast token site-wide.
- **Predictable rhythm:** Shared spacing and type scale (tokens + primitives) over one-off margins.
- **Accessible forms:** Every input has an associated label (`htmlFor` / `id` or wrapping `label`).
- **Motion:** Respect `prefers-reduced-motion`; avoid gratuitous animation on core navigation paths.

## Desktop

- Desktop is a **progressive enhancement** of the same structure: wider measure, multi-column layouts, optional side metadata—not a separate visual language.
