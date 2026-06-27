import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveDualReadHeroUrl } from '@/lib/kinkSocialPhotoManifest'

export type KinkSocialMediaEntityType =
  | 'education_article'
  | 'convention'
  | 'event'
  | 'dungeon'
  | 'vendor'
  | 'group'
  | 'organization'
  | 'place'
  | 'presenter'

export type EntityHeroGalleryItem = {
  publicUrl: string
  ordinal: number
  altText: string | null
}

export type EntityHeroAndGallery = {
  heroUrl: string | null
  gallery: EntityHeroGalleryItem[]
}

type MediaRow = {
  role: string
  ordinal: number
  public_url: string
  alt_text: string | null
}

export async function resolveEntityHeroAndGallery(
  client: SupabaseClient,
  entityType: KinkSocialMediaEntityType,
  entitySlug: string,
  legacyHeroUrl?: string | null,
): Promise<EntityHeroAndGallery> {
  const slug = entitySlug.toLowerCase()
  try {
    const { data, error } = await client
      .from('kink_social_media_assets')
      .select('role, ordinal, public_url, alt_text')
      .eq('entity_type', entityType)
      .eq('entity_slug', slug)
      .order('ordinal', { ascending: true })

    if (error || !data?.length) {
      return { heroUrl: legacyHeroUrl?.trim() || null, gallery: [] }
    }

    const rows = data as MediaRow[]
    const heroRow = rows.find((row) => row.role === 'hero')
    const gallery = rows
      .filter((row) => row.role === 'gallery')
      .map((row) => ({
        publicUrl: row.public_url,
        ordinal: row.ordinal,
        altText: row.alt_text,
      }))

    return {
      heroUrl: resolveDualReadHeroUrl(heroRow?.public_url, legacyHeroUrl),
      gallery,
    }
  } catch {
    return { heroUrl: legacyHeroUrl?.trim() || null, gallery: [] }
  }
}

export async function resolveEntityHeroUrl(
  client: SupabaseClient,
  entityType: KinkSocialMediaEntityType,
  entitySlug: string,
  legacyHeroUrl?: string | null,
): Promise<string | null> {
  const resolved = await resolveEntityHeroAndGallery(client, entityType, entitySlug, legacyHeroUrl)
  return resolved.heroUrl
}
