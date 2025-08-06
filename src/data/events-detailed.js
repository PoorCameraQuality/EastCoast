// Comprehensive event data with SEO optimization
export const detailedEvents = [
  {
    "id": 1754451511155,
    "slug": "test-event",
    "title": "Test Kink Event",
    "shortTitle": "Test Event",
    "date": {
      "start": "2024-12-15",
      "end": "2024-12-17",
      "display": "December 15-17, 2024"
    },
    "location": {
      "city": "Philadelphia",
      "state": "PA",
      "venue": "Test Venue",
      "address": "456 Test Avenue"
    },
    "description": {
      "short": "A test kink event for debugging",
      "long": "This is a comprehensive test event to verify the system is working properly.",
      "seo": "Test kink event in Philadelphia for debugging purposes"
    },
    "category": "Indoor Conferences",
    "tags": [
      "test",
      "debug",
      "conference"
    ],
    "logo": "https://example.com/event-logo.jpg",
    "images": [
      "https://example.com/event1.jpg",
      "https://example.com/event2.jpg"
    ],
    "website": "https://testevent.com",
    "organizer": "Test Organizer",
    "contact": {
      "email": "organizer@testevent.com",
      "phone": "555-5678",
      "website": "https://testorganizer.com"
    },
    "pricing": {
      "earlyBird": "$50",
      "regular": "$75",
      "atDoor": "$100",
      "includes": "Workshops, parties, meals"
    },
    "features": [
      "workshops",
      "parties",
      "meals",
      "play spaces"
    ],
    "seo": {
      "title": "Test Kink Event - Philadelphia",
      "description": "A test kink event in Philadelphia for debugging",
      "keywords": [
        "kink",
        "test",
        "philadelphia",
        "conference"
      ]
    }
  }
];

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
    title: event.seo.title || `${event.title} - ${event.location.city}, ${event.location.state}`,
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
