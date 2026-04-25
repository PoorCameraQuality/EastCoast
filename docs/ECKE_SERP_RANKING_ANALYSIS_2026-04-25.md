# ECKE SERP Ranking Analysis

Date: 2026-04-25
Inputs: Google Search Console exports in `C:\Users\shkin\Downloads\stats`, repo data in `src/data`, and live web-search spot checks.

## Files Created

- `docs/ECKE_ENTITY_GSC_RANKINGS_2026-04-25.csv`
  - All 318 entity pages ECKE currently has in static data.
  - Includes events, dungeons, swing clubs, and vendors.
  - Includes GSC clicks, impressions, CTR, and average position where the URL appeared in the supplied `Pages.csv`.
  - Includes expected competitor types and likely ranking reasons for every entity row.

This markdown file is the executive analysis and competitor-pattern summary. The CSV is the per-entity working file.

## Scope and Ranking Method

The most reliable ranking source available here is Search Console average position, not a live Google scraper. GSC average position tells where ECKE appeared across real Google searches during the export period, but it is averaged across many queries, devices, and locations.

Live web searches were used as spot checks for important pages. Those observed result orders should be treated as directional, not guaranteed live Google rankings, because Google results vary by location, personalization, SafeSearch, device, and time.

Additional parallel SERP research was incorporated after the initial file generation. Those subagent observations reinforced the same caveat: positions are observed search output, not a guaranteed live Google rank tracker.

## Inventory Summary

ECKE has 318 entity landing pages in the static data:

- Events: 80 total, 29 seen in the GSC page export.
- Dungeons: 61 total, 14 seen in the GSC page export.
- Swing clubs: 72 total, 0 seen in the GSC page export.
- Vendors: 105 total, 17 seen in the GSC page export.

Only 60 of 318 entity URLs had matching rows in the supplied Search Console page export. The rest either had no impressions in the export window, used a different URL that did not map to the current static route, or were below the export threshold.

## Top Entity Pages by GSC Impressions

| Type | Page | Impressions | Clicks | CTR | Avg Position | Read |
|---|---:|---:|---:|---:|---:|---|
| Dungeon | `/dungeons/the-woodshed-orlando-florida` | 5,195 | 64 | 1.23% | 8.49 | High exposure, weak CTR |
| Event | `/events/frolicon` | 5,009 | 98 | 1.96% | 6.85 | Strong rank, weak CTR |
| Event | `/events/charmed` | 4,324 | 68 | 1.57% | 6.09 | Strong rank, weak CTR |
| Dungeon | `/dungeons/ohiosmart-dungeon-cleveland` | 2,985 | 96 | 3.22% | 8.96 | Good exposure, can improve |
| Dungeon | `/dungeons/the-nest-philadelphia-poconos` | 2,025 | 133 | 6.57% | 12.81 | Lower rank but strong intent |
| Dungeon | `/dungeons/baltimore-playhouse` | 1,789 | 82 | 4.58% | 9.76 | Mid-page one/two |
| Dungeon | `/dungeons/the-honey-pot-arundel-county` | 1,689 | 280 | 16.58% | 14.23 | Low rank, excellent CTR |
| Dungeon | `/dungeons/the-aphrodite-group` | 1,671 | 166 | 9.93% | 8.79 | Good CTR |
| Event | `/events/fetcamp` | 1,579 | 66 | 4.18% | 5.94 | Good rank |
| Event | `/events/naughty-gras` | 1,309 | 46 | 3.51% | 6.59 | Good rank |
| Event | `/events/claw` | 1,142 | 29 | 2.54% | 7.18 | Weak CTR for brand query |
| Event | `/events/imslbb` | 954 | 26 | 2.73% | 7.57 | Weak CTR |
| Event | `/events/naughty-knowledge` | 769 | 28 | 3.64% | 6.98 | Moderate |
| Dungeon | `/dungeons/sarasota-dark-temple` | 747 | 66 | 8.84% | 6.05 | Strong |
| Event | `/events/primal-arts-festival` | 682 | 10 | 1.47% | 6.31 | Weak CTR |
| Event | `/events/coastal-carolina-fetish-fair` | 668 | 79 | 11.83% | 6.37 | Strong CTR |

## Competitor SEO Patterns

### Events

For branded event queries, the sites above ECKE are usually:

- The official event website.
- Registration/ticket pages on the official domain.
- Host/community partner calendars.
- Large niche directories such as Recon.
- Venue/event platforms if the event is listed there.

Why they rank higher:

- Official source/entity authority: Google strongly prefers the official event domain for branded event searches.
- Exact-match titles: official pages often lead with the event name, year, city, and registration intent.
- Fresh transactional content: registration, hotel blocks, schedules, dates, prices, and ticket links.
- Internal event subpages: FAQ, registration, hotel, dungeon/play space, schedule, consent policy.
- Backlinks and citations: official pages are linked by attendees, venues, sponsors, social profiles, and ticket platforms.

### Dungeons and Venues

For branded venue queries, the sites above ECKE are usually:

- Official venue website.
- Official social/profile hubs such as Linktree, FetLife, or Facebook.
- Local/niche directories such as Fetish.com, SwingTowns, Couples International, and local event calendars.
- ECKE state/category hub pages when Google chooses a broader directory result.

Why they rank higher:

- Stronger local/entity signals: official pages often have NAP-style details, phone, address, hours, and membership info.
- Exact brand match: official or directory titles often begin with the exact venue name.
- Local intent fit: directories include city/state/category in URL, title, and breadcrumb.
- More event freshness: some venue sites have current calendars, recurring classes, and FAQ pages.
- Reviews/community links: even adult venues often receive social/profile links that reinforce entity identity.

## Live SERP Spot Checks

These are directional web-search observations, not guaranteed canonical Google positions.

### Frolicon

Observed results:

1. Official `frolicon.com`
2. ECKE old/current indexed result for Frolicon
3. Official hotel/room page
4. Official dungeon page
5. Official about page

What competitors use:

- Official title: `Frolicon – Frolicon: Where Nerdy Meets Naughty`
- Event date visible near the top: `Frolicon 2026 – May 14 – 17, 2026`
- Multiple supporting pages for room block, dungeon, and about content.

Why they rank higher:

- Official event source.
- More event-specific subpages.
- Stronger branded relevance and likely backlink profile.
- ECKE is competitive but had weak CTR at average position 6.85, so the title/snippet needs to communicate date, city, and value faster.

### CLAW 26

Observed results:

1. Stonewall Columbus event page
2. ECKE `/events/claw`
3. Official `clawinfo.org`
4. Official registration page
5. Recon event listing

What competitors use:

- Stonewall title: `CLAW 26 - Stonewall Columbus`
- Official site highlights hotel takeover, package requirement, VendorMart, classes, and urgency.
- Recon title includes event name and city: `CLAW 26 – Columbus Ohio`.

Why they rank higher:

- Stonewall is a strong local/community calendar with clean event schema-like content.
- Official CLAW pages own registration/hotel/ticket intent.
- Recon has niche directory authority.
- ECKE has strong content but should lead harder with `Columbus`, `April 2-5, 2026`, `leather weekend`, and `registration/hotel takeover`.

### Charmed

Observed results:

1. Official Charmed rules page
2. ECKE `/events/charmed`
3. Official FAQ
4. Official homepage
5. Official consent policy

What competitors use:

- Official pages are topic-specific: rules, FAQ, consent, homepage.
- They include strong terms like erotic hypnosis, recreational hypnosis, consent policy, dungeon space.

Why they rank higher:

- Official domain owns the event entity.
- Multiple indexed official pages answer specific intents.
- ECKE ranks well at average position 6.09 but has weak CTR, likely because the snippet reads like a generic event description rather than answering registration/date/location intent.

### Elevation Rope

Observed results:

1. Official `elevationrope.com`
2. ECKE `/events/elevation-rope`
3-5. Unrelated rope/circus/safety results.

What competitors use:

- Official title: `Elevation Rope | Shibari Rope Conference | Western North Carolina`
- Strong location and category in title.
- Clear registration date and venue details.

Why they rank higher:

- Official source and exact query match.
- ECKE is doing well here: average position 5.77 and CTR 21.1%.
- This page is a model: when the query intent is precise and the ECKE snippet matches it, CTR can be excellent even below the official site.

### Baltimore Playhouse

Observed results:

1. ECKE `/dungeons/baltimore-playhouse`
2. Official Baltimore Playhouse about page
3. ECKE alternate/legacy slug
4. Fetish.com venue page
5. Official newcomer page

What competitors use:

- Official pages emphasize `501(c)7`, `12,000 square feet`, `since 1997`, and newcomer content.
- Fetish.com uses category/location taxonomy in title and URL.

Why they rank higher or compete:

- ECKE is currently strong for this query, but duplicate ECKE URLs may split signals.
- Official pages have direct NAP and first-party trust.
- Fetish.com has directory/category authority.

### The Woodshed Orlando

Observed results:

1. Official Woodshed Orlando homepage.
2. Couples International listing.
3. SwingTowns guide.
4. Official events page.

What competitors use:

- Official homepage: simple brand-first title and clear address/hours.
- SwingTowns has a long editorial guide with lots of descriptive content.
- Couples International has local category targeting: BDSM clubs Florida / The Woodshed Orlando.

Why they rank higher:

- Official site has NAP, hours, phone, location, and direct business identity.
- Competitor directories use local category landing-page patterns.
- ECKE has many impressions but only 1.23% CTR, so the page should likely emphasize `Orlando BDSM dungeon`, address, hours, membership, and what first-timers can expect in the title/description.

### The Honey Pot

Observed results:

1. ECKE legacy/current result.
2. ECKE canonical result.
3. ECKE Maryland state hub.
4. Unrelated `all4honey.com` result.
5. Unrelated/ambiguous Honey Pot result.

Why ECKE performs well:

- ECKE appears to be the clearest indexed source for this specific local venue.
- CTR is excellent at 16.58% even though average position is 14.23.

Issue:

- Multiple ECKE URLs are visible (`/dungeons/honeypotdungeon` and `/dungeons/the-honey-pot-arundel-county`). This should be consolidated with redirects/canonicals.

### OhioSMART

Observed results:

1. ECKE alternate slug.
2. Official OhioSMART homepage.
3. Official first-time page.
4. ECKE canonical/current slug.
5. Official FAQ.

Why competitors rank:

- Official pages have strong local and trust signals: oldest BDSM organization in Ohio, first-time instructions, contact info, phone, RSVP details.
- ECKE ranks but appears with duplicate slugs, which may dilute click and ranking signals.

### The Aphrodite Group

Observed results:

1. ECKE canonical result.
2. Swingers New York directory.
3. Official/old payment page.
4. Fetish.com listing.
5. Unrelated restaurant/venue brand.

Why ECKE performs well:

- Official web presence appears fragmented or confusing.
- ECKE has a strong, clear local venue page and gets good CTR.

Competitor SEO:

- Directories use local category pages and exact brand/category phrasing.
- Official/old pages may have stronger brand authority but weaker content clarity.

### The Nest

Observed results:

1. ECKE canonical result.
2. ECKE dungeons hub.
3. PhillyGayCalendar event page.
4. ECKE alternate slug.
5. Linktree profile.

Why ECKE performs well:

- The official web presence is mostly social/profile based.
- ECKE has a crawlable, descriptive page.

Issue:

- Duplicate ECKE slug appears again: `/dungeons/the-nest-philadelphia-poconos` and `/dungeons/theowlsnest`.

## Highest-Priority Problems

### 1. Duplicate/legacy URL patterns are visible in search

Observed examples:

- `/kinkeventcalendar/frolicon`
- `/kinkeventcalendar/costal-carolina-fetish-fair`
- `/dungeons/honeypotdungeon`
- `/dungeons/ohiosmart`
- `/dungeons/the-baltimore-playhouse`
- `/dungeons/theowlsnest`

Why it matters:

- Duplicate URLs split signals.
- Google may show the weaker/older URL.
- CTR and canonical authority can fragment.
- The `costal-carolina` spelling variant is especially risky because it looks like a typo but can still be indexed.

Recommended fix:

- Add permanent 301 redirects from legacy slugs/routes to canonical routes.
- Ensure canonical tags always point to the current canonical URL.
- Submit the updated sitemap in GSC.

### 2. Some event titles/snippets are quality-damaged

Observed examples:

- `Elevation Rope 2026 2026`
- `Coastal Carolina Fetish Fair 2026 2026`
- Legacy ECKE result titles repeating `East Coast Kink Events | East Coast Kink Events`

Why it matters:

- Duplicate years make the result look auto-generated.
- Repeated brand text reduces useful title space.
- Competitor titles usually use concise event + year + place/category patterns.

Recommended fix:

- Normalize event title generation so a year is not appended when the event name already includes that year.
- For known high-impression events, use hand-tuned titles instead of generic generated titles.
- Keep titles under roughly 55-60 characters, with the event name first.

### 3. ECKE needs event-specific SERP snippets, not generic directory snippets

Low-CTR examples:

- Frolicon: 5,009 impressions, 1.96% CTR, position 6.85.
- Charmed: 4,324 impressions, 1.57% CTR, position 6.09.
- CLAW: 1,142 impressions, 2.54% CTR, position 7.18.
- Primal Arts Festival: 682 impressions, 1.47% CTR, position 6.31.

Recommended title pattern:

`[Event Name] [Year]: [City/State] [Primary Intent]`

Examples:

- `Frolicon 2026 Atlanta: Kink, Gaming & Parties`
- `Charmed 2026: Erotic Hypnosis Convention`
- `CLAW 26 Columbus: Leather Weekend & VendorMart`
- `Primal Arts Festival 2026: Maryland Kink Retreat`

Recommended meta pattern:

`[Event Name] runs [date] in [city/state]. Find [classes/parties/dungeon/vendor/registration] details, venue notes, age requirements, and official links.`

### 4. Dungeons need local-first titles

Low/improvable CTR examples:

- The Woodshed: 5,195 impressions, 1.23% CTR, position 8.49.
- OhioSMART: 2,985 impressions, 3.22% CTR, position 8.96.
- Baltimore Playhouse: 1,789 impressions, 4.58% CTR, position 9.76.

Recommended title pattern:

`[Venue Name]: [City] BDSM Dungeon / Kink Space`

Examples:

- `The Woodshed Orlando: BDSM Dungeon & Kink Classes`
- `OhioSMART Cleveland: BDSM Dungeon & Education`
- `Baltimore Playhouse: Baltimore BDSM Dungeon`

Recommended meta pattern:

`Find [venue] in [city/state]: membership/access details, events, classes, address area, rules, age requirements, and official website links.`

### 5. Some direct event pages may not be rendering reliably in search

The parallel event SERP pass observed the direct Primal Arts Festival ECKE result showing an application-error-style snippet rather than normal event content.

Recommended fix:

- Reproduce `/events/primal-arts-festival` locally and in production.
- Check browser console and server logs for client-side exceptions.
- Confirm the page renders without JavaScript-specific failure and that metadata/structured data are emitted server-side.
- Prioritize this before copy tuning because a broken SERP snippet can suppress CTR and trust even if rankings are decent.

### 6. Swing club pages have no matching GSC visibility

The CSV found 72 swing-club pages and 0 matching rows in `Pages.csv`.

Likely causes:

- They are not indexed, not internally linked enough, or have too little demand.
- They may be too new or not present in the sitemap.
- Their queries may be captured by broader state/category pages instead of entity pages.

Recommended checks:

- Confirm sitemap includes `/swing-clubs/...`.
- Check GSC URL inspection for a few representative swing-club URLs.
- Strengthen internal links from state pages and the swing-clubs hub.
- Add local-first title/meta patterns.

## Recommended Next Implementation Batch

1. Add canonical redirect map for old event and dungeon slugs.
2. Fix event title generation so names containing the year do not become `2026 2026`.
3. Investigate and fix the Primal Arts Festival direct page rendering/search snippet issue.
4. Add per-event SEO overrides for the highest-impression low-CTR event pages:
   - Frolicon
   - Charmed
   - CLAW
   - Primal Arts Festival
   - Fetish Con
   - Mid-Atlantic Leather Weekend
5. Add per-dungeon SEO overrides for:
   - The Woodshed
   - OhioSMART
   - Baltimore Playhouse
   - The Nest
   - The Honey Pot
   - The Aphrodite Group
6. Add Event schema fields where missing:
   - `startDate`
   - `endDate`
   - `location`
   - `organizer`
   - `eventAttendanceMode`
   - `eventStatus`
   - `offers` when pricing/registration exists
7. Add LocalBusiness/EventVenue-style schema for dungeon pages where appropriate and where it does not expose private addresses improperly.
8. Run a GSC compare export after deployment:
   - Previous 28 days before release vs first 28 days after recrawl.
   - Track CTR by page, not just total clicks.

## How To Use the CSV

Open `docs/ECKE_ENTITY_GSC_RANKINGS_2026-04-25.csv` and sort by:

1. `gsc_impressions` descending.
2. `gsc_ctr` ascending.
3. `gsc_avg_position` between 3 and 15.

Those are the best SEO targets: already visible, close enough to win clicks, but currently under-clicked.
