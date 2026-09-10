export const ECKE_EVENT_ASSETS_BUCKET = 'ecke-event-assets'

export const EVENT_ASSET_KINDS = ['hero', 'logo', 'gallery', 'program', 'map'] as const
export type EventAssetKind = (typeof EVENT_ASSET_KINDS)[number]

export const EVENT_APPLICATION_KINDS = [
  { id: 'staff', label: 'Staff', field: 'staff_application_url', openField: 'staff_applications_open' },
  { id: 'vendor', label: 'Vendor', field: 'vendor_application_url', openField: 'vendor_applications_open' },
  { id: 'presenter', label: 'Presenter', field: 'presenter_application_url', openField: 'presenter_applications_open' },
  { id: 'photographer', label: 'Photographer', field: 'photographer_application_url', openField: 'photographer_applications_open' },
] as const

export type EventApplicationField = (typeof EVENT_APPLICATION_KINDS)[number]['field']

export function openEventApplications(event: {
  staffApplicationUrl?: string | null
  vendorApplicationUrl?: string | null
  presenterApplicationUrl?: string | null
  photographerApplicationUrl?: string | null
  staffApplicationsOpen?: boolean | null
  vendorApplicationsOpen?: boolean | null
  presenterApplicationsOpen?: boolean | null
  photographerApplicationsOpen?: boolean | null
}) {
  const values = {
    staff: { url: event.staffApplicationUrl, open: event.staffApplicationsOpen },
    vendor: { url: event.vendorApplicationUrl, open: event.vendorApplicationsOpen },
    presenter: { url: event.presenterApplicationUrl, open: event.presenterApplicationsOpen },
    photographer: { url: event.photographerApplicationUrl, open: event.photographerApplicationsOpen },
  }
  return EVENT_APPLICATION_KINDS.flatMap((item) => {
    const row = values[item.id]
    const url = row.url?.trim()
    return url && row.open ? [{ ...item, url }] : []
  })
}

export const EVENT_ASSET_GUIDES: Record<
  EventAssetKind,
  { title: string; hint: string; accept: string; maxBytes: number; allowPdf?: boolean }
> = {
  hero: {
    title: 'Hero / cover',
    hint: '1600×900 (16:9). JPG or WebP. Under 2 MB.',
    accept: 'image/jpeg,image/png,image/webp',
    maxBytes: 2 * 1024 * 1024,
  },
  logo: {
    title: 'Logo',
    hint: '512×512 square. PNG or WebP with a clear mark. Under 500 KB.',
    accept: 'image/png,image/webp,image/jpeg',
    maxBytes: 512 * 1024,
  },
  gallery: {
    title: 'Gallery photo',
    hint: '1600×1200 or similar. JPG or WebP. Under 2 MB each. Up to 12 photos.',
    accept: 'image/jpeg,image/png,image/webp',
    maxBytes: 2 * 1024 * 1024,
  },
  program: {
    title: 'Program',
    hint: 'PDF or a readable image of the schedule. Under 8 MB. Optional.',
    accept: 'application/pdf,image/jpeg,image/png,image/webp',
    maxBytes: 8 * 1024 * 1024,
    allowPdf: true,
  },
  map: {
    title: 'Event map',
    hint: 'Venue or site map image. PNG or JPG. Under 4 MB. Optional.',
    accept: 'image/jpeg,image/png,image/webp',
    maxBytes: 4 * 1024 * 1024,
  },
}

export function sanitizeAssetFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80) || 'file.bin'
}

export function extensionForMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  if (mime === 'application/pdf') return 'pdf'
  return 'bin'
}
