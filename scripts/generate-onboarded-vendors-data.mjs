/**
 * Writes src/data/onboardedVendors.data.js from net-new vendor specs.
 * Run: node scripts/generate-onboarded-vendors-data.mjs
 */
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

/** [brand, slug, websiteUrl, location, description, tagSlugs, extraStoryLine?] */
const SPECS = [
  [
    '2V1 Dark Works',
    '2v1-dark-works',
    'https://www.facebook.com/2V1darkworks',
    'Online',
    'Handmade maker with a public Facebook presence for products and updates.',
    ['mixed-media-maker', 'custom-commission-vendor'],
  ],
  [
    'Agreeable Agony',
    'agreeable-agony',
    'https://agreeableagony.com/',
    'Online',
    'Maker collective offering handcrafted impact and sensation toys.',
    ['impact-implements', 'sensation-play-tools', 'handmade-leather', 'custom-commission-vendor'],
  ],
  [
    'Anubis Gear',
    'anubis-gear',
    'https://www.anubisgear.com/',
    'Online',
    'Designer-led fetish gear and accessories built for durability and fit.',
    ['clothing-fetish-wear', 'handmade-leather', 'restraints-bondage-gear', 'custom-commission-vendor'],
  ],
  [
    'Arcane Impact',
    'arcane-impact',
    'https://arcaneimpact.com/',
    'Online',
    'Impact play tools and related gear from an independent maker.',
    ['impact-implements', 'woodworking', 'custom-commission-vendor'],
  ],
  [
    'Awkward Artist Studio',
    'awkward-artist-studio',
    'https://www.awkwardartiststudio.com/',
    'Online',
    'Small-batch art, accessories, and giftable pieces from an independent studio.',
    ['mixed-media-maker', 'decor-lifestyle-aftercare', 'custom-commission-vendor'],
  ],
  [
    'Bastille & Bags',
    'bastille-and-bags',
    'https://www.the-bastille.com/',
    'Online',
    'Leather bags and accessories with a fetish-forward aesthetic.',
    ['handmade-leather', 'clothing-fetish-wear', 'custom-commission-vendor'],
  ],
  [
    'Biggins Beatery / The Beatery',
    'biggins-beatery',
    'https://www.bigginsbeatery.com/',
    'Online',
    'Wooden impact toys and beaters from an independent woodworking maker.',
    ['impact-implements', 'woodworking', 'wood', 'custom-commission-vendor'],
  ],
  [
    'Bloody Rose Boutique',
    'bloody-rose-boutique',
    'https://bloodyroseboutique.com/',
    'Online',
    'Boutique apparel and accessories for alternative and fetish style.',
    ['clothing-fetish-wear', 'textile-clothing-maker', 'custom-commission-vendor'],
  ],
  [
    'BONEAFIDE',
    'boneafide',
    'https://boneafide.store/',
    'Online',
    'Independent maker shop for kink-adjacent goods and accessories.',
    ['mixed-media-maker', 'jewelry-collars', 'custom-commission-vendor'],
  ],
  [
    'Bound Bunny Boutique',
    'bound-bunny-boutique',
    'https://www.etsy.com/shop/BoundBunnyBoutique',
    'Online • Etsy',
    'Etsy boutique for handmade and curated kink-friendly accessories.',
    ['clothing-fetish-wear', 'roleplay-costume', 'custom-commission-vendor'],
  ],
  [
    'CedarCreek Creations',
    'cedarcreek-creations',
    'https://www.facebook.com/cedarcreek.handmadecreations',
    'Online',
    'Handmade creations sold through a public Facebook page.',
    ['mixed-media-maker', 'natural-materials-maker', 'custom-commission-vendor'],
  ],
  [
    'Chameleon Creations',
    'chameleon-creations',
    'https://www.facebook.com/ChameleonAfterDark/',
    'Online',
    'After-dark handmade goods via Facebook; often seen on regional vendor lists.',
    ['handmade-leather', 'clothing-fetish-wear', 'custom-commission-vendor'],
  ],
  [
    'Cockeye Kink',
    'cockeye-kink',
    'https://cockeyekink.com/',
    'Online',
    'Fetish gear brand offering apparel and accessories for kink audiences.',
    ['clothing-fetish-wear', 'handmade-leather', 'restraints-bondage-gear', 'custom-commission-vendor'],
  ],
  [
    'Dorie’s Designs',
    'dories-designs',
    'https://doriesdesigns.net/',
    'Online',
    'Chain maille jewelry and wearables from an independent artisan.',
    ['metalwork-chain-jewelry', 'clothing-fetish-wear', 'custom-commission-vendor'],
  ],
  [
    'Dulcis Doloris',
    'dulcis-doloris',
    'https://www.etsy.com/shop/WTProductions',
    'Online • Etsy',
    'Etsy shop offering handmade and small-batch maker goods.',
    ['mixed-media-maker', 'decor-lifestyle-aftercare', 'custom-commission-vendor'],
  ],
  [
    'Dungeon in a Bag',
    'dungeon-in-a-bag',
    'https://dungeoninabag.com/',
    'Online',
    'Portable dungeon furniture and kit concepts for travel-friendly play spaces.',
    ['dungeon-equipment-furniture', 'restraints-bondage-gear', 'custom-commission-vendor'],
  ],
  [
    'Fantasy Grove Toys',
    'fantasy-grove-toys',
    'https://fantasygrove.com/',
    'Online',
    'Fantasy-themed body-safe toys and sculpts from an independent maker.',
    ['insertables-body-toys', 'handmade-silicone', 'custom-commission-vendor'],
  ],
  [
    'Faire Treasures',
    'faire-treasures',
    'https://www.fairetreasures.com/',
    'Online',
    'Curated treasures, gifts, and maker goods for ren-faire and kink-friendly crowds.',
    ['reseller-curated-shop', 'decor-lifestyle-aftercare', 'roleplay-costume'],
  ],
  [
    'FFäusten',
    'ffausten',
    'https://ffausten.com/',
    'Online',
    'Proprietary gear and implements from a specialty fetish workshop.',
    ['impact-implements', 'restraints-bondage-gear', 'handmade-leather', 'custom-commission-vendor'],
  ],
  [
    'Fontina + Co',
    'fontina-co',
    'https://www.fontinaco.com/',
    'Online',
    'Independent maker of collars, jewelry, and small leather goods.',
    ['jewelry-collars', 'handmade-leather', 'custom-commission-vendor'],
  ],
  [
    'Forge and Fleece',
    'forge-and-fleece',
    'https://www.etsy.com/shop/ForgeAndFleece',
    'Online • Etsy',
    'Etsy shop combining forged metalwork and textile pieces.',
    ['metalwork-chain-jewelry', 'textile-clothing-maker', 'custom-commission-vendor'],
  ],
  [
    'From the Hoard',
    'from-the-hoard',
    'https://www.fromthehoard.com/',
    'Online',
    'Maker shop for fantasy-leaning accessories and small-batch goods.',
    ['mixed-media-maker', 'roleplay-costume', 'decor-lifestyle-aftercare'],
  ],
  [
    'Heidi Sweet Sensations',
    'heidi-sweet-sensations',
    'https://heidisweetsensations.square.site/',
    'Online',
    'Sensual and sensation products via Square—often listed on event vendor rosters.',
    ['sensation-play-tools', 'decor-lifestyle-aftercare', 'custom-commission-vendor'],
  ],
  [
    'Heretical Son Leatherwork',
    'heretical-son-leatherwork',
    'https://www.etsy.com/shop/HereticalSonLeather',
    'Online • Etsy',
    'Etsy leather shop for cuffs, collars, and custom leatherwork.',
    ['handmade-leather', 'restraints-bondage-gear', 'jewelry-collars', 'custom-commission-vendor'],
  ],
  [
    'JAFantasyArt',
    'jafantasyart',
    'https://www.jafantasyart.com/',
    'Online',
    'Fantasy and fandom-inspired art prints and merchandise.',
    ['mixed-media-maker', 'decor-lifestyle-aftercare', 'media-education-products'],
  ],
  [
    'Kilted Kink',
    'kilted-kink',
    'https://kiltedkinktoys.square.site/',
    'Online',
    'Square storefront for kink-positive toys and accessories.',
    ['insertables-body-toys', 'sensation-play-tools', 'custom-commission-vendor'],
  ],
  [
    'Kinky Nix',
    'kinky-nix',
    'https://kinkynix.bigcartel.com/',
    'Online',
    'Big Cartel shop for handmade kink and novelty goods.',
    ['mixed-media-maker', 'clothing-fetish-wear', 'custom-commission-vendor'],
  ],
  [
    'Kink Works',
    'kink-works-rx',
    'https://www.etsy.com/shop/kinkworksrx',
    'Online • Etsy',
    'Etsy maker shop for kink-themed small goods and accessories.',
    ['mixed-media-maker', 'sensation-play-tools', 'custom-commission-vendor'],
  ],
  [
    'KnottieKittie Rope',
    'knottiekittie-rope',
    'https://www.knottiekittie.com/',
    'Online',
    'Rope, cordage, and knot-craft supplies oriented toward rope enthusiasts.',
    ['rope-fabric', 'rope-suspension', 'custom-commission-vendor'],
  ],
  [
    'Kjones Pottery',
    'kjones-pottery',
    'https://kjonespottery.com/',
    'Online',
    'Ceramic pottery studio with handmade vessels and art pieces.',
    ['ceramics-pottery', 'decor-lifestyle-aftercare', 'custom-commission-vendor'],
  ],
  [
    'KNucks',
    'knucks',
    'https://www.myknucks.com/',
    'Online',
    'Metal jewelry and knuckle-style accessories from an independent maker.',
    ['metalwork-chain-jewelry', 'jewelry-collars', 'custom-commission-vendor'],
  ],
  [
    'Leather By Danny',
    'leather-by-danny',
    'https://www.leatherbydanny.com/',
    'Online',
    'Handmade leather impact toys, cuffs, and custom leather orders.',
    ['handmade-leather', 'impact-implements', 'restraints-bondage-gear', 'custom-commission-vendor'],
  ],
  [
    'Lethal Ware',
    'lethal-ware',
    'https://www.etsy.com/shop/LethalWare',
    'Online • Etsy',
    'Etsy metal and impact-focused implements from a small maker.',
    ['impact-implements', 'metal', 'metalwork-chain-jewelry', 'custom-commission-vendor'],
  ],
  [
    'Lilfox Toy Box',
    'lilfox-toy-box',
    'https://www.etsy.com/shop/LilfoxToybox',
    'Online • Etsy',
    'Etsy shop for body-safe toys and playful maker goods.',
    ['insertables-body-toys', 'handmade-silicone', 'custom-commission-vendor'],
  ],
  [
    'Ms Martha’s Corset Shoppe',
    'ms-marthas-corset-shoppe',
    'https://corset1.com/',
    'Online',
    'Corsetry and structured garments with custom fitting options.',
    ['clothing-fetish-wear', 'textile-clothing-maker', 'custom-commission-vendor'],
  ],
  [
    'Nadia Vanilla Fine Art',
    'nadia-vanilla-fine-art',
    'https://www.nadiavanilla.com/',
    'Online',
    'Fine art and prints from an independent visual artist.',
    ['mixed-media-maker', 'decor-lifestyle-aftercare'],
  ],
  [
    'Oh, Jessa!',
    'oh-jessa',
    'https://ohjessa.com/',
    'Online',
    'Handmade apparel and corsetry-forward pieces from an independent designer.',
    ['clothing-fetish-wear', 'textile-clothing-maker', 'custom-commission-vendor'],
  ],
  [
    'Pan’s Haven Candles & More',
    'pans-haven-candles',
    'https://www.etsy.com/shop/PansHaven',
    'Online • Etsy',
    'Etsy candles and home goods suited for mood, ritual, and sensation play contexts.',
    ['decor-lifestyle-aftercare', 'wax-temperature-play', 'sensation-play-tools', 'custom-commission-vendor'],
  ],
  [
    'Pendragon Chainmail',
    'pendragon-chainmail',
    'https://www.etsy.com/shop/PendragonChainmail',
    'Online • Etsy',
    'Chainmail armor, jewelry, and wearables from an Etsy metalsmith.',
    ['metalwork-chain-jewelry', 'roleplay-costume', 'custom-commission-vendor'],
  ],
  [
    'Perverted Pins',
    'perverted-pins',
    'https://www.instagram.com/PervertedPins',
    'Online',
    'Enamel pins and small goods promoted via Instagram.',
    ['mixed-media-maker', 'roleplay-costume', 'decor-lifestyle-aftercare'],
  ],
  [
    'Pixie and Paladin Crafts',
    'pixie-and-paladin-crafts',
    'https://facebook.com/pixiepaladin',
    'Online',
    'Handmade crafts sold through a public Facebook page.',
    ['mixed-media-maker', 'roleplay-costume', 'custom-commission-vendor'],
  ],
  [
    'PlusHii Kawaii',
    'plushiikawaii',
    'https://www.plushiikawaii.com/',
    'Online',
    'Kawaii plush and soft goods from an independent maker.',
    ['decor-lifestyle-aftercare', 'little-space-abdl', 'mixed-media-maker'],
  ],
  [
    'Raven Claw Rope',
    'raven-claw-rope',
    'https://ravenclawrope.com/',
    'Online',
    'Rope products and cordage for bondage and decorative use.',
    ['rope-fabric', 'restraints-bondage-gear', 'rope-suspension', 'custom-commission-vendor'],
  ],
  [
    'Sire Don Leather',
    'sire-don-leather',
    'https://www.etsy.com/shop/SDLeather',
    'Online • Etsy',
    'Etsy leather shop for collars, cuffs, and impact leather.',
    ['handmade-leather', 'impact-implements', 'jewelry-collars', 'custom-commission-vendor'],
  ],
  [
    'Skipjack Flog',
    'skipjack-flog',
    'https://www.etsy.com/shop/SkipjackFlog',
    'Online • Etsy',
    'Etsy shop focused on floggers and leather impact gear.',
    ['handmade-leather', 'impact-implements', 'custom-commission-vendor'],
  ],
  [
    'Spicy Kitten Designs',
    'spicy-kitten-designs',
    'https://www.spicykittendesigns.com/',
    'Online',
    'Apparel and accessories with a spicy, fetish-friendly design voice.',
    ['clothing-fetish-wear', 'textile-clothing-maker', 'custom-commission-vendor'],
  ],
  [
    'Spring Hill Wood Works',
    'spring-hill-wood-works',
    'https://springhill-woodworks.com/',
    'Online',
    'Hardwood toys and woodworking pieces from a small shop.',
    ['woodworking', 'impact-implements', 'wood', 'custom-commission-vendor'],
  ],
  [
    'Square Peg Toys',
    'square-peg-toys',
    'https://www.squarepegtoys.com/',
    'Online',
    'Handcrafted platinum silicone toys from a long-running maker brand.',
    ['insertables-body-toys', 'handmade-silicone', 'custom-commission-vendor'],
  ],
  [
    'The Fat Unicorn',
    'the-fat-unicorn',
    'https://www.etsy.com/shop/fatunicorncreations',
    'Online • Etsy',
    'Etsy maker of whimsical and kink-adjacent handmade goods.',
    ['mixed-media-maker', 'decor-lifestyle-aftercare', 'custom-commission-vendor'],
  ],
  [
    'The Giggling Sadist',
    'the-giggling-sadist',
    'https://thegigglingsadist.com/',
    'Online',
    'Impact and sensation toys from an independent maker brand.',
    ['impact-implements', 'sensation-play-tools', 'handmade-leather', 'custom-commission-vendor'],
  ],
  [
    'Too Hot to Handle Candles',
    'too-hot-to-handle-candles',
    'https://www.toohotcandles.com/',
    'Online',
    'Specialty candles for wax and temperature play, sold online and at vending events.',
    ['decor-lifestyle-aftercare', 'wax-temperature-play', 'sensation-play-tools', 'custom-commission-vendor'],
  ],
  [
    'Vitromancy Arts',
    'vitromancy-arts',
    'https://www.vitromancyart.com/',
    'Online',
    'Glass art and maker pieces from an independent glass artist.',
    ['glasswork', 'decor-lifestyle-aftercare', 'mixed-media-maker'],
  ],
  [
    'Wolfstryker Leather',
    'wolfstryker-leather',
    'https://wolfstryker.com/',
    'Online',
    'Leather gear and accessories from an independent leather worker.',
    ['handmade-leather', 'restraints-bondage-gear', 'clothing-fetish-wear', 'custom-commission-vendor'],
  ],
]

function uniqTags(slugs) {
  return [...new Set(slugs)]
}

function seoPhrases(name, tagSlugs) {
  const phrases = [
    `${name} kink vendor`,
    `${name} BDSM maker`,
    `${name} handmade fetish gear`,
    'East Coast Kink Events vendor directory',
    'kink convention vendor',
    'dungeon vending handmade',
  ]
  for (const s of tagSlugs) {
    phrases.push(`${name} ${s.replace(/-/g, ' ')}`)
  }
  return [...new Set(phrases)].slice(0, 14)
}

function truncateMeta(s, max = 158) {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).replace(/[,;:\s]+$/, '')}…`
}

function buildStory(name, websiteUrl, location) {
  const vending =
    location.includes('Etsy') || websiteUrl.includes('etsy.com')
      ? 'They sell primarily through their Etsy storefront; details and policies are listed there.'
      : websiteUrl.includes('facebook.com')
        ? 'They use Facebook as a primary public storefront and update channel.'
        : websiteUrl.includes('instagram.com')
          ? 'They promote products and drops through Instagram; ordering details appear in profile links and posts.'
          : 'Product details, policies, and contact options are published on their public website.'
  return `${name} is listed on East Coast Kink Events as a handmade or small-batch maker that tables at regional kink conventions and dungeon vendor events. ${vending} This listing is sourced from their public web presence.`
}

const objects = SPECS.map(([name, slug, websiteUrl, location, description, tagSlugs]) => {
  const tags = uniqTags(tagSlugs)
  const story = buildStory(name, websiteUrl, location)
  const seoKeywordPhrases = seoPhrases(name, tags)
  const seoDescription = truncateMeta(`${name}: ${description} Listed in the ECKE vendor directory.`)
  return {
    name,
    slug,
    location,
    description,
    story,
    websiteUrl,
    logo125Url: `/images/vendors/${slug}/logo-125.jpg`,
    tagSlugs: tags,
    isPaid: false,
    seoDescription,
    seoKeywordPhrases,
  }
})

const outPath = join(root, 'src/data/onboardedVendors.data.js')
const fileContent = `// Auto-generated by scripts/generate-onboarded-vendors-data.mjs
export const onboardedVendors = ${JSON.stringify(objects, null, 2)}
`
writeFileSync(outPath, fileContent, 'utf8')

const logoJobs = objects.map((o) => ({ slug: o.slug, url: o.websiteUrl }))
writeFileSync(
  join(root, 'docs/ONBOARD_LOGO_JOBS.json'),
  JSON.stringify(logoJobs, null, 2),
  'utf8'
)

console.log('Wrote', objects.length, 'vendors to', outPath)
console.log('Wrote docs/ONBOARD_LOGO_JOBS.json')
