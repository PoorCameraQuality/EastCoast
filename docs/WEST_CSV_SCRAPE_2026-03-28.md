# West-of-Mississippi CSV — verification & scrape dossier (2026-03-28)

Consolidates parallel agent research, live `WebFetch` / `curl` checks where noted, and **ECKE ingest decisions** for this batch. Facts are from **public pages only** unless marked *not stated*.

## Summary table

| Name | URL | Decision | Primary state(s) | Notes |
|------|-----|----------|------------------|--------|
| The Facility | https://thefacility.club/ | **Defer** | MO | 503 Service Unavailable at verify time |
| The Black Dog | https://theblackdogkc.com/ | **Defer** | MO | Fetch timeout in tooling; retry locally |
| IX Dungeon | https://ixkc.net/ | **Defer** | MO | 503 / timeout; no verified copy |
| ThatPlace | https://thatplace.club/ | **Exclude** | OK | Public site announces **permanent closure** (effective ~Dec 2025) |
| Oklahoma Power Exchange | https://oklahomapowerexchange.com/ | **Add** | OK | Active vetting, Ticketleap, recurring events |
| Infliction Hall | https://inflictionhall.com/ | **Add** | TX | DFW kink venue; ML platform; travel offers in footer |
| DFW Dungeon | https://dfwdungeon.com/ | **Defer** | TX | Homepage marketing-only; no address/contact/hours |
| Meridian Dallas Dungeon | https://meridiandallasdungeon.com/ | **Defer** | TX | 503 at verify time |
| Shrine Parties | https://shrineparties.com/ | **Add** | TX | Austin; colette temp membership; policies dated 12/2025 per CSV |
| Pendulum Club | https://pendulum.club/ (CSV: pendulumclubhtx.com 503) | **Add** | TX | **Lifestyle-first**; include hybrid disclaimer per editorial choice |
| Vortex Parties | https://vortexparties.com/ | **Add** | IA / NE | **One listing**; primary `state` **IA**; copy names **Omaha & Des Moines** |
| Happy Kitten Portal | https://portalnola.com/ | **Add** | LA | Bookable dungeon at The Prive; appointment-based |
| GWNN BASH 2026 | https://gwnnbash.com/ | **Add** | TX | Hotel block **May 18–21, 2026** (IHG link on site) |
| Austin Kink Weekend 2026 | https://austinkinkweekend.com/ | **Add** | TX | Apr 16–19, 2026; venue/tickets thin on homepage |
| Oklahoma LeatherFest 2026 | Google Sites OKLF 2026 | **Add** | OK | May 29–31, 2026; Wyndham Garden OKC |
| OKC Kink Weekend 2026 | https://www.okckinkweekend.com/ | **Add** | OK | Jul 16–19, 2026; bare domain 500—use **www** |
| Iowa Leather Weekend 2026 | https://www.midamericaconferenceofclubs.org/event/iowa-leather-weekend-2026/ | **Add** | IA | Aug 28–30, 2026; Blazing Saddle Des Moines |
| Leather Pride KC | https://leatherpridekc.com/ | **Defer** | MO | 503 at verify time |
| CSV gap rows (AR, KS, ND, SD, NE text, MN west) | — | **No listing** | — | Reference only |

---

## Venues (detail)

### The Facility — DEFER
- **Scrape:** Homepage not retrievable (**503** on `thefacility.club`). No public facts verified in this pass.
- **ECKE:** Defer until live site responds.

### The Black Dog — DEFER
- **Scrape:** Timeouts from automated fetch; no HTML body captured.
- **ECKE:** Defer; re-scrape locally.

### IX Dungeon (ixkc.net) — DEFER
- **Scrape:** 503 / timeout; no verified copy.
- **ECKE:** Defer.

### ThatPlace — EXCLUDE
- **Identity:** ThatPlace — OKC BDSM / kink social club (GoDaddy site).
- **Freshness:** Closure announcement **10/30/2025**; states **closed December 2025**, permanent closure.
- **ECKE:** Exclude active listing; do not link as open venue.

### Oklahoma Power Exchange — ADD
- **Identity:** Oklahoma Power Exchange — BDSM / power-exchange community, **18+**, private dungeon in **OKC metro** (no street on crawled copy).
- **Access:** Vetting, membership, waivers/NDA; guests sponsored; non-member party rules (e.g. limits per 90 days); **Ticketleap** `ope.ticketleap.com`, FetLife group, Google Calendar embed, **Events@OklahomaPowerExchange.com**.
- **Programming:** Bi-monthly parties, midweek dungeon nights, socials, workshops, rentals.
- **Proposed slug:** `oklahoma-power-exchange-okc`
- **Logo:** Run `og:image` harvest via script (may need HTML parse).

### Infliction Hall — ADD
- **Identity:** Infliction Hall — DFW TX; Modern Lifestyle member platform; VIP/Platinum memberships.
- **Location:** Events at **Infliction Hall DFW, TX** (no street on homepage); CSV city **Euless** for region context.
- **Programming:** Themed nights (rope, impact, littles, etc.); **Travel Events** (resorts/cruises) also listed—note in long copy.
- **Proposed slug:** `infliction-hall-dfw-tx`

### DFW Dungeon — DEFER
- **Scrape:** Single marketing line; no address, contact, calendar on fetched homepage.
- **ECKE:** Defer until richer public page.

### Meridian Dallas Dungeon — DEFER
- **Scrape:** **503** on meridiandallasdungeon.com.
- **ECKE:** Defer.

### Shrine Parties — ADD
- **Identity:** Shrine / Shrine Parties — Austin, TX; fetish/kink play parties; **colette** temporary membership (no extra cost); **18+**, waivers; policies updated per CSV **12/01/2025**.
- **URLs:** shrineparties.com (events, vendors, volunteer, STI testing, contact form).
- **Proposed slug:** `shrine-parties-austin-tx`

### Pendulum Club — ADD (hybrid disclaimer)
- **Canonical URL:** **https://pendulum.club/** (`pendulumclubhtx.com` returned **503** in agents).
- **Identity:** Woman-owned **on-premise lifestyle** clubs (Houston); **21+**; couples, single women, select single men (policy restrictions); **BYOB**; **not a strip club**.
- **Locations:** Three Houston-area clubs (Hempstead original, South near Hobby, North Spring); footer example **14448 Hempstead Rd, Houston, TX 77040**; **info@pendulum.club**, **281-857-6040**.
- **Editorial:** **Not kink-primary**—swingers/lifestyle positioning; some kink-adjacent travel/events in feed. Excerpt and long description **must** state this clearly (per user approval).
- **Proposed slug:** `pendulum-club-houston-tx`
- **Category:** `Lifestyle Club`

### Vortex Parties — ADD (single listing)
- **Identity:** Vortex Parties — fetish/kink play parties in **Omaha, NE** and **Des Moines, IA**; public **/about** is Des Moines–centric; **515-423-0591**, **VortexFetishParties@gmail.com**; rules (PRICK, **RED**), waiver, membership storefront.
- **Age:** Rules cite **19+ in Nebraska**, **18+** elsewhere for Vortex events.
- **ECKE data model:** **One** dungeon row; `location.state` = **IA** (operational detail anchor); text covers **both cities** and Nebraska age rule.
- **Proposed slug:** `vortex-parties-omaha-des-moines`

### Happy Kitten Portal — ADD
- **Identity:** The Happy Kitten Portal — **BDSM dungeon** for short/overnight visits at **The Prive**, French Quarter, New Orleans; appointment/Acuity booking; classes (rope, impact, tantra, etc.); linked **privenola.com** (members-only clothing-optional community; **628 N. Rampart** on Prive site).
- **ECKE:** Tag as **rental / by appointment**, not open club night.
- **Proposed slug:** `happy-kitten-portal-new-orleans`

---

## Conventions (detail)

### GWNN BASH 2026 — ADD
- **Dates:** **2026-05-18** – **2026-05-21** (from **gwnnbash.com/hotel-information/** IHG redirect: check-in May 18, check-out May 21, 2026).
- **Theme:** “BASH & Beyond — A BDSM Space Odyssey”
- **Hotel:** Holiday Inn Midtown Austin; group code **GWN**; cutoff **May 29, 2026**.
- **Links:** Registration (Cognito Forms), classes **bash2026.sched.com**.
- **Slug:** `gwnn-bash-2026`

### Austin Kink Weekend 2026 — ADD
- **Dates:** **2026-04-16** – **2026-04-19**
- **Venue/tickets:** Not on crawled homepage; note “confirm on austinkinkweekend.com”.
- **Slug:** `austin-kink-weekend-2026`

### Oklahoma LeatherFest 2026 — ADD
- **URL:** `https://sites.google.com/site/okleatherfest/2026-oklahoma-leatherfest`
- **Dates:** **2026-05-29** – **2026-05-31**
- **Venue:** Wyndham Garden OKC; room block phone on site.
- **Organizer email:** oklahomaleatherfest@gmail.com (per agent scrape).
- **Slug:** `oklahoma-leatherfest-2026`
- **Note:** Google Sites URL may change—flag in `longDescription`.

### OKC Kink Weekend 2026 — ADD
- **URL:** **https://www.okckinkweekend.com/** (non-www **500** at verify).
- **Dates:** **2026-07-16** – **2026-07-19**
- **Venues:** The District Hotel OKC; education at The Diversity Center (18+ class track).
- **Pricing:** Tiers on site ($90 early, etc.); registration may be “coming soon” for 2026.
- **Editorial:** Site references **ThatPlace** dungeon add-on—**ThatPlace is closed**; ECKE copy notes schedule may change.
- **Slug:** `okc-kink-weekend-2026`

### Iowa Leather Weekend 2026 — ADD
- **URL:** `https://www.midamericaconferenceofclubs.org/event/iowa-leather-weekend-2026/`
- **Dates:** **2026-08-28** – **2026-08-30** (15:00 CDT start Fri)
- **Venue:** The Blazing Saddle, East Village, Des Moines, IA
- **Programming:** Mr./Ms. Iowa Leather, Mr. Iowa Bear, Iowa Pet, vendor mart, socials.
- **Slug:** `iowa-leather-weekend-2026`

### Leather Pride KC — DEFER
- **Scrape:** **503** on leatherpridekc.com.
- **ECKE:** Defer.

---

## Dedupe (ECKE repo)

Grep of `dungeons.js` / `events.js` found **no** existing rows for these slugs or domains (2026-03-28).

---

## Ingest execution

- State hubs extended: **TX, OK, IA, NE** in `eastCoastStates.ts` (plus **South Central** / **Great Plains** groupings on `/states`).
- Data appended per **Add** rows; **Defer/Exclude** omitted from `dungeons.js` / `events.js`.
- Logos: `scripts/fetch-listing-logos.mjs` extended and run. **Downloaded:** Infliction, Shrine, Vortex, Happy Kitten, OK LeatherFest, OKC Kink Weekend. **SVG placeholder (`/images/placeholder-logo.svg`) for dungeon rows:** Oklahoma Power Exchange, Pendulum (no `og:image` in tooling). **Events omit `logo` (hidden in UI):** GWNN BASH, Austin Kink Weekend, Iowa Leather Weekend — add assets later if desired.
