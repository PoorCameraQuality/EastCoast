# Dancecard slug registry (ECKE directory ↔ Dancecard)

Maps **East Coast Kink Events** directory slugs (`/events/[slug]`) and **Coast to Coast Kink** convention slugs to **Dancecard** event slugs (`/dancecard/[slug]`).

## ECKE directory

| ECKE slug (`events.js`) | Dancecard slug | Notes |
| --- | --- | --- |
| `primal-arts-festival` | `paf26` | Demo / seeded event (`dancecard_seed_paf26_demo.sql`) |
| *(sandbox QA)* | `sandbox` | Full synthetic demo (`npm run dancecard:seed-sandbox`) |

## C2K conventions

Set the same mapping on the convention row via `conventions.settings` (`dancecardSlug`, `dancecardHost`, `dancecardEnabled`). See [dancecard-c2k-integration.md](./dancecard-c2k-integration.md).

| C2K convention slug | Dancecard slug | ECKE host | Notes |
| --- | --- | --- | --- |
| *(pilot TBD)* | `paf26` | `https://www.eastcoastkinkevents.com` | Use for integration QA until a live C2K convention is linked |

## Adding a new mapping

1. Set `dancecardSlug` and `dancecardEnabled: true` on the event object in [`src/data/events.js`](../src/data/events.js).
2. Ensure the Dancecard event exists in Supabase with `status = published` and matching `slug`.
3. Append a row to this table.

Public discovery also lists published events via `GET /api/dancecard/public-events`.
