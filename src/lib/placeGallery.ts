import type { PublicPlaceMedia } from '@/types/publicPlaceMedia'

/** Only public-safe, approved gallery media may render on ECKE. */
export function publicSafeGallery(media: PublicPlaceMedia[] | undefined): PublicPlaceMedia[] {
  if (!media?.length) return []
  return media
    .filter(
      (m) =>
        m.publicSafe &&
        m.moderationStatus === 'approved' &&
        (!m.containsPeople || m.consentCleared)
    )
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function galleryPreviewStack(media: PublicPlaceMedia[] | undefined, limit = 3): PublicPlaceMedia[] {
  return publicSafeGallery(media).slice(0, limit)
}

export function galleryHeroImage(media: PublicPlaceMedia[] | undefined): PublicPlaceMedia | null {
  const safe = publicSafeGallery(media)
  if (!safe.length) return null
  const cover = safe.find((m) => m.mediaKind !== 'logo')
  return cover ?? safe[0]!
}

export function galleryKindLabel(kind: PublicPlaceMedia['mediaKind']): string {
  switch (kind) {
    case 'interior':
      return 'Main play space'
    case 'social_area':
      return 'Social lounge'
    case 'classroom':
      return 'Classroom / workshop area'
    case 'equipment':
      return 'Equipment'
    case 'exterior':
    case 'parking':
      return 'Entrance / parking'
    case 'accessibility':
      return 'Accessibility'
    case 'vendor_area':
      return 'Vendor area'
    case 'stage':
      return 'Stage'
    case 'map_or_layout':
      return 'Layout'
    default:
      return 'Gallery'
  }
}
