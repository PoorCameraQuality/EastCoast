const fs = require('fs');
const path = require('path');

// Baltimore Playhouse dungeon data
const baltimorePlayhouse = {
  id: Date.now(),
  slug: "baltimore-playhouse",
  name: "Baltimore Playhouse",
  location: {
    city: "Baltimore",
    state: "MD",
    address: "Baltimore, MD" // Address not provided on page
  },
  excerpt: "A 501(c)7 Non-Profit Social Club with 12,000 square foot play space, the largest of its kind in the United States. Since 1997, we have been Charm City's premier kink destination.",
  logo: "", // No logo provided on page
  images: [], // No images provided on page
  website: "https://www.baltimoreplayhouse.com", // Assuming this is their website
  contact: {
    email: "", // Not provided on page
    phone: "" // Not provided on page
  },
  seo: {
    title: "Baltimore Playhouse - Premier BDSM Dungeon & Kink Community",
    description: "Baltimore Playhouse is a 501(c)7 non-profit social club with 12,000 square feet of play space. Since 1997, we've been Charm City's premier kink destination for safe, inclusive BDSM events.",
    keywords: ["baltimore", "playhouse", "dungeon", "bdsm", "kink", "maryland", "charm city", "play space", "non-profit", "social club"]
  }
};

// Read existing data
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

// Add Baltimore Playhouse to existing dungeons
const existingDungeons = readExistingData();
existingDungeons.push(baltimorePlayhouse);

// Write updated dungeons file
const dungeonsContent = `// Dungeon data with SEO optimization
export const dungeons = ${JSON.stringify(existingDungeons, null, 2)};

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

console.log('✅ Baltimore Playhouse added successfully!');
console.log('📊 Total dungeons:', existingDungeons.length);
console.log('🔗 You can view it at: http://localhost:3000/dungeons/baltimore-playhouse');
console.log('\n❌ Missing Information:');
console.log('- Exact address');
console.log('- Contact email');
console.log('- Contact phone');
console.log('- Logo/images');
console.log('\n💡 You may want to:');
console.log('1. Visit their actual website to get contact info');
console.log('2. Add their logo and images');
console.log('3. Update the address if you find it');
