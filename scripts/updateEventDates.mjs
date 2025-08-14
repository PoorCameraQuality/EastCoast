import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust if your data files live elsewhere:
const EVENTS_PATH = path.resolve(__dirname, '../src/data/events.js');

// --- Helpers ---
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function toDisplay(startISO, endISO) {
  const s = new Date(startISO);
  const e = endISO ? new Date(endISO) : null;

  const sMon = monthNames[s.getUTCMonth()];
  const sDay = s.getUTCDate();
  const sYear = s.getUTCFullYear();

  if (!e || startISO === endISO) return `${sMon} ${sDay}, ${sYear}`;

  const eMon = monthNames[e.getUTCMonth()];
  const eDay = e.getUTCDate();
  const eYear = e.getUTCFullYear();

  // Same month & year: "May 7-11, 2027"
  if (s.getUTCFullYear() === eYear && s.getUTCMonth() === e.getUTCMonth()) {
    return `${sMon} ${sDay}-${eDay}, ${sYear}`;
  }
  // Different month but same year: "Aug 26-Sep 1, 2027"
  if (sYear === eYear) {
    return `${sMon} ${sDay}-${eMon} ${eDay}, ${sYear}`;
  }
  // Different years: "Dec 30, 2026-Jan 2, 2027"
  return `${sMon} ${sDay}, ${sYear}-${eMon} ${eDay}, ${eYear}`;
}

// Very conservative date-ish matchers
const YEAR_RE = /\b(19|20)\d{2}\b/g;
const RANGE_RE = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:\s?[-–—]\s?(?:\d{1,2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}))?,?\s*(?:,?\s*(19|20)\d{2})?\b/g;

function rewriteProseDates(str, newDisplay, newYears) {
  if (!str || typeof str !== 'string') return str;
  // Replace complex ranges first
  let out = str.replace(RANGE_RE, newDisplay);
  // Then any year not in the newYears set is likely stale — replace entire token with the display
  out = out.replace(YEAR_RE, (y) => (newYears.has(y) ? y : newDisplay));
  return out;
}

async function run() {
  const slug = process.argv[2];         // e.g., "primal-arts-festival"
  const start = process.argv[3];        // e.g., "2027-05-06"
  const end   = process.argv[4] || null;// e.g., "2027-05-10"

  if (!slug || !start) {
    console.error('Usage: node updateEventDates.mjs <slug> <startISO> [endISO]');
    process.exit(1);
  }

  let source = fs.readFileSync(EVENTS_PATH, 'utf8');

  // Create a temporary loader to read the data array at runtime:
  const TMP_PATH = path.resolve(__dirname, './__events_tmp__.mjs');
  const wrapped = source
    .replace(/^export\s+const\s+events\s*=/m, 'export default ')
    .replace(/;?\s*$/, ';'); // ensure semicolon

  fs.writeFileSync(TMP_PATH, wrapped, 'utf8');
  const { default: events } = await import(pathToFileURL(TMP_PATH));
  fs.unlinkSync(TMP_PATH);

  const idx = events.findIndex(e => e.slug === slug);
  if (idx === -1) {
    console.error(`Event with slug "${slug}" not found.`);
    process.exit(1);
  }

  const ev = events[idx];
  const newDisplay = toDisplay(start, end ?? start);
  const newYears = new Set([ String(new Date(start).getUTCFullYear()) ]);
  if (end) newYears.add(String(new Date(end).getUTCFullYear()));

  // Update authoritative fields
  ev.date.start = start;
  ev.date.end = end ?? start;
  ev.date.display = newDisplay;

  // Rewrite prose & SEO strings
  const fieldsToRewrite = ['excerpt', 'longDescription'];
  fieldsToRewrite.forEach(f => { ev[f] = rewriteProseDates(ev[f], newDisplay, newYears); });

  if (ev.seo?.title)       ev.seo.title       = rewriteProseDates(ev.seo.title, newDisplay, newYears);
  if (ev.seo?.description) ev.seo.description = rewriteProseDates(ev.seo.description, newDisplay, newYears);
  if (ev.seo?.keywords)    ev.seo.keywords    = rewriteProseDates(ev.seo.keywords, newDisplay, newYears);

  // Write file back (simple stringify; keep your own prettier/eslint to format)
  const newText =
`// Events data with SEO optimization
export const events = ${JSON.stringify(events, null, 2)};
`;
  fs.writeFileSync(EVENTS_PATH, newText, 'utf8');

  // Post-update stale scan (simple alerting)
  const staleHits = [];
  const stringified = JSON.stringify(ev);
  const yearMatches = stringified.match(YEAR_RE) || [];
  yearMatches.forEach(y => {
    if (!newYears.has(y)) staleHits.push(y);
  });

  if (staleHits.length) {
    console.warn('⚠ Potential stale years still present in this event:', [...new Set(staleHits)].join(', '));
  } else {
    console.log(`✅ Updated "${ev.name}" to ${newDisplay} and rewrote embedded dates.`);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
