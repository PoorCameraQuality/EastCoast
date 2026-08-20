# GA4 — event landings & organizer monthly visitors

Property in use: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (production: `G-YRXEJ4E72Y`).

## What the site now sends

On public detail pages, `EntityPageViewTracker` fires (without double-counting `page_view`):

1. **`entity_page_view`** — dedicated event with `page_path`, `page_title`, `content_group`, `entity_*`, `organizer_*`
2. **`view_item`** — ecommerce-style item view with the same dimensions + `items[]`

The standard SPA **`page_view`** still comes from `GoogleAnalytics.tsx` (path + title). Landing page reports use that path (e.g. `/events/dark-odyssey-winter-fire`).

Listing clicks still send **`select_item`**. Official-site CTAs send **`outbound_click`**.

## GA4 Admin — register custom dimensions (required once)

In GA4 → Admin → Custom definitions → Create custom dimensions (event-scoped):

| Dimension name | Event parameter |
|----------------|-----------------|
| Content group | `content_group` |
| Entity type | `entity_type` |
| Entity slug | `entity_slug` |
| Entity name | `entity_name` |
| Organizer name | `organizer_name` |
| Organizer slug | `organizer_slug` |

Also register for outbound (if not already): `link_domain`, `link_url`.

Dimensions only apply to data **after** they are created.

## How to see which event pages people land on

1. **Reports → Engagement → Landing page** — filter page path contains `/events/` (uses normal `page_view` paths).
2. **Explore → Free form** (best for entity names / organizers)
   - Event name: `entity_page_view` or `view_item`
   - Rows: `entity_slug` (or `entity_name`)
   - Filter: `entity_type` = `event`
   - Values: Event count, Active users
3. Secondary: Landing page report + custom dimension `entity_slug` once registered (may need `entity_page_view` as the event source).

## Monthly visitors per organizer

1. Explore → Free form  
2. Event: `entity_page_view` or `view_item`  
3. Rows: `organizer_slug` (or `organizer_name`)  
4. Columns: Month  
5. Values: Active users (preferred) or Event count  
6. Filter: `entity_type` = `event` (add organization pages if you also want org hub traffic)

### Looker Studio (shareable)

Connect the GA4 property → table: Month × Organizer slug × Active users. Export CSV/PDF monthly for organizers.

### Optional later

- BigQuery export for historical joins when slugs change  
- Organizer console via GA Data API  

## Verification checklist after deploy

1. Open an event detail page; in DevTools → Network filter `google-analytics` / `collect` and confirm `ep.entity_slug` / `ep.organizer_name` (or GA DebugView).  
2. GA4 DebugView: see `page_view` + `view_item` with parameters.  
3. Confirm `NEXT_PUBLIC_GSC_VERIFICATION` is set in Vercel if Search Console meta is still missing.
