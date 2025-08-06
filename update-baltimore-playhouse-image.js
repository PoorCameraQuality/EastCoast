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

// Update Baltimore Playhouse with the logo
const existingDungeons = readExistingData();
const baltimorePlayhouse = existingDungeons.find(d => d.slug === 'baltimore-playhouse');

if (baltimorePlayhouse) {
  // Update the logo
  baltimorePlayhouse.logo = "/images/BPH.png";
  
  console.log('✅ Baltimore Playhouse logo updated!');
  console.log('🖼️ Logo path:', baltimorePlayhouse.logo);
} else {
  console.log('❌ Baltimore Playhouse not found in data');
  process.exit(1);
}

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

console.log('✅ Baltimore Playhouse data updated successfully!');
console.log('🔗 View at: http://localhost:3000/dungeons/baltimore-playhouse');
console.log('🖼️ Logo will now display on the dungeon page');
