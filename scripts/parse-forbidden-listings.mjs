/**
 * Parse Forbidden Tickets-style paste (title, venue, organizer, date lines, optional "Current").
 * Filters: drop cancelled; drop membership/ticket-window style (heuristic); drop obvious online-only.
 * Outputs JSON array of { title, venue, organizer, datesText, inPerson }.
 *
 * Usage:
 *   node parse-forbidden-listings.mjs <paste.txt> [out.json]
 * Stdin (UTF-8):
 *   Get-Content .\paste.txt -Raw | node parse-forbidden-listings.mjs - .\out.json
 */
import fs from "fs";

const inputPath = process.argv[2] || "forbidden-listings-paste.txt";
const raw =
  inputPath === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(inputPath, "utf8");
const lines = raw.split(/\r?\n/).map((l) => l.trimEnd());

const dayRe = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/;

function isDateLine(s) {
  return dayRe.test(s.trim());
}

function isCancelledBlock(title, venue, org) {
  const t = `${title} ${venue} ${org}`.toLowerCase();
  return (
    /^cancelled!?\s*$/i.test(title.trim()) ||
    /^canceled\b/i.test(title.trim()) ||
    /\bcancelled\b/i.test(title) ||
    /\bcanceled\b/i.test(title)
  );
}

function isOnlineOnly(venue, title) {
  const v = venue.toLowerCase();
  const t = title.toLowerCase();
  if (/\bzoom\b/i.test(v) || /\bzoom\b/i.test(t)) return true;
  if (/\bonline only\b/i.test(v) || /^online\b/i.test(v)) return true;
  if (/\bvirtual\b/i.test(v) && !/\bin person\b/i.test(v)) return true;
  return false;
}

function isMembershipWindow(title, venue) {
  const t = title.toLowerCase();
  if (/\bmembership\b/i.test(t) && /\b20\d\d\b/.test(t)) return true;
  if (/\bwwmm lodging\b/i.test(t)) return false; // real event
  return false;
}

const records = [];
let i = 0;

while (i < lines.length) {
  let line = lines[i];
  if (!line || line === "Current") {
    i++;
    continue;
  }

  // Skip orphan "All the..." instruction line
  if (/^all the inperson events$/i.test(line)) {
    i++;
    continue;
  }

  let title = line;
  i++;

  if (i >= lines.length) break;

  let explicitCancelled = /^cancelled!?\s*$/i.test(title.trim());
  // "Cancelled!" on its own line, then real title
  if (explicitCancelled && lines[i] && !isDateLine(lines[i])) {
    title = lines[i];
    i++;
  }

  if (i >= lines.length) break;
  let venue = lines[i++];
  if (i >= lines.length) break;
  let organizer = lines[i++];

  const dateLines = [];
  while (i < lines.length && isDateLine(lines[i])) {
    dateLines.push(lines[i++].trim());
  }
  if (lines[i] === "Current") i++;

  if (!title || !venue || !organizer) continue;
  if (explicitCancelled || isCancelledBlock(title, venue, organizer)) continue;
  if (isMembershipWindow(title, venue)) continue;
  if (isOnlineOnly(venue, title)) continue;

  const datesText = dateLines.join(" | ");
  records.push({
    title: title.replace(/\s+/g, " ").trim(),
    venue: venue.replace(/\s+/g, " ").trim(),
    organizer: organizer.replace(/\s+/g, " ").trim(),
    datesText,
    inPerson: true,
  });
}

// Dedupe: same title + venue + organizer + dates
const key = (r) =>
  [r.title.toLowerCase(), r.venue.toLowerCase(), r.organizer.toLowerCase(), r.datesText.toLowerCase()].join("||");
const seen = new Set();
const deduped = [];
for (const r of records) {
  const k = key(r);
  if (seen.has(k)) continue;
  seen.add(k);
  deduped.push(r);
}

const outPath = process.argv[3] || "forbidden-inperson-parsed.json";
fs.writeFileSync(outPath, JSON.stringify(deduped, null, 2), "utf8");
console.error(`Parsed ${records.length} blocks, ${deduped.length} after dedupe -> ${outPath}`);
