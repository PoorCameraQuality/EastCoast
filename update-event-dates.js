const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load current events data
const eventsDataPath = path.join(__dirname, 'src', 'data', 'events.js');
const eventsData = require('./src/data/events.js');

// Event website scraping configurations
const eventScrapers = {
  'primal-arts': {
    url: 'https://smsprimalarts.com/',
    selectors: [
      'h1, h2, h3', // Look for headings that might contain dates
      '.event-date, .date, .event-info', // Common date class names
      'p', // Paragraphs that might contain date info
    ],
    datePatterns: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
    ],
    keywords: ['2026', '2025', 'primal', 'arts', 'event', 'conference']
  },
  'dark-odyssey': {
    url: 'https://darkodyssey.com/',
    selectors: [
      'h1, h2, h3',
      '.event-date, .date, .event-info',
      'p',
    ],
    datePatterns: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
    ],
    keywords: ['2026', '2025', 'dark', 'odyssey', 'event', 'conference']
  },
  'crucible-con': {
    url: 'https://www.cruciblecon.com/',
    selectors: [
      'h1, h2, h3',
      '.event-date, .date, .event-info',
      'p',
    ],
    datePatterns: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
    ],
    keywords: ['2026', '2025', 'crucible', 'con', 'event', 'conference']
  },
  'frolicon': {
    url: 'https://frolicon.com/',
    selectors: [
      'h1, h2, h3',
      '.event-date, .date, .event-info',
      'p',
    ],
    datePatterns: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
    ],
    keywords: ['2026', '2025', 'frolicon', 'event', 'conference']
  },
  'kinky-kollege': {
    url: 'https://kinkykollege.com/',
    selectors: [
      'h1, h2, h3',
      '.event-date, .date, .event-info',
      'p',
    ],
    datePatterns: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
    ],
    keywords: ['2026', '2025', 'kinky', 'kollege', 'event', 'conference']
  },
  'master-slave-conference': {
    url: 'https://masterslaveconference.org/',
    selectors: [
      'h1, h2, h3',
      '.event-date, .date, .event-info',
      'p',
    ],
    datePatterns: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
    ],
    keywords: ['2026', '2025', 'master', 'slave', 'conference', 'event']
  },
  'fornucopia': {
    url: 'https://www.fornucopiaevent.com/',
    selectors: [
      'h1, h2, h3',
      '.event-date, .date, .event-info',
      'p',
    ],
    datePatterns: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
    ],
    keywords: ['2026', '2025', 'fornucopia', 'event', 'conference']
  }
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Helper function to extract dates from text
function extractDates(text, patterns) {
  const dates = [];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      dates.push(...matches);
    }
  });
  
  return [...new Set(dates)]; // Remove duplicates
}

// Helper function to parse date strings
function parseDate(dateStr) {
  try {
    // Try different date formats
    const formats = [
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})/, // "January 15, 2026"
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // "1/15/2026"
      /(\d{4})-(\d{2})-(\d{2})/, // "2026-01-15"
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format.source.includes('\\w+')) {
          // Month name format
          const monthNames = {
            'january': 0, 'february': 1, 'march': 2, 'april': 3,
            'may': 4, 'june': 5, 'july': 6, 'august': 7,
            'september': 8, 'october': 9, 'november': 10, 'december': 11
          };
          const month = monthNames[match[1].toLowerCase()];
          const day = parseInt(match[2]);
          const year = parseInt(match[3]);
          return new Date(year, month, day);
        } else if (format.source.includes('\\d{4}-\\d{2}-\\d{2}')) {
          // ISO format
          return new Date(match[1], match[2] - 1, match[3]);
        } else {
          // MM/DD/YYYY format
          return new Date(match[3], match[1] - 1, match[2]);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return null;
  }
}

// Main scraping function
async function scrapeEventWebsite(eventSlug, config) {
  try {
    console.log(`\n🔍 Scraping ${eventSlug} at ${config.url}`);
    
    const html = await makeRequest(config.url);
    
    // Simple text extraction (basic approach)
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Extract dates
    const dates = extractDates(text, config.datePatterns);
    
    console.log(`📅 Found ${dates.length} potential dates:`);
    dates.forEach(date => console.log(`   - ${date}`));
    
    // Look for keywords that might indicate new events
    const keywordMatches = config.keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    console.log(`🔑 Found keywords: ${keywordMatches.join(', ')}`);
    
    return {
      dates,
      keywordMatches,
      text: text.substring(0, 500) + '...' // First 500 chars for review
    };
    
  } catch (error) {
    console.error(`❌ Error scraping ${eventSlug}:`, error.message);
    return null;
  }
}

// Function to update events data
function updateEventData(eventSlug, newDates) {
  const events = eventsData.getAllEvents();
  const event = events.find(e => e.slug === eventSlug);
  
  if (!event) {
    console.log(`⚠️  Event ${eventSlug} not found in current data`);
    return false;
  }
  
  // Parse the most recent date that's in the future
  const futureDates = newDates
    .map(dateStr => parseDate(dateStr))
    .filter(date => date && date > new Date())
    .sort((a, b) => a - b);
  
  if (futureDates.length === 0) {
    console.log(`⚠️  No future dates found for ${eventSlug}`);
    return false;
  }
  
  const newStartDate = futureDates[0];
  const newEndDate = futureDates[futureDates.length - 1];
  
  // Format dates for display
  const formatDate = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  const newDateDisplay = newStartDate.getTime() === newEndDate.getTime() 
    ? formatDate(newStartDate)
    : `${formatDate(newStartDate)} - ${formatDate(newEndDate)}`;
  
  // Update the event data
  event.date = {
    start: newStartDate.toISOString().split('T')[0],
    end: newEndDate.toISOString().split('T')[0],
    display: newDateDisplay
  };
  
  console.log(`✅ Updated ${eventSlug} dates to: ${newDateDisplay}`);
  return true;
}

// Main execution function
async function main() {
  console.log('🚀 Starting event date update process...\n');
  
  const results = [];
  let hasUpdates = false;
  
  // Scrape each event website
  for (const [eventSlug, config] of Object.entries(eventScrapers)) {
    const result = await scrapeEventWebsite(eventSlug, config);
    
    if (result && result.dates.length > 0) {
      const updated = updateEventData(eventSlug, result.dates);
      if (updated) {
        hasUpdates = true;
      }
      
      results.push({
        eventSlug,
        dates: result.dates,
        keywordMatches: result.keywordMatches,
        updated
      });
    } else {
      results.push({
        eventSlug,
        dates: [],
        keywordMatches: [],
        updated: false
      });
    }
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save updated data if there were changes
  if (hasUpdates) {
    try {
      // Read the current events.js file
      const currentContent = fs.readFileSync(eventsDataPath, 'utf8');
      
      // Create backup
      const backupPath = eventsDataPath.replace('.js', `.backup.${Date.now()}.js`);
      fs.writeFileSync(backupPath, currentContent);
      console.log(`\n💾 Backup created: ${backupPath}`);
      
      // Generate new content
      const events = eventsData.getAllEvents();
      const newContent = `// Auto-generated event data
// Last updated: ${new Date().toISOString()}

export const events = ${JSON.stringify(events, null, 2)};

export function getAllEvents() {
  return events;
}

export function getEventBySlug(slug) {
  return events.find(event => event.slug === slug);
}

export function getEventsByCategory(category) {
  return events.filter(event => event.category === category);
}

export function generateEventSEO(event) {
  return {
    title: \`\${event.name} - East Coast Kink Events\`,
    description: event.excerpt,
    keywords: [event.name, event.category, event.location.city, event.location.state, 'kink events', 'BDSM events'].join(', '),
    openGraph: {
      title: \`\${event.name} - East Coast Kink Events\`,
      description: event.excerpt,
      images: event.logo ? [event.logo] : []
    }
  };
}
`;
      
      fs.writeFileSync(eventsDataPath, newContent);
      console.log(`✅ Updated events data saved to ${eventsDataPath}`);
      
    } catch (error) {
      console.error('❌ Error saving updated data:', error);
    }
  } else {
    console.log('\n📝 No updates were made to the events data.');
  }
  
  // Print summary
  console.log('\n📊 Summary:');
  results.forEach(result => {
    const status = result.updated ? '✅ Updated' : '⏭️  No changes';
    console.log(`${status} ${result.eventSlug}: ${result.dates.length} dates found`);
  });
  
  console.log('\n🎉 Event date update process completed!');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, scrapeEventWebsite, updateEventData };
