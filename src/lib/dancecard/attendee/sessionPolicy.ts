/** API-driven photo policy chips for attendee program (Phase 5). */

export type PhotoPolicy = 'allowed' | 'restricted' | 'none'

export type PhotoPolicyChip = {
  policy: PhotoPolicy
  label: string
  className: string
}

const CHIP_BY_POLICY: Record<PhotoPolicy, Omit<PhotoPolicyChip, 'policy'>> = {
  allowed: {
    label: 'Photos OK',
    className: 'border-dc-success/35 bg-dc-success-muted text-dc-success',
  },
  restricted: {
    label: 'Photos limited',
    className: 'border-dc-warning/35 bg-dc-warning-muted text-dc-warning',
  },
  none: {
    label: 'No photos',
    className: 'border-dc-danger-border bg-dc-danger-muted text-dc-danger',
  },
}

export function normalizePhotoPolicy(raw: unknown): PhotoPolicy {
  if (raw === 'restricted' || raw === 'none') return raw
  return 'allowed'
}

export function photoPolicyChip(policy: PhotoPolicy): PhotoPolicyChip {
  const base = CHIP_BY_POLICY[policy]
  return { policy, ...base }
}

export function photoPolicyChipFromRaw(raw: unknown): PhotoPolicyChip | null {
  const policy = normalizePhotoPolicy(raw)
  if (policy === 'allowed') return null
  return photoPolicyChip(policy)
}
