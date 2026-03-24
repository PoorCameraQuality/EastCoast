# Pre-Production Deployment Checklist

**Date:** October 16, 2025  
**Purpose:** Complete validation gate before merging PR-1 and PR-2 to production

---

## 🚨 Critical Blockers to Clear First

### 1. Sitemap Infrastructure
- [ ] **Sitemap returns 200** with valid XML in staging
- [ ] **State hub pages included** (all 17 states in sitemap)
- [ ] **Pagination URLs excluded** (no `/events/page/*` in sitemap)
- [ ] **Cache headers present** (`Cache-Control: public, max-age=600, s-maxage=600, stale-while-revalidate=86400`)
- [ ] **Static fallback tested** (sitemap serves when Supabase is down)

### 2. Dungeons Page Deduplication
- [ ] **Dungeons page shows 10 unique venues** (no duplicates)
- [ ] **Each venue appears exactly once** in DOM
- [ ] **Stable sort by name** applied

### 3. Footer Legal Section
- [ ] **Community Guidelines link** points to `/guidelines` (not `/community-guidelines`)

### 4. Events Add Redirect
- [ ] **`/events/add` redirects** to contact form with prefilled subject
- [ ] **Redirect is permanent** (301 or 308 status code)

---

## 🔄 Merge Order

### Step 1: Merge PR-1 First
1. Deploy PR-1 to staging
2. Run complete validation checklist
3. Confirm all 4 critical blockers are resolved
4. Deploy PR-1 to production
5. Verify production matches staging

### Step 2: Merge PR-2 Second
1. Deploy PR-2 to staging
2. Confirm pagination and state hubs work
3. Deploy PR-2 to production
4. Run post-deployment verification

---

## 🧪 Staging Acceptance Criteria

### Functional Tests

#### Sitemap Validation
```bash
# Test sitemap returns 200
curl -I https://staging.yoursite.com/sitemap.xml
# Expected: HTTP/1.1 200 OK

# Verify content type
curl -I https://staging.yoursite.com/sitemap.xml | grep "Content-Type"
# Expected: application/xml; charset=utf-8

# Check for state pages
curl -s https://staging.yoursite.com/sitemap.xml | grep -c "/states/"
# Expected: ≥18 (1 index + 17 states)

# Verify no pagination URLs
curl -s https://staging.yoursite.com/sitemap.xml | grep -c "/events/page/"
# Expected: 0
```

#### Robots.txt Validation
```bash
# Test robots.txt
curl -I https://staging.yoursite.com/robots.txt
# Expected: HTTP/1.1 200 OK

# Check sitemap reference
curl -s https://staging.yoursite.com/robots.txt | grep "Sitemap:"
# Expected: Sitemap: https://www.eastcoastkinkevents.com/sitemap.xml
```

#### Google Search Console (articles / organic)
- [ ] Property verified for `https://www.eastcoastkinkevents.com`
- [ ] Submit sitemap: `https://www.eastcoastkinkevents.com/sitemap.xml` (Sitemaps report)
- [ ] After deploy, use **URL Inspection** on `/education` and 2–3 article URLs; request indexing if needed
- [ ] **Pages** report: watch “Crawled – currently not indexed” and fix coverage issues on `/education/*`
- [ ] **Enhancements** (or Rich results / structured data): fix any Article/Breadcrumb errors reported

#### Dungeons Deduplication
```bash
# Count unique dungeons
curl -s https://staging.yoursite.com/dungeons | grep -o 'data-slug="[^"]*"' | sort | uniq -c
# Expected: Each slug appears exactly once, total count = 10
```

#### Redirect Tests
```bash
# Test /events/add redirect
curl -I -L https://staging.yoursite.com/events/add
# Expected: 307/308 redirect to /contact?subject=Event%20Submission

# Test legacy event redirect
curl -I -L https://staging.yoursite.com/kinkeventcalendar/whips-and-wine
# Expected: 308 redirect to /events/whips-and-wine
```

### SEO Specifics

#### Canonical Tags
- [ ] **Pagination pages** have self-referencing canonical tags
- [ ] **`rel="prev"` and `rel="next"`** links present on pagination
- [ ] **`/events` ≠ `/events/page/1`** (no duplicate content)

#### State Pages Content
- [ ] **Unique titles** for each state page
- [ ] **Unique H1s** with state name
- [ ] **State-specific content** (events and dungeons)
- [ ] **Links to neighboring states**
- [ ] **At least one paragraph** of state information

#### Structured Data
- [ ] **Event pages** render Event JSON-LD
- [ ] **Dungeon pages** render LocalBusiness JSON-LD
- [ ] **Article pages** render Article JSON-LD
- [ ] **Test with Google Rich Results Test**

#### IndexNow
- [ ] **Key file accessible** at exact configured path
- [ ] **IndexNow client** only fires in production
- [ ] **Batching capped** with backoff on errors

### Performance & Caching

#### Cache Headers
- [ ] **Sitemap has Cache-Control** headers
- [ ] **Vercel edge caching** configured
- [ ] **Static assets cached** appropriately

#### Stability
- [ ] **Sitemap timeout protection** (1500ms max)
- [ ] **Static fallback works** when dynamic fails
- [ ] **No 400 errors** under any conditions

#### Performance
- [ ] **Pagination loads** without layout shift on mobile
- [ ] **Image components** have width and height
- [ ] **No oversized logos** in cards

---

## 🚀 Automated Testing

### Run Pre-Deploy Script
```bash
# Execute automated validation
./scripts/pre-deploy-check.sh

# All tests must pass before proceeding
```

### Manual QA Checklist
- [ ] **Open `/events/page/1` and `/events/page/2`** - verify pagination works
- [ ] **Navigate through 3+ state pages** - confirm content and links
- [ ] **Test pagination Previous/Next** - ensure navigation works
- [ ] **Verify state-scoped content** - events and dungeons filter correctly
- [ ] **Check internal linking** - state pages link to each other
- [ ] **Test mobile responsiveness** - no horizontal scrolling
- [ ] **Validate JSON-LD** with Google Rich Results Test on 3 representative pages

---

## 🔍 Post-Deployment Verification

### Production Smoke Test
```bash
# Headers and status
curl -I https://www.eastcoastkinkevents.com/sitemap.xml
curl -I https://www.eastcoastkinkevents.com/robots.txt
curl -I -L https://www.eastcoastkinkevents.com/events/add
curl -I -L https://www.eastcoastkinkevents.com/kinkeventcalendar/whips-and-wine

# Content validation
curl -s https://www.eastcoastkinkevents.com/dungeons | grep -Eo 'data-slug="[^"]+"' | sort | uniq -c
curl -s https://www.eastcoastkinkevents.com/events/page/2 | grep -i canonical
curl -s https://www.eastcoastkinkevents.com/states/pennsylvania | head -n 80
```

### Search Console Actions
1. [ ] **Resubmit sitemap** in Google Search Console
2. [ ] **Resubmit sitemap** in Bing Webmaster Tools
3. [ ] **Submit key state pages** for indexing
4. [ ] **Verify IndexNow key file** is accessible
5. [ ] **Monitor crawl errors** for 24 hours

### IndexNow Notification
```typescript
// Notify Bing of new state hub pages
import { notifyIndexNowBatch } from '@/lib/indexnow'

const stateUrls = [
  'https://www.eastcoastkinkevents.com/states/pennsylvania',
  'https://www.eastcoastkinkevents.com/states/maryland',
  // ... all 17 states
]

await notifyIndexNowBatch(stateUrls)
```

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Production must have these set
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel Configuration
- [ ] **Environment variables** configured in production
- [ ] **Cache headers** set for sitemap
- [ ] **Build command** working: `npm run build`
- [ ] **No build errors** or warnings

---

## 🚨 Rollback Plan

### If Sitemap Fails in Production
1. **Immediate**: Update `vercel.json` to rewrite `/sitemap.xml` to `/sitemap-fallback.xml`
2. **Deploy**: Push emergency fix
3. **Verify**: Confirm sitemap returns 200 with static content
4. **Debug**: Investigate dynamic sitemap issues offline

### If Dungeons Duplication Returns
1. **Check**: Verify `dedupeBySlug()` function is being called
2. **Clear**: Remove `.next` cache and rebuild
3. **Restart**: Restart production server
4. **Verify**: Confirm 10 unique dungeons displayed

### If Pagination Creates Duplicate Content
1. **Temporary**: Set canonical of all `/events/page/*` to `/events`
2. **Add**: `noindex` meta tag to pagination pages
3. **Debug**: Investigate canonical tag implementation
4. **Fix**: Correct canonical tag logic

---

## 📊 Success Criteria

### All Tests Must Pass
- [ ] **Sitemap returns 200** with valid XML
- [ ] **State hub pages included** (17 states)
- [ ] **Pagination URLs excluded** from sitemap
- [ ] **Dungeons show 10 unique venues**
- [ ] **Footer Legal section** links to `/guidelines`
- [ ] **`/events/add` redirects** to contact form
- [ ] **Legacy paths redirect** properly
- [ ] **Pagination navigation** works
- [ ] **State pages render** with unique content
- [ ] **IndexNow key file** accessible
- [ ] **Cache headers** present on sitemap
- [ ] **Static fallback** tested and working

### Performance Targets
- [ ] **LCP < 2.5s** on event pages
- [ ] **FID < 100ms** on interactive elements
- [ ] **CLS < 0.1** on pagination pages
- [ ] **No layout shift** on mobile

### SEO Compliance
- [ ] **Unique titles** on all pages
- [ ] **Proper canonical tags** on pagination
- [ ] **JSON-LD structured data** on content pages
- [ ] **No duplicate content** issues
- [ ] **Proper internal linking** structure

---

## 📝 Documentation Updates

### Files to Update
- [ ] **`PR1-FIX-STATUS.md`** - Mark all issues as resolved
- [ ] **`PR2-IMPLEMENTATION-COMPLETE.md`** - Add sitemap improvements
- [ ] **`SITEMAP-IMPLEMENTATION.md`** - Document technical changes
- [ ] **`DEPLOYMENT_READINESS_REPORT.md`** - Update final status

### Commit Message Template
```
feat: implement pre-production deployment gate

- Replace sitemap.ts with robust route handler
- Add state hub pages to sitemap (17 states)
- Exclude pagination URLs from sitemap
- Add cache headers and static fallback
- Create automated validation script
- Update Vercel configuration

Resolves all PR-1 blockers:
✅ Sitemap returns 200 with valid XML
✅ Dungeons deduplication working
✅ Footer Legal section links fixed
✅ /events/add redirect implemented

Ready for PR-1 and PR-2 deployment.
```

---

## 🎯 Final Checklist

Before declaring deployment ready:

- [ ] **All automated tests pass** (`./scripts/pre-deploy-check.sh`)
- [ ] **Manual QA completed** on 3+ representative pages
- [ ] **Staging matches production** configuration
- [ ] **Environment variables** set in production
- [ ] **Rollback plan** understood and tested
- [ ] **Search console submissions** ready
- [ ] **IndexNow notifications** prepared
- [ ] **Documentation updated** with final status

**🚀 Ready for production deployment when all items above are checked!**
