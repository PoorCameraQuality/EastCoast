import { pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';

const EVENTS_PATH = path.resolve(process.cwd(), 'src/data/events.js');

// Load current events data
const tmp = fs.readFileSync(EVENTS_PATH, 'utf8')
  .replace(/^export\s+const\s+events\s*=/m, 'export default ')
  .replace(/;?\s*$/, ';');

const TMP_PATH = path.resolve(process.cwd(), 'scripts/__events_tmp__.mjs');
fs.writeFileSync(TMP_PATH, tmp, 'utf8');
const { default: events } = await import(pathToFileURL(TMP_PATH));
fs.unlinkSync(TMP_PATH);

console.log(`🔍 Found ${events.length} events to process...`);

// Helper function to standardize region names
function standardizeRegion(region) {
  if (!region) return '';
  
  const regionMap = {
    'NorthEastern': 'Northeastern',
    'North Eastern': 'Northeastern',
    'NorthEastern,': 'Northeastern',
    'Northern,': 'Northern',
    'Central,': 'Central',
    'Southeast,': 'Southeastern',
    'Eastern,': 'Eastern',
    'Southeast': 'Southeastern'
  };
  
  return regionMap[region] || region;
}

// Helper function to ensure all required fields exist
function ensureRequiredFields(event) {
  // Ensure excerpt exists
  if (!event.excerpt) {
    event.excerpt = `Join us for ${event.name} in ${event.location.city}, ${event.location.state}.`;
  }
  
  // Ensure longDescription exists
  if (!event.longDescription) {
    event.longDescription = event.excerpt;
  }
  
  // Ensure features array exists
  if (!event.features || !Array.isArray(event.features)) {
    event.features = [
      'Educational Workshops',
      'Community Building',
      'Safe Space Environment'
    ];
  }
  
  // Ensure SEO fields exist
  if (!event.seo) {
    event.seo = {};
  }
  if (!event.seo.title) {
    event.seo.title = `${event.name} - ${event.location.city}, ${event.location.state} BDSM Event | East Coast Kink Events`;
  }
  if (!event.seo.description) {
    event.seo.description = event.excerpt;
  }
  if (!event.seo.keywords) {
    event.seo.keywords = `${event.name.toLowerCase()}, ${event.location.city.toLowerCase()}, ${event.location.state.toLowerCase()}, BDSM event, kink community`;
  }
  
  return event;
}

// Helper function to fix stale dates in text
function fixStaleDates(text, event) {
  if (!text || typeof text !== 'string') return text;
  
  const currentYear = new Date(event.date.start).getFullYear();
  const currentDisplay = event.date.display;
  
  // Replace years that don't match the current event year
  let fixed = text.replace(/\b(19|20)\d{2}\b/g, (match) => {
    const year = parseInt(match);
    if (year === currentYear) return match;
    return currentDisplay;
  });
  
  // Replace date ranges that don't match current display
  const dateRangePattern = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:\s?[-–—]\s?(?:\d{1,2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t)?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}))?,?\s*(?:,?\s*(19|20)\d{2})?\b/g;
  
  fixed = fixed.replace(dateRangePattern, currentDisplay);
  
  return fixed;
}

// Process events
let processedEvents = [];
let duplicatesRemoved = 0;
let eventsFixed = 0;

for (let i = 0; i < events.length; i++) {
  const event = events[i];
  
  // Check if this is a duplicate of an already processed event
  const isDuplicate = processedEvents.find(existing => 
    existing.name === event.name || 
    existing.slug === event.slug ||
    (existing.name.includes('Master/slave Conference') && event.name.includes('Master/slave Conference'))
  );
  
  if (isDuplicate) {
    console.log(`🔄 Removing duplicate: ${event.name}`);
    duplicatesRemoved++;
    continue;
  }
  
  // Standardize region
  if (event.location && event.location.region) {
    event.location.region = standardizeRegion(event.location.region);
  }
  
  // Fix stale dates in all text fields
  if (event.excerpt) {
    event.excerpt = fixStaleDates(event.excerpt, event);
  }
  if (event.longDescription) {
    event.longDescription = fixStaleDates(event.longDescription, event);
  }
  if (event.seo?.title) {
    event.seo.title = fixStaleDates(event.seo.title, event);
  }
  if (event.seo?.description) {
    event.seo.description = fixStaleDates(event.seo.description, event);
  }
  if (event.seo?.keywords) {
    event.seo.keywords = fixStaleDates(event.seo.keywords, event);
  }
  
  // Ensure all required fields exist
  const standardizedEvent = ensureRequiredFields(event);
  processedEvents.push(standardizedEvent);
  eventsFixed++;
}

console.log(`\n📊 Cleanup Summary:`);
console.log(`   - Original events: ${events.length}`);
console.log(`   - Duplicates removed: ${duplicatesRemoved}`);
console.log(`   - Events processed: ${eventsFixed}`);
console.log(`   - Final count: ${processedEvents.length}`);

// Write cleaned events back to file
const newText = `// Events data with SEO optimization - Cleaned and standardized
export const events = ${JSON.stringify(processedEvents, null, 2)};

export const getEventBySlug = (slug) => {
  return events.find(event => event.slug === slug);
};

export const getAllEvents = () => {
  return events.sort((a, b) => new Date(a.date.start) - new Date(b.date.start));
};

export const getUpcomingEvents = () => {
  const today = new Date();
  return events
    .filter(event => new Date(event.date.start) >= today)
    .sort((a, b) => new Date(a.date.start) - new Date(b.date.start));
};

export const getPastEvents = () => {
  const today = new Date();
  return events
    .filter(event => new Date(event.date.end) < today)
    .sort((a, b) => new Date(b.date.start) - new Date(a.date.start));
};
`;

fs.writeFileSync(EVENTS_PATH, newText, 'utf8');

console.log(`\n✅ Events data cleaned and saved to ${EVENTS_PATH}`);
console.log(`\n🔍 Run 'npm run validate:dates' to verify no stale dates remain.`);
