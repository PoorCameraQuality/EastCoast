# East Coast Kink Events — platform audit

Living reference for major product surfaces on the ECKE monolith. Update when routes, auth, or chrome rules change.

---

## Dancecard

**Product:** Attendee planning (program, compare, reservations) + organizer operations console. Backend phases 0–7 implemented; UI phased per [`DANCECARD_UI_UX_MASTER_PLAN.md`](./DANCECARD_UI_UX_MASTER_PLAN.md).

### Public routes

| Route | Purpose | ECKE chrome |
| --- | --- | --- |
| `/dancecard` | Product landing, event picker, beta disclaimer | Header + Footer |
| `/dancecard/organizers` | Organizer marketing → login CTA | Header + Footer |
| `/products/dancecard` | Redirect → `/dancecard` | — |
| `/dancecard/[slug]` | Attendee dancecard app | `DancecardTopBar` only |
| `/dancecard/[slug]/map`, `/policies`, `/s/[token]` | Attendee sub-routes | `DancecardTopBar` only |
| `/organizer/login` | Supabase sign-in for organizers | Full ECKE chrome |
| `/organizer/dancecard` | Multi-event hub | `OrganizerDancecardChrome` only |
| `/organizer/dancecard/[slug]` | Per-event ops console | `OrganizerDancecardChrome` only |
| `/embed/dancecard/[slug]/schedule`, `/map` | iframe embeds (CSP) | Minimal embed chrome |

Chrome rules are centralized in [`src/lib/dancecard/shellRoutes.ts`](../src/lib/dancecard/shellRoutes.ts).

### Discovery

- **Header / Footer:** Links to `/dancecard` and `/dancecard/organizers`.
- **Directory:** `dancecardSlug` + `dancecardEnabled` on static events in [`src/data/events.js`](../src/data/events.js); CTA via `DancecardEventCta`. Slug mappings: [`dancecard-slug-registry.md`](./dancecard-slug-registry.md).
- **Public API:** `GET /api/dancecard/public-events` — published `dancecard_events` only (no secrets).

### Auth

| Persona | Mechanism |
| --- | --- |
| Attendee | Event entry gate + Dancecard account (`/api/dancecard/[slug]/register`, session cookie) |
| Organizer | Supabase auth + `dancecard_organizers` RBAC; hub at `/organizer/dancecard` |
| Embed | Hashed `emb_` tokens; entitlements per event (migration 027) |
| External API | API keys + webhooks (Phase 6) |

### Ops

- Migrations: `npm run dancecard:apply-migrations` (requires `DATABASE_URL` in `.env.local`).
- Smoke: `npm run dancecard:smoke`, `npm run dancecard:smoke:auth`.
- First-run: [`dancecard-first-run.md`](./dancecard-first-run.md).

### Visual lab

`/dancecard-visual-lab` — `noindex`; available when `NODE_ENV=development` or `DANCECARD_VISUAL_LAB=1`.

---

## Other ECKE surfaces

*(Expand as needed: directory, vendors, admin, etc.)*
