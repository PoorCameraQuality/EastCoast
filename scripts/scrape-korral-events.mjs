import { writeFileSync } from 'node:fs'

const LIST_URL = 'https://www.thekorral.com/events.php'
const YEAR = 2026
const MONTHS = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11,
  dec: 12, december: 12,
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseListDate(label) {
  const match = String(label).trim().match(/^([A-Za-z]+)\s+(\d{1,2})$/)
  if (!match) return null
  const month = MONTHS[match[1].toLowerCase()]
  if (!month) return null
  const day = String(match[2]).padStart(2, '0')
  return `${YEAR}-${String(month).padStart(2, '0')}-${day}`
}

function parseClock(value) {
  const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
  if (!match) return null
  let hour = Number(match[1])
  const minute = match[2] || '00'
  const mer = match[3].toUpperCase()
  if (mer === 'PM' && hour < 12) hour += 12
  if (mer === 'AM' && hour === 12) hour = 0
  return `${String(hour).padStart(2, '0')}:${minute}`
}

function classify(title) {
  const text = title.toLowerCase()
  if (/kink night|wax play|class|workshop|intensive/.test(text)) return { event_type: 'class', category: 'Class' }
  if (/karaoke|munch/.test(text)) return { event_type: 'social', category: 'Social' }
  return { event_type: 'play_party', category: 'Play party' }
}

function slugify(title, id) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return `korral-${id}-${base || 'event'}`
}

const listHtml = await (await fetch(LIST_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
const listRe = /event_description\.php\?event=(\d+)[\s\S]*?src="([^"]+)"[\s\S]*?box-menu-item__label">([^<]+)</g
const listed = []
for (const match of listHtml.matchAll(listRe)) {
  listed.push({
    sourceId: match[1],
    banner: match[2].replace(/ /g, '%20'),
    dateLabel: match[3].trim(),
    startDate: parseListDate(match[3].trim()),
  })
}

const events = []
for (const item of listed) {
  const url = `https://www.thekorral.com/event_description.php?event=${item.sourceId}`
  const html = await (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
  const col = html.match(/<div class="col col-sm col-md-8">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/)
  const block = col?.[1] || ''
  const headings = [...block.matchAll(/<h3>([\s\S]*?)<\/h3>/g)].map((m) => decodeHtml(m[1]))
  const timeLine = decodeHtml(block.match(/<h4>([\s\S]*?)<\/h4>/g)?.find((h) => /AM|PM/.test(h)) || '')
  const title = headings.find((h) => !/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i.test(h)) || headings[0] || `Korral event ${item.sourceId}`
  const times = timeLine.match(/(\d{1,2}(?::\d{2})?\s*[AP]M)\s*-\s*(\d{1,2}(?::\d{2})?\s*[AP]M)/i)
  const prices = [...html.matchAll(/<div class="bg-accent price-box mt-2">([\s\S]*?)<\/div>/g)].map((m) => decodeHtml(m[1]))
  const office = decodeHtml(html.match(/<div class=" price-box mt-2">([\s\S]*?)<\/div>/)?.[1] || '')
  const paragraphs = [...block.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => decodeHtml(m[1])).filter(Boolean)
  const longDescription = paragraphs.join('\n\n')
  const kind = classify(title)
  const startTime = times ? parseClock(times[1]) : '19:00'
  const endTime = times ? parseClock(times[2]) : '02:00'
  events.push({
    ...item,
    title,
    url,
    ticketUrl: `https://www.thekorral.com/event-purchase.php?id_event=${item.sourceId}`,
    startTime,
    endTime,
    timeDisplay: timeLine || '7:00 PM - 2:00 AM',
    prices: prices[0] || '',
    officeNote: office,
    longDescription,
    shortDescription: (paragraphs[0] || `${title} at The Korral in Spring Grove, PA.`).slice(0, 220),
    ...kind,
    slug: slugify(title, item.sourceId),
  })
  await new Promise((r) => setTimeout(r, 150))
}

writeFileSync(new URL('../tmp-korral-events.json', import.meta.url), JSON.stringify(events, null, 2))
console.log(`scraped ${events.length} events`)
for (const event of events) {
  console.log(`${event.sourceId} ${event.startDate} ${event.slug} :: ${event.title}`)
}
