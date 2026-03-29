# US west of the Mississippi (+ Hawaii) — kink / BDSM inventory (research pass 2026-03-28)

**Purpose:** Deep-dive reference for expanding ECKE-style coverage **west of the Mississippi River**, including **Hawaii** and **Alaska**, with **live-site verification notes** where tooling allowed. This is **not** a legal vetting of any venue.

**Method:** Twelve parallel readonly research agents (regions + Dark Odyssey gap analysis), plus direct checks of **darkodyssey.com** and **campthornwood.com**. **Logo column:** few sites expose reliable `og:image` in automated fetches; use each site’s header graphic, favicon, or run `scripts/fetch-listing-logos.mjs` after adding a listing.

**ECKE repo status:** At the start of this pass, [`src/data/dungeons.js`](../src/data/dungeons.js) had **no** CO/NV/AZ/UT/WA/OR/CA rows except what the west-CSV batch had already added (TX/LA/OK/IA-focused). **Gap fixed in code:** **Dark Odyssey Surrender** and **Camp Thornwood** were missing despite appearing on [darkodyssey.com](https://darkodyssey.com/) — both are now rows in [`src/data/events.js`](../src/data/events.js) with **placeholder 2026 dates** (must be replaced from official registration).

**Geographic note:** “West of the Mississippi” is interpreted as the **western US** (plains through Pacific) **plus Hawaii**. Some national events (e.g. IMsLBB) **move cities**; some brands (e.g. **Northwest Leather Celebration**) **rotate host cities** — always re-verify.

---

## A. Dark Odyssey lineup vs ECKE (before → after this pass)

| Brand | Region | Official URL | On ECKE before? | Notes |
|-------|--------|--------------|-----------------|--------|
| Winter Fire | Baltimore, MD | darkodyssey.com/winterfire | Yes | Hotel takeover |
| Fusion | Northern MD | darkodyssey.com/fusion | Yes | Outdoor retreat |
| Summer Camp | Northern MD | darkodyssey.com/summerfest | Yes | Labor Day week |
| **Surrender** | **San Jose / Bay Area, CA** | **darkodyssey.com/surrender** | **No → Added** | 2025 site listed Oct 24–27; **2026** confirm on site |
| **Camp Thornwood** | **Sierra Foothills, CA** | **campthornwood.com** | **No → Added** | 2025 Founders Aug 14–18; parent page **TBD Aug 2026** |

**Logo:** ECKE reuses `/images/darkodyssey.png` for Dark Odyssey events; Camp Thornwood had **no** `og:image` in script run — same logo until a brand asset is uploaded.

---

## B. California (sample — not exhaustive)

| Name | Type | Area | URL | Active signal | Logo |
|------|------|------|-----|---------------|------|
| Folsom Street Fair | Fair | SF | folsomstreet.org | 2026 date on org site | Defer / site branding |
| Up Your Alley | Fair | SF | folsomstreet.org | 2026 | Defer |
| Leather Pride Fest | Fest | SF | leatherpridefest.com | ©2026 on site | Defer |
| Threshold LA | Nonprofit dungeon-education | LA | thresholdla.org | ©2026 footer | Defer |
| Black Thorn | Rental / education | Oakland | black-thorn.org | Live booking | Defer |
| Desert Fetish Authority | Org / parties | Palm Springs area | desertfetishauthority.com | Hiatus notes for some tracks | Defer |
| KinkFest | Con | Portland… | *(see PNW)* | — | — |

*(Full CA agent table had 20+ rows including Citadel 503, Wicked Grounds timeout, colette links — confirm before listing.)*

---

## C. Pacific Northwest (WA / OR)

Examples with public URLs: **KinkFest** (kinkfest.org), **Portland Leather Alliance**, **Sanctuary PDX**, **Sub Rosa PDX**, **SubSpace Seattle**, **Kink Center** (kinkcenter.org), **CSPC** (thecspc.org), **Pan-Eros / SEAF**, **Leather Reign**, **WSLO Leather Pride Week**, etc. See agent table in project chat / expand from links above.

---

## D. Four Corners + Mountain (NV, UT, AZ, CO)

Agent-verified examples: **Denver Sanctuary**, **R.A.C.K. Room** (Aurora), **Thunder in the Mountains**, **HECK** (Colorado Springs), **RMLA** / Back Alley, **Den of Indomitus** (Phoenix), **Hush Lounge AZ**, **Purgatory Dungeon** (Albuquerque — NM), **blackBOOTS SLC**, etc.

**Warning:** **southwestleather.org** has been reported as **compromised / spam** — do **not** use until organizers publish a trusted URL.

---

## E. Northern Rockies / sparse (MT, WY, ID, NM)

- **MT:** B.A.C.K., Big Sky Kink / Ruff & Tumble, etc.  
- **WY:** No clear standalone public dungeon URL in agent pass.  
- **ID:** The Warehouse (Boise/Caldwell move note), idahobdsm.com portal.  
- **NM:** Purgatory Dungeon, Spectrum ABQ, NM Rope Bite, NM Leather & Kink Fair, NM-REAL, Kinktoberfest.

---

## F. Plains (ND, SD, NE, KS)

Repo + scrape: **Vortex** (Omaha + Des Moines) is the main **Nebraska-adjacent** listing; **ND/SD/KS** had **no** ECKE rows at inventory time. **KC metro** (MO/KS) still has **deferred** CSV rows (Black Dog, IX, Leather Pride KC) pending live site success.

---

## G. Texas / Louisiana / Arkansas

Beyond existing ECKE west-CSV rows: **Beyond Vanilla**, **South Plains Leatherfest**, **Temple of Flesh**, **NLA Dallas/Houston**, **The Vault HTX**, **Dallas Eagle**, **DomCon NOLA** (already on ECKE), **Different Loving LR** (verify Yola staleness), etc.

---

## H. Missouri / Iowa / Minnesota

**STL3** / Beat Me in St. Louis / Spanksgiving, **MWLKA**, **Our Spot KC**, **Des Moines Lifestyles Club**, **Wicked Creations**, **The Parlour** (Minneapolis), **Atons**, **MN Leather Pride**, etc.

---

## I. Alaska & Hawaii

- **AK:** **Alaska Club Kink** (alaskaclubkink.com) — public site describes member programming; **Alaska Kink Education** (alaskakinkeducation.com).  
- **HI:** No stable org-owned dungeon URL met agent bar; ticketing-only promoters common — **defer** until official homepages exist.

---

## J. Multi-state / rotating cons (western emphasis)

Examples: **NWLC** (northwestleathercelebration.com — Sacramento 2026 in one agent pass), **South Plains Leatherfest** (DFW), **HECK**, **Palm Springs Leather Pride**, **San Diego Bootblack & Leather**, **Folsom** week cluster, **KinkFest**, **Leather Reign**, **Oregon Leather Pride**, etc.

---

## K. Next steps for ECKE maintainers

1. **Replace placeholder dates** on **Dark Odyssey Surrender 2026** and **Camp Thornwood 2026** when organizers publish registration.  
2. **Prioritize ingest** by editorial bar (BDSM-first vs lifestyle-hybrid disclaimers).  
3. **State hubs:** Additional western `abbr` entries were added to [`eastCoastStates.ts`](../src/lib/eastCoastStates.ts) (CA, WA, OR, AZ, NV, UT, MT, WY, ID, NM, AK, HI) so `/states/california` etc. work as listings grow.  
4. **Logos:** Extend `fetch-listing-logos.mjs` with `direct` URLs from manual view-source where `og:image` is absent.  
5. **Re-run** this inventory annually; FetLife-only groups are intentionally out of scope here.

---

*Compiled 2026-03-28. Agent IDs from subagent runs available in session logs if follow-up is needed.*
