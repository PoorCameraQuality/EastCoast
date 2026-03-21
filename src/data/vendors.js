// Vendor data for the marketplace.
//
// Tagging model (static, DB-shaped):
// - tagSlugs[] corresponds to `vendor_tags` (junction table) using tag `slug` values from `src/data/vendorTaxonomy.ts`
// - Paid vendors can add tag-specific product images:
//   - productImage125ByTagSlug.default is the fallback (no filter / no matching tag)
//   - productImage125ByTagSlug[<tagSlug>] is shown when that filter is active

export const vendors = [
  {
    name: 'Floggin Farmers',
    slug: 'floggin-farmers',
    location: 'Online • Etsy',
    description:
      'Handcrafted birch wood floggers and other impact implements. Custom options available.',
    story:
      'We’re Floggin Farmers—making handcrafted birch wood floggers and impact implements with an eye for balance, finish, and durability. We love building pieces that feel great in hand and hold up to real play. Custom options are available, and we’re happy to work with you on style, color, and handle preferences.',
    websiteUrl: 'https://www.etsy.com/shop/FlogginFarmers',
    logo125Url: '/images/vendors/floggin-farmers/logo-125.jpg',
    tagSlugs: [
      'impact-implements',
      'woodworking',
      'custom-commission-vendor',
    ],
    isPaid: false,
    productImage125ByTagSlug: {
      default: '/images/vendors/floggin-farmers/impact-implements-125.jpg',
      'impact-implements': '/images/vendors/floggin-farmers/impact-implements-125.jpg',
      woodworking: '/images/vendors/floggin-farmers/woodworking-125.jpg',
      'custom-commission-vendor': '/images/vendors/floggin-farmers/woodworking-125.jpg',
    },
  },
  {
    name: 'Dodson Designs',
    slug: 'dodson-designs',
    location: 'Denver, PA • USA',
    description:
      'Bespoke, heirloom-quality leather accessories and apparel—handcrafted with meticulous attention to detail.',
    story:
      'Dodson Designs creates bespoke and heirloom-quality leather accessories and apparel, handcrafted by veteran artist Donald Dodson in Pennsylvania. Their work blends functional craftsmanship with custom tooling for pieces designed to be used, loved, and passed down. They emphasize responsive communication and custom builds tailored to the end user.',
    websiteUrl: 'https://dodson-designs.com/',
    logo125Url: '/images/vendors/dodson-designs/logo-125.png',
    tagSlugs: [
      'handmade-leather',
      'custom-commission-vendor',
      'clothing-fetish-wear',
      'roleplay-costume',
    ],
    isPaid: false,
  },
  {
    name: 'EF Leather',
    slug: 'ef-leather',
    location: 'Online',
    description:
      'Handmade floggers, whips, and premium BDSM impact gear built for precision, balance, and durability.',
    story:
      'EF Leather specializes in high-quality impact toys including floggers, kangaroo-handled whips, nylon whips, galley whips, cat o’ nine tails, and leather goods. They describe a focus on precision, craftsmanship, and authenticity, with offerings that include vending, demonstrations, and educational classes. This listing is sourced from their public website.',
    websiteUrl: 'https://www.efleathercraft.com/',
    logo125Url: '/images/vendors/ef-leather/logo-125.png',
    tagSlugs: [
      'impact-implements',
      'handmade-leather',
      'custom-commission-vendor',
    ],
    isPaid: false,
  },
  {
    name: 'Free-to-be Boudoir',
    slug: 'free-to-be-boudoir',
    location: 'Online',
    description:
      'Boudoir photography and kink event coverage under the Free-to-be Boudoir brand.',
    story:
      'Free-to-be Boudoir provides photography services for kink events. Photographer details and additional background are available on their about page.',
    websiteUrl: 'https://waterfirephotography85.mypixieset.com/',
    logo125Url: '/images/f2b.PNG',
    tagSlugs: ['photography-content'],
    isPaid: false,
  },
  {
    name: 'Emma Alamo',
    slug: 'emma-alamo',
    location: 'Chicago, IL • USA',
    description:
      'Handmade leather harnesses and accessories for every body, made-to-order with custom sizing.',
    story:
      'Emma Alamo makes handmade leather harnesses and accessories in Chicago, Illinois, with an emphasis on custom sizing and made-to-order pieces. Their catalog includes collars & cuffs, chest harnesses, strap-on harnesses, hip harnesses, and accessories. This listing is sourced from their public website.',
    websiteUrl: 'https://emmaalamo.com/',
    logo125Url: '/images/vendors/emma-alamo/logo-125.png',
    tagSlugs: [
      'handmade-leather',
      'restraints-bondage-gear',
      'custom-commission-vendor',
    ],
    isPaid: false,
  },
  {
    name: 'Exploring Taboos',
    slug: 'exploring-taboos',
    location: 'Online',
    description:
      'A collection of short stories and related products, with options for audiobook, ebook, and print.',
    story:
      'Exploring Taboos is a site centered around a collection of 23 short stories, with purchase options including audiobook, ebook, and paperback/hardback. They also list additional products such as books, massage candles, and sensory items. This listing is sourced from their public website.',
    websiteUrl: 'https://exploringtaboos.com/',
    logo125Url: '/images/vendors/exploring-taboos/logo-125.png',
    tagSlugs: [
      'media-education-products',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
  {
    name: 'M. Benson',
    slug: 'm-benson',
    location: 'Online',
    description:
      'Luxury bondage gear made to exacting standards with an emphasis on lasting quality.',
    story:
      'M. Benson describes their work as luxury, high-end bondage gear made from high quality materials and built to last. Their site includes collections like Hellebore and a full catalog of products. This listing is sourced from their public website.',
    websiteUrl: 'https://mbensonjewelry.com/collections/hellebore',
    logo125Url: '/images/vendors/m-benson/logo-125.jpg',
    tagSlugs: [
      'restraints-bondage-gear',
      'metalwork-chain-jewelry',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
  {
    name: 'HOLO Leather',
    slug: 'holo-leather',
    location: 'Sugar Hill, GA • USA',
    description:
      'Handcrafted leather goods featuring comfort-focused construction and detailed finishing.',
    story:
      'HOLO Leather describes hand-crafted designs made from top grain leather and other materials, with well sewn edges and comfort-focused padding. Their public site lists contact details and a Georgia location. This listing is sourced from their public website.',
    websiteUrl: 'https://www.hololeathers.com/',
    logo125Url: '/images/vendors/holo-leather/logo-125.png',
    tagSlugs: [
      'handmade-leather',
      'restraints-bondage-gear',
      'custom-commission-vendor',
    ],
    isPaid: false,
  },
  {
    name: 'Kinky Elf Toys',
    slug: 'kinky-elf-toys',
    location: 'Online',
    description:
      'BDSM toys, impact implements, and dungeon furniture built by a maker who designs and manufactures their own pieces.',
    story:
      'Kinky Elf Toys describes themselves as a designer, builder, and manufacturer of BDSM toys, implements, and furniture—ranging from sensual to more intense styles. They note expanding from paddles into a wider range of implements and dungeon furniture. This listing is sourced from their public website.',
    websiteUrl: 'https://www.kinkyelftoys.com/',
    logo125Url: '/images/vendors/kinky-elf-toys/logo-125.jpg',
    tagSlugs: [
      'impact-implements',
      'dungeon-equipment-furniture',
      'woodworking',
      'custom-commission-vendor',
    ],
    isPaid: false,
  },
  {
    name: 'Shoshinsha',
    slug: 'shoshinsha',
    location: 'Online',
    description:
      'Japanese premium rope brand focused on high-quality shibari ropes crafted from natural materials.',
    story:
      'Shoshinsha describes a premium rope brand dedicated to developing and producing shibari ropes using traditional handcrafting techniques and natural materials. Their public site emphasizes gentle handling for sensitive skin and includes customization options. This listing is sourced from their public website.',
    websiteUrl: 'https://shoshinsha-store.com/',
    logo125Url: '/images/vendors/shoshinsha/logo-125.jpg',
    tagSlugs: [
      'restraints-bondage-gear',
      'reseller-curated-shop',
      'natural-materials-maker',
    ],
    isPaid: false,
  },
  {
    name: 'Steel Bones',
    slug: 'steel-bones',
    location: 'Houston, TX • USA',
    description:
      'A corsetiere bringing original designs to dynamic individuals of all genders.',
    story:
      'Steel Bones describes themselves as a sophisticated corsetiere with original designs and weekend shows around the USA, offering fittings for local Houston customers and video appointments. This listing is sourced from their public website.',
    websiteUrl: 'https://steelbones.com/',
    logo125Url: '/images/vendors/steel-bones/logo-125.png',
    tagSlugs: [
      'clothing-fetish-wear',
      'textile-clothing-maker',
      'custom-commission-vendor',
    ],
    isPaid: false,
  },
  {
    name: 'The Dungeon Store',
    slug: 'the-dungeon-store',
    location: 'Online',
    description:
      'Curated BDSM and fetish products including bondage gear, impact toys, and dungeon furniture.',
    story:
      'The Dungeon Store presents a curated collection of BDSM and fetish products, including bondage items, impact toys, and dungeon furniture. Their public storefront includes product categories spanning gear and accessories. This listing is sourced from their public website.',
    websiteUrl: 'https://thedungeonstore.com/',
    logo125Url: '/images/vendors/the-dungeon-store/logo-125.jpg',
    tagSlugs: [
      'restraints-bondage-gear',
      'impact-implements',
      'dungeon-equipment-furniture',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
  {
    name: 'Bound By Jay',
    slug: 'bound-by-jay',
    location: 'Richmond, VA • USA',
    description:
      'Queer-owned leather company crafting veg-tan leather gear, dyed and finished by hand.',
    story:
      'Bound By Jay is a queer-owned leather company based in Richmond, Virginia. Their gear is made from veg-tan leather that is processed and hand dyed in-house. For commissions, they invite customers to reach out directly via email.',
    websiteUrl: 'https://www.boundbyjay.com/',
    logo125Url: '/images/vendors/bound-by-jay/logo-125.webp',
    tagSlugs: [
      'handmade-leather',
      'custom-commission-vendor',
      'restraints-bondage-gear',
      'jewelry-collars',
    ],
    isPaid: false,
  },
  {
    name: 'Blush Industries',
    slug: 'blush-industries',
    location: 'Online',
    description:
      'Things to make you blush — toys and jewelry.',
    story:
      'Blush Industries offers toys and jewelry with a playful, cheeky vibe. Explore their catalog and shop by category as the marketplace expands. This listing is sourced from their public website.',
    websiteUrl: 'https://www.blushindustries.com/',
    logo125Url: '/images/vendors/blush-industries/logo-125.png',
    tagSlugs: [
      'insertables-body-toys',
      'jewelry-collars',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
  {
    name: 'Bitches Love Leather',
    slug: 'bitches-love-leather',
    location: 'Online',
    description:
      'BDSM leather gear including collars, restraints, gags, harnesses, accessories, and sets.',
    story:
      'Bitches Love Leather describes a BDSM leather company crafting a wide variety of leather items from collars and restraints to harnesses and custom gear. Their public site emphasizes quality pieces designed with comfort and enjoyment in mind. This listing is sourced from their public website.',
    websiteUrl: 'https://www.bllenterprises.com/',
    logo125Url: '/images/vendors/bitches-love-leather/logo-125.png',
    tagSlugs: [
      'handmade-leather',
      'custom-commission-vendor',
      'restraints-bondage-gear',
      'jewelry-collars',
    ],
    isPaid: false,
  },
  {
    name: 'Delicious Boutique',
    slug: 'delicious-boutique',
    location: 'Philadelphia, PA • USA',
    description:
      'Alternative fashion boutique featuring independent designers across clothing, accessories, and jewelry.',
    story:
      'Delicious Boutique is a Philadelphia-based boutique carrying a wide range of alternative fashion, accessories, and jewelry across many independent designers. Their public website includes in-store details and a large catalog. This listing is sourced from their public website.',
    websiteUrl: 'https://www.deliciousboutique.com/',
    logo125Url: '/images/vendors/delicious-boutique/logo-125.ico',
    tagSlugs: [
      'clothing-fetish-wear',
      'roleplay-costume',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
  {
    name: 'KINBAKU STUDIO',
    slug: 'kinbaku-studio',
    location: 'Online',
    description:
      'Premium handcrafted ropes (jute, bamboo silk, nylon), wax play candles, and suspension hardware inspired by Japanese tradition.',
    story:
      'Kinbaku Studio offers handcrafted ropes (including jute, bamboo silk, nylon, and conductive bamboo silk), along with wax play candles and suspension hardware. Their public site also describes professionally led classes and a studio environment supporting students at all levels. This listing is sourced from their public website.',
    websiteUrl: 'https://www.kinbaku-studio.com/',
    logo125Url: '/images/vendors/kinbaku-studio/logo-125.jpg',
    tagSlugs: [
      'restraints-bondage-gear',
      'sensation-play-tools',
      'natural-materials-maker',
    ],
    isPaid: false,
  },
  {
    name: 'KinkThink Factory',
    slug: 'kinkthink-factory',
    location: 'Online',
    description:
      'Kinky lifestyle celebration products like stickers, journals, books, coloring books, and custom merchandise.',
    story:
      'KinkThink Factory describes creating lifestyle celebration products and kinky merchandise that can be hard to find—like stickers, coloring books, journals, books, and custom shirts. This listing is sourced from their public website.',
    websiteUrl: 'https://www.kinkthinkfactory.com/',
    logo125Url: '/images/vendors/kinkthink-factory/logo-125.png',
    tagSlugs: [
      'media-education-products',
      'mixed-media-maker',
    ],
    isPaid: false,
  },
  {
    name: 'SlaveOutlet',
    slug: 'slaveoutlet',
    location: 'Online',
    description:
      'Online store offering a wide range of bondage gear and toys, including cuffs, collars, gags, hoods, and more.',
    story:
      'SlaveOutlet is a Shopify-based storefront with product categories spanning bondage gear and toys, including collars, cuffs/shackles, gags/muzzles, and hoods/blindfolds. Their homepage also lists upcoming vending appearances. This listing is sourced from their public website.',
    websiteUrl: 'https://slaveoutlet.myshopify.com/',
    logo125Url: '/images/vendors/slaveoutlet/logo-125.jpg',
    tagSlugs: [
      'restraints-bondage-gear',
      'sensation-play-tools',
      'jewelry-collars',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
  {
    name: 'WhippingStripes',
    slug: 'whippingstripes',
    location: 'Online',
    description: 'Hand crafted floggers, whips, and other BDSM toys.',
    story:
      'WhippingStripes describes creating hand crafted floggers, whips, and other BDSM toys. This listing is sourced from their public website.',
    websiteUrl: 'https://www.whippingstripes.com/',
    logo125Url: '/images/vendors/whippingstripes/logo-125.jpg',
    tagSlugs: [
      'impact-implements',
    ],
    isPaid: false,
  },
  {
    name: 'Captured Curls',
    slug: 'captured-curls',
    location: 'Online',
    description: 'Quirky, quality, cute hair accessories and crowns.',
    story:
      'Captured Curls is a Square Online storefront focused on hair accessories and crowns. This listing is sourced from their public website.',
    websiteUrl: 'https://captured-curls.square.site/',
    logo125Url: '/images/vendors/captured-curls/logo-125.png',
    tagSlugs: [
      'clothing-fetish-wear',
      'roleplay-costume',
      'textile-clothing-maker',
    ],
    isPaid: false,
  },
  {
    name: 'MarrusArt',
    slug: 'marrusart',
    location: 'New Orleans, LA • USA',
    description: 'Original art, prints, and gifts from a New Orleans-based artist.',
    story:
      'MarrusArt is the online home of an artist who shares originals and limited editions, prints, and gift items. Their public site describes decades of selling art at festivals and conventions, with a focus on expressive, metaphor-rich work. This listing is sourced from their public website.',
    websiteUrl: 'https://www.marrusart.com/',
    logo125Url: '/images/vendors/marrusart/logo-125.jpg',
    tagSlugs: [
      'decor-lifestyle-aftercare',
      'mixed-media-maker',
    ],
    isPaid: false,
  },
  {
    name: 'Chromaknotz',
    slug: 'chromaknotz',
    location: 'Online',
    description: 'Square Online storefront.',
    story:
      'Chromaknotz is a Square Online storefront. If you share what they specialize in (rope, apparel, accessories, etc.), we can tag it more precisely. This listing is sourced from their public website.',
    websiteUrl: 'https://chromaknotz.square.site/',
    logo125Url: '/images/vendors/chromaknotz/logo-125.png',
    tagSlugs: [],
    isPaid: false,
  },
  {
    name: 'WhipSinLeather',
    slug: 'whipsinleather',
    location: 'Online',
    description: 'Premium leather BDSM floggers crafted for a balanced feel and durability.',
    story:
      'WhipSinLeather describes premium leather BDSM floggers, handcrafted with care and built for a balanced feel. Their public site positions the brand around elegance, craftsmanship, and durability. This listing is sourced from their public website.',
    websiteUrl: 'https://whipsinleather.com/',
    logo125Url: '/images/vendors/whipsinleather/logo-125.png',
    tagSlugs: [
      'impact-implements',
      'handmade-leather',
    ],
    isPaid: false,
  },
  {
    name: 'KINK3D',
    slug: 'kink3d',
    location: 'Online',
    description:
      'Chastity cages and other premium toys designed and manufactured in the USA with cutting-edge 3D printing.',
    story:
      'KINK3D offers chastity cages (including the Cobra® and Viper® lines) and related accessories, emphasizing modern design and USA-based manufacturing using 3D printing. Their public site also lists additional premium toys and collaborations. This listing is sourced from their public website.',
    websiteUrl: 'https://kink3d.com/',
    logo125Url: '/images/vendors/kink3d/logo-125.png',
    tagSlugs: [
      'chastity-cages',
      'insertables-body-toys',
      '3d-printed-items',
    ],
    isPaid: false,
  },
  {
    name: 'Barking Leather',
    slug: 'barking-leather',
    location: 'Atlanta, GA • USA',
    description:
      'Leather gear and apparel including harnesses, bondage hoods/vests, collars & leashes, restraints, gags, and pup play gear.',
    story:
      'Barking Leather is a leather brand with product categories spanning apparel, harnesses, bondage/BDSM gear, and pup play items like hoods, paws, and tails. This listing is sourced from their public website.',
    websiteUrl: 'https://www.barkingleather.com/',
    logo125Url: '/images/vendors/barking-leather/logo-125.jpg',
    tagSlugs: [
      'handmade-leather',
      'clothing-fetish-wear',
      'restraints-bondage-gear',
      'jewelry-collars',
      'pup-play-gear',
    ],
    isPaid: false,
  },
  {
    name: 'Angel Eyes Photography',
    slug: 'angel-eyes-photography',
    location: 'Chicago, IL • USA',
    description:
      'Chicago-based photographer offering weddings, couples, portraits, headshots, and boudoir sessions.',
    story:
      'Angel Eyes Photography is a Chicago-based photography studio that also travels, with services spanning weddings, couples, portraits, headshots, and boudoir. This listing is sourced from their public website.',
    websiteUrl: 'https://angeleyesphotography.com/',
    logo125Url: '/images/vendors/angel-eyes-photography/logo-125.jpg',
    tagSlugs: [
      'services-experiences',
      'photography-content',
    ],
    isPaid: false,
  },
  {
    name: 'Canes4Pain',
    slug: 'canes4pain',
    location: 'Online',
    description:
      'Handmade premium rattan disciplinary canes and classic school canes for spanking, discipline, and BDSM.',
    story:
      'Canes4Pain is a long-running shop focused on rattan disciplinary canes and classic school-style canes, describing handmade finishing, testing, and a lifetime guarantee on their products. This listing is sourced from their public website.',
    websiteUrl: 'https://canes4pain.com/index.htm',
    logo125Url: '/images/vendors/canes4pain/logo-125.jpg',
    tagSlugs: [
      'impact-implements',
      'woodworking',
    ],
    isPaid: false,
  },
  {
    name: 'Corset Punk & Kilts',
    slug: 'corset-punk-kilts',
    location: 'Online',
    description:
      'Fully steel-boned handmade corsets and handmade kilts with pockets. Custom work available.',
    story:
      'Corset Punk & Kilts describes fully steel-boned handmade corsets designed for tight lacing, plus handmade kilts (with pockets), and notes custom work availability. This listing is sourced from their public website.',
    websiteUrl: 'https://www.corsetpunk.com/',
    logo125Url: '/images/vendors/corset-punk-kilts/logo-125.png',
    tagSlugs: [
      'clothing-fetish-wear',
      'textile-clothing-maker',
      'custom-commission-vendor',
    ],
    isPaid: false,
  },
  {
    name: 'Iron Wolf Forge',
    slug: 'iron-wolf-forge',
    location: 'Online',
    description:
      'Forge and maker shop (Iron Wolf Forge).',
    story:
      'Iron Wolf Forge is an online maker site. If you share what they specialize in (e.g., collars, tools, accessories), we can tag it more precisely. This listing is sourced from their public website.',
    websiteUrl: 'https://iwfonline.com/',
    logo125Url: '/images/vendors/iron-wolf-forge/logo-125.jpg',
    tagSlugs: [],
    isPaid: false,
  },
  {
    name: 'Jennifer Froh Jewelry',
    slug: 'jennifer-froh-jewelry',
    location: 'Online',
    description:
      'Sterling silver wirework statement jewelry.',
    story:
      'Jennifer Froh Jewelry describes sterling silver wirework statement jewelry sold via an online store. This listing is sourced from their public website.',
    websiteUrl: 'https://jenniferfroh.com/',
    logo125Url: '/images/vendors/jennifer-froh-jewelry/logo-125.png',
    tagSlugs: [
      'jewelry-collars',
      'metalwork-chain-jewelry',
    ],
    isPaid: false,
  },
  {
    name: 'Love in Many Forms',
    slug: 'love-in-many-forms',
    location: 'Online',
    description:
      'Ideas, tips, and inspiration for throwing an adult birthday celebration.',
    story:
      'Love in Many Forms positions itself as a source of ideas, tips, and inspiration for planning an adult birthday celebration. This listing is sourced from their public website.',
    websiteUrl: 'https://loveinmanyforms.com/',
    logo125Url: '/images/vendors/love-in-many-forms/logo-125.png',
    tagSlugs: [
      'media-education-products',
    ],
    isPaid: false,
  },
  {
    name: 'Wandering Acres Art (After Dark)',
    slug: 'wandering-acres-after-dark',
    location: 'Online',
    description:
      'After Dark collection from Wandering Acres Art.',
    story:
      'Wandering Acres Art hosts an “After Dark” section on their public site. If you share what’s sold here (prints, pins, apparel, etc.), we can tag it more precisely. This listing is sourced from their public website.',
    websiteUrl: 'https://www.wanderingacres.com/afterdark',
    logo125Url: '/images/vendors/wandering-acres-after-dark/logo-125.png',
    tagSlugs: [
      'decor-lifestyle-aftercare',
      'mixed-media-maker',
    ],
    isPaid: false,
  },
  {
    name: 'Sinsual Steel Designs',
    slug: 'sinsualsteel',
    location: 'Online',
    description:
      'Sinsual Steel Designs (online shop).',
    story:
      'Sinsual Steel Designs uses an online storefront under the SinsualSteel name. If you share what they specialize in, we can tag it more precisely. This listing is sourced from their public website.',
    websiteUrl: 'https://www.sinsualsteel.com/',
    logo125Url: '/images/vendors/sinsualsteel/logo-125.jpg',
    tagSlugs: [],
    isPaid: false,
  },
  {
    name: 'TheBeav Woodcrafting',
    slug: 'thebeav-woodcrafting',
    location: 'Online',
    description:
      'Handcrafted hardwoods and woodcraft pieces.',
    story:
      'TheBeav Woodcrafting describes handcrafted hardwoods and woodcraft. If you share the kink-relevant product lines (impact, furniture, accessories), we can tag it more precisely. This listing is sourced from their public website.',
    websiteUrl: 'https://thebeavwoodcrafting.com/',
    logo125Url: '/images/vendors/thebeav-woodcrafting/logo-125.jpg',
    tagSlugs: [
      'woodworking',
    ],
    isPaid: false,
  },
  {
    name: 'Unique Kink',
    slug: 'unique-kink',
    location: 'Online',
    description:
      'Online shop for kink and fetish gear across multiple categories.',
    story:
      'Unique Kink is an online storefront with a broad catalog and category navigation (including a “Leather 101” section), suggesting a curated multi-category shop. This listing is sourced from their public website.',
    websiteUrl: 'https://uniquekink.com/',
    logo125Url: '/images/vendors/unique-kink/logo-125.jpg',
    tagSlugs: [
      'reseller-curated-shop',
      'restraints-bondage-gear',
      'impact-implements',
      'clothing-fetish-wear',
      'jewelry-collars',
    ],
    isPaid: false,
  },
  {
    name: 'The Connected Unicorn',
    slug: 'the-connected-unicorn',
    location: 'Online',
    description:
      'Square Online site (The Connected Unicorn).',
    story:
      'The Connected Unicorn is a Square Online site. If you share what they offer (shop items, services, or community info), we can tag it more precisely. This listing is sourced from their public website.',
    websiteUrl: 'https://www.theconnectedunicorn.com/',
    logo125Url: '/images/vendors/the-connected-unicorn/logo-125.png',
    tagSlugs: [],
    isPaid: false,
  },
  {
    name: 'SnM Leatherworks',
    slug: 'snm-leatherworks',
    location: 'West Virginia • USA',
    description:
      'Handcrafted ready-made and custom order kinky leather tools and restraints.',
    story:
      'SnM Leatherworks describes a family-owned handcrafted kink and leather company making items that are hand cut, hand sewn, and hand assembled to customer specifications. Their shop includes ready-to-ship items like floggers and cuff sets, and they invite customers to contact them for recreations and custom requests. This listing is sourced from their public website.',
    websiteUrl: 'https://www.snmleatherworks.com/',
    logo125Url: '/images/vendors/snm-leatherworks/logo-125.png',
    tagSlugs: [
      'handmade-leather',
      'custom-commission-vendor',
      'impact-implements',
      'restraints-bondage-gear',
    ],
    isPaid: false,
  },
  {
    name: 'Lil Comforts',
    slug: 'lil-comforts',
    location: 'Online',
    description:
      'Adult baby diapers and ABDL pacifiers with cute designs and a snug fit.',
    story:
      'Lil Comforts is an online shop focused on adult baby diapers and ABDL pacifiers, emphasizing soft, high-quality products designed for comfort and fun. This listing is sourced from their public website.',
    websiteUrl: 'https://lilcomforts.com/',
    logo125Url: '/images/vendors/lil-comforts/logo-125.png',
    tagSlugs: [
      'little-space-abdl',
      'clothing-fetish-wear',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
  {
    name: 'Itty Bitty Littles',
    slug: 'itty-bitty-littles',
    location: 'Nashville, TN • USA',
    description:
      'Adult baby rompers and deco/custom pacifiers. Discreet shipping is emphasized.',
    story:
      'Itty Bitty Littles offers adult baby rompers along with deco pacifiers and custom pacifier options. Their public site emphasizes discreet shipping and a maker story rooted in creating special pacifiers for their community. This listing is sourced from their public website.',
    websiteUrl: 'https://www.ittybittylittles.com/',
    logo125Url: '/images/vendors/itty-bitty-littles/logo-125.jpg',
    tagSlugs: [
      'little-space-abdl',
      'clothing-fetish-wear',
      'custom-commission-vendor',
    ],
    isPaid: false,
  },
  {
    name: 'ObsessHarness',
    slug: 'obsessharness',
    location: 'Online',
    description:
      'Leather lingerie harnesses, cuffs, collars, masks, and bondage accessories with custom sizing options.',
    story:
      'ObsessHarness sells leather harness lingerie and BDSM accessories for women and men, including harness sets, cuffs, collars, and leather masks. Their public site emphasizes handcrafted production, premium materials, express shipping, and custom sizing/measurements at no additional charge. This listing is sourced from their public website.',
    websiteUrl: 'https://obsessharness.com/',
    logo125Url: '/images/vendors/obsessharness/logo-125.jpg',
    tagSlugs: [
      'handmade-leather',
      'custom-commission-vendor',
      'clothing-fetish-wear',
      'restraints-bondage-gear',
      'jewelry-collars',
    ],
    isPaid: false,
  },
  {
    name: 'BadPups Store',
    slug: 'badpups-store',
    location: 'Online',
    description:
      'Puppy play gear, pup hoods, collars, harnesses, chastity cages, and kink apparel with discreet worldwide shipping and payments.',
    story:
      'BadPups Store is an online shop focused on pup & pet play gear alongside broader BDSM gear, chastity, and apparel. Their public site highlights discreet packaging and payments, and they stock products across multiple categories and regions. This listing is sourced from their public website.',
    websiteUrl: 'https://store.badpups.com/',
    logo125Url: '/images/vendors/badpups-store/logo-125.jpg',
    tagSlugs: [
      'pup-play-gear',
      'chastity-cages',
      'restraints-bondage-gear',
      'clothing-fetish-wear',
      'jewelry-collars',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
  {
    name: 'KINK OV GEAR',
    slug: 'kink-ov-gear',
    location: 'UK • Online',
    description:
      'Fleshlight gas mask conversion specialist, sneaker mask sculptor, and puppy play handle harness & clubwear designer.',
    story:
      'KINK OV GEAR describes itself as a UK kinky emporium focused on upcycled and repurposed gear, including gas mask conversions, sneaker mask sculpture, puppy play handle harnesses, and clubwear designs. This listing is sourced from their public website.',
    websiteUrl: 'https://www.kinkovgear.com/',
    logo125Url: '/images/vendors/kink-ov-gear/logo-125.jpg',
    tagSlugs: [
      'pup-play-gear',
      'clothing-fetish-wear',
      'restraints-bondage-gear',
      'reseller-curated-shop',
    ],
    isPaid: false,
  },
]

export const getAllVendors = () => {
  return vendors.filter((v) => !v.isHidden)
}

export const getVendorBySlug = (slug) => {
  return vendors.find((v) => v.slug === slug && !v.isHidden)
}

/** Set to a vendor slug (e.g. `'floggin-farmers'`) for site-wide sponsor spotlight; `null` when no active sponsor. */
export const SITE_SPONSOR_VENDOR_SLUG = null

export const getSiteSponsorVendor = () => {
  if (!SITE_SPONSOR_VENDOR_SLUG) return null
  return getVendorBySlug(SITE_SPONSOR_VENDOR_SLUG)
}
