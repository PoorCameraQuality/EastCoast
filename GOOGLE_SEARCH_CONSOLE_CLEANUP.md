# Google Search Console Cleanup Guide

## Current Issue
- Google Search Console has old Squarespace data
- Need to clean up and add new domain
- Submit new sitemap

## Steps to Clean Up Google Search Console

### 1. Remove Old Squarespace Property
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Find the old Squarespace property
3. Click the gear icon (Settings) → **Change of Address**
4. Or simply **Remove** the old property

### 2. Add New Domain Property
1. Click **Add Property**
2. Enter: `https://eastcoastkinkevents.com`
3. Choose **Domain** property type (recommended)
4. Verify ownership using one of these methods:
   - **HTML tag** (already added to your site)
   - **DNS record**
   - **Google Analytics** (if you have it)

### 3. Submit New Sitemap
1. In your new property, go to **Sitemaps**
2. Add sitemap URL: `https://eastcoastkinkevents.com/sitemap.xml`
3. Click **Submit**

### 4. Request Re-indexing
1. Go to **URL Inspection**
2. Enter your homepage: `https://eastcoastkinkevents.com/`
3. Click **Request Indexing**
4. Repeat for key pages:
   - `/events`
   - `/dungeons`
   - `/education`
   - `/calendar`

### 5. Monitor Performance
1. Check **Performance** report
2. Monitor **Coverage** report for indexing issues
3. Review **Enhancements** for rich results

## Bing Webmaster Tools Setup

### 1. Add Site to Bing
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your domain: `eastcoastkinkevents.com`
3. Verify ownership (HTML file already in place)

### 2. Submit Sitemap
1. Go to **Sitemaps**
2. Add: `https://eastcoastkinkevents.com/sitemap.xml`
3. Submit for indexing

### 3. Monitor Bing Indexing
1. Check **Index Explorer** for indexed pages
2. Monitor **Search Performance**
3. Review **SEO Reports**

## Expected Timeline
- **Google**: 1-7 days for re-indexing
- **Bing**: 1-14 days for indexing
- **Yandex**: 1-7 days for verification

## Troubleshooting Bing Redirect Issue

### If Bing Still Shows Redirects:
1. **Clear Vercel Cache**: Deploy a small change
2. **Check DNS**: Ensure no redirects at domain level
3. **Contact Vercel Support**: If issue persists
4. **Use Bing URL Inspection**: Test specific URLs

### Additional Headers Added:
- `X-Robots-Tag: index, follow`
- `Cache-Control: public, max-age=0, must-revalidate`
- Specific Bingbot directives in robots.txt

## Next Steps
1. Deploy these changes
2. Clean up Google Search Console
3. Set up Bing Webmaster Tools
4. Monitor indexing progress
5. Submit sitemaps to all search engines
