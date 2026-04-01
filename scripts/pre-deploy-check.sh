#!/bin/bash
# Pre-deployment validation script for East Coast Kink Events
# This script validates all critical components before merging PR-1 and PR-2

set -e  # Exit on any error

echo "🚀 Starting pre-deployment validation..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        return 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
}

# Clean up any existing build
echo "🧹 Cleaning previous build..."
rm -rf .next
echo ""

# Build production version
echo "🔨 Building production version..."
npm run build
echo ""

# Start production server in background
echo "🚀 Starting production server..."
npm run start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 8

# Test 1: Sitemap returns 200
echo ""
echo "📋 Testing sitemap..."
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sitemap.xml)
if [ "$SITEMAP_STATUS" = "200" ]; then
    print_status 0 "Sitemap returns HTTP 200"
else
    print_status 1 "Sitemap returned HTTP $SITEMAP_STATUS (expected 200)"
fi

# Test 2: Sitemap has correct content type
echo ""
echo "📋 Testing sitemap content type..."
SITEMAP_CT=$(curl -s -I http://localhost:3000/sitemap.xml | grep -i "content-type" | grep "application/xml")
if [ -n "$SITEMAP_CT" ]; then
    print_status 0 "Sitemap has correct Content-Type: application/xml"
else
    print_status 1 "Sitemap missing or incorrect Content-Type header"
fi

# Test 3: Sitemap contains state pages
echo ""
echo "📋 Testing sitemap contains state pages..."
SITEMAP_CONTENT=$(curl -s http://localhost:3000/sitemap.xml)
STATE_COUNT=$(echo "$SITEMAP_CONTENT" | grep -c "/states/" || echo "0")
if [ "$STATE_COUNT" -ge 17 ]; then
    print_status 0 "Sitemap contains $STATE_COUNT state URLs (expected ≥17)"
else
    print_status 1 "Sitemap contains only $STATE_COUNT state URLs (expected ≥17)"
fi

# Test 4: Sitemap does NOT contain pagination URLs
echo ""
echo "📋 Testing sitemap excludes pagination URLs..."
PAGINATION_COUNT=$(echo "$SITEMAP_CONTENT" | grep -c "/events/page/" || echo "0")
if [ "$PAGINATION_COUNT" = "0" ]; then
    print_status 0 "Sitemap correctly excludes pagination URLs"
else
    print_status 1 "Sitemap contains $PAGINATION_COUNT pagination URLs (expected 0)"
fi

# Test 5: Dungeons deduplication
echo ""
echo "📋 Testing dungeons deduplication..."
DUNGEON_RESPONSE=$(curl -s http://localhost:3000/dungeons)
UNIQUE_DUNGEONS=$(echo "$DUNGEON_RESPONSE" | grep -o 'data-slug="[^"]*"' | sort | uniq | wc -l)
if [ "$UNIQUE_DUNGEONS" = "10" ]; then
    print_status 0 "Dungeons page shows $UNIQUE_DUNGEONS unique dungeons (expected 10)"
else
    print_status 1 "Dungeons page shows $UNIQUE_DUNGEONS unique dungeons (expected 10)"
fi

# Test 6: Events add redirect
echo ""
echo "📋 Testing /events/add redirect..."
REDIRECT_LOCATION=$(curl -s -I -L http://localhost:3000/events/add | grep -i "location:" | tail -1)
if echo "$REDIRECT_LOCATION" | grep -q "contact"; then
    print_status 0 "/events/add redirects to contact page"
else
    print_status 1 "/events/add redirect failed or incorrect target"
fi

# Test 7: Legacy event redirect
echo ""
echo "📋 Testing legacy event redirect..."
LEGACY_REDIRECT=$(curl -s -I -L http://localhost:3000/kinkeventcalendar/whips-and-wine | grep -i "location:" | tail -1)
if echo "$LEGACY_REDIRECT" | grep -q "/events/whips-and-wine"; then
    print_status 0 "Legacy event URLs redirect to new structure"
else
    print_status 1 "Legacy event redirect failed or incorrect target"
fi

# Test 8: States index page
echo ""
echo "📋 Testing states index page..."
STATES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/states)
if [ "$STATES_STATUS" = "200" ]; then
    print_status 0 "States index page returns HTTP 200"
else
    print_status 1 "States index page returned HTTP $STATES_STATUS"
fi

# Test 9: Individual state page
echo ""
echo "📋 Testing individual state page..."
STATE_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/states/pennsylvania)
if [ "$STATE_PAGE_STATUS" = "200" ]; then
    print_status 0 "Individual state page returns HTTP 200"
else
    print_status 1 "Individual state page returned HTTP $STATE_PAGE_STATUS"
fi

# Test 10: Pagination pages
echo ""
echo "📋 Testing pagination pages..."
PAGE1_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/events/page/1)
PAGE2_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/events/page/2)
if [ "$PAGE1_STATUS" = "200" ] && [ "$PAGE2_STATUS" = "200" ]; then
    print_status 0 "Pagination pages return HTTP 200"
else
    print_status 1 "Pagination pages returned HTTP $PAGE1_STATUS and $PAGE2_STATUS"
fi

# Test 11: IndexNow key file
echo ""
echo "📋 Testing IndexNow key file..."
INDEXNOW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/0050cb815778482eafc98bbf0849daad.txt)
if [ "$INDEXNOW_STATUS" = "200" ]; then
    print_status 0 "IndexNow key file is accessible"
else
    print_status 1 "IndexNow key file returned HTTP $INDEXNOW_STATUS"
fi

# Test 12: Robots.txt
echo ""
echo "📋 Testing robots.txt..."
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/robots.txt)
if [ "$ROBOTS_STATUS" = "200" ]; then
    print_status 0 "Robots.txt returns HTTP 200"
else
    print_status 1 "Robots.txt returned HTTP $ROBOTS_STATUS"
fi

# Check robots.txt content
ROBOTS_CONTENT=$(curl -s http://localhost:3000/robots.txt)
if echo "$ROBOTS_CONTENT" | grep -q "Sitemap:"; then
    print_status 0 "Robots.txt includes sitemap reference"
else
    print_status 1 "Robots.txt missing sitemap reference"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
echo "=================================="
echo "🎉 Pre-deployment validation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Review any FAILED tests above"
echo "2. Fix issues and re-run this script"
echo "3. Deploy to staging for final verification"
echo "4. Run production smoke tests after deployment"
echo ""
