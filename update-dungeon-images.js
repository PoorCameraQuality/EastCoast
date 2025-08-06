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

// Update dungeons with correct image filenames and remove test dungeon
const existingDungeons = readExistingData();

// Remove test dungeon
const filteredDungeons = existingDungeons.filter(dungeon => dungeon.name !== 'Test Dungeon');

// Update image filenames for specific dungeons
const updatedDungeons = filteredDungeons.map(dungeon => {
  const updates = {
    'The Ascend Hudson Valley Community': 'ascend.PNG',
    'The Honey Pot Dungeon': 'Honeypot.PNG',
    'The Aphrodite Group (TAG)': 'aphrodite.PNG',
    'OhioSMART': 'ohio.PNG',
    'Sarasota Dark Temple': 'sarasota.PNG'
  };

  if (updates[dungeon.name]) {
    return {
      ...dungeon,
      logo: `/images/${updates[dungeon.name]}`
    };
  }

  return dungeon;
});

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

console.log('✅ Dungeon updates completed!');
console.log('🗑️ Removed: Test Dungeon');
console.log('🖼️ Updated image filenames:');
console.log('   • The Ascend Hudson Valley Community → ascend.PNG');
console.log('   • The Honey Pot Dungeon → Honeypot.PNG');
console.log('   • The Aphrodite Group (TAG) → aphrodite.PNG');
console.log('   • OhioSMART → ohio.PNG');
console.log('   • Sarasota Dark Temple → sarasota.PNG');
console.log('🔗 View dungeons at: http://localhost:3000/dungeons');
