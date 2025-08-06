const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to read existing data
function readExistingData() {
  try {
    const dungeonsPath = path.join(__dirname, 'src/data/dungeons.js');
    const eventsPath = path.join(__dirname, 'src/data/events-detailed.js');
    
    // Read dungeons
    const dungeonsContent = fs.readFileSync(dungeonsPath, 'utf8');
    const dungeonsMatch = dungeonsContent.match(/export const dungeons = (\[[\s\S]*?\]);/);
    const dungeons = dungeonsMatch ? JSON.parse(dungeonsMatch[1]) : [];
    
    // Read events
    const eventsContent = fs.readFileSync(eventsPath, 'utf8');
    const eventsMatch = eventsContent.match(/export const detailedEvents = (\[[\s\S]*?\]);/);
    const events = eventsMatch ? JSON.parse(eventsMatch[1]) : [];
    
    return { dungeons, events };
  } catch (error) {
    console.error('Error reading existing data:', error);
    return { dungeons: [], events: [] };
  }
}

// Helper function to write data back to files
function writeData(dungeons, events) {
  try {
    const dungeonsPath = path.join(__dirname, 'src/data/dungeons.js');
    const eventsPath = path.join(__dirname, 'src/data/events-detailed.js');
    
    // Write dungeons
    const dungeonsContent = `// Dungeon data with SEO optimization
export const dungeons = ${JSON.stringify(dungeons, null, 2)};

export const getDungeonBySlug = (slug) => {
  return dungeons.find(dungeon => dungeon.slug === slug);
};

export const getAllDungeons = () => {
  return dungeons.sort((a, b) => a.name.localeCompare(b.name));
};

export const getDungeonsByLocation = (state) => {
  return dungeons.filter(dungeon => dungeon.location.state === state);
};

export const generateDungeonSEO = (dungeon) => {
  return {
    title: dungeon.seo.title,
    description: dungeon.seo.description,
    keywords: dungeon.seo.keywords,
    openGraph: {
      title: dungeon.seo.title,
      description: dungeon.seo.description,
      images: dungeon.images.length > 0 ? dungeon.images : [dungeon.logo],
      type: 'website'
    }
  };
};
`;
    
    // Write events
    const eventsContent = `// Comprehensive event data with SEO optimization
export const detailedEvents = ${JSON.stringify(events, null, 2)};

// Helper functions for SEO and data management
export const getEventBySlug = (slug) => {
  return detailedEvents.find(event => event.slug === slug);
};

export const getUpcomingDetailedEvents = () => {
  const today = new Date();
  return detailedEvents
    .filter(event => {
      const eventEndDate = new Date(event.date.end);
      return eventEndDate >= today;
    })
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
    .slice(0, 8); // Show up to 8 upcoming events
};

export const getPastDetailedEvents = () => {
  const today = new Date();
  return detailedEvents
    .filter(event => {
      const eventEndDate = new Date(event.date.end);
      return eventEndDate < today;
    })
    .sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime());
};

export const getAllDetailedEvents = () => {
  return detailedEvents.sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime());
};

export const getEventsByCategory = (category) => {
  return detailedEvents.filter(event => event.category === category);
};

export const getEventsByLocation = (state) => {
  return detailedEvents.filter(event => event.location.state === state);
};

// SEO metadata generator
export const generateEventSEO = (event) => {
  return {
    title: event.seo.title || \`\${event.title} - \${event.location.city}, \${event.location.state}\`,
    description: event.seo.description || event.description.short,
    keywords: event.seo.keywords || [event.category, event.location.city, event.location.state],
    openGraph: {
      title: event.seo.title || event.title,
      description: event.seo.description || event.description.short,
      images: event.images.length > 0 ? event.images : [event.logo],
      type: 'website'
    }
  };
};
`;
    
    fs.writeFileSync(dungeonsPath, dungeonsContent);
    fs.writeFileSync(eventsPath, eventsContent);
    
    console.log('✅ Data saved successfully!');
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// Add a dungeon
async function addDungeon() {
  console.log('\n🏰 Adding a new dungeon...\n');
  
  const dungeon = {
    id: Date.now(),
    slug: await askQuestion('Slug (URL-friendly name): '),
    name: await askQuestion('Dungeon name: '),
    location: {
      city: await askQuestion('City: '),
      state: await askQuestion('State: '),
      address: await askQuestion('Address: ')
    },
    excerpt: await askQuestion('Short description: '),
    logo: await askQuestion('Logo URL: '),
    images: (await askQuestion('Image URLs (comma-separated): ')).split(',').map(img => img.trim()),
    website: await askQuestion('Website URL: '),
    contact: {
      email: await askQuestion('Email: '),
      phone: await askQuestion('Phone: ')
    },
    seo: {
      title: await askQuestion('SEO Title: '),
      description: await askQuestion('SEO Description: '),
      keywords: (await askQuestion('SEO Keywords (comma-separated): ')).split(',').map(keyword => keyword.trim())
    }
  };
  
  const { dungeons, events } = readExistingData();
  dungeons.push(dungeon);
  writeData(dungeons, events);
  
  console.log('✅ Dungeon added successfully!');
}

// Add an event
async function addEvent() {
  console.log('\n🎉 Adding a new event...\n');
  
  const event = {
    id: Date.now(),
    slug: await askQuestion('Slug (URL-friendly name): '),
    title: await askQuestion('Event title: '),
    shortTitle: await askQuestion('Short title: '),
    date: {
      start: await askQuestion('Start date (YYYY-MM-DD): '),
      end: await askQuestion('End date (YYYY-MM-DD): '),
      display: await askQuestion('Display date (e.g., "December 15-17, 2024"): ')
    },
    location: {
      city: await askQuestion('City: '),
      state: await askQuestion('State: '),
      venue: await askQuestion('Venue name: '),
      address: await askQuestion('Address: ')
    },
    description: {
      short: await askQuestion('Short description: '),
      long: await askQuestion('Long description: '),
      seo: await askQuestion('SEO description: ')
    },
    category: await askQuestion('Category (Indoor Conferences/Outdoor Conferences): '),
    tags: (await askQuestion('Tags (comma-separated): ')).split(',').map(tag => tag.trim()),
    logo: await askQuestion('Logo URL: '),
    images: (await askQuestion('Image URLs (comma-separated): ')).split(',').map(img => img.trim()),
    website: await askQuestion('Event website: '),
    organizer: await askQuestion('Organizer name: '),
    contact: {
      email: await askQuestion('Contact email: '),
      phone: await askQuestion('Contact phone: '),
      website: await askQuestion('Organizer website: ')
    },
    pricing: {
      earlyBird: await askQuestion('Early bird price: '),
      regular: await askQuestion('Regular price: '),
      atDoor: await askQuestion('At door price: '),
      includes: await askQuestion('What\'s included: ')
    },
    features: (await askQuestion('Features (comma-separated): ')).split(',').map(feature => feature.trim()),
    seo: {
      title: await askQuestion('SEO Title: '),
      description: await askQuestion('SEO Description: '),
      keywords: (await askQuestion('SEO Keywords (comma-separated): ')).split(',').map(keyword => keyword.trim())
    }
  };
  
  const { dungeons, events } = readExistingData();
  events.push(event);
  writeData(dungeons, events);
  
  console.log('✅ Event added successfully!');
}

// Main menu
async function showMenu() {
  console.log('\n📋 Data Entry Menu');
  console.log('1. Add a dungeon');
  console.log('2. Add an event');
  console.log('3. View current data');
  console.log('4. Exit');
  
  const choice = await askQuestion('\nSelect an option (1-4): ');
  
  switch (choice) {
    case '1':
      await addDungeon();
      break;
    case '2':
      await addEvent();
      break;
    case '3':
      const { dungeons, events } = readExistingData();
      console.log(`\n📊 Current Data:`);
      console.log(`Dungeons: ${dungeons.length}`);
      console.log(`Events: ${events.length}`);
      if (dungeons.length > 0) {
        console.log('\n🏰 Dungeons:');
        dungeons.forEach(d => console.log(`- ${d.name} (${d.location.city}, ${d.location.state})`));
      }
      if (events.length > 0) {
        console.log('\n🎉 Events:');
        events.forEach(e => console.log(`- ${e.title} (${e.date.display})`));
      }
      break;
    case '4':
      console.log('👋 Goodbye!');
      rl.close();
      return;
    default:
      console.log('❌ Invalid option. Please try again.');
  }
  
  // Continue showing menu
  await showMenu();
}

// Start the program
console.log('🚀 Squarespace Data Entry Tool');
console.log('This tool will help you manually add your events and dungeons from Squarespace.');
console.log('You can copy the information from your Squarespace site and enter it here.\n');

showMenu().catch(console.error);
