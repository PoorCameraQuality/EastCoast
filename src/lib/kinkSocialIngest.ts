import { randomUUID } from 'crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { submitSingleContentUrlToIndexNow } from '@/lib/indexnow'
import {
  getIngestSecret,
  resolveEducationArticleSlug,
  validateUnpublishEnvelope,
  validateUpsertEnvelope,
  verifyIngestAuth,
  type EducationArticlePayload,
  type IngestErrorCode,
  type IngestErrorResponse,
  type IngestSuccessResponse,
  type UnpublishEnvelope,
  type UpsertEnvelope,
} from '@/lib/kinkSocialIngestValidation'
import { BASE_URL } from '@/lib/seo'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import {
  resolveEckePayloadHeroUrl,
  setArticleHeroMediaPointer,
  upsertKinkSocialPhotoManifest,
  type EckePhotosManifest,
} from '@/lib/kinkSocialPhotoManifest'

export {
  __kinkSocialIngestSelfTest,
  isKinkSocialSourcedArticle,
} from '@/lib/kinkSocialIngestValidation'

function ingestJsonError(
  errorCode: IngestErrorCode,
  errorMessage: string,
  httpStatus: number,
): NextResponse<IngestErrorResponse> {
  return NextResponse.json({ status: 'rejected', errorCode, errorMessage }, { status: httpStatus })
}

function mapPayloadToArticleRow(
  envelope: UpsertEnvelope,
  payload: EducationArticlePayload,
  slug: string,
): Record<string, unknown> {
  const readTime =
    payload.readingMinutes != null ? `${payload.readingMinutes} min read` : null

  const heroUrl = resolveEckePayloadHeroUrl({
    photos: payload.photos as EckePhotosManifest | undefined,
    legacyHeroUrl: payload.heroImageUrl,
  })

  return {
    title: payload.title,
    slug,
    excerpt: payload.excerpt.slice(0, 500),
    content: payload.bodyHtml,
    author_name: payload.authorDisplayName,
    author_bio: '',
    category: payload.categories[0] || 'Education',
    tags: payload.categories,
    status: 'published',
    publish_date: payload.publishedAt,
    last_updated: payload.updatedAt,
    read_time: readTime,
    seo_title: payload.seoTitle ?? payload.title,
    meta_description: (payload.metaDescription ?? payload.excerpt).slice(0, 500),
    og_image: heroUrl,
    content_warnings: payload.contentWarnings,
    difficulty: payload.difficulty ?? null,
    author_username: payload.authorUsername ?? null,
    author_profile_url: payload.authorProfileUrl ?? null,
    presenter_profile_url: payload.presenterProfileUrl ?? null,
    kink_social_canonical_url: envelope.canonicalKinkSocialUrl ?? null,
    source_attribution: 'kink.social member',
    last_synced_at: new Date().toISOString(),
    c2k_source_type: 'education_article',
    c2k_source_id: envelope.sourceId,
    featured: false,
  }
}

function logIngestEvent(event: {
  requestId: string
  entityType: string
  sourceId: string
  action: string
  status: string
  durationMs?: number
  indexNowStatus?: number
  indexNowError?: string
}): void {
  console.info('[kink-social-ingest]', event)
}

async function notifyIndexNow(
  requestId: string,
  entityType: string,
  sourceId: string,
  publicUrl: string,
): Promise<void> {
  try {
    const result = await submitSingleContentUrlToIndexNow(publicUrl)
    logIngestEvent({
      requestId,
      entityType,
      sourceId,
      action: 'indexnow',
      status: result.ok ? 'ok' : 'failed',
      indexNowStatus: result.status,
      indexNowError: result.error,
    })
  } catch (error) {
    logIngestEvent({
      requestId,
      entityType,
      sourceId,
      action: 'indexnow',
      status: 'failed',
      indexNowError: error instanceof Error ? error.message : 'unknown',
    })
  }
}

async function syncEducationArticlePhotos(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  envelope: UpsertEnvelope,
  payload: EducationArticlePayload,
  slug: string,
): Promise<void> {
  if (!payload.photos) return
  const { heroMediaAssetRowId, error } = await upsertKinkSocialPhotoManifest(admin, {
    entityType: 'education_article',
    entitySlug: slug,
    c2kSourceId: envelope.sourceId,
    photos: payload.photos as EckePhotosManifest,
  })
  if (error) {
    console.warn('[kink-social-ingest] photo manifest upsert failed', { error, sourceId: envelope.sourceId })
    return
  }
  await setArticleHeroMediaPointer(admin, slug, heroMediaAssetRowId)
}

export async function upsertEducationArticle(
  envelope: UpsertEnvelope,
  payload: EducationArticlePayload,
  requestId: string,
): Promise<NextResponse<IngestSuccessResponse | IngestErrorResponse>> {
  const started = Date.now()
  const admin = getSupabaseAdminClient()
  if (!admin) {
    return ingestJsonError('supabase_unavailable', 'Supabase admin client unavailable', 503)
  }

  const { data: existingBySource, error: sourceLookupError } = await admin
    .from('articles')
    .select('id, slug')
    .eq('c2k_source_type', 'education_article')
    .eq('c2k_source_id', envelope.sourceId)
    .maybeSingle()

  if (sourceLookupError) {
    return ingestJsonError('upsert_failed', 'Failed to look up article by source identity', 500)
  }

  const baseSlug = (envelope.preferredSlug || payload.slug).toLowerCase()
  const { data: slugOwner, error: slugLookupError } = await admin
    .from('articles')
    .select('id, slug')
    .eq('slug', baseSlug)
    .maybeSingle()

  if (slugLookupError) {
    return ingestJsonError('upsert_failed', 'Failed to look up article by slug', 500)
  }

  const slugResolution = resolveEducationArticleSlug({
    preferredSlug: envelope.preferredSlug,
    payloadSlug: payload.slug,
    sourceId: envelope.sourceId,
    allowSlugSuffix: envelope.allowSlugSuffix,
    existingBySource: existingBySource ?? null,
    slugOwner: slugOwner ?? null,
  })

  if (!slugResolution.ok) {
    return ingestJsonError(
      'slug_collision',
      'Requested slug is owned by another article',
      409,
    )
  }

  const finalSlug = slugResolution.slug
  if (finalSlug !== baseSlug) {
    const { data: suffixOwner } = await admin
      .from('articles')
      .select('id')
      .eq('slug', finalSlug)
      .maybeSingle()

    if (suffixOwner && suffixOwner.id !== existingBySource?.id) {
      return ingestJsonError(
        'slug_collision',
        'Deterministic slug suffix still collides with an existing article',
        409,
      )
    }
  }

  const row = mapPayloadToArticleRow(envelope, payload, finalSlug)

  if (existingBySource?.id) {
    const { data: updated, error: updateError } = await admin
      .from('articles')
      .update(row)
      .eq('id', existingBySource.id)
      .select('id, slug')
      .single()

    if (updateError || !updated) {
      return ingestJsonError('upsert_failed', 'Failed to update article', 500)
    }

    const eckePublicUrl = `${BASE_URL}/education/${updated.slug}`
    logIngestEvent({
      requestId,
      entityType: envelope.entityType,
      sourceId: envelope.sourceId,
      action: 'upsert',
      status: 'published',
      durationMs: Date.now() - started,
    })
    void notifyIndexNow(requestId, envelope.entityType, envelope.sourceId, eckePublicUrl)
    await syncEducationArticlePhotos(admin, envelope, payload, updated.slug)

    return NextResponse.json({
      status: 'published',
      eckeSlug: updated.slug,
      eckePublicUrl,
      eckeRecordId: updated.id,
    })
  }

  const { data: inserted, error: insertError } = await admin
    .from('articles')
    .insert(row)
    .select('id, slug')
    .single()

  if (insertError || !inserted) {
    if (insertError?.code === '23505') {
      return ingestJsonError('slug_collision', 'Slug conflicts with an existing article', 409)
    }
    console.error('[kink-social-ingest] insert failed', insertError)
    return ingestJsonError(
      'upsert_failed',
      insertError?.message ? `Failed to insert article: ${insertError.message}` : 'Failed to insert article',
      500,
    )
  }

  const eckePublicUrl = `${BASE_URL}/education/${inserted.slug}`
  logIngestEvent({
    requestId,
    entityType: envelope.entityType,
    sourceId: envelope.sourceId,
    action: 'upsert',
    status: 'published',
    durationMs: Date.now() - started,
  })
  void notifyIndexNow(requestId, envelope.entityType, envelope.sourceId, eckePublicUrl)
  await syncEducationArticlePhotos(admin, envelope, payload, inserted.slug)

  return NextResponse.json({
    status: 'published',
    eckeSlug: inserted.slug,
    eckePublicUrl,
    eckeRecordId: inserted.id,
  })
}

export async function unpublishEducationArticle(
  envelope: UnpublishEnvelope,
  requestId: string,
): Promise<NextResponse<IngestSuccessResponse | IngestErrorResponse>> {
  const started = Date.now()
  const admin = getSupabaseAdminClient()
  if (!admin) {
    return ingestJsonError('supabase_unavailable', 'Supabase admin client unavailable', 503)
  }

  const { data: existing, error: lookupError } = await admin
    .from('articles')
    .select('id, slug')
    .eq('c2k_source_type', 'education_article')
    .eq('c2k_source_id', envelope.sourceId)
    .maybeSingle()

  if (lookupError) {
    return ingestJsonError('unpublish_failed', 'Failed to look up article by source identity', 500)
  }

  if (!existing) {
    logIngestEvent({
      requestId,
      entityType: envelope.entityType,
      sourceId: envelope.sourceId,
      action: 'unpublish',
      status: 'unpublished',
      durationMs: Date.now() - started,
    })
    return NextResponse.json({
      status: 'unpublished',
      eckeSlug: '',
      eckePublicUrl: '',
      idempotent: true,
    })
  }

  const { error: updateError } = await admin
    .from('articles')
    .update({
      status: 'draft',
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', existing.id)

  if (updateError) {
    return ingestJsonError('unpublish_failed', 'Failed to unpublish article', 500)
  }

  const eckePublicUrl = `${BASE_URL}/education/${existing.slug}`
  logIngestEvent({
    requestId,
    entityType: envelope.entityType,
    sourceId: envelope.sourceId,
    action: 'unpublish',
    status: 'unpublished',
    durationMs: Date.now() - started,
  })
  void notifyIndexNow(requestId, envelope.entityType, envelope.sourceId, eckePublicUrl)

  return NextResponse.json({
    status: 'unpublished',
    eckeSlug: existing.slug,
    eckePublicUrl,
  })
}

export async function handleKinkSocialIngest(request: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID()
  if (!getIngestSecret()) {
    return ingestJsonError('missing_auth', 'Ingest authentication is not configured', 503)
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return ingestJsonError('invalid_envelope', 'Request body must be valid JSON', 400)
  }

  const authError = verifyIngestAuth(request.headers, rawBody)
  if (authError) {
    return ingestJsonError(
      authError,
      authError === 'bad_auth' ? 'Invalid ingest credentials' : 'Missing or invalid Authorization header',
      401,
    )
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return ingestJsonError('invalid_envelope', 'Request body must be valid JSON', 400)
  }

  const validated = validateUpsertEnvelope(body)
  if (!validated.ok) {
    const httpStatus =
      validated.errorCode === 'unsupported_entity_type' ? 400
      : validated.errorCode === 'restricted_field' ? 403
      : 400
    return ingestJsonError(validated.errorCode, validated.errorMessage, httpStatus)
  }

  return upsertEducationArticle(validated.envelope, validated.payload, requestId)
}

export async function handleKinkSocialUnpublish(request: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID()
  if (!getIngestSecret()) {
    return ingestJsonError('missing_auth', 'Ingest authentication is not configured', 503)
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return ingestJsonError('invalid_envelope', 'Request body must be valid JSON', 400)
  }

  const authError = verifyIngestAuth(request.headers, rawBody)
  if (authError) {
    return ingestJsonError(
      authError,
      authError === 'bad_auth' ? 'Invalid ingest credentials' : 'Missing or invalid Authorization header',
      401,
    )
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return ingestJsonError('invalid_envelope', 'Request body must be valid JSON', 400)
  }

  const validated = validateUnpublishEnvelope(body)
  if (!validated.ok) {
    return ingestJsonError(validated.errorCode, validated.errorMessage, 400)
  }

  return unpublishEducationArticle(validated.envelope, requestId)
}
