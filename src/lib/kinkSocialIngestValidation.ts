import { z } from 'zod'

export const KINK_SOCIAL_SOURCE_SYSTEM = 'kink.social' as const
export const SUPPORTED_ENTITY_TYPES = ['education_article'] as const
export type SupportedEntityType = (typeof SUPPORTED_ENTITY_TYPES)[number]

export const INGEST_ERROR_CODES = [
  'missing_auth',
  'bad_auth',
  'unsupported_entity_type',
  'invalid_envelope',
  'invalid_payload',
  'restricted_field',
  'slug_collision',
  'supabase_unavailable',
  'upsert_failed',
  'unpublish_failed',
] as const

export type IngestErrorCode = (typeof INGEST_ERROR_CODES)[number]

const RESTRICTED_PAYLOAD_FIELDS = new Set([
  'privateNotes',
  'internalNotes',
  'memberOnlyBody',
  'connectionOnlyBody',
  'draftBody',
  'hiddenAuthorData',
  'moderationNotes',
  'applicationMaterials',
  'references',
  'safetyReports',
  'attendeeNames',
  'rsvpList',
  'privateAddress',
  'privateContact',
  'staffOnlyNotes',
  'organizerOnlyMaterials',
  'applicationAnswers',
])

const PRIVATE_KINK_SOCIAL_PATH_SEGMENTS = [
  '/messages',
  '/settings',
  '/admin',
  '/dm',
  '/inbox',
  '/notifications',
  '/moderation',
  '/staff',
  '/organizer',
  '/api/',
  '/auth/',
  '/login',
  '/door',
  '/vetting',
  '/applications',
  '/rsvp',
  '/members',
  '/connections',
  '/draft',
  '/compose',
  '/internal',
]

const KINK_SOCIAL_URL_RE = /https?:\/\/(?:www\.)?kink\.social\b[^\s"'<>]*/i
const KINK_SOCIAL_HOST_RE = /\bkink\.social\b/i

const eckePhotoAssetSchema = z.object({
  sourceMediaAssetId: z.string().uuid(),
  role: z.enum(['hero', 'gallery', 'logo', 'thumbnail']),
  ordinal: z.number().int().min(0).max(999),
  publicUrl: z.string().url().max(2000),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  sha256Hash: z.string().max(128).nullable(),
  altText: z.string().max(500).nullable(),
})

const eckePhotosManifestSchema = z.object({
  manifestVersion: z.literal(1),
  hero: eckePhotoAssetSchema.nullable(),
  gallery: z.array(eckePhotoAssetSchema).max(48).default([]),
})

const educationArticlePayloadSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().min(1).max(2000),
  bodyHtml: z.string().min(1),
  authorDisplayName: z.string().min(1).max(200),
  authorUsername: z.string().max(100).nullable().optional(),
  authorProfileUrl: z.string().url().max(2000).nullable().optional(),
  presenterProfileUrl: z.string().url().max(2000).nullable().optional(),
  contentWarnings: z.array(z.string().max(200)).default([]),
  categories: z.array(z.string().min(1).max(100)).min(1),
  difficulty: z.string().max(100).nullable().optional(),
  readingMinutes: z.number().int().positive().max(999).nullable().optional(),
  publishedAt: z.string().min(1),
  updatedAt: z.string().min(1),
  heroImageUrl: z.string().url().max(2000).nullable().optional(),
  seoTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  photos: eckePhotosManifestSchema.optional(),
})

const upsertEnvelopeSchema = z.object({
  sourceSystem: z.literal(KINK_SOCIAL_SOURCE_SYSTEM),
  entityType: z.enum(SUPPORTED_ENTITY_TYPES),
  sourceId: z.string().uuid(),
  sourceUpdatedAt: z.string().min(1),
  action: z.literal('upsert'),
  visibility: z.literal('PUBLIC'),
  publishToEcke: z.literal(true),
  publicSafe: z.literal(true),
  idempotencyKey: z.string().min(1).max(500),
  canonicalKinkSocialUrl: z.string().url().max(2000).optional(),
  preferredSlug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  allowSlugSuffix: z.boolean().optional(),
  payload: z.unknown(),
})

export const unpublishEnvelopeSchema = z.object({
  sourceSystem: z.literal(KINK_SOCIAL_SOURCE_SYSTEM),
  entityType: z.enum(SUPPORTED_ENTITY_TYPES),
  sourceId: z.string().uuid(),
  action: z.literal('unpublish'),
  reason: z.enum(['archived', 'deleted', 'opt_out', 'ineligible', 'visibility_change']).optional(),
})

export type EducationArticlePayload = z.infer<typeof educationArticlePayloadSchema>
export type UpsertEnvelope = z.infer<typeof upsertEnvelopeSchema>
export type UnpublishEnvelope = z.infer<typeof unpublishEnvelopeSchema>

export type IngestSuccessResponse = {
  status: 'published' | 'unpublished'
  eckeSlug: string
  eckePublicUrl: string
  eckeRecordId?: string
  idempotent?: boolean
}

export type IngestErrorResponse = {
  status: 'rejected'
  errorCode: IngestErrorCode
  errorMessage: string
}

export type IngestAuthHeaders = {
  get(name: string): string | null
}

export function getIngestSecret(): string | null {
  const secret = process.env.KINK_SOCIAL_INGEST_SECRET?.trim()
  return secret || null
}

export function verifyIngestAuth(headers: IngestAuthHeaders): IngestErrorCode | null {
  const secret = getIngestSecret()
  if (!secret) return 'missing_auth'

  const header = headers.get('authorization')
  if (!header) return 'missing_auth'

  const match = /^Bearer\s+(.+)$/i.exec(header)
  if (!match) return 'missing_auth'

  const token = match[1].trim()
  if (!token || token !== secret) return 'bad_auth'

  return null
}

export function findRestrictedFieldInPayload(payload: unknown): string | null {
  if (payload === null || typeof payload !== 'object') return null

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const hit = findRestrictedFieldInPayload(item)
      if (hit) return hit
    }
    return null
  }

  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (RESTRICTED_PAYLOAD_FIELDS.has(key)) return key
    const nested = findRestrictedFieldInPayload(value)
    if (nested) return nested
  }

  return null
}

export function textContainsKinkSocialReference(text: string): boolean {
  return KINK_SOCIAL_URL_RE.test(text) || KINK_SOCIAL_HOST_RE.test(text)
}

export function isUnsafeKinkSocialProfileUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase()
    if (host !== 'kink.social') return false
    const path = parsed.pathname.toLowerCase()
    return PRIVATE_KINK_SOCIAL_PATH_SEGMENTS.some((segment) => path.includes(segment))
  } catch {
    return false
  }
}

/** True when text includes a kink.social URL pointing at a member-only app surface. */
export function textContainsUnsafeKinkSocialUrl(text: string): boolean {
  const urlRe = /https?:\/\/(?:www\.)?kink\.social\b[^\s"'<>]*/gi
  let match: RegExpExecArray | null
  while ((match = urlRe.exec(text)) !== null) {
    if (isUnsafeKinkSocialProfileUrl(match[0])) return true
  }
  return false
}

export function validateEducationArticlePrivacy(payload: EducationArticlePayload): string | null {
  const textFields: Array<[string, string]> = [
    ['bodyHtml', payload.bodyHtml],
    ['excerpt', payload.excerpt],
    ['title', payload.title],
    ['authorDisplayName', payload.authorDisplayName],
  ]

  for (const [field, value] of textFields) {
    if (textContainsUnsafeKinkSocialUrl(value)) {
      return field
    }
  }

  if (payload.authorProfileUrl && isUnsafeKinkSocialProfileUrl(payload.authorProfileUrl)) {
    return 'authorProfileUrl'
  }
  if (payload.presenterProfileUrl && isUnsafeKinkSocialProfileUrl(payload.presenterProfileUrl)) {
    return 'presenterProfileUrl'
  }

  return null
}

export function validateUpsertEnvelope(body: unknown):
  | { ok: true; envelope: UpsertEnvelope; payload: EducationArticlePayload }
  | { ok: false; errorCode: IngestErrorCode; errorMessage: string } {
  const envelopeResult = upsertEnvelopeSchema.safeParse(body)
  if (!envelopeResult.success) {
    const unsupported =
      typeof body === 'object' &&
      body !== null &&
      'entityType' in body &&
      (body as { entityType?: string }).entityType !== 'education_article'

    if (unsupported) {
      return {
        ok: false,
        errorCode: 'unsupported_entity_type',
        errorMessage: 'Only education_article is supported in this pass',
      }
    }

    return {
      ok: false,
      errorCode: 'invalid_envelope',
      errorMessage: 'Invalid ingest envelope',
    }
  }

  const envelope = envelopeResult.data

  const restricted = findRestrictedFieldInPayload(envelope.payload)
  if (restricted) {
    return {
      ok: false,
      errorCode: 'restricted_field',
      errorMessage: `Payload contains restricted field: ${restricted}`,
    }
  }

  const payloadResult = educationArticlePayloadSchema.safeParse(envelope.payload)
  if (!payloadResult.success) {
    return {
      ok: false,
      errorCode: 'invalid_payload',
      errorMessage: 'Invalid education_article payload',
    }
  }

  const payload = payloadResult.data
  const privacyField = validateEducationArticlePrivacy(payload)
  if (privacyField) {
    return {
      ok: false,
      errorCode: 'restricted_field',
      errorMessage: `Payload field contains disallowed kink.social reference: ${privacyField}`,
    }
  }

  return { ok: true, envelope, payload }
}

export function validateUnpublishEnvelope(body: unknown):
  | { ok: true; envelope: UnpublishEnvelope }
  | { ok: false; errorCode: IngestErrorCode; errorMessage: string } {
  const result = unpublishEnvelopeSchema.safeParse(body)
  if (!result.success) {
    const unsupported =
      typeof body === 'object' &&
      body !== null &&
      'entityType' in body &&
      (body as { entityType?: string }).entityType !== 'education_article'

    if (unsupported) {
      return {
        ok: false,
        errorCode: 'unsupported_entity_type',
        errorMessage: 'Only education_article is supported in this pass',
      }
    }

    return {
      ok: false,
      errorCode: 'invalid_envelope',
      errorMessage: 'Invalid unpublish envelope',
    }
  }

  return { ok: true, envelope: result.data }
}

export function buildDeterministicSlugSuffix(sourceId: string): string {
  const fragment = sourceId.replace(/-/g, '').slice(0, 8)
  return `c2k-${fragment}`.toLowerCase()
}

export function resolveEducationArticleSlug(input: {
  preferredSlug?: string
  payloadSlug: string
  sourceId: string
  allowSlugSuffix?: boolean
  existingBySource: { id: string; slug: string } | null
  slugOwner: { id: string; slug: string } | null
}): { ok: true; slug: string } | { ok: false; errorCode: 'slug_collision' } {
  const baseSlug = (input.preferredSlug || input.payloadSlug).toLowerCase()

  if (input.existingBySource) {
    if (!input.slugOwner || input.slugOwner.id === input.existingBySource.id) {
      return { ok: true, slug: baseSlug }
    }
    if (!input.allowSlugSuffix) {
      return { ok: false, errorCode: 'slug_collision' }
    }
    const suffixed = `${baseSlug}-${buildDeterministicSlugSuffix(input.sourceId)}`
    return { ok: true, slug: suffixed }
  }

  if (!input.slugOwner) {
    return { ok: true, slug: baseSlug }
  }

  if (!input.allowSlugSuffix) {
    return { ok: false, errorCode: 'slug_collision' }
  }

  const suffixed = `${baseSlug}-${buildDeterministicSlugSuffix(input.sourceId)}`
  return { ok: true, slug: suffixed }
}

export function isKinkSocialSourcedArticle(article: {
  c2k_source_id?: string | null
  c2k_source_type?: string | null
  source_attribution?: string | null
}): boolean {
  if (article.c2k_source_id) return true
  if (article.c2k_source_type === 'education_article') return true
  const attr = (article.source_attribution || '').toLowerCase()
  return attr.includes('kink.social')
}

const KINK_SOCIAL_PRIVATE_URL_RE =
  /https?:\/\/(?:www\.)?kink\.social(?:\/api\b|\/messages\b|\/dm\b|\/inbox\b|\/settings\b|\/profile\/edit\b|\/education\/write\b|\/organizer\b)[^\s"'<>]*/i

export function isKinkSocialSourcedEvent(event: {
  c2kSourceId?: string | null
  c2kSourceType?: string | null
}): boolean {
  if (event.c2kSourceId) return true
  const t = (event.c2kSourceType || '').toLowerCase()
  return t === 'event' || t === 'convention'
}

/** Public-safe kink.social deep link for C2K-published ECKE events. */
export function resolveKinkSocialEventCtaUrl(input: {
  c2kSourceId?: string | null
  c2kSourceType?: string | null
  eckeSlug: string
}): string | null {
  const base = process.env.NEXT_PUBLIC_C2K_PUBLIC_URL?.trim()
  if (!base || !input.c2kSourceId) return null

  const sourceType = (input.c2kSourceType || 'event').toLowerCase()
  let href: string
  if (sourceType === 'convention') {
    href = `${base.replace(/\/$/, '')}/conventions/${encodeURIComponent(input.eckeSlug)}`
  } else {
    href = `${base.replace(/\/$/, '')}/events/${encodeURIComponent(input.c2kSourceId)}`
  }

  if (KINK_SOCIAL_PRIVATE_URL_RE.test(href)) return null
  return href
}

export function __kinkSocialIngestSelfTest(): void {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`[kink-social-ingest-selftest] ${msg}`)
  }

  assert(verifyIngestAuth({ get: () => null }) === 'missing_auth', 'missing header')

  const prev = process.env.KINK_SOCIAL_INGEST_SECRET
  process.env.KINK_SOCIAL_INGEST_SECRET = 'test-secret'
  assert(
    verifyIngestAuth({
      get: (k: string) => (k.toLowerCase() === 'authorization' ? 'Bearer wrong' : null),
    }) === 'bad_auth',
    'bad auth',
  )

  const validPayload = {
    title: 'Safety Basics',
    slug: 'safety-basics',
    excerpt: 'A short public excerpt.',
    bodyHtml: '<p>Public body</p>',
    authorDisplayName: 'Alex Educator',
    contentWarnings: ['discussion of power exchange'],
    categories: ['Safety'],
    publishedAt: '2026-06-01',
    updatedAt: '2026-06-01',
  }

  const validEnvelope = {
    sourceSystem: KINK_SOCIAL_SOURCE_SYSTEM,
    entityType: 'education_article',
    sourceId: '11111111-1111-4111-8111-111111111111',
    sourceUpdatedAt: '2026-06-01T00:00:00.000Z',
    action: 'upsert',
    visibility: 'PUBLIC',
    publishToEcke: true,
    publicSafe: true,
    idempotencyKey: 'kink.social:education_article:11111111-1111-4111-8111-111111111111',
    payload: validPayload,
  }

  const accepted = validateUpsertEnvelope(validEnvelope)
  assert(accepted.ok, 'valid education_article accepted')

  const badEntity = validateUpsertEnvelope({ ...validEnvelope, entityType: 'event' })
  assert(!badEntity.ok && badEntity.errorCode === 'unsupported_entity_type', 'unsupported entity')

  const nonPublic = validateUpsertEnvelope({ ...validEnvelope, visibility: 'MEMBERS' })
  assert(!nonPublic.ok && nonPublic.errorCode === 'invalid_envelope', 'non-PUBLIC rejected')

  const noPublish = validateUpsertEnvelope({ ...validEnvelope, publishToEcke: false })
  assert(!noPublish.ok && noPublish.errorCode === 'invalid_envelope', 'publishToEcke false rejected')

  const notSafe = validateUpsertEnvelope({ ...validEnvelope, publicSafe: false })
  assert(!notSafe.ok && notSafe.errorCode === 'invalid_envelope', 'publicSafe false rejected')

  const restricted = validateUpsertEnvelope({
    ...validEnvelope,
    payload: { ...validPayload, privateNotes: 'secret' },
  })
  assert(!restricted.ok && restricted.errorCode === 'restricted_field', 'restricted field rejected')

  const privateUrl = validateUpsertEnvelope({
    ...validEnvelope,
    payload: { ...validPayload, bodyHtml: '<p>See https://kink.social/messages/1</p>' },
  })
  assert(!privateUrl.ok && privateUrl.errorCode === 'restricted_field', 'private url in body rejected')

  const brandMention = validateUpsertEnvelope({
    ...validEnvelope,
    payload: {
      ...validPayload,
      title: 'Kink.Social comes online in alpha',
      excerpt: 'kink.social alpha launch',
      bodyHtml: '<p>Visit kink.social for the community platform.</p>',
    },
  })
  assert(brandMention.ok, 'kink.social brand mentions allowed in education payload')

  const slugCollision = resolveEducationArticleSlug({
    payloadSlug: 'safety-basics',
    sourceId: '11111111-1111-4111-8111-111111111111',
    allowSlugSuffix: false,
    existingBySource: null,
    slugOwner: { id: 'other', slug: 'safety-basics' },
  })
  assert(!slugCollision.ok && slugCollision.errorCode === 'slug_collision', 'slug collision without suffix')

  const slugSuffix = resolveEducationArticleSlug({
    payloadSlug: 'safety-basics',
    sourceId: '11111111-1111-4111-8111-111111111111',
    allowSlugSuffix: true,
    existingBySource: null,
    slugOwner: { id: 'other', slug: 'safety-basics' },
  })
  assert(slugSuffix.ok && slugSuffix.slug.includes('c2k-'), 'slug suffix applied')

  const unpublishOk = validateUnpublishEnvelope({
    sourceSystem: KINK_SOCIAL_SOURCE_SYSTEM,
    entityType: 'education_article',
    sourceId: '11111111-1111-4111-8111-111111111111',
    action: 'unpublish',
  })
  assert(unpublishOk.ok, 'unpublish envelope accepted')

  assert(
    isKinkSocialSourcedArticle({ c2k_source_id: '11111111-1111-4111-8111-111111111111' }),
    'CTA source detection by c2k_source_id',
  )
  assert(!isKinkSocialSourcedArticle({ source_attribution: 'East Coast Kink Events' }), 'non-C2K article hidden')

  assert(isKinkSocialSourcedEvent({ c2kSourceId: '11111111-1111-4111-8111-111111111111' }), 'C2K event by id')
  const prevC2kUrl = process.env.NEXT_PUBLIC_C2K_PUBLIC_URL
  process.env.NEXT_PUBLIC_C2K_PUBLIC_URL = 'https://kink.social'
  assert(
    resolveKinkSocialEventCtaUrl({
      c2kSourceId: '11111111-1111-4111-8111-111111111111',
      c2kSourceType: 'event',
      eckeSlug: 'rope-munch',
    }) === 'https://kink.social/events/11111111-1111-4111-8111-111111111111',
    'event CTA url',
  )
  assert(
    resolveKinkSocialEventCtaUrl({
      c2kSourceId: '22222222-2222-4222-8222-222222222222',
      c2kSourceType: 'convention',
      eckeSlug: 'preview-c2k-weekend',
    }) === 'https://kink.social/conventions/preview-c2k-weekend',
    'convention CTA url',
  )
  if (prevC2kUrl === undefined) delete process.env.NEXT_PUBLIC_C2K_PUBLIC_URL
  else process.env.NEXT_PUBLIC_C2K_PUBLIC_URL = prevC2kUrl

  if (prev === undefined) delete process.env.KINK_SOCIAL_INGEST_SECRET
  else process.env.KINK_SOCIAL_INGEST_SECRET = prev

  console.log('[OK] kink-social education ingest self-test passed')
}
