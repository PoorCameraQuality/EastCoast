const fs = require('fs');
const path = require('path');

// Read existing dungeons data
function readExistingData() {
  try {
    const dungeonsPath = path.join(__dirname, 'src/data/dungeons.js');
    const dungeonsContent = fs.readFileSync(dungeonsPath, 'utf8');
    const dungeonsMatch = dungeonsContent.match(/export const dungeons = (\[[\s\S]*?\]);/);
    const dungeons = dungeonsMatch ? JSON.parse(dungeonsMatch[1]) : [];
    return dungeons;
  } catch (error) {
    console.error('Error reading existing data:', error);
    return [];
  }
}

// New dungeons data
const newDungeons = [
  {
    name: "The Crucible",
    slug: "the-crucible-washington-dc",
    excerpt: "Welcome to The Crucible, Washington DC's Only Alternate Lifestyles/BDSM Private Club",
    description: {
      short: "Welcome to The Crucible, Washington DC's Only Alternate Lifestyles/BDSM Private Club",
      long: `The Crucible is dedicated to providing a safe gathering space for all of our members and their guests. In an effort to provide our community with the safest space possible, beginning March 1, 2018, The Crucible application process for all new memberships and all membership renewals will include an ID search of the public US Department of Justice and the DC Metropolitan Police Department registered sex offenders database. Additionally, all non-member guests requesting admission to events at The Crucible must present a valid government-issued photo ID which includes date of birth, and guest entries will be checked against these databases as well. Should you be unable to present current, valid ID, you will not be granted access to The Crucible. No exceptions will be made in this regard. Anyone who is registered on these databases will be denied membership and/or entry to The Crucible. We appreciate your patience as we add this important step to our membership and admission process.`
    },
    location: {
      address: "Washington, DC",
      city: "Washington",
      state: "DC"
    },
    contact: {
      email: "",
      phone: ""
    },
    website: "https://www.eastcoastkinkevents.com/dungeons/thecrubible",
    logo: "/images/crucible.png",
    images: [],
    seo: {
      title: "The Crucible - Washington DC BDSM Private Club | East Coast Kink Events",
      description: "The Crucible is Washington DC's premier BDSM private club, offering a safe gathering space for the kink community with enhanced safety measures and membership requirements.",
      keywords: "The Crucible, Washington DC, BDSM club, kink community, private club, DC dungeon, BDSM Washington"
    }
  },
  {
    name: "The Owl's Nest",
    slug: "the-owls-nest-poconos-philadelphia",
    excerpt: "At The Nest, we prioritize creating a judgment-free environment where people of all backgrounds and identities can feel safe and welcome. Our members enjoy access to a wide range of exclusive workshops, classes, and social opportunities focusing on photography, mixed media, visual, and performing arts.",
    description: {
      short: "At The Nest, we prioritize creating a judgment-free environment where people of all backgrounds and identities can feel safe and welcome. Our members enjoy access to a wide range of exclusive workshops, classes, and social opportunities focusing on photography, mixed media, visual, and performing arts.",
      long: `Welcome to The Nest: A Creative Arts Collective and Social Club

At The Nest, we prioritize creating a judgment-free environment where people of all backgrounds and identities can feel safe and welcome. Our members enjoy access to a wide range of exclusive workshops, classes, and social opportunities focusing on photography, mixed media, visual, and performing arts.

Our Mission

We believe art is a powerful force for social change and community building. Our collective works tirelessly to create a platform for diverse voices and experiences to be heard and celebrated.

Our Space

The Nest is our permanent home in Philly, conveniently located a short walk from Fishtown with many public transit options. Our space boasts over 4,800 sq. ft. with various configurations to suit different events and activities.

Join Us

Become a part of The Nest and immerse yourself in a vibrant community dedicated to artistic expression and social change. Whether you're attending a workshop, participating in a class, or enjoying a social event, you'll find a welcoming and inspiring atmosphere.`
    },
    location: {
      address: "Poconos and Philadelphia, PA",
      city: "Philadelphia",
      state: "PA"
    },
    contact: {
      email: "",
      phone: ""
    },
    website: "https://www.eastcoastkinkevents.com/dungeons/theowlsnest",
    logo: "/images/owlsnest.png",
    images: [],
    seo: {
      title: "The Owl's Nest - Poconos & Philadelphia Creative Arts Collective | East Coast Kink Events",
      description: "The Owl's Nest is a creative arts collective and social club in Philadelphia, offering judgment-free workshops, classes, and social opportunities for the kink community.",
      keywords: "The Owl's Nest, Philadelphia, Poconos, creative arts, social club, kink community, workshops, Pennsylvania"
    }
  },
  {
    name: "Sarasota Dark Temple",
    slug: "sarasota-dark-temple-florida",
    excerpt: "At Sarasota Dark Temple, we are dedicated to creating a sanctuary where you can be your authentic self, free from fear, judgment, shame, guilt, and negativity. Our mission is to foster a space that inspires awakening, liberation, and true self-embodiment.",
    description: {
      short: "At Sarasota Dark Temple, we are dedicated to creating a sanctuary where you can be your authentic self, free from fear, judgment, shame, guilt, and negativity. Our mission is to foster a space that inspires awakening, liberation, and true self-embodiment.",
      long: `Welcome to Your Sacred Space

At Sarasota Dark Temple, we are dedicated to creating a sanctuary where you can be your authentic self, free from fear, judgment, shame, guilt, and negativity. Our mission is to foster a space that inspires awakening, liberation, and true self-embodiment.

Educational Experiences

We offer a range of educational opportunities designed to enhance your kink and BDSM skills. Stay updated with the latest protocols and techniques through our workshops and classes, tailored to support and enrich your journey.

Conflict Support

Conflicts are a natural part of any community. Our Conscious Restoration Process provides thoughtful support to address and resolve issues between members, promoting understanding and harmony.

Inspiring Self-Growth

Our experiences are crafted to inspire self-healing, personal growth, and mastery. Engage in activities that foster self-discovery and empower you to reach your full potential.

A Place to Call 'HOME'

Our goal is to build a place where everyone feels a deep sense of belonging. At The Nest, we strive to create a welcoming environment where we can all find solace and community.

Join us and be a part of a vibrant, supportive community where you can truly thrive.`
    },
    location: {
      address: "Sarasota, Florida",
      city: "Sarasota",
      state: "FL"
    },
    contact: {
      email: "",
      phone: ""
    },
    website: "https://www.eastcoastkinkevents.com/dungeons/sarasotadarktemple",
    logo: "/images/sarasotadarktemple.png",
    images: [],
    seo: {
      title: "Sarasota Dark Temple - Florida BDSM Sanctuary | East Coast Kink Events",
      description: "Sarasota Dark Temple is a sanctuary for authentic self-expression, offering educational experiences, conflict support, and inspiring self-growth in the Florida kink community.",
      keywords: "Sarasota Dark Temple, Florida, BDSM sanctuary, kink community, educational experiences, self-growth, Sarasota"
    }
  },
  {
    name: "The Woodshed",
    slug: "the-woodshed-orlando-florida",
    excerpt: "Welcome to The Woodshed, Orlando's premier private kink dungeon and social club. As a members-only sanctuary, we offer a unique and discreet space for all your kink and BDSM desires.",
    description: {
      short: "Welcome to The Woodshed, Orlando's premier private kink dungeon and social club. As a members-only sanctuary, we offer a unique and discreet space for all your kink and BDSM desires.",
      long: `Discover Your Secret Escape in Orlando!

Welcome to The Woodshed, Orlando's premier private kink dungeon and social club. As a members-only sanctuary, we offer a unique and discreet space for all your kink and BDSM desires.

What We Offer:

Exclusive Access: Enjoy private membership to our state-of-the-art dungeon, designed for your ultimate pleasure and exploration.

Varied Events: Join us for a range of exciting events throughout the year, from workshops and demonstrations to themed parties and social mixers.

Top-Notch Facilities: Our dungeon features a variety of equipment and play spaces to cater to all interests and experiences.

Safe and Discreet: Experience your passions in a safe, respectful, and judgement-free environment where privacy is our priority.

Become a Member:

Unlock the door to a world of creativity and connection. Apply for membership today and start exploring your desires with like-minded individuals in Orlando's most exclusive kink community.

Connect with Us:

Ready to take the next step? Visit our website or contact us to learn more about membership options and upcoming events. Your ultimate adventure awaits at The Woodshed.

Check out our website for more information!`
    },
    location: {
      address: "Orlando, Florida",
      city: "Orlando",
      state: "FL"
    },
    contact: {
      email: "",
      phone: ""
    },
    website: "https://www.eastcoastkinkevents.com/dungeons/thewoodshed",
    logo: "/images/woodshed.png",
    images: [],
    seo: {
      title: "The Woodshed - Orlando Private Kink Dungeon | East Coast Kink Events",
      description: "The Woodshed is Orlando's premier private kink dungeon and social club, offering exclusive membership access to state-of-the-art facilities and varied events.",
      keywords: "The Woodshed, Orlando, private kink dungeon, BDSM club, Florida, exclusive membership, Orlando dungeon"
    }
  },
  {
    name: "The Honey Pot Dungeon",
    slug: "the-honey-pot-dungeon-maryland",
    excerpt: "At The Honey Pot, our mission is to provide a safe and inclusive environment where you can explore your kinks and fantasies with confidence.",
    description: {
      short: "At The Honey Pot, our mission is to provide a safe and inclusive environment where you can explore your kinks and fantasies with confidence.",
      long: `Welcome to The Honey Pot – Maryland's Premier LGBTQ+ Friendly BDSM Dungeon

At The Honey Pot, our mission is to provide a safe and inclusive environment where you can explore your kinks and fantasies with confidence. We are dedicated to:

Modeling Safer Kink Scenes: We emphasize safety and consent in every scene, ensuring that all experiences are secure and enjoyable for everyone involved.

Consent Coaching: We practice and promote enthusiastic, ongoing, and informed consent. Our experienced staff is here to guide you in establishing and respecting boundaries.

Safe Harbor Policy: We are committed to creating a welcoming space for the LGBTQIA+ community. Our Safe Harbor Policy ensures that our dungeon remains a supportive and respectful environment for all.

Discover a space where safety, respect, and inclusivity come together. At The Honey pot, your exploration of BDSM is supported by our dedication to best practices and community values.

For more information or to schedule your visit, please contact us at on our website linked here!`
    },
    location: {
      address: "Arundel County, Maryland",
      city: "Arundel County",
      state: "MD"
    },
    contact: {
      email: "",
      phone: ""
    },
    website: "https://www.eastcoastkinkevents.com/dungeons/honeypotdungeon",
    logo: "/images/honeypotdungeon.png",
    images: [],
    seo: {
      title: "The Honey Pot Dungeon - Maryland LGBTQ+ Friendly BDSM Dungeon | East Coast Kink Events",
      description: "The Honey Pot is Maryland's premier LGBTQ+ friendly BDSM dungeon, emphasizing safer kink scenes, consent coaching, and a Safe Harbor Policy for all.",
      keywords: "The Honey Pot, Maryland, LGBTQ+ friendly, BDSM dungeon, consent coaching, safer kink, Arundel County"
    }
  },
  {
    name: "OhioSMART",
    slug: "ohiosmart-cleveland-ohio",
    excerpt: "The oldest and longest-running BDSM organization in Ohio, proudly serving the greater Cleveland area since 1995! Whether you're new to the scene or a seasoned veteran, OhioSMART is your ultimate social and educational hub for all things BDSM, D/s, and fetish lifestyles.",
    description: {
      short: "The oldest and longest-running BDSM organization in Ohio, proudly serving the greater Cleveland area since 1995! Whether you're new to the scene or a seasoned veteran, OhioSMART is your ultimate social and educational hub for all things BDSM, D/s, and fetish lifestyles.",
      long: `The oldest and longest-running BDSM organization in Ohio, proudly serving the greater Cleveland area since 1995! Whether you're new to the scene or a seasoned veteran, OhioSMART is your ultimate social and educational hub for all things BDSM, D/s, and fetish lifestyles.

Join us at our private dungeon space for exhilarating and safe play, meet like-minded individuals at our friendly munches in local restaurants, or enjoy our thrilling outdoor activities. At OhioSMART, you'll always find a welcoming and inclusive atmosphere where participation is voluntary, but consent is absolutely mandatory.

Come be part of our vibrant community and explore your desires in a supportive and respectful environment. OhioSMART—where your fantasies come to life!`
    },
    location: {
      address: "Cleveland, Ohio",
      city: "Cleveland",
      state: "OH"
    },
    contact: {
      email: "",
      phone: ""
    },
    website: "https://www.eastcoastkinkevents.com/dungeons/ohiosmart",
    logo: "/images/ohiosmart.png",
    images: [],
    seo: {
      title: "OhioSMART - Cleveland Ohio BDSM Organization | East Coast Kink Events",
      description: "OhioSMART is the oldest BDSM organization in Ohio, serving Cleveland since 1995 with private dungeon space, munches, and educational events for the kink community.",
      keywords: "OhioSMART, Cleveland, Ohio, BDSM organization, oldest kink group, private dungeon, munches, Cleveland BDSM"
    }
  },
  {
    name: "The Aphrodite Group (TAG)",
    slug: "the-aphrodite-group-rochester-ny",
    excerpt: "At TAG, we celebrate diversity and support our members in their journey to safely explore their desires. Whether you're a seasoned player or new to the scene, you'll find a welcoming atmosphere and a wealth of resources to enhance your experience.",
    description: {
      short: "At TAG, we celebrate diversity and support our members in their journey to safely explore their desires. Whether you're a seasoned player or new to the scene, you'll find a welcoming atmosphere and a wealth of resources to enhance your experience.",
      long: `Discover The Aphrodite Group (TAG), Rochester, NY's premier upscale BDSM club. 
TAG is a thriving community of enthusiasts with a passion for kink, BDSM, and fetishes, welcoming everyone 18 and older.

At TAG, we celebrate diversity and support our members in their journey to safely explore their desires. Whether you're a seasoned player or new to the scene, you'll find a welcoming atmosphere and a wealth of resources to enhance your experience.

Join us to:

Dive into the vibrant BDSM and kink community in Rochester and Western NY

Make new friends at our exciting socials, play parties, and events

Enjoy our state-of-the-art dungeon, available for play or private rentals

Our facility boasts an expansive open play area for those who love an audience, as well as intimate private spaces for more secluded scenes. You'll find an array of BDSM furniture, a comfortable social area, a fully-equipped kitchen, and private bathrooms.

Conveniently located near Buffalo, Syracuse, and the Finger Lakes, The Aphrodite Group is your luxurious destination for exploring kink and BDSM. Experience the finest in Rochester, NY—join TAG today!`
    },
    location: {
      address: "Rochester, New York",
      city: "Rochester",
      state: "NY"
    },
    contact: {
      email: "",
      phone: ""
    },
    website: "https://www.eastcoastkinkevents.com/dungeons/theaphroditegroup",
    logo: "/images/aphroditegroup.png",
    images: [],
    seo: {
      title: "The Aphrodite Group (TAG) - Rochester NY BDSM Club | East Coast Kink Events",
      description: "The Aphrodite Group (TAG) is Rochester's premier upscale BDSM club, offering state-of-the-art facilities, social events, and a vibrant kink community in Western NY.",
      keywords: "The Aphrodite Group, TAG, Rochester, New York, BDSM club, upscale dungeon, Western NY, Finger Lakes"
    }
  },
  {
    name: "The Ascend Hudson Valley Community",
    slug: "ascend-hudson-valley-community-ny",
    excerpt: "We foster a risk-aware, consensual kink (RACK) community in the Hudson Valley, providing education, support, and a judgment-free environment for exploration and growth.",
    description: {
      short: "We foster a risk-aware, consensual kink (RACK) community in the Hudson Valley, providing education, support, and a judgment-free environment for exploration and growth.",
      long: `Welcome to The Ascend Hudson Valley Community
A nurturing space for consenting adults in the kink and alternative lifestyle community.

Our Mission

We foster a risk-aware, consensual kink (RACK) community in the Hudson Valley, providing education, support, and a judgment-free environment for exploration and growth.

Who We Are

A real-life community with a strong online presence.

A Coalition Partner with the National Coalition for Sexual Freedom (NCSF).

A safe, inclusive space for learning, connection, and personal development.

What We Offer

Educational programming (workshops, classes, discussions)

Social events (munches, sloshes, themed socials)

Play parties & private gatherings (vetted members only)

A permanent physical community space in the Mid-Hudson Valley, NY, offering short- and long-term rentals.

Community Leadership

Board of Directors:

President, Vice President, Treasurer, Member at Large (experienced leaders guiding the community)

Key Roles:

Head Dungeon Monitor, Community Development, Staff Coordinator

Household Specialists (Riggers, Tops, Photographer, and more)

Join Us

Vetting Required: To ensure safety and trust, all members must complete a vetting process before attending private events or joining our Discord.

Open Socials (No Vetting Needed):

The Poughkeepsie Munch

HVLOL Munch

Where the Wild Things Meet (for Littles, Middles, & Caretakers)

Ascend Community Slosh

Fresh & Kinky Social

The Wild Rumpus (Littles, Middles, & Caretakers)

Connect Online:

Join our FetLife group to engage with the community.

We Value Your Feedback

Have suggestions or questions? Share your thoughts—we're always listening!

Why Ascend?

A supportive, RACK-based community

Dedicated leadership & safe spaces

Regular events for learning & play

A home for all lifestyles

Ready to Begin Your Journey?

Click the link above and take the first step toward belonging.

Disclaimer: Some promotional material produced by AI.

Explore. Connect. Ascend.`
    },
    location: {
      address: "Hudson Valley, New York",
      city: "Hudson Valley",
      state: "NY"
    },
    contact: {
      email: "",
      phone: ""
    },
    website: "https://www.eastcoastkinkevents.com/dungeons/hudson-valley-kink-community",
    logo: "/images/ascendhudsonvalley.png",
    images: [],
    seo: {
      title: "Ascend Hudson Valley Community - NY RACK Kink Community | East Coast Kink Events",
      description: "Ascend Hudson Valley Community fosters a risk-aware, consensual kink (RACK) community in the Hudson Valley, offering education, support, and safe spaces for exploration.",
      keywords: "Ascend Hudson Valley, RACK community, Hudson Valley, New York, kink education, safe spaces, NCSF partner"
    }
  }
];

// Add new dungeons to existing data
const existingDungeons = readExistingData();
const updatedDungeons = [...existingDungeons, ...newDungeons];

// Write updated dungeons file
const dungeonsContent = `// Dungeon data with SEO optimization
export const dungeons = ${JSON.stringify(updatedDungeons, null, 2)};

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

const dungeonsPath = path.join(__dirname, 'src/data/dungeons.js');
fs.writeFileSync(dungeonsPath, dungeonsContent);

console.log('✅ All new dungeons added successfully!');
console.log('📝 Added dungeons:');
newDungeons.forEach(dungeon => {
  console.log(`   • ${dungeon.name} (${dungeon.slug})`);
});
console.log('🔗 View dungeons at: http://localhost:3000/dungeons');
console.log('📄 All dungeons now have enhanced formatting for long descriptions');
console.log('🎨 Images should be placed in /public/images/ with names like:');
newDungeons.forEach(dungeon => {
  const imageName = dungeon.logo.split('/').pop();
  console.log(`   • ${imageName}`);
});
