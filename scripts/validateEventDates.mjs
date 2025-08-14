import { pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';

const EVENTS_PATH = path.resolve(process.cwd(), 'src/data/events.js');
const tmp = fs.readFileSync(EVENTS_PATH, 'utf8')
  .replace(/^export\s+const\s+events\s*=/m, 'export default ')
  .replace(/;?\s*$/, ';');

const TMP_PATH = path.resolve(process.cwd(), 'scripts/__events_tmp__.mjs');
fs.writeFileSync(TMP_PATH, tmp, 'utf8');
const { default: events } = await import(pathToFileURL(TMP_PATH));
fs.unlinkSync(TMP_PATH);

const YEAR_RE = /\b(19|20)\d{2}\b/g;
let bad = [];

for (const e of events) {
  const allowed = new Set([
    String(new Date(e.date.start).getUTCFullYear()),
    String(new Date(e.date.end).getUTCFullYear()),
  ]);
  const text = JSON.stringify(e);
  const years = text.match(YEAR_RE) || [];
  for (const y of years) {
    if (!allowed.has(y)) {
      bad.push({ slug: e.slug, year: y });
    }
  }
}

if (bad.length) {
  console.error('❌ Stale date(s) detected:');
  for (const b of bad) console.error(` - ${b.slug}: ${b.year}`);
  process.exit(1);
}
console.log('✅ Date validation passed.');
