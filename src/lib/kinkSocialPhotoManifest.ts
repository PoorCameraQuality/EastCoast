import type { SupabaseClient } from '@supabase/supabase-js'

export type EckePhotoAsset = {
  sourceMediaAssetId: string
  role: 'hero' | 'gallery' | 'logo' | 'thumbnail'
  ordinal: number
  publicUrl: string
  width: number | null
  height: number | null
  sha256Hash: string | null
  altText: string | null
}

export type EckePhotosManifest = {
  manifestVersion: 1
  hero: EckePhotoAsset | null
  gallery: EckePhotoAsset[]
}

export function resolveEckePayloadHeroUrl(input: {
  photos?: EckePhotosManifest | null
  legacyHeroUrl?: string | null
}): string | null {
  const fromManifest = input.photos?.hero?.publicUrl?.trim()
  if (fromManifest) return fromManifest
  const legacy = input.legacyHeroUrl?.trim()
  return legacy || null
}

/** Prefer synced manifest hero URL, then legacy column value. */
export function resolveDualReadHeroUrl(
  manifestHeroUrl?: string | null,
  legacyHeroUrl?: string | null,
): string | null {
  return resolveEckePayloadHeroUrl({
    photos: manifestHeroUrl
      ? {
          manifestVersion: 1,
          hero: {
            sourceMediaAssetId: '00000000-0000-4000-8000-000000000002',
            role: 'hero',
            ordinal: 0,
            publicUrl: manifestHeroUrl,
            width: null,
            height: null,
            sha256Hash: null,
            altText: null,
          },
          gallery: [],
        }
      : null,
    legacyHeroUrl,
  })
}

type UpsertPhotoManifestInput = {
  entityType: string
  entitySlug: string
  c2kSourceId: string
  photos: EckePhotosManifest
}

export async function upsertKinkSocialPhotoManifest(
  admin: SupabaseClient,
  input: UpsertPhotoManifestInput,
): Promise<{ heroMediaAssetRowId: string | null; error?: string }> {
  const assets = [
    ...(input.photos.hero ? [input.photos.hero] : []),
    ...input.photos.gallery,
  ]
  if (assets.length === 0) {
    return { heroMediaAssetRowId: null }
  }

  const syncedAt = new Date().toISOString()
  let heroRowId: string | null = null

  for (const asset of assets) {
    const row = {
      entity_type: input.entityType,
      entity_slug: input.entitySlug.toLowerCase(),
      c2k_source_id: input.c2kSourceId,
      source_media_asset_id: asset.sourceMediaAssetId,
      role: asset.role,
      ordinal: asset.ordinal,
      public_url: asset.publicUrl,
      width: asset.width,
      height: asset.height,
      sha256_hash: asset.sha256Hash,
      alt_text: asset.altText,
      source_attribution: 'kink.social',
      last_synced_at: syncedAt,
      updated_at: syncedAt,
    }

    const { data, error } = await admin
      .from('kink_social_media_assets')
      .upsert(row, {
        onConflict: 'entity_type,entity_slug,source_media_asset_id',
      })
      .select('id, role')
      .maybeSingle()

    if (error) {
      return { heroMediaAssetRowId: null, error: error.message }
    }

    if (data?.role === 'hero' && data.id) {
      heroRowId = data.id as string
    }
  }

  return { heroMediaAssetRowId: heroRowId }
}

export async function setArticleHeroMediaPointer(
  admin: SupabaseClient,
  articleSlug: string,
  heroMediaAssetRowId: string | null,
): Promise<void> {
  if (!heroMediaAssetRowId) return
  await admin
    .from('articles')
    .update({ hero_media_asset_id: heroMediaAssetRowId })
    .eq('slug', articleSlug.toLowerCase())
}
