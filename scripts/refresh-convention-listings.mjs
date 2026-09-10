/**
 * Scrape official convention websites, update public.events, and precreate
 * one org login + public organization/convention pages per producer.
 *
 * Conservative:
 * - Conventions only (no dungeon/club nights)
 * - Date changes only when a year-tagged range is unambiguous
 * - Emails only from public mailto/contact text (never invented as org addresses)
 * - 2027 rows only when the official site publishes 2027 dates
 * - Does not reset passwords on existing orgs
 *
 * Usage:
 *   node scripts/refresh-convention-listings.mjs
 *   node scripts/refresh-convention-listings.mjs --apply
 */

import { randomBytes, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const APPLY = process.argv.includes('--apply')
const LIMIT = numberArg('--limit', null)
const CONCURRENCY = numberArg('--concurrency', 2)
const TIMEOUT_MS = 14000
const DELAY_MS = 500
const USER_AGENT = 'EastCoastKinkEventsBot/1.0 (+https://www.eastcoastkinkevents.com)'
const TODAY = '2026-09-10'
const OUT_DIR = path.resolve(process.cwd(), 'scripts/out')
const REPORT_PATH = path.join(OUT_DIR, 'convention-refresh-report.json')
const HANDOFF_JSON = path.join(OUT_DIR, 'org-handoff-credentials.json')
const HANDOFF_MD = path.join(OUT_DIR, 'org-handoff.md')
const HOLDING_EMAIL_DOMAIN = 'eastcoastkinkevents.com'

const SKIP_SLUGS = new Set(['preview-c2k-weekend'])

const HOST_GROUPS = [
  {
    hosts: ['darkodyssey.com', 'campthornwood.com'],
    name: 'Dark Odyssey',
    slug: 'dark-odyssey',
    username: 'darkodyssey',
    website: 'https://darkodyssey.com/',
  },
  {
    hosts: ['studio58events.com'],
    name: 'Studio 58 Events',
    slug: 'studio-58-events',
    username: 'studio58events',
    website: 'https://studio58events.com/',
  },
  {
    hosts: ['kinkykollege.com'],
    name: 'Leather SINS',
    slug: 'leather-sins',
    username: 'leathersins',
    website: 'https://kinkykollege.com/',
  },
  {
    hosts: ['goboundless.us'],
    name: 'goBOUNDLESS',
    slug: 'goboundless',
    username: 'goboundless',
    website: 'https://goboundless.us/',
  },
]

const EXTRA_PATHS = ['/contact', '/contact-us', '/about', '/dates', '/events', '/2027']
const PREFERRED_LOCAL = /^(info|contact|hello|hellohello|office|registration|registrar|tickets|staff|vendors|vendor|board|admin|mail|hello@)/i
const REJECT_EMAIL_HOST = /(wixpress|squarespace|sentry|cloudflare|github|googlemail|wix\.com|godaddy|wordpress\.com|example\.com|sentry\.io)$/i
const REJECT_LOCAL = /^(noreply|no-reply|donotreply|privacy|webmaster|postmaster|mailer-daemon|support)$/i

const monthMap = new Map([
  ['jan', 0],
  ['january', 0],
  ['feb', 1],
  ['february', 1],
  ['mar', 2],
  ['march', 2],
  ['apr', 3],
  ['april', 3],
  ['may', 4],
  ['jun', 5],
  ['june', 5],
  ['jul', 6],
  ['july', 6],
  ['aug', 7],
  ['august', 7],
  ['sep', 8],
  ['sept', 8],
  ['september', 8],
  ['oct', 9],
  ['october', 9],
  ['nov', 10],
  ['november', 10],
  ['dec', 11],
  ['december', 11],
])
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function numberArg(name, fallback) {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return fallback
  const n = Number(process.argv[idx + 1])
  return Number.isFinite(n) ? n : fallback
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function usernameFromName(name) {
  return slugify(name).replace(/-/g, '').slice(0, 30) || 'org'
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function originOf(url) {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

function isoDate(y, m0, d) {
  const mm = String(m0 + 1).padStart(2, '0')
  const dd = String(Math.max(1, Math.min(31, d))).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function toDisplay(startISO, endISO) {
  const [ys, ms, ds] = startISO.split('-').map(Number)
  const [ye, me, de] = (endISO || startISO).split('-').map(Number)
  const sMon = monthNames[ms - 1]
  const eMon = monthNames[me - 1]
  if (!endISO || startISO === endISO) return `${sMon} ${ds}, ${ys}`
  if (ys === ye && ms === me) return `${sMon} ${ds}-${de}, ${ys}`
  if (ys === ye) return `${sMon} ${ds}-${eMon} ${de}, ${ys}`
  return `${sMon} ${ds}, ${ys}-${eMon} ${de}, ${ye}`
}

function normalizeTextFromHtml(html) {
  if (!html) return ''
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#64;/gi, '@')
    .replace(/\[at\]/gi, '@')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseMonthNameRange(raw, yearRequired) {
  const s = raw.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()
  const re =
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:\s*-\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{1,2}))?\s*,?\s*(20\d{2})\b/i
  const m = s.match(re)
  if (!m) return null
  const y = Number(m[5])
  if (yearRequired && y !== yearRequired) return null
  const m1 = monthMap.get(m[1].toLowerCase())
  const m2 = m[3] ? monthMap.get(m[3].toLowerCase()) : m1
  if (m1 == null || m2 == null) return null
  return { start: isoDate(y, m1, Number(m[2])), end: isoDate(y, m2, Number(m[4] || m[2])), year: y }
}

function parseNumericRange(raw, yearRequired) {
  const s = raw.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()
  const re = /\b(\d{1,2})[\/\-](\d{1,2})(?:\s*-\s*(\d{1,2})[\/\-](\d{1,2}))?[\/\-](20\d{2})\b/
  const m = s.match(re)
  if (!m) return null
  const y = Number(m[5])
  if (yearRequired && y !== yearRequired) return null
  const m1 = Number(m[1]) - 1
  const m2 = m[3] ? Number(m[3]) - 1 : m1
  if (m1 < 0 || m1 > 11 || m2 < 0 || m2 > 11) return null
  return { start: isoDate(y, m1, Number(m[2])), end: isoDate(y, m2, Number(m[4] || m[2])), year: y }
}

function findYearRanges(text, year) {
  const candidates = []
  const monthRe = new RegExp(
    String.raw`\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:\s*[-–—]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{1,2})?\s*,?\s*20\d{2}\b`,
    'gi',
  )
  const numericRe = /\b\d{1,2}[\/\-]\d{1,2}(?:\s*[-–—]\s*\d{1,2}[\/\-]\d{1,2})?[\/\-]20\d{2}\b/g
  let match
  while ((match = monthRe.exec(text))) {
    const parsed = parseMonthNameRange(match[0], year)
    if (parsed) candidates.push({ raw: match[0], ...parsed, score: /[A-Za-z]/.test(match[0]) ? 6 : 4 })
  }
  while ((match = numericRe.exec(text))) {
    const parsed = parseNumericRange(match[0], year)
    if (parsed) candidates.push({ raw: match[0], ...parsed, score: 4 })
  }
  return candidates
}

function chooseBestRange(candidates) {
  if (!candidates.length) return { best: null, reason: 'no_candidates' }
  const byKey = new Map()
  for (const c of candidates) {
    const key = `${c.start}..${c.end}`
    const prev = byKey.get(key)
    if (!prev) byKey.set(key, { ...c, raws: [c.raw], score: c.score })
    else {
      prev.score = Math.max(prev.score, c.score)
      if (prev.raws.length < 5) prev.raws.push(c.raw)
    }
  }
  const ranked = [...byKey.values()].sort((a, b) => b.score - a.score)
  const top = ranked[0]
  const runner = ranked[1]
  if (top.score < 6) return { best: null, reason: 'low_score', top }
  if (runner && runner.score === top.score && `${runner.start}..${runner.end}` !== `${top.start}..${top.end}`) {
    return { best: null, reason: 'ambiguous', top, runner }
  }
  return { best: top, reason: 'ok' }
}

function extractEmails(html, siteHost) {
  const text = normalizeTextFromHtml(html)
  const mailto = [...html.matchAll(/mailto:([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)].map((m) => m[1])
  const inline = [...text.matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)].map((m) => m[0])
  const seen = new Set()
  const scored = []
  for (const raw of [...mailto, ...inline]) {
    const email = raw.toLowerCase()
    if (seen.has(email)) continue
    seen.add(email)
    const [local, host] = email.split('@')
    if (!host || REJECT_EMAIL_HOST.test(host) || REJECT_LOCAL.test(local)) continue
    if (host.endsWith('sentry.io') || host.includes('wixpress')) continue
    let score = 0
    if (siteHost && (host === siteHost || host.endsWith(`.${siteHost}`))) score += 8
    if (PREFERRED_LOCAL.test(local)) score += 4
    if (mailto.includes(raw) || mailto.includes(email)) score += 3
    if (/(gmail|yahoo|icloud|outlook|hotmail)\.com$/.test(host) && score < 4) score += 1
    if (score < 4) continue
    scored.push({ email, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.email || null
}

async function fetchHtml(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })
    const html = await res.text()
    return { ok: res.ok, status: res.status, html: res.ok ? html : null, error: res.ok ? null : `HTTP ${res.status}` }
  } catch (error) {
    return { ok: false, status: null, html: null, error: String(error?.message || error) }
  } finally {
    clearTimeout(timer)
  }
}

async function scrapeSite(website) {
  if (!website) {
    return { ok: false, error: 'no_website', pages: [], email: null, range2026: null, range2027: null }
  }
  const origin = originOf(website)
  const host = hostnameOf(website)
  const skipExtras = /fetlife\.com|facebook\.com|sites\.google\.com/.test(host)
  const urls = [website]
  if (origin && !skipExtras) {
    for (const extra of EXTRA_PATHS) {
      const next = `${origin}${extra}`
      if (!urls.includes(next)) urls.push(next)
    }
  }

  const pages = []
  let combined = ''
  let email = null
  for (const [index, url] of urls.entries()) {
    if (index > 0) {
      const d2026 = chooseBestRange(findYearRanges(combined, 2026))
      const d2027 = chooseBestRange(findYearRanges(combined, 2027))
      const needEmail = !email
      const needDates = d2026.reason !== 'ok' && d2027.reason !== 'ok'
      const isContact = /contact/i.test(url)
      const isDates = /dates|events|2027/i.test(url)
      if (isContact && !needEmail) continue
      if (isDates && !needDates) continue
      if (!needEmail && !needDates) break
    }
    await sleep(DELAY_MS)
    const fetched = await fetchHtml(url)
    pages.push({ url, ok: fetched.ok, status: fetched.status, error: fetched.error })
    if (!fetched.html) continue
    combined += ` ${normalizeTextFromHtml(fetched.html)} `
    if (!email) email = extractEmails(fetched.html, host)
  }

  const d2026 = chooseBestRange(findYearRanges(combined, 2026))
  const d2027 = chooseBestRange(findYearRanges(combined, 2027))
  return {
    ok: pages.some((p) => p.ok),
    error: pages.some((p) => p.ok) ? null : pages[0]?.error || 'fetch_failed',
    pages,
    email,
    range2026: d2026.reason === 'ok' ? d2026.best : null,
    range2027: d2027.reason === 'ok' ? d2027.best : null,
    decision2026: { reason: d2026.reason, range: d2026.best ? { start: d2026.best.start, end: d2026.best.end } : null },
    decision2027: { reason: d2027.reason, range: d2027.best ? { start: d2027.best.start, end: d2027.best.end } : null },
  }
}

function groupKeyFor(event) {
  const host = hostnameOf(event.website || '')
  const grouped = HOST_GROUPS.find((g) => g.hosts.includes(host))
  if (grouped) return grouped.slug
  const name = event.organizer_name || event.organizer || event.title
  return slugify(name)
}

function orgMetaFor(event, members) {
  const host = hostnameOf(event.website || '')
  const grouped = HOST_GROUPS.find((g) => g.hosts.includes(host))
  if (grouped) {
    return {
      name: grouped.name,
      slug: grouped.slug,
      username: grouped.username,
      website: grouped.website,
    }
  }
  const name = (event.organizer_name || event.organizer || event.title || 'Organization').replace(/\s+20\d{2}.*$/, '').trim()
  const primary = members.find((m) => m.website) || event
  return {
    name,
    slug: slugify(name),
    username: usernameFromName(name),
    website: primary.website || null,
  }
}

function makePassword() {
  const raw = randomBytes(9).toString('base64url').replace(/[^a-zA-Z0-9]/g, 'x')
  return `Ecke27!${raw.slice(0, 10)}`
}

function makeAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function loadEvents(admin) {
  const { data, error } = await admin
    .from('events')
    .select(
      'id, slug, title, short_title, start_date, end_date, display_date, city, state, venue, website, organizer, organizer_name, email, event_type, category, organization_id, dungeon_slug, dungeon_venue_id, logo, status, short_description, long_description, seo_title, seo_description',
    )
    .eq('status', 'published')
    .is('dungeon_venue_id', null)
    .order('start_date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).filter((row) => !row.dungeon_slug && !SKIP_SLUGS.has(row.slug) && row.category === 'Convention')
}

function planDateUpdate(event, scrape) {
  const currentStart = event.start_date
  const past = currentStart && currentStart < TODAY
  const upcoming = !past

  if (upcoming && scrape.range2026) {
    const next = {
      start: scrape.range2026.start,
      end: scrape.range2026.end,
      display: toDisplay(scrape.range2026.start, scrape.range2026.end),
    }
    const changed = next.start !== event.start_date || next.end !== event.end_date
    return { mode: 'update-current', current: changed ? next : null, extra2027: scrape.range2027 || null }
  }

  if (past && scrape.range2027) {
    return {
      mode: 'roll-forward-2027',
      current: {
        start: scrape.range2027.start,
        end: scrape.range2027.end,
        display: toDisplay(scrape.range2027.start, scrape.range2027.end),
      },
      extra2027: null,
    }
  }

  if (upcoming && scrape.range2027) {
    return {
      mode: 'keep-and-add-2027',
      current: scrape.range2026
        ? {
            start: scrape.range2026.start,
            end: scrape.range2026.end,
            display: toDisplay(scrape.range2026.start, scrape.range2026.end),
          }
        : null,
      extra2027: scrape.range2027,
    }
  }

  return { mode: 'unchanged', current: null, extra2027: null }
}

async function upsertListing(admin, table, matchSlug, row) {
  const { data: existing } = await admin.from(table).select('id, c2k_source_id').eq('slug', matchSlug).maybeSingle()
  if (existing?.id) {
    const { c2k_source_id: _drop, ...updateRow } = row
    const { error } = await admin.from(table).update(updateRow).eq('id', existing.id)
    if (error) throw new Error(`${table} update failed: ${error.message}`)
    return { id: existing.id, created: false }
  }
  const { data, error } = await admin.from(table).insert(row).select('id').single()
  if (error || !data) throw new Error(`${table} insert failed: ${error?.message || 'unknown'}`)
  return { id: data.id, created: true }
}

async function findAuthUserByEmail(admin, email) {
  for (let page = 1; page <= 8; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(error.message)
    const hit = data.users.find((row) => row.email?.toLowerCase() === email)
    if (hit) return hit
    if (!data.users.length || data.users.length < 200) break
  }
  return null
}

async function ensureOrg(admin, meta, email, description, logo, password) {
  const { data: bySlug } = await admin
    .from('organizations')
    .select('id, name, slug, username, email, owner_user_id')
    .eq('slug', meta.slug)
    .maybeSingle()
  const { data: byUsername } = bySlug
    ? { data: null }
    : await admin.from('organizations').select('id, name, slug, username, email, owner_user_id').eq('username', meta.username).maybeSingle()
  const { data: byEmail } = bySlug || byUsername
    ? { data: null }
    : await admin.from('organizations').select('id, name, slug, username, email, owner_user_id').eq('email', email).maybeSingle()
  const existing = bySlug || byUsername || byEmail

  if (existing?.owner_user_id) {
    const { error } = await admin
      .from('organizations')
      .update({
        name: meta.name,
        website: meta.website,
        description,
        logo_url: logo,
      })
      .eq('id', existing.id)
    if (error) throw new Error(`org update failed: ${error.message}`)
    return { org: existing, created: false, password: null, reused: true }
  }

  let user = null
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: meta.name },
  })
  user = created.data?.user ?? null
  if (!user && created.error && /already|registered|exists/i.test(created.error.message)) {
    user = await findAuthUserByEmail(admin, email)
    if (!user) throw new Error(`Auth email exists but user missing: ${email}`)
    const { error: pwError } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { name: meta.name },
    })
    if (pwError) throw new Error(pwError.message)
  }
  if (!user) throw new Error(created.error?.message || 'Could not create auth user')

  if (existing?.id && !existing.owner_user_id) {
    const { error } = await admin
      .from('organizations')
      .update({
        name: meta.name,
        slug: meta.slug,
        email,
        website: meta.website,
        description,
        logo_url: logo,
        username: meta.username,
        owner_user_id: user.id,
      })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...(user.app_metadata ?? {}), ecke_role: 'org', organization_id: existing.id },
    })
    return { org: { ...existing, owner_user_id: user.id, username: meta.username, email }, created: false, password, reused: false }
  }

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: meta.name,
      slug: meta.slug,
      email,
      website: meta.website,
      description,
      logo_url: logo,
      username: meta.username,
      owner_user_id: user.id,
    })
    .select('id, name, slug, username, email, owner_user_id')
    .single()
  if (orgError || !org) {
    await admin.auth.admin.deleteUser(user.id)
    throw new Error(orgError?.message || 'Could not create organization')
  }
  await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...(user.app_metadata ?? {}), ecke_role: 'org', organization_id: org.id },
  })
  return { org, created: true, password, reused: false }
}

async function applyGroup(admin, group, now) {
  const primary = group.events[0]
  const description =
    primary.short_description ||
    `${group.meta.name} produces public kink / leather / education weekends listed on East Coast Kink Events. Confirm dates and registration on the official site.`
  const location = [primary.city, primary.state].filter(Boolean).join(', ')
  const logo = primary.logo || null
  const officialEmail = group.events.map((e) => e.scrape?.email).find(Boolean) || null
  const email = officialEmail || `ecke-org-${group.meta.username}@${HOLDING_EMAIL_DOMAIN}`
  const emailSource = officialEmail ? 'official-site' : 'ecke-holding'
  const password = makePassword()

  const ensured = await ensureOrg(admin, group.meta, email, description, logo, password)
  const org = ensured.org

  await upsertListing(admin, 'organization_listings', group.meta.slug, {
    slug: group.meta.slug,
    name: group.meta.name,
    description,
    public_location_summary: location || null,
    logo_url: logo,
    website_url: group.meta.website,
    cta_url: group.meta.website,
    kink_social_canonical_url: null,
    status: 'published',
    source_system: 'ecke',
    c2k_source_type: 'organization',
    c2k_source_id: randomUUID(),
    source_attribution: 'Official site',
    last_synced_at: now,
    updated_at: now,
  })

  const eventResults = []
  for (const event of group.events) {
    const plan = event.plan
    const update = {
      organizer: group.meta.name,
      organizer_name: group.meta.name,
      organizer_website: group.meta.website,
      organization_id: org.id,
      event_type: 'convention',
      category: 'Convention',
      website: event.website || group.meta.website,
      status: 'published',
    }
    if (officialEmail && !event.email) update.email = officialEmail
    if (plan.current) {
      update.start_date = plan.current.start
      update.end_date = plan.current.end
      update.display_date = plan.current.display
    } else if (event.start_date && event.end_date) {
      update.display_date = toDisplay(event.start_date, event.end_date)
    }

    const { error } = await admin.from('events').update(update).eq('id', event.id)
    if (error) throw new Error(`${event.slug}: ${error.message}`)

    const starts = update.start_date || event.start_date
    const ends = update.end_date || event.end_date
    await upsertListing(admin, 'convention_listings', event.slug, {
      slug: event.slug,
      name: event.title,
      description: event.short_description || description,
      public_location_summary: [toDisplay(starts, ends), location].filter(Boolean).join(' · ') || null,
      logo_url: event.logo || logo,
      cta_url: event.website || group.meta.website,
      kink_social_canonical_url: null,
      org_slug: group.meta.slug,
      org_display_name: group.meta.name,
      starts_at: starts ? `${starts}T00:00:00` : null,
      ends_at: ends ? `${ends}T23:59:59` : null,
      status: 'published',
      source_system: 'ecke',
      c2k_source_type: 'convention',
      c2k_source_id: randomUUID(),
      source_attribution: 'Official site',
      last_synced_at: now,
      updated_at: now,
    })

    let extraSlug = null
    if (plan.extra2027) {
      extraSlug = event.slug.includes('2027') ? event.slug : `${event.slug.replace(/-20\d{2}$/, '')}-2027`
      const { data: existingExtra } = await admin.from('events').select('id').eq('slug', extraSlug).maybeSingle()
      const extraRow = {
        title: event.title.replace(/20\d{2}/, '2027'),
        short_title: event.short_title?.replace(/20\d{2}/, '2027') || null,
        slug: extraSlug,
        start_date: plan.extra2027.start,
        end_date: plan.extra2027.end,
        display_date: toDisplay(plan.extra2027.start, plan.extra2027.end),
        city: event.city,
        state: event.state,
        venue: event.venue,
        short_description: event.short_description,
        long_description: event.long_description,
        seo_description: event.seo_description,
        seo_title: event.seo_title?.replace(/20\d{2}/, '2027') || null,
        category: 'Convention',
        event_type: 'convention',
        logo: event.logo,
        website: event.website || group.meta.website,
        organizer: group.meta.name,
        organizer_name: group.meta.name,
        organizer_website: group.meta.website,
        organization_id: org.id,
        email: officialEmail || event.email,
        status: 'published',
      }
      if (existingExtra?.id) {
        const { error: extraError } = await admin.from('events').update(extraRow).eq('id', existingExtra.id)
        if (extraError) throw new Error(`${extraSlug}: ${extraError.message}`)
      } else {
        const { error: extraError } = await admin.from('events').insert(extraRow)
        if (extraError) throw new Error(`${extraSlug}: ${extraError.message}`)
      }
      await upsertListing(admin, 'convention_listings', extraSlug, {
        slug: extraSlug,
        name: extraRow.title,
        description: extraRow.short_description || description,
        public_location_summary: [extraRow.display_date, location].filter(Boolean).join(' · ') || null,
        logo_url: event.logo || logo,
        cta_url: extraRow.website,
        kink_social_canonical_url: null,
        org_slug: group.meta.slug,
        org_display_name: group.meta.name,
        starts_at: `${plan.extra2027.start}T00:00:00`,
        ends_at: `${plan.extra2027.end}T23:59:59`,
        status: 'published',
        source_system: 'ecke',
        c2k_source_type: 'convention',
        c2k_source_id: randomUUID(),
        source_attribution: 'Official site',
        last_synced_at: now,
        updated_at: now,
      })
    }

    eventResults.push({
      slug: event.slug,
      mode: plan.mode,
      updatedDates: Boolean(plan.current),
      extra2027: extraSlug,
    })
  }

  return {
    org: {
      id: org.id,
      name: group.meta.name,
      slug: group.meta.slug,
      username: group.meta.username,
      email,
      emailSource,
      website: group.meta.website,
      created: ensured.created,
      password: ensured.password,
      alreadyProvisioned: ensured.reused,
      login: '/auth/org/login',
      organizationPage: `/organizations/${group.meta.slug}`,
    },
    events: eventResults,
  }
}

async function run() {
  const admin = makeAdmin()
  const events = await loadEvents(admin)
  const subset = LIMIT ? events.slice(0, LIMIT) : events

  const scrapeBySlug = new Map()
  let idx = 0
  async function worker() {
    while (idx < subset.length) {
      const current = subset[idx++]
      if (!current.website) {
        scrapeBySlug.set(current.slug, { ok: false, error: 'no_website', email: null, range2026: null, range2027: null })
        continue
      }
      scrapeBySlug.set(current.slug, await scrapeSite(current.website))
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, () => worker()))

  const enriched = subset.map((event) => {
    const scrape = scrapeBySlug.get(event.slug) || { ok: false, email: null, range2026: null, range2027: null }
    return { ...event, scrape, plan: planDateUpdate(event, scrape) }
  })

  const groupsMap = new Map()
  for (const event of enriched) {
    const key = groupKeyFor(event)
    if (!groupsMap.has(key)) groupsMap.set(key, [])
    groupsMap.get(key).push(event)
  }

  const groups = [...groupsMap.entries()].map(([key, members]) => ({
    key,
    meta: orgMetaFor(members[0], members),
    events: members,
  }))

  const report = {
    today: TODAY,
    apply: APPLY,
    scanned: enriched.length,
    groups: groups.map((g) => ({
      name: g.meta.name,
      slug: g.meta.slug,
      username: g.meta.username,
      website: g.meta.website,
      events: g.events.map((e) => ({
        slug: e.slug,
        title: e.title,
        current: { start: e.start_date, end: e.end_date },
        scrapeOk: e.scrape.ok,
        scrapeError: e.scrape.error || null,
        email: e.scrape.email,
        range2026: e.scrape.range2026 ? { start: e.scrape.range2026.start, end: e.scrape.range2026.end } : null,
        range2027: e.scrape.range2027 ? { start: e.scrape.range2027.start, end: e.scrape.range2027.end } : null,
        plan: e.plan,
      })),
    })),
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8')

  if (!APPLY) {
    const dateHits = enriched.filter((e) => e.plan.current || e.plan.extra2027).length
    const emailHits = enriched.filter((e) => e.scrape.email).length
    console.log(`Scanned ${enriched.length} conventions into ${groups.length} organizations`)
    console.log(`High-confidence date plans: ${dateHits}`)
    console.log(`Official emails found: ${emailHits}`)
    console.log(`Report: ${REPORT_PATH}`)
    console.log('Dry run only. Re-run with --apply to write live listings and org logins.')
    return
  }

  const now = new Date().toISOString()
  const handoff = []
  for (const group of groups) {
    const result = await applyGroup(admin, group, now)
    handoff.push(result.org)
    await sleep(250)
  }

  fs.writeFileSync(HANDOFF_JSON, JSON.stringify({ generatedAt: now, organizations: handoff }, null, 2), 'utf8')
  const lines = [
    '# ECKE organizer handoff',
    '',
    `Generated ${now}`,
    'Login: https://www.eastcoastkinkevents.com/auth/org/login',
    '',
    '| Organization | Username | Password | Recovery email | Email source | Org page |',
    '| --- | --- | --- | --- | --- | --- |',
  ]
  for (const org of handoff) {
    lines.push(
      `| ${org.name} | \`${org.username}\` | ${org.password ? `\`${org.password}\`` : 'already provisioned — password unchanged'} | \`${org.email}\` | ${org.emailSource} | ${org.organizationPage} |`,
    )
  }
  lines.push('')
  lines.push('Holding emails (`ecke-org-…@eastcoastkinkevents.com`) are placeholders until the owner claims the account. Do not present them as the organizer’s public contact.')
  fs.writeFileSync(HANDOFF_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Applied ${groups.length} organizations`)
  console.log(`Handoff: ${HANDOFF_MD}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
