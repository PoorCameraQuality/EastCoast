# IndexNow Implementation Guide

This project implements IndexNow for faster search engine indexing, replacing deprecated sitemap ping endpoints.

## 🚀 Quick Start

### Post-Deployment Submission
```bash
# Submit all core + content URLs after deployment
node scripts/post-deploy-indexnow.js

# Submit only core URLs (state hubs)
node scripts/post-deploy-indexnow.js --core-only

# Submit only content URLs (events/dungeons)
node scripts/post-deploy-indexnow.js --content-only
```

### Quick URL Submission
```bash
# Submit single URL
node scripts/quick-indexnow.js "https://www.eastcoastkinkevents.com/events/naughty-noel"

# Submit multiple URLs
node scripts/quick-indexnow.js --batch "url1,url2,url3"
```

### API Endpoints
```bash
# Submit single URL
curl "https://www.eastcoastkinkevents.com/api/indexnow?url=https://www.eastcoastkinkevents.com/events"

# Submit bulk URLs
curl -X POST "https://www.eastcoastkinkevents.com/api/indexnow" \
  -H "Content-Type: application/json" \
  -d '{"urlList": ["url1", "url2", "url3"]}'

# Ping sitemap (IndexNow only)
curl -X POST "https://www.eastcoastkinkevents.com/api/sitemap/ping" \
  -H "Content-Type: application/json" \
  -d '{"indexNow": true, "includeContent": true}'

# Check status
curl "https://www.eastcoastkinkevents.com/api/indexnow/status"
```

## 📊 What Changed

### ✅ Removed Deprecated Endpoints
- **Google `/ping?sitemap=`** - Deprecated (returns 404)
- **Bing `/ping?sitemap=`** - Removed (returns 410)

### ✅ Added IndexNow Support
- **Direct API**: `/api/indexnow` for URL submissions
- **Batch submission**: `/api/sitemap/ping` for sitemap + content
- **Status monitoring**: `/api/indexnow/status` for health checks
- **Utility scripts**: Post-deploy and quick submission tools

## 🎯 Best Practices

### For Google
1. **Search Console**: Submit sitemap via UI (one-time setup)
2. **Sitemap API**: Use Search Console API for programmatic submission
3. **URL Inspection**: Request indexing for priority URLs (quota-limited)
4. **Internal Links**: Strong linking from homepage/state hubs to new content

### For Bing & Other Engines
1. **IndexNow**: Primary method for URL notifications
2. **Bing Webmaster Tools**: Monitor IndexNow submissions
3. **Batch submissions**: Up to 10,000 URLs per request

### Deployment Workflow
```bash
# After deployment
node scripts/post-deploy-indexnow.js

# For specific new content
node scripts/quick-indexnow.js "https://www.eastcoastkinkevents.com/events/new-event"
```

## 🔧 Configuration

### IndexNow Key
- **File**: `public/0050cb815778482eafc98bbf0849daad.txt`
- **URL**: `https://www.eastcoastkinkevents.com/0050cb815778482eafc98bbf0849daad.txt`
- **Purpose**: Domain ownership verification

### API Configuration
- **IndexNow API**: `https://api.indexnow.org/indexnow`
- **Domain**: `www.eastcoastkinkevents.com`
- **Key**: `0050cb815778482eafc98bbf0849daad`

## 📈 Monitoring

### Health Checks
```bash
# Check IndexNow status
curl "https://www.eastcoastkinkevents.com/api/indexnow/status"

# Run full test suite
node scripts/test-indexnow.js
```

### Expected Results
- **Key file**: Accessible and contains correct key
- **API submissions**: HTTP 200 responses
- **URL validation**: Only domain URLs accepted
- **Batch limits**: Up to 10,000 URLs per request

## 🚨 Troubleshooting

### Common Issues
1. **404/410 on sitemap ping**: Expected (endpoints deprecated)
2. **Key file not accessible**: Check file exists in `public/` directory
3. **URL validation errors**: Ensure URLs belong to your domain
4. **Rate limiting**: IndexNow has built-in spam protection

### Debug Commands
```bash
# Test key file accessibility
curl "https://www.eastcoastkinkevents.com/0050cb815778482eafc98bbf0849daad.txt"

# Test single URL submission
node scripts/quick-indexnow.js "https://www.eastcoastkinkevents.com/"

# Check API status
curl "https://www.eastcoastkinkevents.com/api/indexnow/status"
```

## 📚 References

- [IndexNow Documentation](https://www.indexnow.org/documentation)
- [Google Sitemaps Guide](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Bing URL Submission](https://www.bing.com/webmasters/help/url-submission-62f2860b)
- [Google Search Console API](https://developers.google.com/webmaster-tools/v1/sitemaps/submit)
