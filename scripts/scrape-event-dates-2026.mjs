/**
 * Scrape event websites for 2026 date ranges and (optionally) update src/data/events.js.
 *
 * Goals:
 * - Be conservative: only auto-update when we find a clear, unambiguous 2026 date range.
 * - Be polite: low concurrency, timeouts, user-agent, and short backoff delay.
 * - Be idempotent: re-running without changes should produce no diffs.
 *
 * Usage:
 *   node scripts/scrape-event-dates-2026.mjs
 *   node scripts/scrape-event-dates-2026.mjs --apply
 *   node scripts/scrape-event-dates-2026.mjs --apply --minScore 6 --limit 25
 */

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const EVENTS_PATH = path.resolve(process.cwd(), 'src/data/events.js')
const OUT_DIR = path.resolve(process.cwd(), 'scripts/out')
const OUT_PATH = path.resolve(OUT_DIR, 'event-date-scan-2026.json')

const argv = process.argv.slice(2)
const APPLY = argv.includes('--apply')
const LIMIT = getNumberArg('--limit', null)
const MIN_SCORE = getNumberArg('--minScore', 7)
const CONCURRENCY = getNumberArg('--concurrency', 3)

const TIMEOUT_MS = 12000
const DELAY_MS = 400
const YEAR = 2026
const USER_AGENT = 'EastCoastKinkEventsBot/1.0 (+https://www.eastcoastkinkevents.com)'

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

function getNumberArg(name, fallback) {
  const idx = argv.findIndex((a) => a === name)
  if (idx === -1) return fallback
  const raw = argv[idx + 1]
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) ? n : fallback
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function toDisplay(startISO, endISO) {
  const s = new Date(startISO)
  const e = endISO ? new Date(endISO) : null

  const sMon = monthNames[s.getUTCMonth()]
  const sDay = s.getUTCDate()
  const sYear = s.getUTCFullYear()

  if (!e || startISO === endISO) return `${sMon} ${sDay}, ${sYear}`

  const eMon = monthNames[e.getUTCMonth()]
  const eDay = e.getUTCDate()
  const eYear = e.getUTCFullYear()

  if (sYear === eYear && s.getUTCMonth() === e.getUTCMonth()) return `${sMon} ${sDay}-${eDay}, ${sYear}`
  if (sYear === eYear) return `${sMon} ${sDay}-${eMon} ${eDay}, ${sYear}`
  return `${sMon} ${sDay}, ${sYear}-${eMon} ${eDay}, ${eYear}`
}

function normalizeTextFromHtml(html) {
  if (!html) return ''
  // Drop scripts/styles to reduce noise and false matches.
  let out = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
  out = out.replace(/\s+/g, ' ').trim()
  return out
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!m) return null
  return normalizeTextFromHtml(m[1])
}

function clampDay(d) {
  return Math.max(1, Math.min(31, d))
}

function isoDate(y, m0, d) {
  const mm = String(m0 + 1).padStart(2, '0')
  const dd = String(clampDay(d)).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function parseMonthWord(word) {
  const key = String(word || '').toLowerCase()
  return monthMap.has(key) ? monthMap.get(key) : null
}

/**
 * Parse a month-name range containing a 2026 year:
 * Examples:
 * - "Feb 6-8, 2026"
 * - "February 6 – 8 2026"
 * - "Aug 26-Sep 1, 2026"
 */
function parseMonthNameRange(raw) {
  const s = raw
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

  // Pattern A: "Mon 6-8, 2026" or "Mon 6, 2026"
  // Pattern B: "Mon 6-Mon 8, 2026" (cross-month)
  const re = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:\s*-\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{1,2}))?\s*,?\s*(20\d{2})\b/i
  const m = s.match(re)
  if (!m) return null

  const m1 = parseMonthWord(m[1])
  const d1 = Number(m[2])
  const m2 = m[3] ? parseMonthWord(m[3]) : m1
  const d2 = m[4] ? Number(m[4]) : d1
  const y = Number(m[5])
  if (!Number.isFinite(y) || y !== YEAR) return null
  if (m1 == null || m2 == null || !Number.isFinite(d1) || !Number.isFinite(d2)) return null

  const start = isoDate(y, m1, d1)
  const end = isoDate(y, m2, d2)
  return { start, end }
}

/**
 * Parse numeric ranges that include year 2026.
 * Examples:
 * - "2/6/2026" "02/06/2026"
 * - "2/6-2/8/2026"
 * - "02/06 - 02/08/2026"
 */
function parseNumericRange(raw) {
  const s = raw.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()
  const re = /\b(\d{1,2})[\/\-](\d{1,2})(?:\s*-\s*(\d{1,2})[\/\-](\d{1,2}))?[\/\-](20\d{2})\b/
  const m = s.match(re)
  if (!m) return null
  const m1 = Number(m[1]) - 1
  const d1 = Number(m[2])
  const m2 = m[3] ? Number(m[3]) - 1 : m1
  const d2 = m[4] ? Number(m[4]) : d1
  const y = Number(m[5])
  if (y !== YEAR) return null
  if (![m1, m2, d1, d2].every(Number.isFinite)) return null
  if (m1 < 0 || m1 > 11 || m2 < 0 || m2 > 11) return null
  return { start: isoDate(y, m1, d1), end: isoDate(y, m2, d2) }
}

function uniqKey(range) {
  return `${range.start}..${range.end}`
}

function scoreCandidate({ range, raw, inTitle }) {
  let score = 0
  if (range.start.startsWith(`${YEAR}-`)) score += 4
  if (range.end.startsWith(`${YEAR}-`)) score += 2
  if (inTitle) score += 3
  // Bonus for month-name ranges (usually more likely to be the headline event date).
  if (/[A-Za-z]/.test(raw)) score += 2
  // Penalize overly long raw strings (often schedule blocks).
  if (raw.length > 40) score -= 1
  return score
}

function findCandidates(html) {
  const title = extractTitle(html) || ''
  const text = normalizeTextFromHtml(html)
  const candidates = []

  // Month-name matches: we scan both title and text.
  const monthRe = new RegExp(
    String.raw`\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:\s*[-–—]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{1,2})?\s*,?\s*20\d{2}\b`,
    'gi'
  )

  const numericRe = /\b\d{1,2}[\/\-]\d{1,2}(?:\s*[-–—]\s*\d{1,2}[\/\-]\d{1,2})?[\/\-]20\d{2}\b/g

  for (const [source, inTitle] of [
    [title, true],
    [text, false],
  ]) {
    if (!source) continue

    let m
    monthRe.lastIndex = 0
    while ((m = monthRe.exec(source))) {
      const raw = m[0]
      const parsed = parseMonthNameRange(raw)
      if (!parsed) continue
      candidates.push({ raw, range: parsed, inTitle, score: scoreCandidate({ range: parsed, raw, inTitle }) })
    }

    while ((m = numericRe.exec(source))) {
      const raw = m[0]
      const parsed = parseNumericRange(raw)
      if (!parsed) continue
      candidates.push({ raw, range: parsed, inTitle, score: scoreCandidate({ range: parsed, raw, inTitle }) })
    }
  }

  return candidates
}

async function fetchHtml(url) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })
    const ct = res.headers.get('content-type') || ''
    if (!res.ok) {
      return { ok: false, status: res.status, contentType: ct, html: null, error: `HTTP ${res.status}` }
    }
    if (!ct.includes('text/html') && !ct.includes('application/xhtml+xml')) {
      // still try reading; many hosts mislabel
    }
    const html = await res.text()
    return { ok: true, status: res.status, contentType: ct, html, error: null }
  } catch (e) {
    return { ok: false, status: null, contentType: null, html: null, error: String(e?.message || e) }
  } finally {
    clearTimeout(t)
  }
}

function chooseBest(candidates) {
  if (!candidates.length) return { best: null, reason: 'no_candidates' }

  // Collapse identical ranges, accumulate max score and evidence.
  const byRange = new Map()
  for (const c of candidates) {
    const k = uniqKey(c.range)
    const prev = byRange.get(k)
    if (!prev) {
      byRange.set(k, { range: c.range, score: c.score, raws: [c.raw] })
    } else {
      prev.score = Math.max(prev.score, c.score)
      if (prev.raws.length < 5) prev.raws.push(c.raw)
    }
  }

  const collapsed = Array.from(byRange.values()).sort((a, b) => b.score - a.score)
  const top = collapsed[0]
  const runnerUp = collapsed[1]

  // Conservative acceptance: must clear threshold and be meaningfully better than runner-up.
  if (top.score < MIN_SCORE) return { best: null, reason: 'low_score', top }
  if (runnerUp && top.score === runnerUp.score && uniqKey(top.range) !== uniqKey(runnerUp.range)) {
    return { best: null, reason: 'ambiguous', top, runnerUp }
  }

  return { best: top, reason: 'ok' }
}

async function loadEvents() {
  const src = fs.readFileSync(EVENTS_PATH, 'utf8')
  const tmp = src.replace(/^export\s+const\s+events\s*=/m, 'export default ').replace(/;?\s*$/, ';')
  const TMP_PATH = path.resolve(process.cwd(), 'scripts/__events_tmp__.mjs')
  fs.writeFileSync(TMP_PATH, tmp, 'utf8')
  const { default: events } = await import(pathToFileURL(TMP_PATH))
  fs.unlinkSync(TMP_PATH)
  return events
}

function rewriteProseDates(str, newDisplay, newYears) {
  if (!str || typeof str !== 'string') return str
  const YEAR_RE = /\b(19|20)\d{2}\b/g
  const RANGE_RE = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:\s?[-–—]\s?(?:\d{1,2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}))?,?\s*(?:,?\s*(19|20)\d{2})?\b/g
  let out = str.replace(RANGE_RE, newDisplay)
  out = out.replace(YEAR_RE, (y) => (newYears.has(y) ? y : newDisplay))
  return out
}

function applyUpdate(ev, start, end) {
  const newDisplay = toDisplay(start, end)
  const newYears = new Set([String(new Date(start).getUTCFullYear()), String(new Date(end).getUTCFullYear())])

  ev.date.start = start
  ev.date.end = end
  ev.date.display = newDisplay

  const fieldsToRewrite = ['excerpt', 'longDescription']
  for (const f of fieldsToRewrite) ev[f] = rewriteProseDates(ev[f], newDisplay, newYears)
  if (ev.seo?.title) ev.seo.title = rewriteProseDates(ev.seo.title, newDisplay, newYears)
  if (ev.seo?.description) ev.seo.description = rewriteProseDates(ev.seo.description, newDisplay, newYears)
  if (ev.seo?.keywords) ev.seo.keywords = rewriteProseDates(ev.seo.keywords, newDisplay, newYears)
}

function writeEvents(events) {
  const newText = `// Events data with SEO optimization\nexport const events = ${JSON.stringify(events, null, 2)};\n`
  fs.writeFileSync(EVENTS_PATH, newText, 'utf8')
}

async function run() {
  const events = await loadEvents()
  const targets = events.filter((e) => e?.website && typeof e.website === 'string')
  const subset = LIMIT ? targets.slice(0, LIMIT) : targets

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const results = []
  let idx = 0

  async function worker() {
    while (idx < subset.length) {
      const i = idx++
      const ev = subset[i]
      const url = ev.website

      // simple politeness delay between requests per worker
      await sleep(DELAY_MS)

      const fetched = await fetchHtml(url)
      if (!fetched.ok || !fetched.html) {
        results.push({
          slug: ev.slug,
          name: ev.name,
          website: url,
          ok: false,
          error: fetched.error,
          status: fetched.status,
        })
        continue
      }

      const candidates = findCandidates(fetched.html)
      const decision = chooseBest(candidates)
      const current = { start: ev.date?.start, end: ev.date?.end, display: ev.date?.display }

      const update =
        decision.best &&
        (decision.best.range.start !== current.start || decision.best.range.end !== current.end)
          ? { start: decision.best.range.start, end: decision.best.range.end, display: toDisplay(decision.best.range.start, decision.best.range.end) }
          : null

      results.push({
        slug: ev.slug,
        name: ev.name,
        website: url,
        ok: true,
        status: fetched.status,
        contentType: fetched.contentType,
        current,
        decision: {
          reason: decision.reason,
          best: decision.best
            ? { score: decision.best.score, range: decision.best.range, evidence: decision.best.raws }
            : null,
          top: decision.top ? { score: decision.top.score, range: decision.top.range, evidence: decision.top.raws } : null,
          runnerUp: decision.runnerUp
            ? { score: decision.runnerUp.score, range: decision.runnerUp.range, evidence: decision.runnerUp.raws }
            : null,
        },
        update,
      })
    }
  }

  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, () => worker())
  await Promise.all(workers)

  // Write report
  results.sort((a, b) => a.slug.localeCompare(b.slug))
  fs.writeFileSync(OUT_PATH, JSON.stringify({ year: YEAR, minScore: MIN_SCORE, apply: APPLY, results }, null, 2), 'utf8')

  const proposed = results.filter((r) => r.update)
  const applied = []

  if (APPLY && proposed.length) {
    const bySlug = new Map(events.map((e) => [e.slug, e]))
    for (const r of proposed) {
      const ev = bySlug.get(r.slug)
      if (!ev) continue
      // Only apply if decision was ok (not ambiguous/low_score)
      if (r.decision?.reason !== 'ok' || !r.update) continue
      applyUpdate(ev, r.update.start, r.update.end)
      applied.push(r.slug)
    }
    if (applied.length) writeEvents(events)
  }

  // Console summary (high-signal)
  const ok = results.filter((r) => r.ok).length
  const fail = results.length - ok
  const okUpdates = proposed.filter((r) => r.decision?.reason === 'ok').length
  console.log(`Scanned ${results.length} event website(s): ${ok} ok, ${fail} failed`)
  console.log(`Proposed updates (any): ${proposed.length} | High-confidence (reason=ok): ${okUpdates}`)
  console.log(`Report: ${path.relative(process.cwd(), OUT_PATH)}`)
  if (APPLY) console.log(`Applied updates: ${applied.length}`)
  if (!APPLY) console.log('Dry run only. Re-run with --apply to write updates to src/data/events.js')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

