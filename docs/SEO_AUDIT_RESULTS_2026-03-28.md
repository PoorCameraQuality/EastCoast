# SEO audit results — East Coast Kink Events (2026-03-28)

**Rubric:** [MASTER_GOOGLE_SEARCH_CENTRAL_AUDIT_REFERENCE.md](./MASTER_GOOGLE_SEARCH_CENTRAL_AUDIT_REFERENCE.md) (§§1, 3, 4, 5, 6, 9; explicit-content §7 out of scope per product stance).

**Production checks (manual):** After deploy, run [URL Inspection](https://support.google.com/webmasters/answer/9012289), [Rich Results Test](https://search.google.com/test/rich-results) on one URL per template, and confirm [Search Console](https://search.google.com/search-console) sitemap + indexing.

---

## Track A — Global crawl & index

| Finding | Severity | Evidence | Remediation (done) |
|--------|----------|----------|-------------------|
| Sitemap listed every state URL while thin state hubs use `noindex` | Should-fix | [states/[state]/page.tsx](../src/app/states/[state]/page.tsx) `totalListings < 2` vs sitemap | [sitemap.xml/route.ts](../src/app/sitemap.xml/route.ts) now uses `getStateSlugsForSitemap()` from [eastCoastStates.ts](../src/lib/eastCoastStates.ts) (same ≥2 listing rule). |
| Duplicate state config between index, detail, sitemap | Nice-to-have | Drift risk | Shared `EAST_COAST_STATES` in [eastCoastStates.ts](../src/lib/eastCoastStates.ts); [states/page.tsx](../src/app/states/page.tsx) and [states/[state]/page.tsx](../src/app/states/[state]/page.tsx) import it. |
| `robots.txt` / disallow alignment | OK | [robots.ts](../src/app/robots.ts) | No change; `/api/`, admin, test routes blocked. |

**Google refs:** [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview), [canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

---

## Track B — Hub metadata & SERP

| Finding | Severity | Remediation (done) |
|--------|----------|---------------------|
| `keywords` meta on multiple hubs (ignored by Google for ranking) | Nice-to-have | Removed `keywords` from root [layout.tsx](../src/app/layout.tsx), [events/page.tsx](../src/app/events/page.tsx), [calendar/page.tsx](../src/app/calendar/page.tsx), [dungeons/page.tsx](../src/app/dungeons/page.tsx), [vendors/page.tsx](../src/app/vendors/page.tsx), [education/page.tsx](../src/app/education/page.tsx), [states/page.tsx](../src/app/states/page.tsx). |
| Education layout OG/Twitter used non-`www` URLs | Should-fix | [education/layout.tsx](../src/app/education/layout.tsx) now uses `BASE_URL` for `openGraph.url` and images. |
| GSC verification placeholder in HTML when env unset | Should-fix | [layout.tsx](../src/app/layout.tsx): `verification.google` only set when `NEXT_PUBLIC_GSC_VERIFICATION` is defined. |

**Google refs:** [Meta keywords](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag), [title links](https://developers.google.com/search/docs/appearance/title-link).

---

## Track C — Detail templates

| Finding | Severity | Remediation (done) |
|--------|----------|---------------------|
| `/events/page/N` indexable while `/events` is main listing hub | Should-fix | [events/page/[page]/page.tsx](../src/app/events/page/[page]/page.tsx): `robots: { index: false, follow: true }` for all paginated event URLs (still linked with `rel` prev/next). |
| State detail `keywords` | Nice-to-have | Removed from [states/[state]/page.tsx](../src/app/states/[state]/page.tsx) metadata. |

---

## Track D — Structured data

| Finding | Severity | Remediation (done) |
|--------|----------|---------------------|
| `Event` JSON-LD duplicated entity as `performer` (same as event name) | Nice-to-have | Removed `performer` from [StructuredData.tsx EventStructuredData](../src/components/StructuredData.tsx). |
| `Offer.url` / `ViewAction` empty when `event.website` missing | Should-fix | Fallback to canonical event URL on site. |
| `Organization` `logo` pointed at generic placeholder | Should-fix | Set to `${BASE_URL}/og-image.png` in [OrganizationStructuredData](../src/components/StructuredData.tsx). |
| FAQ answers only in DOM when accordion open | Should-fix | [FAQ.tsx](../src/components/FAQ.tsx) refactored to `<details>`/`<summary>` so answer copy is always in HTML; JSON-LD unchanged. |

**Verify:** Rich Results Test on `/events/[slug]`, `/education/[slug]`, any page with FAQ.

**Google refs:** [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

---

## Track E — On-page content & links

| Finding | Severity | Notes |
|--------|----------|--------|
| Home hub uses crawlable `<Link>` for states/calendar | OK | [HubCategoryGrid.tsx](../src/components/home/HubCategoryGrid.tsx). |
| Ongoing | — | Prefer descriptive anchor text on new components; spot-check `EventCard` / dungeon cards for `alt` on logos. |

---

## Track F — Performance (CWV)

| Finding | Severity | Notes |
|--------|----------|--------|
| Font preload | Addressed earlier | Inter preloaded; Playfair `preload: false` in [layout.tsx](../src/app/layout.tsx). |
| Ongoing | — | Run [PageSpeed Insights](https://pagespeed.web.dev/) on `/`, `/events`, one article, one event after deploy. |

---

## Track G — Verification gate (post-deploy checklist)

1. Set `NEXT_PUBLIC_GSC_VERIFICATION` in production env (Vercel/hosting) if not already; redeploy. Confirm `<meta name="google-site-verification">` appears in page source.
2. Search Console → Sitemaps → submit `https://www.eastcoastkinkevents.com/sitemap.xml`.
3. URL Inspection: `/`, `/events`, `/education`, `/states/new-york` (or active state), one event detail.
4. Rich Results Test: one event URL, one article URL, one page with FAQ (if any).
5. Performance report: compare 28 days after changes (no immediate ranking guarantee).

---

## Post-deploy verification (Track G + PSI)

Record outcomes here after each step. Replace placeholders with dates and short notes (or “OK / issue: …”).

| Step | Tool / action | Result (date + notes) |
|------|----------------|------------------------|
| GSC meta | Production: view-source or `curl` homepage for `google-site-verification` | **2026-03-28:** Spot-check via `curl` on `https://www.eastcoastkinkevents.com/` — **no** `google-site-verification` meta in response body. **Action:** set `NEXT_PUBLIC_GSC_VERIFICATION` on the host, redeploy, re-check. |
| Sitemap | Search Console → Sitemaps → `https://www.eastcoastkinkevents.com/sitemap.xml` | _Owner: date / success or errors_ |
| URL Inspection | GSC: `/`, `/events`, `/education`, one active state hub, one `/events/[slug]` | _Owner: dates / indexed or notes_ |
| Rich Results Test | [Rich Results Test](https://search.google.com/test/rich-results): event URL, education article URL, FAQ page if applicable | _Owner: pass/fail + URL_ |
| PageSpeed Insights | [PSI](https://pagespeed.web.dev/): `/`, `/events`, one article, one event | _Owner: scores or regression notes_ |

---

## Summary

**Closed in code (this audit cycle):** Sitemap/state alignment (`getStateSlugsForSitemap()` + `eastCoastStates.ts`), shared state config on index + detail, paginated events listing `noindex` (`events/page/[page]`), hub metadata cleanup (removed `keywords` where noted), conditional GSC verification in root layout (no placeholder when env unset), education layout OG/Twitter `www` URLs, Event/Organization JSON-LD fixes (`performer` removed, `Offer`/`ViewAction` fallbacks, org logo), FAQ always in HTML via `<details>`. **Image alt polish (Track E follow-up):** richer event card / featured event alts; `DungeonLogo` / `EventLogo` safe fallbacks; `VendorImage` / `DungeonImage` non-empty fallbacks; promotional banner image alt includes page context.

**Closed after owner verification:** Track G items and PSI rows in **Post-deploy verification** above (sitemap submit, URL Inspection, Rich Results, performance snapshots). These require Search Console / hosting access, not repo changes.

**Explicit-content publisher guidelines (Google §7):** Out of scope per product stance; not used to drive changes here.

**Not automated in repo:** Ongoing content/copy passes beyond metadata; 28-day Search Console performance trends after deploy.
