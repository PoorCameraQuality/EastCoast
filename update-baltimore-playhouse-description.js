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

// Update Baltimore Playhouse with descriptions
const existingDungeons = readExistingData();
const baltimorePlayhouse = existingDungeons.find(d => d.slug === 'baltimore-playhouse');

if (baltimorePlayhouse) {
  // Update with both short and long descriptions
  baltimorePlayhouse.excerpt = "A 501(c)7 Non-Profit Social Club with 12,000 square foot play space, the largest of its kind in the United States. Since 1997, we have been Charm City's premier kink destination.";
  
  baltimorePlayhouse.description = {
    short: "A 501(c)7 Non-Profit Social Club with 12,000 square foot play space, the largest of its kind in the United States. Since 1997, we have been Charm City's premier kink destination.",
    long: `A 501(c)7 Non-Profit Social Club

Our mission is to create a safe, inclusive space for everyone to socialize, learn, and most importantly, "MAKE PLAY HAPPEN!™"

Inclusivity and Safety

At Baltimore Playhouse, we welcome everyone. Discrimination based on sexual orientation, gender identity, gender presentation, race, cultural background, socioeconomic status, or disability is strictly prohibited.

Our Space

We boast a 12,000 square foot play space, the largest of its kind in the United States. Since 1997, we have been Charm City's premier kink destination.

Event Guidelines

Attendance: Parties are limited to 250 attendees. RSVP is required.

Alcohol-Free: No alcohol is sold or allowed on the premises. Those under the influence will be asked to leave.

Drug-Free: We have a ZERO tolerance policy for illegal drugs or paraphernalia. One strike and you're out.

Photography: Photography is not allowed during events. See our rules for exceptions with prior permission.

ID Check: Legal ID must be shown upon entry. Your ID will be viewed and returned, not photocopied or scanned.

Private Rentals

Our space is available for professional photography rentals when not in use. Visit our private rental page for more information.

Join us at Baltimore Playhouse for a safe, fun, and welcoming experience!`
  };
  
  console.log('✅ Baltimore Playhouse descriptions updated!');
  console.log('📝 Short description (for listing page):', baltimorePlayhouse.excerpt.substring(0, 100) + '...');
  console.log('📝 Long description (for individual page):', baltimorePlayhouse.description.long.substring(0, 100) + '...');
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
console.log('📄 Short description will show on dungeons listing page');
console.log('📄 Long description will show on individual dungeon page');
