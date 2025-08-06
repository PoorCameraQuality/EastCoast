const fs = require('fs');

// Function to update events data
function updateEventsData() {
  console.log('🔄 Updating events data...');
  
  // Read current cleaned data
  let cleanedData;
  try {
    cleanedData = JSON.parse(fs.readFileSync('cleaned-events.json', 'utf8'));
    console.log(`📊 Found ${cleanedData.events.length} existing events`);
  } catch (error) {
    console.log('❌ No existing cleaned data found. Run the scraper first.');
    return;
  }

  // Create updated events data for the data file
  const updatedEvents = cleanedData.events
    .filter(event => event.title && event.description && event.link)
    .map((event, index) => ({
      id: index + 1,
      title: event.title,
      date: event.date,
      location: event.location || extractLocationFromDescription(event.description),
      description: enhanceDescription(event.description),
      category: determineCategory(event.description),
      link: event.link
    }))
    .slice(0, 20); // Limit to 20 events for the homepage

  // Create the data file content
  const dataFileContent = `// Real event data from your current website
export const events = ${JSON.stringify(updatedEvents, null, 2)};

// Get upcoming events (filter by date)
export const getUpcomingEvents = () => {
  const now = new Date();
  return events.filter(event => {
    // Simple date parsing - you might want to improve this
    const eventDate = new Date(event.date.split(' to ')[0] + ', 2025');
    return eventDate >= now;
  }).slice(0, 8); // Show first 8 upcoming events
};

// Get events by category
export const getEventsByCategory = (category) => {
  return events.filter(event => event.category === category);
};

// Get all events
export const getAllEvents = () => {
  return events;
};
`;

  // Write the updated data file
  fs.writeFileSync('src/data/events.js', dataFileContent);
  console.log('✅ Updated src/data/events.js with latest event data');
  console.log(`📋 Processed ${updatedEvents.length} events`);

  // Display sample of updated events
  if (updatedEvents.length > 0) {
    console.log('\n📋 Sample of updated events:');
    updatedEvents.slice(0, 3).forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Date: ${event.date}`);
      console.log(`  Location: ${event.location}`);
      console.log(`  Category: ${event.category}`);
    });
  }
}

// Helper function to extract location from description
function extractLocationFromDescription(description) {
  const locationMatch = description.match(/([A-Z][a-z]+,\s*[A-Z]{2})/);
  return locationMatch ? locationMatch[1] : '';
}

// Helper function to enhance description
function enhanceDescription(description) {
  // Clean up the description and make it more readable
  return description
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to determine category
function determineCategory(description) {
  const desc = description.toLowerCase();
  if (desc.includes('conference')) return 'Conference';
  if (desc.includes('camp')) return 'Camp';
  if (desc.includes('party')) return 'Party';
  if (desc.includes('workshop')) return 'Workshop';
  if (desc.includes('munch')) return 'Munch';
  return 'Event';
}

// Run the update
updateEventsData(); 