import { revalidatePath } from 'next/cache'
import { NextResponse, type NextResponse as NextResponseType } from 'next/server'
import { submitSingleContentUrlToIndexNow } from '@/lib/indexnow'
import type { IngestErrorResponse } from '@/lib/kinkSocialIngestValidation'
import {
  resolveEckePayloadHeroUrl,
  upsertKinkSocialPhotoManifest,
  type EckePhotosManifest,
} from '@/lib/kinkSocialPhotoManifest'
import {
  type ListingEntityType,
  type ListingErrorCode,
  type ListingPayload,
  type ListingSuccessResponse,
  type ListingUnpublishEnvelope,
  type ListingUpsertEnvelope,
} from '@/lib/kinkSocialListingValidation'
import { BASE_URL } from '@/lib/seo'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import type { KinkSocialMediaEntityType } from '@/lib/kinkSocialEntityMedia'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ListingProjectionConfig = {
  entityType: ListingEntityType
  table:
    | 'group_listings'
    | 'organization_listings'
    | 'convention_listings'
    | 'presenter_listings'
    | 'venue_listings'
  c2kSourceType: string
  detailPath: (slug: string) => string
  indexPath?: string
}

export const LISTING_PROJECTIONS: Record<ListingEntityType, ListingProjectionConfig> = {
  group: {
    entityType: 'group',
    table: 'group_listings',
    c2kSourceType: 'group',
    detailPath: (slug) => `/groups/${slug}`,
    indexPath: '/groups',
  },
  organization: {
    entityType: 'organization',
    table: 'organization_listings',
    c2kSourceType: 'organization',
    detailPath: (slug) => `/organizations/${slug}`,
    indexPath: '/organizations',
  },
  convention: {
    entityType: 'convention',
    table: 'convention_listings',
    c2kSourceType: 'convention',
    detailPath: (slug) => `/conventions/${slug}`,
    indexPath: '/conventions',
  },
  presenter: {
    entityType: 'presenter',
    table: 'presenter_listings',
    c2kSourceType: 'presenter',
    detailPath: (slug) => `/presenters/${slug}`,
    indexPath: '/presenters',
  },
  venue: {
    entityType: 'venue',
    table: 'venue_listings',
    c2kSourceType: 'venue',
    detailPath: (slug) => `/venues/${slug}`,
    indexPath: '/venues',
  },
}

function listingJsonError(
  errorCode: ListingErrorCode,
  errorMessage: string,
  httpStatus: number,
): NextResponse<IngestErrorResponse> {
  return NextResponse.json({ status: 'rejected', errorCode, errorMessage }, { status: httpStatus })
}

function logListingEvent(event: Record<string, unknown>): void {
  console.info('[kink-social-listing]', event)
}

function listingMediaEntityType(entityType: ListingEntityType): KinkSocialMediaEntityType | null {
  if (entityType === 'group') return 'group'
  if (entityType === 'organization') return 'organization'
  if (entityType === 'convention') return 'convention'
  if (entityType === 'presenter') return 'presenter'
  if (entityType === 'venue') return 'place'
  return null
}

export { listingMediaEntityType }

function resolveListingLogoUrl(payload: ListingPayload): string | null {
  return resolveEckePayloadHeroUrl({
    photos: payload.photos as EckePhotosManifest | undefined,
    legacyHeroUrl: payload.imageUrl,
  })
}

async function syncListingPhotos(
  admin: SupabaseClient,
  config: ListingProjectionConfig,
  envelope: ListingUpsertEnvelope,
  payload: ListingPayload,
  slug: string,
): Promise<void> {
  if (!payload.photos) return
  const entityType = listingMediaEntityType(config.entityType)
  if (!entityType) return

  const { error } = await upsertKinkSocialPhotoManifest(admin, {
    entityType,
    entitySlug: slug,
    c2kSourceId: envelope.sourceId,
    photos: payload.photos as EckePhotosManifest,
  })
  if (error) {
    console.warn('[kink-social-listing] photo manifest upsert failed', {
      error,
      entityType: config.entityType,
      sourceId: envelope.sourceId,
    })
  }
}

function mapPayloadToRow(
  config: ListingProjectionConfig,
  envelope: ListingUpsertEnvelope,
  payload: ListingPayload,
): Record<string, unknown> {
  const syncedAt = new Date().toISOString()
  const base: Record<string, unknown> = {
    slug: payload.slug.toLowerCase(),
    name: payload.title,
    description: payload.description?.trim() || null,
    public_location_summary: payload.location?.trim() || null,
    logo_url: resolveListingLogoUrl(payload),
    kink_social_canonical_url: envelope.canonicalKinkSocialUrl ?? null,
    cta_url: envelope.canonicalKinkSocialUrl ?? null,
    status: 'published',
    source_system: envelope.sourceSystem,
    c2k_source_type: config.c2kSourceType,
    c2k_source_id: envelope.sourceId,
    source_attribution: 'kink.social',
    last_synced_at: syncedAt,
    updated_at: syncedAt,
  }

  if (config.entityType === 'group' || config.entityType === 'convention') {
    base.org_slug = payload.orgSlug?.toLowerCase() ?? null
    base.org_display_name = payload.orgDisplayName ?? null
  }
  if (config.entityType === 'convention') {
    base.starts_at = payload.startsAt ?? null
    base.ends_at = payload.endsAt ?? null
  }
  if (config.entityType === 'organization' || config.entityType === 'presenter' || config.entityType === 'venue') {
    base.website_url = payload.websiteUrl ?? null
  }
  if (config.entityType === 'venue') {
    base.city = payload.city ?? null
    base.state = payload.state ?? null
  }

  return base
}

function revalidateListingPaths(config: ListingProjectionConfig, slug: string): void {
  try {
    revalidatePath(config.detailPath(slug))
    if (config.indexPath) revalidatePath(config.indexPath)
  } catch {
    // revalidatePath only works in server contexts; ignore in tests
  }
}

async function notifyIndexNow(requestId: string, sourceId: string, publicUrl: string): Promise<void> {
  try {
    const result = await submitSingleContentUrlToIndexNow(publicUrl)
    logListingEvent({
      requestId,
      sourceId,
      action: 'indexnow',
      status: result.ok ? 'ok' : 'failed',
      indexNowStatus: result.status,
      indexNowError: result.error,
    })
  } catch (error) {
    logListingEvent({
      requestId,
      sourceId,
      action: 'indexnow',
      status: 'failed',
      indexNowError: error instanceof Error ? error.message : 'unknown',
    })
  }
}

export async function upsertListingProjection(
  config: ListingProjectionConfig,
  envelope: ListingUpsertEnvelope,
  payload: ListingPayload,
  requestId: string,
): Promise<NextResponseType<ListingSuccessResponse | IngestErrorResponse>> {
  const started = Date.now()
  const admin = getSupabaseAdminClient()
  if (!admin) {
    return listingJsonError('supabase_unavailable', 'Supabase admin client unavailable', 503)
  }

  const { data: existingBySource, error: sourceLookupError } = await admin
    .from(config.table)
    .select('id, slug')
    .eq('c2k_source_type', config.c2kSourceType)
    .eq('c2k_source_id', envelope.sourceId)
    .maybeSingle()

  if (sourceLookupError) {
    return listingJsonError('upsert_failed', `Failed to look up ${config.entityType} by source identity`, 500)
  }

  const slug = payload.slug.toLowerCase()
  const { data: slugOwner, error: slugLookupError } = await admin
    .from(config.table)
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (slugLookupError) {
    return listingJsonError('upsert_failed', `Failed to look up ${config.entityType} by slug`, 500)
  }

  if (slugOwner && slugOwner.id !== existingBySource?.id) {
    return listingJsonError('slug_collision', `Slug is owned by another ${config.entityType} listing`, 409)
  }

  const row = mapPayloadToRow(config, envelope, payload)

  const writeRow = async (id?: string) => {
    if (id) {
      const { data: updated, error: updateError } = await admin
        .from(config.table)
        .update(row)
        .eq('id', id)
        .select('id, slug')
        .single()
      if (updateError || !updated) {
        return listingJsonError('upsert_failed', `Failed to update ${config.entityType} listing`, 500)
      }
      return updated
    }
    const { data: inserted, error: insertError } = await admin
      .from(config.table)
      .insert(row)
      .select('id, slug')
      .single()
    if (insertError || !inserted) {
      if (insertError?.code === '23505') {
        return listingJsonError('slug_collision', `Slug conflicts with an existing ${config.entityType} listing`, 409)
      }
      return listingJsonError('upsert_failed', `Failed to insert ${config.entityType} listing`, 500)
    }
    return inserted
  }

  const saved = await writeRow(existingBySource?.id)
  if (saved instanceof NextResponse) return saved

  await syncListingPhotos(admin, config, envelope, payload, saved.slug)

  const eckePublicUrl = `${BASE_URL}${config.detailPath(saved.slug)}`
  logListingEvent({
    requestId,
    entityType: envelope.entityType,
    sourceId: envelope.sourceId,
    action: 'upsert',
    status: 'published',
    durationMs: Date.now() - started,
  })
  revalidateListingPaths(config, saved.slug)
  void notifyIndexNow(requestId, envelope.sourceId, eckePublicUrl)

  return NextResponse.json({
    status: 'published',
    eckeSlug: saved.slug,
    eckePublicUrl,
    eckeRecordId: saved.id,
  })
}

export async function unpublishListingProjection(
  config: ListingProjectionConfig,
  envelope: ListingUnpublishEnvelope,
  requestId: string,
): Promise<NextResponseType<ListingSuccessResponse | IngestErrorResponse>> {
  const started = Date.now()
  const admin = getSupabaseAdminClient()
  if (!admin) {
    return listingJsonError('supabase_unavailable', 'Supabase admin client unavailable', 503)
  }

  const { data: existing, error: lookupError } = await admin
    .from(config.table)
    .select('id, slug')
    .eq('c2k_source_type', config.c2kSourceType)
    .eq('c2k_source_id', envelope.sourceId)
    .maybeSingle()

  if (lookupError) {
    return listingJsonError('unpublish_failed', `Failed to look up ${config.entityType} by source identity`, 500)
  }

  if (!existing) {
    logListingEvent({
      requestId,
      entityType: envelope.entityType,
      sourceId: envelope.sourceId,
      action: 'unpublish',
      status: 'unpublished',
      durationMs: Date.now() - started,
      idempotent: true,
    })
    return NextResponse.json({
      status: 'unpublished',
      eckeSlug: envelope.payload?.slug?.toLowerCase() ?? '',
      eckePublicUrl: '',
      idempotent: true,
    })
  }

  const { error: updateError } = await admin
    .from(config.table)
    .update({
      status: 'draft',
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)

  if (updateError) {
    return listingJsonError('unpublish_failed', `Failed to unpublish ${config.entityType} listing`, 500)
  }

  revalidateListingPaths(config, existing.slug)
  logListingEvent({
    requestId,
    entityType: envelope.entityType,
    sourceId: envelope.sourceId,
    action: 'unpublish',
    status: 'unpublished',
    durationMs: Date.now() - started,
  })

  return NextResponse.json({
    status: 'unpublished',
    eckeSlug: existing.slug,
    eckePublicUrl: `${BASE_URL}${config.detailPath(existing.slug)}`,
  })
}
