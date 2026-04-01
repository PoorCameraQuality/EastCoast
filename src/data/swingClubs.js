import { swingClubsNortheastMidatlantic } from './swingClubs/northeast-midatlantic.js'
import { swingClubsWesternUs } from './swingClubs/western-us.js'
import { dungeons } from './dungeons.js'
import { ASSET_OVERRIDES } from './swingClubs/asset-overrides.generated.js'

const merged = [...swingClubsNortheastMidatlantic, ...swingClubsWesternUs]

function applyAssetOverrides(list) {
  return list.map((c) => {
    const o = ASSET_OVERRIDES[c.slug]
    if (!o) return c
    return { ...c, ...o }
  })
}

function assertUniqueSlugs(list) {
  const seen = new Set()
  for (const c of list) {
    if (seen.has(c.slug)) {
      throw new Error(`Duplicate swing club slug: ${c.slug}`)
    }
    seen.add(c.slug)
  }
}

function assertNoDungeonSlugCollision(list) {
  const dungeonSlugs = new Set(dungeons.map((d) => d.slug))
  for (const c of list) {
    if (dungeonSlugs.has(c.slug)) {
      throw new Error(`Swing slug collides with dungeon slug: ${c.slug}`)
    }
  }
}

assertUniqueSlugs(merged)
assertNoDungeonSlugCollision(merged)

/** @type {typeof merged} */
export const swingClubs = applyAssetOverrides(merged.sort((a, b) => a.name.localeCompare(b.name)))

export const getSwingClubBySlug = (slug) => swingClubs.find((c) => c.slug === slug)

export const getAllSwingClubs = () => [...swingClubs]

export const getSwingClubsByLocation = (state) =>
  swingClubs.filter((c) => c.location.state === state)

export const generateSwingClubSEO = (club) => {
  const { generateSwingClubTitle } = require('@/lib/seo-helpers')
  const optimizedTitle = generateSwingClubTitle(club)
  return {
    title: optimizedTitle,
    description: club.seo.description,
    keywords: club.seo.keywords,
    openGraph: {
      title: optimizedTitle,
      description: club.seo.description,
      images: club.logo
        ? [`https://www.eastcoastkinkevents.com${club.logo}`]
        : ['https://www.eastcoastkinkevents.com/og-image.png'],
      type: 'website',
    },
  }
}
