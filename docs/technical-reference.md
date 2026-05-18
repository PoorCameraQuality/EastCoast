## Technical Reference

This repo powers the `eastcoastkinkevents.com` Next.js site: Events, Dungeons, States, Education, Calendar, About, Contact, **Dancecard** (event operations), and “Add Event” flows. See the live navigation at `https://www.eastcoastkinkevents.com/`.

**Project status (2026-05-18):** [docs/PROJECT_STATUS.md](./PROJECT_STATUS.md) — Dancecard platform on GitHub `master` @ `931bc94`; production deploy pending.

### Runtime and tooling

- **Node.js**: `20.x` (see `package.json` -> `engines`)
- **Next.js**: `14.2.35` (see `package.json`)
- **React**: `18.3.x`
- **TypeScript**: `5.9.x`
- **Styling**: Tailwind CSS `3.4.x`

### Key directories

- `src/app/`: Next.js App Router pages, layouts, and route handlers (API).
- `src/app/dancecard/`, `src/app/organizer/dancecard/`, `src/app/embed/dancecard/`: Dancecard attendee, organizer, and embed surfaces.
- `src/components/dancecard/`: Dancecard UI (organizer shell, attendee client, shared `ui/` primitives).
- `src/lib/dancecard/`: Dancecard domain logic (conflicts, imports, registrants, embeds, theme, etc.).
- `src/components/`: ECKE marketing UI (admin, submissions, vendors).
- `src/contexts/`: Client providers (Auth, GA4 tracking).
- `src/data/`: Static seed data (events/dungeons/education).
- `src/lib/`: Shared utilities (Supabase, auth, validation, SEO, IndexNow, `security/`).
- `database/`: Dancecard SQL migrations (`dancecard_007` … `040`, bundle, verify script).
- `public/`: Static assets (logos, OG image, Dancecard walkthrough images, IndexNow key).
- `scripts/`: Node scripts (dates, Dancecard smoke/seed/migrations, indexing).

### Mobile-first UI uplift

- **Principles:** `docs/MOBILE_FIRST_PRINCIPLES.md`
- **Parallel agent / merge waves:** `docs/PARALLEL_AGENT_WORKFLOW.md`
- **QA & rollout:** `docs/MOBILE_QA_ROLLOUT.md`
- **Shared primitives:** `src/components/ui/` (`Button`, `Card`, `Input`, `Field`, `Badge`)
- **Layout conventions:** `.card-elegant` uses responsive padding (`p-6 sm:p-8`); primary marketing and legal routes use `container-custom py-8 md:py-16` with scaled headings on small viewports; interactive targets use `min-h-touch` / `min-w-touch` (`44px`) from `tailwind.config.js`.
- **Z-index / overlays:** CSS variables `--z-ecke-drawer` (70) and `--z-ecke-modal` (80) in `src/app/globals.css` stack vendor filter drawer and blocking modals above the support banner (`z-[60]`). Skip link uses `focus:z-[100]`; back-to-top uses `z-[65]` so it stays tappable above the banner. Login overlay remains `.login-modal-overlay` at 9999.
- **Escape / dismissal:** Mobile nav ([`Header.tsx`](src/components/Header.tsx)), vendor filter drawer ([`VendorFilters.tsx`](src/components/vendors/VendorFilters.tsx)), and login popover ([`UserMenu.tsx`](src/components/auth/UserMenu.tsx)) close on Escape; login also closes on backdrop click with focus return to the Login trigger.
- **Search combobox:** Result links use `onMouseDown={(e) => e.preventDefault()}` to reduce blur-before-click races; search root uses `z-[55]` so panels sit above in-page chrome.

### Data sources

#### Static listings (site-visible without DB)
- **Events**: `src/data/events.js`
- **Dungeons**: `src/data/dungeons.js`
- **Education**: `src/data/education.js`

These modules export data + helpers like `getAllEvents()` / `getUpcomingEvents()`.

#### Submissions (stored in Supabase)
Submissions are handled via Next.js route handlers under `src/app/api/*` and inserted into Supabase when configured.

Notable endpoints:
- `src/app/api/events/route.ts` (event submission POST)
- `src/app/api/dungeons/submit/route.ts`
- `src/app/api/education/submit/route.ts`
- `src/app/api/admin/submissions/*` (approve/reject/delete/respond)

### Environment variables

Use `ENV_TEMPLATE.md` in the repo root as the source of truth. Common keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_GSC_VERIFICATION` (Google Search Console verification; read in `src/app/layout.tsx`)

### Scripts

Defined in `package.json`:
- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: eslint
- `npm run update:dates`: `scripts/updateEventDates.mjs`
- `npm run validate:dates`: `scripts/validateEventDates.mjs`
- `npm run cleanup:events`: `scripts/cleanupEvents.mjs`
- `npm run clean`: remove `.next` cache (`scripts/clean-next-cache.mjs`)
- `npm run dancecard:smoke` / `dancecard:smoke:prod`: HTTP smoke against local or production base URL
- `npm run dancecard:seed-sandbox`: reset sandbox demo event in Supabase
- `npm run dancecard:apply-migrations`: apply `database/dancecard_*.sql` via `DATABASE_URL`
- `npm run test:dancecard-conflicts`, `test:dancecard-registrant-rbac`: unit selftests

### Dancecard

- **Docs:** [PROJECT_STATUS.md](./PROJECT_STATUS.md), [dancecard-handoff-2026-05-18.md](./dancecard-handoff-2026-05-18.md), [database/README_DANCECARD.md](../database/README_DANCECARD.md)
- **Local organizer bypass:** `DANCECARD_ORGANIZER_DEV_BYPASS=1` in `.env.local` only — must be **unset** for `npm run build` (production assert).
- **Dev rule:** one `npm run dev` on port **3000**; multiple instances cause broken CSS chunk URLs.

### SEO, redirects, and indexing

- **Metadata**: `src/app/layout.tsx` sets site-wide metadata and verification.
- **Redirects and canonicalization**: `next.config.js` defines redirects (HTTP->HTTPS, www normalization, legacy path redirects).
- **Sitemap**:
  - Route: `src/app/sitemap.xml/route.ts`
  - Falls back to `public/sitemap-fallback.xml` if downstream calls fail.
  - Uses `/api/sitemap/*` routes to include dynamic slugs.
- **IndexNow**:
  - Implementation: `src/lib/indexnow.ts`
  - Key file: `public/0050cb815778482eafc98bbf0849daad.txt`

### Analytics

If `NEXT_PUBLIC_GA_MEASUREMENT_ID` is present, `src/app/layout.tsx` enables GA via `src/components/GoogleAnalytics.tsx` and wraps pages in `src/contexts/GA4Provider.tsx`. After age verification, `window.gaConsent` is set so SPA route changes update `page_path` in GA and optional scroll/device helpers in `src/hooks/useSafeTracking.ts` run.

Listing and outbound engagement:

- `src/lib/analyticsEntities.ts` — `select_item` (params include `item_list_name` and an `items` array with `item_id`, `item_name`, `item_category`) and `outbound_click` (`entity_type`, `entity_slug`, `entity_name`, `link_url`, `link_domain`).
- `src/components/analytics/TrackedEntityLink.tsx` and `OutboundWebsiteLink.tsx` for wrapped links.

**GA4 Admin (client reporting):** Register event-scoped custom dimensions as needed, for example `item_list_name`, `item_category`, and for `outbound_click` events `entity_name`, `entity_slug`, `entity_type`, `link_domain`. Use Explorations (free form) with event name `select_item` or `outbound_click` and break down by `item_name` or `entity_name` for per-entity counts. Looker Studio can connect to the same GA4 property for shareable dashboards.

## Technical Reference

This project is a Next.js 14 app (App Router) running on Node.js 20.x. It uses React 18 and Tailwind CSS for UI styling and ships with serverless API routes under `src/app/api`.

### Runtime and Tooling
- **Node.js**: `20.x` (see `package.json` -> `engines`)
- **Next.js**: `14.2.x`
- **React**: `18.3.x`
- **TypeScript**: `5.9.x` (mixed TS/JS codebase)
- **Tailwind CSS**: `3.4.x`

### Data Sources
- **Events**: Static seed data in `src/data/events.js`.
- **Dungeons**: Static seed data in `src/data/dungeons.js`.
- **Education**: Static seed data in `src/data/education.js`.
- **Event submissions**: POSTed to `src/app/api/events/route.ts` and stored in Supabase.

### Environment Configuration
Use `docs/ENV_TEMPLATE.md` as the source of required environment variables.

### Build and Utility Scripts
The following scripts are defined in `package.json`:
- `dev`, `build`, `start`, `lint`
- `update:dates`, `validate:dates`, `cleanup:events`
