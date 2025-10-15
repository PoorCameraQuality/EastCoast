<!-- 3d1eb469-466e-46f0-a561-c88a37fd3da8 82f9c837-9043-4093-8bf3-b9c9cf78dfdf -->
# Fix Google Search Console Indexing, Soft 404s & 404 Errors

## Problem Summary

Google Search Console shows three types of errors:

1. **Page with redirect**: Non-canonical URLs (www vs apex, trailing slashes, query params) redirect instead of serving content
2. **Soft 404**: Pages return 200 but look like 404s, or duplicate URLs confuse Google
3. **Not found (404)**: Legacy paths, deleted content, and missing slugs

## Root Causes

- Broken sitemap link in footer (`/sitemap` instead of `/sitemap.xml`)
- Missing redirects for query parameters (`?format=amp`, `?category=...`)
- No explicit section root normalization (`/events/` vs `/events`)
- Legacy paths still being crawled (`/kinkeventcalendar/`, `/kinkeducationcenter/`)
- Static `robots.txt` instead of dynamic export
- Potential conflicts between `next.config.js` and `vercel.json` redirects

## Implementation Plan

### 1. Fix Footer Sitemap Link

**File**: `src/components/Footer.tsx` (line 114)

- Change: `<Link href="/sitemap">` → `<Link href="/sitemap.xml">`

### 2. Add Missing Redirects to next.config.js

**File**: `next.config.js`

**Current state**: Already has redirects for:

- HTTP → HTTPS (lines 16-28)
- apex → www (lines 29-40)
- `/kinkeventcalendar/:slug` → `/events/:slug` (line 42)
- `/kinkeducationcenter/:slug` → `/education/:slug` (lines 47-57)
- Many specific article/event redirects (lines 59-290)

**Add these NEW redirects** after line 40 (after www redirect):

```javascript
// Normalize section roots - remove trailing slashes
{ source: '/events/', destination: '/events', permanent: true },
{ source: '/dungeons/', destination: '/dungeons', permanent: true },
{ source: '/education/', destination: '/education', permanent: true },

// Explicit trailing slash removal for detail pages
{ source: '/events/:slug/', destination: '/events/:slug', permanent: true },
{ source: '/dungeons/:slug/', destination: '/dungeons/:slug', permanent: true },
{ source: '/education/:slug/', destination: '/education/:slug', permanent: true },

// Strip AMP format parameter
{
  source: '/:path*',
  has: [{ type: 'query', key: 'format', value: 'amp' }],
  destination: '/:path*',
  permanent: true,
},

// Map category query parameters to events page
{
  source: '/',
  has: [{ type: 'query', key: 'category', value: 'Events' }],
  destination: '/events',
  permanent: true,
},
{
  source: '/',
  has: [{ type: 'query', key: 'category', value: 'Indoor+Kink+Events' }],
  destination: '/events',
  permanent: true },
{
  source: '/',
  has: [{ type: 'query', key: 'category', value: 'Outdoor+Events' }],
  destination: '/events',
  permanent: true,
},

// Privacy URL consistency
{ source: '/privacy-policy', destination: '/privacy', permanent: true },
{ source: '/privacy/', destination: '/privacy', permanent: true },
```

### 3. Enhance Middleware for URL Normalization

**File**: `src/middleware.ts`

Add URL normalization **before** admin route checks (after line 23):

```typescript
// Normalize URL: force www and lowercase paths
const host = req.headers.get('host') || ''
const lowerPath = pathname.toLowerCase()

// Force www (backup to next.config.js redirect)
if (host === 'eastcoastkinkevents.com') {
  url.host = 'www.eastcoastkinkevents.com'
  return NextResponse.redirect(url, 308)
}

// Force lowercase paths for consistency
if (pathname !== lowerPath) {
  url.pathname = lowerPath
  return NextResponse.redirect(url, 308)
}

// Strip unwanted query parameters
const allowedParams = new Set(['page', 'q'])
let paramsChanged = false
for (const key of [...url.searchParams.keys()]) {
  if (!allowedParams.has(key) && key !== 'format' && key !== 'category') {
    url.searchParams.delete(key)
    paramsChanged = true
  }
}
if (paramsChanged) {
  return NextResponse.redirect(url, 308)
}
```

Update matcher (line 87) to exclude sitemap and robots:

```typescript
matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|sitemap.xml|robots.txt).*)']
```

### 4. Create Dynamic robots.ts

**File**: `src/app/robots.ts` (NEW FILE)

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/login', '/unauthorized', '/debug', '/debug-simple', '/test-article', '/admin-test'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://www.eastcoastkinkevents.com/sitemap.xml',
  }
}
```

**Action**: Delete `public/robots.txt` after creating this file

### 5. Create Custom 404 Page

**File**: `src/app/not-found.tsx` (NEW FILE)

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container-custom mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-serif font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-300 mb-6 text-lg">
          We couldn't find the page you're looking for. It may have been moved or deleted.
        </p>
        <div className="space-y-4">
          <p className="text-gray-400">Try exploring these sections:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              <Link href="/events" className="text-primary-400 hover:text-primary-300 underline">
                Browse Events
              </Link>
            </li>
            <li>
              <Link href="/dungeons" className="text-primary-400 hover:text-primary-300 underline">
                Find Dungeons
              </Link>
            </li>
            <li>
              <Link href="/education" className="text-primary-400 hover:text-primary-300 underline">
                Read Education Articles
              </Link>
            </li>
            <li>
              <Link href="/calendar" className="text-primary-400 hover:text-primary-300 underline">
                View Calendar
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
```

### 6. Verify Education Page Uses notFound()

**File**: `src/app/education/[slug]/page.tsx`

Confirm it already calls `notFound()` for missing slugs (like events and dungeons already do).

### 7. Simplify vercel.json

**File**: `vercel.json`

Remove duplicate category redirects (lines 8-18) since we're handling them in `next.config.js` now.

Keep only:

- AMP format redirects (lines 19-42)
- Headers (lines 44-82)
- Build config (lines 83-90)

### 8. Verify All Files Already Correct

**No changes needed** - just verify:

- ✅ `src/app/sitemap.ts` - Uses BASE_URL correctly, no trailing slashes
- ✅ `src/app/events/[slug]/page.tsx` - Calls `notFound()` on line 64
- ✅ `src/app/dungeons/[slug]/page.tsx` - Calls `notFound()` on line 62
- ✅ `src/lib/seo.ts` - BASE_URL = `https://www.eastcoastkinkevents.com`
- ✅ All page metadata uses correct canonical URLs

## Testing Checklist

### Pre-Deployment:

```bash
npm run build  # Must complete with no errors
```

### Post-Deployment Tests:

```bash
# 1. Host normalization (expect 308 to www)
curl -I https://eastcoastkinkevents.com/events/naughty-noel

# 2. Trailing slash removal (expect 308 to no-slash)
curl -I https://www.eastcoastkinkevents.com/events/naughty-noel/

# 3. Legacy path redirect (expect 301/308 to /events/)
curl -I https://www.eastcoastkinkevents.com/kinkeventcalendar/naughty-noel
curl -I https://www.eastcoastkinkevents.com/kinkeducationcenter/consent101

# 4. AMP parameter strip (expect 308 without ?format=amp)
curl -I "https://www.eastcoastkinkevents.com/education/consent-101?format=amp"

# 5. Category query redirect (expect 308 to /events)
curl -I "https://www.eastcoastkinkevents.com/?category=Indoor+Kink+Events"

# 6. Section roots (expect 200 OK, no redirect)
curl -I https://www.eastcoastkinkevents.com/events
curl -I https://www.eastcoastkinkevents.com/dungeons
curl -I https://www.eastcoastkinkevents.com/education

# 7. Canonical detail pages (expect 200 OK, no redirect)
curl -I https://www.eastcoastkinkevents.com/events/naughty-noel
curl -I https://www.eastcoastkinkevents.com/dungeons/ohiosmart-dungeon-cleveland

# 8. Missing slugs (expect 404)
curl -I https://www.eastcoastkinkevents.com/events/does-not-exist
curl -I https://www.eastcoastkinkevents.com/education/fake-article

# 9. Sitemap (expect 200 OK, XML content)
curl -I https://www.eastcoastkinkevents.com/sitemap.xml

# 10. Robots (expect 200 OK, text content)
curl -I https://www.eastcoastkinkevents.com/robots.txt
```

### Google Search Console Actions:

1. Submit `https://www.eastcoastkinkevents.com/sitemap.xml` in Sitemaps section
2. Use URL Inspection on 5-10 example pages from each error report
3. Click "Request Indexing" for each
4. Click "Validate Fix" on all three reports:

   - Page with redirect
   - Soft 404
   - Not found (404)

5. Monitor for 1-2 weeks

## Expected Results

### Immediate (after deployment):

- ✅ Footer sitemap link works
- ✅ All non-www URLs → www (308)
- ✅ All trailing slashes removed (308)
- ✅ All query params cleaned (308)
- ✅ Legacy paths redirect (301/308)
- ✅ Missing slugs return 404
- ✅ Canonical URLs return 200 with NO redirects

### Within 1-2 weeks:

- "Page with redirect" errors → 0
- "Soft 404" errors → 0
- "Not found (404)" errors → only legitimate 404s remain
- Indexed pages increase
- Better crawl budget efficiency

## Files Modified

1. `src/components/Footer.tsx` - Fix sitemap link
2. `next.config.js` - Add query param & trailing slash redirects
3. `src/middleware.ts` - Add URL normalization
4. `src/app/robots.ts` - NEW (dynamic robots)
5. `src/app/not-found.tsx` - NEW (custom 404 page)
6. `public/robots.txt` - DELETE
7. `vercel.json` - Remove duplicate redirects
8. `src/app/education/[slug]/page.tsx` - Verify notFound() usage

### To-dos

- [ ] Update Footer.tsx to link to /sitemap.xml instead of /sitemap
- [ ] Review and confirm redirect configuration is not creating conflicts between next.config.js and vercel.json
- [ ] Test all URLs after deployment to ensure no redirect chains exist on canonical URLs