# Master reference: Google Search Central (audit handbook)

**Purpose:** Single place to jump off into **official** Google Search Central documentation when auditing a site (especially directory + editorial sites like East Coast Kink Events). This file **summarizes** and **links**; it does not replace Google’s pages. Policies and URLs change—verify the live doc.

**Primary sources (hubs you named):**

- [Google Search Essentials](https://developers.google.com/search/docs/essentials) (technical requirements, spam policies, key practices)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Crawling and indexing (overview)](https://developers.google.com/search/docs/crawling-indexing)
- [Search appearance (overview)](https://developers.google.com/search/docs/appearance)
- [Debugging Search traffic drops](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops)
- [Guidelines for sites with explicit content](https://developers.google.com/search/docs/specialty/explicit/guidelines)
- [Structured data features (gallery)](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)

**Official tools (bookmark):**

- [Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [URL Inspection](https://support.google.com/webmasters/answer/9012289) (via GSC)

**Related internal doc:** [google-seo-rule-set.md](./google-seo-rule-set.md) (Search Console–centric workflow).

---

## 1. Search Essentials (eligibility baseline)

From [Search Essentials](https://developers.google.com/search/docs/essentials):

| Pillar | Official doc | Audit questions |
|--------|----------------|-----------------|
| Technical requirements | [Technical requirements](https://developers.google.com/search/docs/essentials/technical) | Is Googlebot unblocked? HTTP 200 for important URLs? Indexable content type? No spam policy violations on content? |
| Spam policies | [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) | Any cloaking, scraped/low-value AI spam, doorway pages, link spam, misleading structured data, etc.? |
| Key practices | Same hub + [creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | People-first content? Clear titles/H1? Crawlable links? Images/videos/JS/structured data follow respective guides? |

### 1.1 Technical requirements (three checks)

From [Google Search technical requirements](https://developers.google.com/search/docs/essentials/technical):

1. **Googlebot isn’t blocked** — page is publicly reachable; not blocked by `robots.txt` / login walls for content you want indexed. Use [Page indexing](https://support.google.com/webmasters/answer/7440203) + [Crawl stats](https://support.google.com/webmasters/answer/9679690) + [URL Inspection](https://support.google.com/webmasters/answer/9012289).
2. **Page works** — HTTP **200** (not 4xx/5xx for pages you want indexed).
3. **Indexable content** — Supported [file types](https://developers.google.com/search/docs/crawling-indexing/indexable-file-types); content complies with [spam policies](https://developers.google.com/search/docs/essentials/spam-policies).

**Note:** Meeting requirements does **not** guarantee indexing or ranking ([How Search Works](https://developers.google.com/search/docs/fundamentals/how-search-works)).

### 1.2 Spam policies (what to scan for)

The full list lives on [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies). Categories include (non-exhaustive): **cloaking**, **doorway abuse**, **expired domain abuse**, **hacked content**, **hidden text/links**, **keyword stuffing**, **link spam**, **malware**, **misleading functionality**, **scraped / low-value / scaled abuse (including AI)**, **reputation abuse**, **thin affiliate**, **trust abuse**, **other behaviors**.

**Audit action:** Read the live page periodically; map any risky patterns (e.g. templated thin location pages, UGC without moderation, aggressive affiliate blocks) against the definitions.

---

## 2. SEO fundamentals (content, IA, links)

| Topic | URL |
|-------|-----|
| SEO Starter Guide | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| How Google Search works | https://developers.google.com/search/docs/fundamentals/how-search-works |
| Creating helpful, reliable, people-first content | https://developers.google.com/search/docs/fundamentals/creating-helpful-content |
| Do you need an SEO? | https://developers.google.com/search/docs/fundamentals/do-you-need-an-seo |
| Maintaining your site’s SEO | https://developers.google.com/search/docs/fundamentals/maintaining-site-seo |
| Developer’s guide to Google Search | https://developers.google.com/search/docs/fundamentals/developers-guide |

**Starter guide themes to bake into audits:**

- Discovery: `site:` check, sitemaps, promotion, **Google sees what users see** (resources not blocked).
- Site organization: descriptive URLs, logical directories, **canonical** / duplicate handling.
- On-page: unique useful content, headings, **expected query language** in title/H1 (not stuffing).
- Links: crawlable links, **descriptive anchor text**, `nofollow` for untrusted/UGC where appropriate.
- SERP: **title** and **snippet** quality; images (quality, placement, **alt**); video pages if applicable.
- “Don’t over-focus” table in the guide (e.g. meta keywords not used for ranking—[historical note](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag)).

---

## 3. Crawling and indexing (technical SEO)

**Hub:** [Overview of crawling and indexing topics](https://developers.google.com/search/docs/crawling-indexing)

| Area | Key official URLs |
|------|-------------------|
| Indexable file types | https://developers.google.com/search/docs/crawling-indexing/indexable-file-types |
| URL structure | https://developers.google.com/search/docs/crawling-indexing/url-structure |
| Links (crawlable) | https://developers.google.com/search/docs/crawling-indexing/links-crawlable |
| Sitemaps overview | https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview |
| Build / submit sitemap | https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap |
| Sitemap index | https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps |
| Image / News / Video sitemaps | Under sitemap extensions in nav |
| Ask Google to recrawl | https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl |
| Google crawlers / Googlebot | https://developers.google.com/search/docs/crawling-indexing/googlebot |
| robots.txt | https://developers.google.com/search/docs/crawling-indexing/robots/intro |
| Canonicalization | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| Specify canonical | https://developers.google.com/search/docs/crawling-indexing/canonicalization |
| Mobile / mobile-first | https://developers.google.com/search/docs/crawling-indexing/mobile |
| JavaScript SEO | https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics |
| Meta tags Google supports | https://developers.google.com/search/docs/crawling-indexing/special-tags |
| Robots meta / `data-nosnippet` / X-Robots-Tag | https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag |
| `noindex` | https://developers.google.com/search/docs/crawling-indexing/block-indexing |
| Control what you share | https://developers.google.com/search/docs/crawling-indexing/control-what-you-share |
| Redirects | https://developers.google.com/search/docs/crawling-indexing/301-redirects |
| Site moves | https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes |

**Audit prompts:** Trailing-slash vs non-slash consistency? Pagination/index bloat? `noindex` on thin faceted URLs? Sitemap matches canonical set? 301 chains shortened?

---

## 4. Search appearance (titles, snippets, rich results)

**Hub:** [Overview of Search appearance topics](https://developers.google.com/search/docs/appearance)

| Topic | URL |
|-------|-----|
| Visual Elements gallery | https://developers.google.com/search/docs/appearance/visual-elements-gallery |
| Title links | https://developers.google.com/search/docs/appearance/title-link |
| Snippets / meta descriptions | https://developers.google.com/search/docs/appearance/snippet |
| Favicons | https://developers.google.com/search/docs/appearance/favicon-in-search |
| Site names | https://developers.google.com/search/docs/appearance/site-names |
| Sitelinks | https://developers.google.com/search/docs/appearance/sitelinks |
| Images in Search | https://developers.google.com/search/docs/appearance/google-images |
| Video | https://developers.google.com/search/docs/appearance/video |
| Featured snippets | https://developers.google.com/search/docs/appearance/featured-snippets |
| Google Discover | https://developers.google.com/search/docs/appearance/google-discover |
| Page experience / CWV | https://developers.google.com/search/docs/appearance/page-experience |
| Core Web Vitals | https://developers.google.com/search/docs/appearance/core-web-vitals |
| AI features (overview) | https://developers.google.com/search/docs/appearance/ai-features |

**Title link audit (summary of [title link doc](https://developers.google.com/search/docs/appearance/title-link)):** Unique `<title>` per page; concise descriptive; avoid stuffing and repetitive boilerplate; clear primary H1; language/script matches page; understand Google may rewrite titles from other signals.

**Snippet audit (summary of [snippet doc](https://developers.google.com/search/docs/appearance/snippet)):** Snippets often come from body text; unique useful **meta descriptions** where they summarize better; optional `nosnippet` / `max-snippet` / `data-nosnippet` when needed.

---

## 5. Structured data (how + policies + gallery)

### 5.1 Core concepts

| Doc | URL |
|-----|-----|
| How structured data works | https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data |
| General guidelines | https://developers.google.com/search/docs/appearance/structured-data/sd-policies |
| Enriched search results | https://developers.google.com/search/docs/appearance/enriched-search-results |
| Generate SD with JavaScript | https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript |
| **Search gallery (all features)** | https://developers.google.com/search/docs/appearance/structured-data/search-gallery |

**Hard rules (from [general guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)):**

- Follow **spam** + **content** policies; misleading or hidden markup can cause manual actions (rich result eligibility loss).
- Rich results are **not guaranteed** even if valid.
- Use **JSON-LD** when practical; don’t block pages with markup; markup must match **visible** content; complete **required** properties per feature doc; prefer accurate completeness over stuffing recommended fields.
- Place markup on the page it describes; duplicate URLs should get **consistent** markup where applicable.
- Images in SD must be **crawlable** and relevant.

**Validation:** [Rich Results Test](https://search.google.com/test/rich-results); after launch, GSC **rich result** / enhancement reports where available.

### 5.2 Structured data feature guides (official paths)

Use the [search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) as the index. Direct “Get started” paths follow this pattern:

`https://developers.google.com/search/docs/appearance/structured-data/<feature-slug>`

| Feature | Path segment (append to base URL above) | Typical ECKE relevance |
|-----------|-------------------------------------------|-------------------------|
| Article | `article` | High (education articles) |
| Breadcrumb | `breadcrumb` | High (if BreadcrumbList used) |
| Event | `event` | High (event detail pages) |
| FAQ | `faqpage` | Medium (FAQ components) |
| Local business | `local-business` | Medium (vendors, venues—align types with Google’s definitions) |
| Organization | `organization` | High (site-wide) |
| Product | `product` + merchant variants | Low unless true product PDPs |
| Review snippet | `review-snippet` | Low/Medium if genuine reviews |
| Video | `video` | Medium if embed-heavy pages |
| Course list | `course` | Low unless structured courses |
| Carousel | `carousel` | Low (requires pairing with Recipe, Course, Movie, or Restaurant per doc) |
| Dataset, Job posting, Recipe, etc. | respective slugs | As needed |

**Base for all feature docs:** `https://developers.google.com/search/docs/appearance/structured-data/`

---

## 6. Monitoring, debugging, trends

| Doc | URL |
|-----|-----|
| Debugging drops in Search traffic | https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops |
| Search Console (get started) | https://support.google.com/webmasters/answer/9128668 |
| Google Trends (get started) | https://developers.google.com/search/docs/monitor-debug/trends-start |
| Refine Google searches (`site:` etc., user-facing help) | https://support.google.com/websearch/answer/2466433 |
| Using GSC + GA for SEO | https://developers.google.com/search/docs/monitor-debug/using-search-console-and-google-analytics-data-for-seo |

**Traffic drop workflow (from [debugging drops](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops)):** Consider algorithm updates, **technical** issues, **security**, **spam/manual actions**, **seasonality**, **site moves**. Use Performance report: **16 months**, **compare** periods, split **search type**, watch **pages** table and indexing reports, cross-check **Google Trends** for demand shifts.

**Data anomalies:** Check Google’s published anomalies when charts look wrong.

---

## 7. Specialty: explicit / adult-adjacent sites

**Critical for kink/BDSM education and community listings:** [Guidelines for sites with explicit content](https://developers.google.com/search/docs/specialty/explicit/guidelines)

**Practice highlights:**

- SafeSearch and other systems filter **visual** explicit material; educational/documentary/artistic context matters but is system-judged.
- **Googlebot and age gates:** Allow verified Googlebot to access content **without** triggering age interstitials if you want that content indexed; blocking can hurt understanding and misclassify the site.
- **Video:** Allow Google to fetch video files where policy expects; use `video:family_friendly` in video sitemaps when applicable.
- **Site structure:** Heavy explicit vs non-explicit mix: consider **separate domain or subdomain** for explicit-heavy sections so SafeSearch doesn’t filter the whole property.
- **Optional markup:** `<meta name="rating" content="adult">` (or RTA equivalent) on pages with sexually explicit content—per Google’s doc.

**Audit:** Age gate behavior for Googlebot, video crawlability, whether listing/education split warrants structural separation, and accuracy of any `rating` meta on explicit pages only.

---

## 8. E-commerce and international (if scope expands)

| Guide | URL |
|-------|-----|
| Ecommerce overview | https://developers.google.com/search/docs/specialty/ecommerce/overview |
| International / multilingual | https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites |

---

## 9. Quarterly site audit checklist (consolidated)

Use this as a tick list; evidence column is for your notes (GSC screenshot, URL, ticket).

| # | Area | Check | Evidence |
|---|------|--------|----------|
| 1 | Essentials | Technical requirements pass for top templates | URL Inspection samples |
| 2 | Essentials | No spam-policy patterns (thin, scraped, misleading SD, etc.) | Manual review |
| 3 | Indexing | Page indexing + crawl stats clean for critical paths | GSC |
| 4 | Canonicals | One preferred URL; redirects; `link[rel=canonical]` | Spot-check + GSC |
| 5 | robots / noindex | Intended crawl blocks only | robots.txt + meta |
| 6 | Titles | Unique, descriptive `<title>`; clear H1 | Template review |
| 7 | Snippets | Unique meta descriptions on high-impression URLs | GSC Pages + CMS |
| 8 | Links | Crawlable `<a href>`; useful anchor text | Crawl or click paths |
| 9 | Images | Alt text, relevance, crawlable URLs | Sample pages |
| 10 | Structured data | JSON-LD valid; matches visible content; required fields | Rich Results Test |
| 11 | Explicit policy | Age gate / bot / video / subdomain / meta `rating` if needed | Policy doc §7 |
| 12 | Performance | CWV / page experience acceptable on key URLs | PSI + GSC |
| 13 | Security | No manual actions; no security issues | GSC |
| 14 | Analytics | Investigate sustained drops using official debug doc | GSC + Trends |

---

## 10. Disclaimer

This document is a **navigation and audit aid**. Google’s documentation is authoritative and changes over time. Always follow the live pages linked above.

Content from Google Search Central is subject to [Google Developers Site Policies](https://developers.google.com/terms/site-policies); structured data examples in Google docs are under the licenses stated there.

**Suggested review cadence:** Re-fetch the [Search Essentials](https://developers.google.com/search/docs/essentials) and [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) pages at least quarterly; re-run Rich Results Test on one URL per major template after each deploy.
