const fs = require('fs');

function cleanEventData() {
  console.log('🧹 Processing scraped event data...');
  
  // Read the scraped data
  const scrapedData = JSON.parse(fs.readFileSync('scraped-events.json', 'utf8'));
  
  // Clean and process events
  const cleanedEvents = scrapedData.events
    .filter(event => {
      // Remove duplicates and empty events
      return event.title && 
             event.title !== 'Directory of kinky events' &&
             event.description &&
             event.link &&
             !event.link.includes('/cart');
    })
    .map((event, index) => {
      // Clean up the date
      let cleanDate = event.date
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Extract location from description if not present
      let location = event.location;
      if (!location && event.description) {
        const locationMatch = event.description.match(/([A-Z][a-z]+,\s*[A-Z]{2})/);
        if (locationMatch) {
          location = locationMatch[1];
        }
      }
      
      // Clean up description
      let cleanDescription = event.description
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Determine category based on description
      let category = 'Event';
      if (cleanDescription.toLowerCase().includes('workshop')) category = 'Workshop';
      else if (cleanDescription.toLowerCase().includes('party')) category = 'Party';
      else if (cleanDescription.toLowerCase().includes('munch')) category = 'Munch';
      else if (cleanDescription.toLowerCase().includes('conference')) category = 'Conference';
      else if (cleanDescription.toLowerCase().includes('meetup')) category = 'Meetup';
      
      return {
        id: index + 1,
        title: event.title.trim(),
        date: cleanDate,
        location: location,
        description: cleanDescription,
        link: event.link,
        category: category,
        scrapedAt: event.scrapedAt
      };
    })
    .filter((event, index, array) => {
      // Remove exact duplicates
      return array.findIndex(e => 
        e.title === event.title && 
        e.date === event.date && 
        e.description === event.description
      ) === index;
    });

  console.log(`✅ Cleaned ${cleanedEvents.length} events from ${scrapedData.events.length} scraped events`);

  // Save cleaned data
  const cleanedData = {
    events: cleanedEvents,
    processedAt: new Date().toISOString(),
    originalCount: scrapedData.events.length,
    cleanedCount: cleanedEvents.length
  };

  fs.writeFileSync('cleaned-events.json', JSON.stringify(cleanedData, null, 2));
  console.log('💾 Saved cleaned data to cleaned-events.json');

  // Display sample of cleaned events
  if (cleanedEvents.length > 0) {
    console.log('\n📋 Sample of cleaned events:');
    cleanedEvents.slice(0, 5).forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Date: ${event.date}`);
      console.log(`  Location: ${event.location}`);
      console.log(`  Category: ${event.category}`);
      console.log(`  Description: ${event.description.substring(0, 100)}...`);
    });
  }

  return cleanedData;
}

// Run the processor
cleanEventData(); 