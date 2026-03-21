# Mobile QA & rollout checklist

Use this after each batch of mobile-first UI work and before production rollout.

## Viewports

- **Small phone:** 360×640 (CSS px)
- **Large phone:** 390×844
- **Tablet:** 768×1024

## Shell & chrome

- [ ] Header drawer opens/closes; focus returns sensibly; no trap outside modal expectations
- [ ] `Skip to main content` visible on focus
- [ ] Support banner (when shown) clears safe-area; dismiss and links are ≥44×44 CSS px targets
- [ ] Promotional strip (if active) scrolls and does not permanently cover primary content
- [ ] Back-to-top control does not overlap banner/footer CTAs

## Overlays & escape hatches (keyboard + pointer)

- [ ] **Age gate** sits above the support banner; no banner obscures Enter / Exit
- [ ] **Header mobile menu:** `Escape` closes; menu button has `aria-expanded`; focus returns to menu button
- [ ] **Vendors — filter drawer:** `Escape` closes; backdrop tap closes; focus returns to “Filters” button
- [ ] **Login popover (header):** `Escape` and backdrop (outside card) close; focus returns to Login
- [ ] **Search combobox:** clicking a result still navigates (no “blur killed the click”)

## Core journeys

- [ ] **Home:** hub cards readable; tap targets comfortable
- [ ] **Events:** category filters scroll horizontally on narrow screens; cards legible
- [ ] **Event detail:** primary actions visible without excessive scroll on phone
- [ ] **Dungeons:** search + submit toggle usable
- [ ] **Vendors:** mobile filter drawer; tag rows tappable
- [ ] **Education:** category chips scroll; article grid stable
- [ ] **States:** grids and cross-state links usable
- [ ] **Calendar:** month nav + export row wraps; grid scrolls horizontally when needed; event links tappable

## Accessibility

- [ ] Tab order logical on listing pages with filters
- [ ] `:focus-visible` ring visible on interactive elements
- [ ] Search field uses valid combobox attributes when suggestions/results open
- [ ] Submission forms: labels associated with controls (`htmlFor` / `id`)

## Performance & motion

- [ ] Enable **prefers-reduced-motion** in OS: no essential information lost; decorative animation reduced
- [ ] No large layout shift when fonts load (`next/font` swap)

## Build gate

```bash
npm run build
```

Resolve new ESLint **errors** before merge (warnings tracked separately).

## Rollout

1. Deploy to staging / preview.
2. Smoke-test the checklist on a real device (iOS Safari + Chrome Android).
3. Monitor Core Web Vitals / Speed Insights after release.
