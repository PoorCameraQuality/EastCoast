#!/usr/bin/env node
/**
 * Post-publish smoke for C2K → ECKE bridge (run after kink.social publishes).
 * Usage: node scripts/verify-c2k-bridge.mjs [eventSlug] [vendorSlug] [educationSlug]
 */
const BASE = (process.env.ECKE_PUBLIC_BASE_URL || 'https://www.eastcoastkinkevents.com').replace(/\/$/, '')
const eventSlug = process.argv[2] || process.env.C2K_EVENT_SLUG || 'forbidden-frostland-2027-8a5cbb24'
const vendorSlug = process.argv[3] || process.env.C2K_VENDOR_SLUG || 'testshop'
const educationSlug =
  process.argv[4] || process.env.C2K_EDUCATION_SLUG || 'ecke-publish-is-online-and-ready-for-testing'

async function check(path, label) {
  const url = `${BASE}${path}`
  const res = await fetch(url, { redirect: 'follow' })
  const ok = res.status === 200
  console.log(`${ok ? 'OK' : 'FAIL'} ${res.status} ${label} ${url}`)
  return ok
}

const checks = await Promise.all([
  check('/kink-social', 'explainer'),
  check(`/events/${eventSlug}`, 'event'),
  check(`/vendors/${vendorSlug}`, 'vendor'),
  check(`/education/${educationSlug}`, 'education'),
  check('/sitemap.xml', 'sitemap'),
])

const sitemapRes = await fetch(`${BASE}/sitemap.xml`)
const sitemapBody = await sitemapRes.text()
const hasEvent = sitemapBody.includes(`/events/${eventSlug}`)
const hasKinkSocial = sitemapBody.includes('/kink-social')
console.log(`${hasKinkSocial ? 'OK' : 'WARN'} sitemap includes /kink-social`)
console.log(`${hasEvent ? 'OK' : 'WARN'} sitemap includes event slug ${eventSlug}`)

if (!checks.every(Boolean)) {
  process.exit(1)
}
console.log('verify:c2k-bridge passed')
