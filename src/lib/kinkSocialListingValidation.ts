import { z } from 'zod'

export const KINK_SOCIAL_SOURCE_SYSTEM = 'kink.social' as const

const LISTING_RESTRICTED_FIELDS = new Set([
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
  'memberList',
  'membershipList',
  'privateAddress',
  'privateContact',
  'staffOnlyNotes',
  'organizerOnlyMaterials',
  'applicationAnswers',
])

export type ListingErrorCode =
  | 'missing_auth'
  | 'bad_auth'
  | 'unsupported_entity_type'
  | 'invalid_envelope'
  | 'invalid_payload'
  | 'restricted_field'
  | 'slug_collision'
  | 'supabase_unavailable'
  | 'upsert_failed'
  | 'unpublish_failed'

export type ListingAuthHeaders = {
  get(name: string): string | null
}

function findRestrictedFieldInPayload(payload: unknown): string | null {
  if (payload === null || typeof payload !== 'object') return null

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const hit = findRestrictedFieldInPayload(item)
      if (hit) return hit
    }
    return null
  }

  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (LISTING_RESTRICTED_FIELDS.has(key)) return key
    const nested = findRestrictedFieldInPayload(value)
    if (nested) return nested
  }

  return null
}

export const LISTING_SUPPORTED_ENTITY_TYPES = ['group'] as const
export type ListingEntityType = (typeof LISTING_SUPPORTED_ENTITY_TYPES)[number]

const listingPayloadSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(500),
  description: z.string().max(12000).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  imageUrl: z.string().url().max(2000).nullable().optional(),
  orgSlug: z.string().max(200).nullable().optional(),
  orgDisplayName: z.string().max(500).nullable().optional(),
  visibility: z.enum(['public', 'hidden']),
  startsAt: z.string().max(100).nullable().optional(),
  endsAt: z.string().max(100).nullable().optional(),
})

const listingUpsertEnvelopeSchema = z.object({
  kind: z.literal('ecke_listing'),
  action: z.literal('upsert'),
  entityType: z.enum(LISTING_SUPPORTED_ENTITY_TYPES),
  sourceSystem: z.literal(KINK_SOCIAL_SOURCE_SYSTEM),
  sourceId: z.string().uuid(),
  canonicalKinkSocialUrl: z.string().url().max(2000).optional(),
  payload: z.unknown(),
})

const listingUnpublishEnvelopeSchema = z.object({
  kind: z.literal('ecke_listing'),
  action: z.literal('unpublish'),
  entityType: z.enum(LISTING_SUPPORTED_ENTITY_TYPES),
  sourceSystem: z.literal(KINK_SOCIAL_SOURCE_SYSTEM),
  sourceId: z.string().uuid(),
  payload: z
    .object({
      slug: z.string().min(1).max(200).optional(),
      visibility: z.literal('hidden').optional(),
    })
    .optional(),
})

export type ListingPayload = z.infer<typeof listingPayloadSchema>
export type ListingUpsertEnvelope = z.infer<typeof listingUpsertEnvelopeSchema>
export type ListingUnpublishEnvelope = z.infer<typeof listingUnpublishEnvelopeSchema>

export type ListingSuccessResponse = {
  status: 'published' | 'unpublished'
  eckeSlug: string
  eckePublicUrl: string
  eckeRecordId?: string
  idempotent?: boolean
}

export function getListingWebhookSecret(): string | null {
  const listingSecret = process.env.ECKE_PUBLISH_WEBHOOK_SECRET?.trim()
  if (listingSecret) return listingSecret
  const ingestSecret = process.env.KINK_SOCIAL_INGEST_SECRET?.trim()
  return ingestSecret || null
}

export function verifyListingWebhookAuth(headers: ListingAuthHeaders): ListingErrorCode | null {
  const secret = getListingWebhookSecret()
  if (!secret) return 'missing_auth'

  const header = headers.get('authorization')
  if (!header) return 'missing_auth'

  const match = /^Bearer\s+(.+)$/i.exec(header)
  if (!match) return 'missing_auth'

  const token = match[1].trim()
  if (!token || token !== secret) return 'bad_auth'

  return null
}

function unsupportedEntity(body: unknown): boolean {
  return (
    typeof body === 'object' &&
    body !== null &&
    'entityType' in body &&
    typeof (body as { entityType?: string }).entityType === 'string' &&
    !(LISTING_SUPPORTED_ENTITY_TYPES as readonly string[]).includes(
      (body as { entityType: string }).entityType,
    )
  )
}

export function validateListingUpsertEnvelope(body: unknown):
  | { ok: true; envelope: ListingUpsertEnvelope; payload: ListingPayload }
  | { ok: false; errorCode: ListingErrorCode; errorMessage: string } {
  const envelopeResult = listingUpsertEnvelopeSchema.safeParse(body)
  if (!envelopeResult.success) {
    if (unsupportedEntity(body)) {
      return {
        ok: false,
        errorCode: 'unsupported_entity_type',
        errorMessage: 'Only group is supported in this pass',
      }
    }
    return {
      ok: false,
      errorCode: 'invalid_envelope',
      errorMessage: 'Invalid listing webhook envelope',
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

  const payloadResult = listingPayloadSchema.safeParse(envelope.payload)
  if (!payloadResult.success) {
    return {
      ok: false,
      errorCode: 'invalid_payload',
      errorMessage: 'Invalid group listing payload',
    }
  }

  if (payloadResult.data.visibility !== 'public') {
    return {
      ok: false,
      errorCode: 'invalid_payload',
      errorMessage: 'Group listing upsert requires visibility public',
    }
  }

  return { ok: true, envelope, payload: payloadResult.data }
}

export function validateListingUnpublishEnvelope(body: unknown):
  | { ok: true; envelope: ListingUnpublishEnvelope }
  | { ok: false; errorCode: ListingErrorCode; errorMessage: string } {
  const result = listingUnpublishEnvelopeSchema.safeParse(body)
  if (!result.success) {
    if (unsupportedEntity(body)) {
      return {
        ok: false,
        errorCode: 'unsupported_entity_type',
        errorMessage: 'Only group is supported in this pass',
      }
    }
    return {
      ok: false,
      errorCode: 'invalid_envelope',
      errorMessage: 'Invalid listing unpublish envelope',
    }
  }

  return { ok: true, envelope: result.data }
}

export function __kinkSocialListingSelfTest(): void {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`[kink-social-listing-selftest] ${msg}`)
  }

  const validPayload = {
    slug: 'baltimore-rope',
    title: 'Baltimore Rope Society',
    description: 'Public-facing group description.',
    location: 'Baltimore metro',
    visibility: 'public' as const,
  }

  const upsertOk = validateListingUpsertEnvelope({
    kind: 'ecke_listing',
    action: 'upsert',
    entityType: 'group',
    sourceSystem: 'kink.social',
    sourceId: '11111111-1111-4111-8111-111111111111',
    canonicalKinkSocialUrl: 'https://kink.social/groups/11111111-1111-4111-8111-111111111111',
    payload: validPayload,
  })
  assert(upsertOk.ok, 'valid group upsert accepted')

  const badEntity = validateListingUpsertEnvelope({
    kind: 'ecke_listing',
    action: 'upsert',
    entityType: 'organization',
    sourceSystem: 'kink.social',
    sourceId: '11111111-1111-4111-8111-111111111111',
    payload: validPayload,
  })
  assert(!badEntity.ok && badEntity.errorCode === 'unsupported_entity_type', 'unsupported entity rejected')

  const restricted = validateListingUpsertEnvelope({
    kind: 'ecke_listing',
    action: 'upsert',
    entityType: 'group',
    sourceSystem: 'kink.social',
    sourceId: '11111111-1111-4111-8111-111111111111',
    payload: { ...validPayload, privateNotes: 'secret' },
  })
  assert(!restricted.ok && restricted.errorCode === 'restricted_field', 'restricted field rejected')

  const unpublishOk = validateListingUnpublishEnvelope({
    kind: 'ecke_listing',
    action: 'unpublish',
    entityType: 'group',
    sourceSystem: 'kink.social',
    sourceId: '11111111-1111-4111-8111-111111111111',
    payload: { slug: 'baltimore-rope', visibility: 'hidden' },
  })
  assert(unpublishOk.ok, 'unpublish envelope accepted')

  console.log('[OK] kink-social listing webhook self-test passed')
}
