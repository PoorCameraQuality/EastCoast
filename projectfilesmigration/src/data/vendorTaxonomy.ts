export type VendorTagGroup = {
  id: string
  name: string
  slug: string
  sortOrder: number
  isActive: boolean
}

export type VendorTag = {
  id: string
  groupId: string
  name: string
  slug: string
  description?: string
  searchWeight: number
  isActive: boolean
}

const GROUPS = {
  productType: 'tg_product_type',
  playStyle: 'tg_play_style',
  craftMakerType: 'tg_craft_maker_type',
  communityAccessibility: 'tg_community_accessibility',
  material: 'tg_material',
  sensationType: 'tg_sensation_type',
  vendorFeatures: 'tg_vendor_features',
} as const

export const TAG_GROUPS: VendorTagGroup[] = [
  {
    id: GROUPS.productType,
    name: 'Product Type Tags',
    slug: 'product_type',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: GROUPS.playStyle,
    name: 'Play Style Tags',
    slug: 'play_style',
    sortOrder: 20,
    isActive: false,
  },
  {
    id: GROUPS.craftMakerType,
    name: 'Craft / Maker Type Tags',
    slug: 'craft_maker_type',
    sortOrder: 30,
    isActive: true,
  },
  {
    id: GROUPS.communityAccessibility,
    name: 'Community & Accessibility Tags',
    slug: 'community_accessibility',
    sortOrder: 40,
    isActive: false,
  },
  {
    id: GROUPS.material,
    name: 'Material Tags',
    slug: 'material',
    sortOrder: 50,
    isActive: false,
  },
  {
    id: GROUPS.sensationType,
    name: 'Sensation Type Tags',
    slug: 'sensation_type',
    sortOrder: 60,
    isActive: false,
  },
  {
    id: GROUPS.vendorFeatures,
    name: 'Vendor Feature Tags',
    slug: 'vendor_features',
    sortOrder: 70,
    isActive: false,
  },
]

// Note: IDs are stable, slugs are SEO-friendly, and `searchWeight` supports future ranking.
export const TAGS: VendorTag[] = [
  // Product Type
  { id: 't_impact_implements', groupId: GROUPS.productType, name: 'Impact Implements', slug: 'impact-implements', searchWeight: 3, isActive: true },
  { id: 't_restraints_bondage_gear', groupId: GROUPS.productType, name: 'Restraints & Bondage Gear', slug: 'restraints-bondage-gear', searchWeight: 3, isActive: true },
  { id: 't_sensation_play_tools', groupId: GROUPS.productType, name: 'Sensation Play Tools', slug: 'sensation-play-tools', searchWeight: 2, isActive: true },
  { id: 't_electro_play_gear', groupId: GROUPS.productType, name: 'Electro Play Gear', slug: 'electro-play-gear', searchWeight: 2, isActive: true },
  { id: 't_insertables_body_toys', groupId: GROUPS.productType, name: 'Insertables & Body Toys', slug: 'insertables-body-toys', searchWeight: 2, isActive: true },
  { id: 't_clothing_fetish_wear', groupId: GROUPS.productType, name: 'Clothing & Fetish Wear', slug: 'clothing-fetish-wear', searchWeight: 3, isActive: true },
  { id: 't_jewelry_collars', groupId: GROUPS.productType, name: 'Jewelry & Collars', slug: 'jewelry-collars', searchWeight: 2, isActive: true },
  { id: 't_roleplay_costume', groupId: GROUPS.productType, name: 'Roleplay & Costume', slug: 'roleplay-costume', searchWeight: 2, isActive: true },
  { id: 't_dungeon_equipment_furniture', groupId: GROUPS.productType, name: 'Dungeon Equipment & Furniture', slug: 'dungeon-equipment-furniture', searchWeight: 2, isActive: true },
  { id: 't_decor_lifestyle_aftercare', groupId: GROUPS.productType, name: 'Decor / Lifestyle / Aftercare', slug: 'decor-lifestyle-aftercare', searchWeight: 1, isActive: true },
  { id: 't_media_education_products', groupId: GROUPS.productType, name: 'Media & Education Products', slug: 'media-education-products', searchWeight: 1, isActive: true },
  { id: 't_services_experiences', groupId: GROUPS.productType, name: 'Services & Experiences', slug: 'services-experiences', searchWeight: 1, isActive: true },
  { id: 't_photography_content', groupId: GROUPS.productType, name: 'Photography & Content', slug: 'photography-content', searchWeight: 1, isActive: true },
  { id: 't_chastity_cages', groupId: GROUPS.productType, name: 'Chastity & Cages', slug: 'chastity-cages', searchWeight: 2, isActive: true },
  { id: 't_pup_play_gear', groupId: GROUPS.productType, name: 'Pup Play Gear', slug: 'pup-play-gear', searchWeight: 2, isActive: true },
  { id: 't_little_space_abdl', groupId: GROUPS.productType, name: 'Little Space / ABDL', slug: 'little-space-abdl', searchWeight: 1, isActive: true },

  // Play Style
  { id: 't_impact_play', groupId: GROUPS.playStyle, name: 'Impact Play', slug: 'impact-play', searchWeight: 3, isActive: true },
  { id: 't_rope_suspension', groupId: GROUPS.playStyle, name: 'Rope / Suspension', slug: 'rope-suspension', searchWeight: 3, isActive: true },
  { id: 't_sensation_play', groupId: GROUPS.playStyle, name: 'Sensation Play', slug: 'sensation-play', searchWeight: 2, isActive: true },
  { id: 't_power_exchange_protocol', groupId: GROUPS.playStyle, name: 'Power Exchange / Protocol', slug: 'power-exchange-protocol', searchWeight: 2, isActive: true },
  { id: 't_pet_play', groupId: GROUPS.playStyle, name: 'Pet Play', slug: 'pet-play', searchWeight: 2, isActive: true },
  { id: 't_roleplay_fantasy', groupId: GROUPS.playStyle, name: 'Roleplay / Fantasy', slug: 'roleplay-fantasy', searchWeight: 2, isActive: true },
  { id: 't_electro_play', groupId: GROUPS.playStyle, name: 'Electro Play', slug: 'electro-play', searchWeight: 2, isActive: true },
  { id: 't_wax_temperature_play', groupId: GROUPS.playStyle, name: 'Wax / Temperature Play', slug: 'wax-temperature-play', searchWeight: 2, isActive: true },
  { id: 't_medical_play', groupId: GROUPS.playStyle, name: 'Medical Play', slug: 'medical-play', searchWeight: 1, isActive: true },
  { id: 't_sharps_play', groupId: GROUPS.playStyle, name: 'Sharps Play', slug: 'sharps-play', searchWeight: 1, isActive: true },
  { id: 't_cbt', groupId: GROUPS.playStyle, name: 'CBT', slug: 'cbt', searchWeight: 1, isActive: true },
  { id: 't_hypnosis_psychological_play', groupId: GROUPS.playStyle, name: 'Hypnosis / Psychological Play', slug: 'hypnosis-psychological-play', searchWeight: 1, isActive: true },
  { id: 't_exhibition_performance', groupId: GROUPS.playStyle, name: 'Exhibition / Performance', slug: 'exhibition-performance', searchWeight: 1, isActive: true },
  { id: 't_fire_play', groupId: GROUPS.playStyle, name: 'Fire Play', slug: 'fire-play', searchWeight: 1, isActive: true },

  // Craft / Maker Type
  { id: 't_handmade_leather', groupId: GROUPS.craftMakerType, name: 'Handmade Leather', slug: 'handmade-leather', searchWeight: 3, isActive: true },
  { id: 't_handmade_silicone', groupId: GROUPS.craftMakerType, name: 'Handmade Silicone', slug: 'handmade-silicone', searchWeight: 2, isActive: true },
  { id: 't_textile_clothing_maker', groupId: GROUPS.craftMakerType, name: 'Textile / Clothing Maker', slug: 'textile-clothing-maker', searchWeight: 2, isActive: true },
  { id: 't_metalwork_chain_jewelry', groupId: GROUPS.craftMakerType, name: 'Metalwork / Chain / Jewelry', slug: 'metalwork-chain-jewelry', searchWeight: 2, isActive: true },
  { id: 't_woodworking', groupId: GROUPS.craftMakerType, name: 'Woodworking', slug: 'woodworking', searchWeight: 2, isActive: true },
  { id: 't_glasswork', groupId: GROUPS.craftMakerType, name: 'Glasswork', slug: 'glasswork', searchWeight: 2, isActive: true },
  { id: 't_stonework', groupId: GROUPS.craftMakerType, name: 'Stonework', slug: 'stonework', searchWeight: 2, isActive: true },
  { id: 't_ceramics_pottery', groupId: GROUPS.craftMakerType, name: 'Ceramics / Pottery', slug: 'ceramics-pottery', searchWeight: 1, isActive: true },
  { id: 't_natural_materials_maker', groupId: GROUPS.craftMakerType, name: 'Natural Materials Maker', slug: 'natural-materials-maker', searchWeight: 1, isActive: true },
  { id: 't_mixed_media_maker', groupId: GROUPS.craftMakerType, name: 'Mixed Media Maker', slug: 'mixed-media-maker', searchWeight: 1, isActive: true },
  { id: 't_resin_acrylic', groupId: GROUPS.craftMakerType, name: 'Resin / Acrylic', slug: 'resin-acrylic', searchWeight: 1, isActive: true },
  { id: 't_3d_printed_items', groupId: GROUPS.craftMakerType, name: '3D Printed Items', slug: '3d-printed-items', searchWeight: 1, isActive: true },
  { id: 't_reseller_curated_shop', groupId: GROUPS.craftMakerType, name: 'Reseller / Curated Shop', slug: 'reseller-curated-shop', searchWeight: 1, isActive: true },
  { id: 't_custom_commission_vendor', groupId: GROUPS.craftMakerType, name: 'Custom Commission Vendor', slug: 'custom-commission-vendor', searchWeight: 3, isActive: true },

  // Community & Accessibility
  { id: 't_lgbtq_owned', groupId: GROUPS.communityAccessibility, name: 'LGBTQ+ Owned', slug: 'lgbtq-owned', searchWeight: 2, isActive: true },
  { id: 't_gender_affirming_gear', groupId: GROUPS.communityAccessibility, name: 'Gender Affirming Gear', slug: 'gender-affirming-gear', searchWeight: 2, isActive: true },
  { id: 't_plus_size_friendly', groupId: GROUPS.communityAccessibility, name: 'Plus Size Friendly', slug: 'plus-size-friendly', searchWeight: 2, isActive: true },
  { id: 't_beginner_friendly_vendor', groupId: GROUPS.communityAccessibility, name: 'Beginner Friendly Vendor', slug: 'beginner-friendly-vendor', searchWeight: 1, isActive: true },
  { id: 't_educational_focused_vendor', groupId: GROUPS.communityAccessibility, name: 'Educational Focused Vendor', slug: 'educational-focused-vendor', searchWeight: 1, isActive: true },
  { id: 't_accessibility_focused_gear', groupId: GROUPS.communityAccessibility, name: 'Accessibility Focused Gear', slug: 'accessibility-focused-gear', searchWeight: 1, isActive: true },
  { id: 't_lifestyle_24_7_wear_gear', groupId: GROUPS.communityAccessibility, name: 'Lifestyle / 24-7 Wear Gear', slug: 'lifestyle-24-7-wear-gear', searchWeight: 1, isActive: true },

  // Materials
  { id: 't_leather', groupId: GROUPS.material, name: 'Leather', slug: 'leather', searchWeight: 3, isActive: true },
  { id: 't_vegan_leather', groupId: GROUPS.material, name: 'Vegan Leather', slug: 'vegan-leather', searchWeight: 2, isActive: true },
  { id: 't_silicone', groupId: GROUPS.material, name: 'Silicone', slug: 'silicone', searchWeight: 2, isActive: true },
  { id: 't_latex_rubber', groupId: GROUPS.material, name: 'Latex / Rubber', slug: 'latex-rubber', searchWeight: 2, isActive: true },
  { id: 't_metal', groupId: GROUPS.material, name: 'Metal', slug: 'metal', searchWeight: 2, isActive: true },
  { id: 't_wood', groupId: GROUPS.material, name: 'Wood', slug: 'wood', searchWeight: 2, isActive: true },
  { id: 't_rope_fabric', groupId: GROUPS.material, name: 'Rope / Fabric', slug: 'rope-fabric', searchWeight: 2, isActive: true },
  { id: 't_fur_faux_fur', groupId: GROUPS.material, name: 'Fur / Faux Fur', slug: 'fur-faux-fur', searchWeight: 1, isActive: true },
  { id: 't_resin_acrylic_material', groupId: GROUPS.material, name: 'Resin / Acrylic', slug: 'resin-acrylic-material', searchWeight: 1, isActive: true },

  // Sensation Type
  { id: 't_stingy', groupId: GROUPS.sensationType, name: 'Stingy', slug: 'stingy', searchWeight: 1, isActive: true },
  { id: 't_thuddy', groupId: GROUPS.sensationType, name: 'Thuddy', slug: 'thuddy', searchWeight: 1, isActive: true },
  { id: 't_tickly', groupId: GROUPS.sensationType, name: 'Tickly', slug: 'tickly', searchWeight: 1, isActive: true },
  { id: 't_sharp_sensation', groupId: GROUPS.sensationType, name: 'Sharp Sensation', slug: 'sharp-sensation', searchWeight: 1, isActive: true },
  { id: 't_restrictive', groupId: GROUPS.sensationType, name: 'Restrictive', slug: 'restrictive', searchWeight: 1, isActive: true },
  { id: 't_weighted', groupId: GROUPS.sensationType, name: 'Weighted', slug: 'weighted', searchWeight: 1, isActive: true },
  { id: 't_soft_sensual', groupId: GROUPS.sensationType, name: 'Soft / Sensual', slug: 'soft-sensual', searchWeight: 1, isActive: true },

  // Vendor Features
  { id: 't_custom_orders_available', groupId: GROUPS.vendorFeatures, name: 'Custom Orders Available', slug: 'custom-orders-available', searchWeight: 3, isActive: true },
  { id: 't_ready_to_ship_items', groupId: GROUPS.vendorFeatures, name: 'Ready to Ship Items', slug: 'ready-to-ship-items', searchWeight: 2, isActive: true },
  { id: 't_event_pickup_available', groupId: GROUPS.vendorFeatures, name: 'Event Pickup Available', slug: 'event-pickup-available', searchWeight: 1, isActive: true },
  { id: 't_workshop_education_offered', groupId: GROUPS.vendorFeatures, name: 'Workshop / Education Offered', slug: 'workshop-education-offered', searchWeight: 1, isActive: true },
  { id: 't_dungeon_tested_professional_use', groupId: GROUPS.vendorFeatures, name: 'Dungeon Tested / Professional Use', slug: 'dungeon-tested-professional-use', searchWeight: 1, isActive: true },
]

export const tagGroupsBySlug = Object.fromEntries(TAG_GROUPS.map((g) => [g.slug, g])) as Record<string, VendorTagGroup>
export const tagGroupsById = Object.fromEntries(TAG_GROUPS.map((g) => [g.id, g])) as Record<string, VendorTagGroup>

export const tagsBySlug = Object.fromEntries(TAGS.map((t) => [t.slug, t])) as Record<string, VendorTag>
export const tagsById = Object.fromEntries(TAGS.map((t) => [t.id, t])) as Record<string, VendorTag>

export const tagsByGroupId = TAGS.reduce<Record<string, VendorTag[]>>((acc, t) => {
  acc[t.groupId] = acc[t.groupId] || []
  acc[t.groupId].push(t)
  return acc
}, {})

