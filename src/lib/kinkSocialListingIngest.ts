import { randomUUID } from 'crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  LISTING_PROJECTIONS,
  unpublishListingProjection,
  upsertListingProjection,
} from '@/lib/kinkSocialListingProjection'
import type { IngestErrorResponse } from '@/lib/kinkSocialIngestValidation'
import {
  getListingWebhookSecret,
  validateListingUnpublishEnvelope,
  validateListingUpsertEnvelope,
  verifyListingWebhookAuth,
  type ListingErrorCode,
  type ListingPayload,
  type ListingSuccessResponse,
  type ListingUnpublishEnvelope,
  type ListingUpsertEnvelope,
} from '@/lib/kinkSocialListingValidation'
import { BASE_URL } from '@/lib/seo'
import { submitSingleContentUrlToIndexNow } from '@/lib/indexnow'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export { __kinkSocialListingSelfTest } from '@/lib/kinkSocialListingValidation'

function listingJsonError(
  errorCode: ListingErrorCode,
  errorMessage: string,
  httpStatus: number,
): NextResponse<IngestErrorResponse> {
  return NextResponse.json({ status: 'rejected', errorCode, errorMessage }, { status: httpStatus })
}

function mapPayloadToGroupRow(
  envelope: ListingUpsertEnvelope,
  payload: ListingPayload,
): Record<string, unknown> {
  const syncedAt = new Date().toISOString()
  return {
    slug: payload.slug.toLowerCase(),
    name: payload.title,
    description: payload.description?.trim() || null,
    public_location_summary: payload.location?.trim() || null,
    logo_url: payload.imageUrl ?? null,
    kink_social_canonical_url: envelope.canonicalKinkSocialUrl ?? null,
    cta_url: envelope.canonicalKinkSocialUrl ?? null,
    org_slug: payload.orgSlug?.toLowerCase() ?? null,
    org_display_name: payload.orgDisplayName ?? null,
    status: 'published',
    source_system: envelope.sourceSystem,
    c2k_source_type: 'group',
    c2k_source_id: envelope.sourceId,
    source_attribution: 'kink.social',
    last_synced_at: syncedAt,
    updated_at: syncedAt,
  }
}

function logListingEvent(event: Record<string, unknown>): void {
  console.info('[kink-social-listing]', event)
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

export async function upsertGroupListing(
  envelope: ListingUpsertEnvelope,
  payload: ListingPayload,
  requestId: string,
): Promise<NextResponse<ListingSuccessResponse | IngestErrorResponse>> {
  const started = Date.now()
  const admin = getSupabaseAdminClient()
  if (!admin) {
    return listingJsonError('supabase_unavailable', 'Supabase admin client unavailable', 503)
  }

  const { data: existingBySource, error: sourceLookupError } = await admin
    .from('group_listings')
    .select('id, slug')
    .eq('c2k_source_type', 'group')
    .eq('c2k_source_id', envelope.sourceId)
    .maybeSingle()

  if (sourceLookupError) {
    return listingJsonError('upsert_failed', 'Failed to look up group by source identity', 500)
  }

  const slug = payload.slug.toLowerCase()
  const { data: slugOwner, error: slugLookupError } = await admin
    .from('group_listings')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (slugLookupError) {
    return listingJsonError('upsert_failed', 'Failed to look up group by slug', 500)
  }

  if (slugOwner && slugOwner.id !== existingBySource?.id) {
    return listingJsonError('slug_collision', 'Slug is owned by another group listing', 409)
  }

  const row = mapPayloadToGroupRow(envelope, payload)

  if (existingBySource?.id) {
    const { data: updated, error: updateError } = await admin
      .from('group_listings')
      .update(row)
      .eq('id', existingBySource.id)
      .select('id, slug')
      .single()

    if (updateError || !updated) {
      return listingJsonError('upsert_failed', 'Failed to update group listing', 500)
    }

    const eckePublicUrl = `${BASE_URL}/groups/${updated.slug}`
    logListingEvent({
      requestId,
      entityType: envelope.entityType,
      sourceId: envelope.sourceId,
      action: 'upsert',
      status: 'published',
      durationMs: Date.now() - started,
    })
    void notifyIndexNow(requestId, envelope.sourceId, eckePublicUrl)

    return NextResponse.json({
      status: 'published',
      eckeSlug: updated.slug,
      eckePublicUrl,
      eckeRecordId: updated.id,
    })
  }

  const { data: inserted, error: insertError } = await admin
    .from('group_listings')
    .insert(row)
    .select('id, slug')
    .single()

  if (insertError || !inserted) {
    if (insertError?.code === '23505') {
      return listingJsonError('slug_collision', 'Slug conflicts with an existing group listing', 409)
    }
    console.error('[kink-social-listing] insert failed', insertError)
    return listingJsonError(
      'upsert_failed',
      insertError?.message ? `Failed to insert group listing: ${insertError.message}` : 'Failed to insert group listing',
      500,
    )
  }

  const eckePublicUrl = `${BASE_URL}/groups/${inserted.slug}`
  logListingEvent({
    requestId,
    entityType: envelope.entityType,
    sourceId: envelope.sourceId,
    action: 'upsert',
    status: 'published',
    durationMs: Date.now() - started,
  })
  void notifyIndexNow(requestId, envelope.sourceId, eckePublicUrl)

  return NextResponse.json({
    status: 'published',
    eckeSlug: inserted.slug,
    eckePublicUrl,
    eckeRecordId: inserted.id,
  })
}

export async function unpublishGroupListing(
  envelope: ListingUnpublishEnvelope,
  requestId: string,
): Promise<NextResponse<ListingSuccessResponse | IngestErrorResponse>> {
  const started = Date.now()
  const admin = getSupabaseAdminClient()
  if (!admin) {
    return listingJsonError('supabase_unavailable', 'Supabase admin client unavailable', 503)
  }

  const { data: existing, error: lookupError } = await admin
    .from('group_listings')
    .select('id, slug')
    .eq('c2k_source_type', 'group')
    .eq('c2k_source_id', envelope.sourceId)
    .maybeSingle()

  if (lookupError) {
    return listingJsonError('unpublish_failed', 'Failed to look up group by source identity', 500)
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
    .from('group_listings')
    .update({
      status: 'draft',
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)

  if (updateError) {
    return listingJsonError('unpublish_failed', 'Failed to unpublish group listing', 500)
  }

  const eckePublicUrl = `${BASE_URL}/groups/${existing.slug}`
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
    eckePublicUrl,
  })
}

export async function handleKinkSocialListingWebhook(request: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID()
  if (!getListingWebhookSecret()) {
    return listingJsonError('missing_auth', 'Listing webhook authentication is not configured', 503)
  }

  const authError = verifyListingWebhookAuth(request.headers)
  if (authError) {
    return listingJsonError(
      authError,
      authError === 'bad_auth' ? 'Invalid listing webhook credentials' : 'Missing or invalid Authorization header',
      401,
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return listingJsonError('invalid_envelope', 'Request body must be valid JSON', 400)
  }

  const action =
    typeof body === 'object' && body !== null && 'action' in body
      ? (body as { action?: string }).action
      : undefined

  if (action === 'unpublish') {
    const validated = validateListingUnpublishEnvelope(body)
    if (!validated.ok) {
      return listingJsonError(validated.errorCode, validated.errorMessage, 400)
    }
    const config = LISTING_PROJECTIONS[validated.envelope.entityType]
    if (!config) {
      return listingJsonError('unsupported_entity_type', 'Unsupported listing entity type', 400)
    }
    return unpublishListingProjection(config, validated.envelope, requestId)
  }

  const validated = validateListingUpsertEnvelope(body)
  if (!validated.ok) {
    const httpStatus =
      validated.errorCode === 'unsupported_entity_type' ? 400
      : validated.errorCode === 'restricted_field' ? 403
      : validated.errorCode === 'slug_collision' ? 409
      : 400
    return listingJsonError(validated.errorCode, validated.errorMessage, httpStatus)
  }

  const config = LISTING_PROJECTIONS[validated.envelope.entityType]
  if (!config) {
    return listingJsonError('unsupported_entity_type', 'Unsupported listing entity type', 400)
  }
  return upsertListingProjection(config, validated.envelope, validated.payload, requestId)
}
