## Technical Reference

This repo powers the `eastcoastkinkevents.com` Next.js site: Events, Dungeons, States, Education, Calendar, About, Contact, and “Add Event” flows. See the live navigation at `https://www.eastcoastkinkevents.com/`.

### Runtime and tooling

- **Node.js**: `20.x` (see `package.json` -> `engines`)
- **Next.js**: `14.2.15`
- **React**: `18.3.x`
- **TypeScript**: `5.9.x`
- **Styling**: Tailwind CSS `3.4.x`

### Key directories

- `src/app/`: Next.js App Router pages, layouts, and route handlers (API).
- `src/components/`: UI components (including admin and submission UI).
- `src/contexts/`: Client providers (Auth, GA4 tracking).
- `src/data/`: Static seed data (events/dungeons/education).
- `src/lib/`: Shared utilities (Supabase clients, auth helpers, validation, SEO, IndexNow).
- `public/`: Static assets (logos, OG image, IndexNow key file, sitemap fallback).
- `scripts/`: Node scripts for maintenance (dates cleanup/validation, indexing utilities).

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

If `NEXT_PUBLIC_GA_MEASUREMENT_ID` is present, `src/app/layout.tsx` enables GA via `src/components/GoogleAnalytics.tsx` and wraps pages in `src/contexts/GA4Provider.tsx`.
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
