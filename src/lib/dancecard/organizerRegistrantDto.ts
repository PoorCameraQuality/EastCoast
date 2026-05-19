import type { OrganizerRoleForClient } from './organizerRoles'
import { organizerRoleCanEditVettingSafetyNotes, organizerRoleCanSeeRegistrantInternalNotes } from './organizerRoles'
import type { CheckInEligibility, CheckInTiming } from '@/lib/dancecard/registrantCheckIn'

export type OrganizerRegistrantExtras = {
  checkInValidFrom?: string | null
  checkInValidThrough?: string | null
  checkInEligibility?: CheckInEligibility
  checkInTiming?: CheckInTiming | null
  checkedInAt?: string | null
}

export function mapOrganizerRegistrantRow(
  r: Record<string, unknown>,
  categoryName: string | undefined,
  role: OrganizerRoleForClient,
  extras?: OrganizerRegistrantExtras,
) {
  const showInternal = organizerRoleCanSeeRegistrantInternalNotes(role)
  const showSafety = organizerRoleCanEditVettingSafetyNotes(role)
  const showPii = role !== 'viewer'
  return {
    id: r.id as string,
    categoryId: r.category_id as string,
    categoryName: categoryName ?? null,
    personId: (r.person_id as string | null) ?? null,
    status: r.status as string,
    sceneDisplayName: r.scene_display_name as string,
    legalName: showPii ? ((r.legal_name as string | null) ?? null) : null,
    email: showPii ? ((r.email as string | null) ?? null) : null,
    phone: showPii ? ((r.phone as string | null) ?? null) : null,
    internalNotes: showInternal ? ((r.internal_notes as string | null) ?? null) : null,
    vettingStatus: (r.vetting_status as string | undefined) ?? 'none',
    vettingSafetyNotes: showSafety ? ((r.vetting_safety_notes as string | null) ?? null) : null,
    pronouns: (r.pronouns as string | null) ?? null,
    badgeTagline: (r.badge_tagline as string | null) ?? null,
    consentWaiverAckAt: (r.consent_waiver_ack_at as string | null) ?? null,
    consentPhotoAckAt: (r.consent_photo_ack_at as string | null) ?? null,
    importedPaymentStatus: (r.imported_payment_status as string | null) ?? null,
    externalSourceRef: (r.external_source_ref as string | null) ?? null,
    externalSource: (r.external_source as string | null) ?? null,
    externalId: (r.external_id as string | null) ?? null,
    lastSyncedAt: (r.last_synced_at as string | null) ?? null,
    rabbitsignStatus: (r.rabbitsign_status as string | null) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    checkInValidFrom: extras?.checkInValidFrom ?? null,
    checkInValidThrough: extras?.checkInValidThrough ?? null,
    checkInEligibility: extras?.checkInEligibility ?? 'unknown',
    checkInTiming: extras?.checkInTiming ?? null,
    checkedInAt: extras?.checkedInAt ?? null,
  }
}
