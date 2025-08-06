const fs = require('fs');
const path = require('path');

// Test dungeon data
const testDungeon = {
  id: Date.now(),
  slug: "test-dungeon",
  name: "Test Dungeon",
  location: {
    city: "New York",
    state: "NY",
    address: "123 Test Street"
  },
  excerpt: "This is a test dungeon for debugging purposes",
  logo: "https://example.com/logo.jpg",
  images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  website: "https://testdungeon.com",
  contact: {
    email: "test@dungeon.com",
    phone: "555-1234"
  },
  seo: {
    title: "Test Dungeon - NYC",
    description: "A test dungeon in New York City",
    keywords: ["dungeon", "test", "nyc", "bdsm"]
  }
};

// Test event data
const testEvent = {
  id: Date.now() + 1,
  slug: "test-event",
  title: "Test Kink Event",
  shortTitle: "Test Event",
  date: {
    start: "2024-12-15",
    end: "2024-12-17",
    display: "December 15-17, 2024"
  },
  location: {
    city: "Philadelphia",
    state: "PA",
    venue: "Test Venue",
    address: "456 Test Avenue"
  },
  description: {
    short: "A test kink event for debugging",
    long: "This is a comprehensive test event to verify the system is working properly.",
    seo: "Test kink event in Philadelphia for debugging purposes"
  },
  category: "Indoor Conferences",
  tags: ["test", "debug", "conference"],
  logo: "https://example.com/event-logo.jpg",
  images: ["https://example.com/event1.jpg", "https://example.com/event2.jpg"],
  website: "https://testevent.com",
  organizer: "Test Organizer",
  contact: {
    email: "organizer@testevent.com",
    phone: "555-5678",
    website: "https://testorganizer.com"
  },
  pricing: {
    earlyBird: "$50",
    regular: "$75",
    atDoor: "$100",
    includes: "Workshops, parties, meals"
  },
  features: ["workshops", "parties", "meals", "play spaces"],
  seo: {
    title: "Test Kink Event - Philadelphia",
    description: "A test kink event in Philadelphia for debugging",
    keywords: ["kink", "test", "philadelphia", "conference"]
  }
};

// Update dungeons file
const dungeonsPath = path.join(__dirname, 'src/data/dungeons.js');
const dungeonsContent = `// Dungeon data with SEO optimization
export const dungeons = ${JSON.stringify([testDungeon], null, 2)};

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

// Update events file
const eventsPath = path.join(__dirname, 'src/data/events-detailed.js');
const eventsContent = `// Comprehensive event data with SEO optimization
export const detailedEvents = ${JSON.stringify([testEvent], null, 2)};

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

// Write the files
fs.writeFileSync(dungeonsPath, dungeonsContent);
fs.writeFileSync(eventsPath, eventsContent);

console.log('✅ Test data added successfully!');
console.log('📁 Dungeons file updated with test dungeon');
console.log('📁 Events file updated with test event');
console.log('🔄 Please refresh your browser to see the changes');
