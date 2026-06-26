import type { UnifiedEvent } from '@/lib/unifiedEvents'

export type EventMediaSource = 'ecke' | 'kink_social' | 'external' | 'fallback'

export type EventMedia = {
  logoUrl?: string
  bannerUrl?: string
  imageUrl?: string
  alt: string
  source: EventMediaSource
  /** True when the primary asset reads as a wide poster/banner. */
  isBanner: boolean
}

const BANNER_URL_HINT =
  /banner|hero|cover|poster|16x9|21x9|2500w|1024x637|og-image|wide/i

function mediaSource(event: UnifiedEvent): EventMediaSource {
  if (event.source === 'supabase' && event.c2kSourceId) return 'kink_social'
  if (event.logo?.startsWith('http')) return 'external'
  return 'ecke'
}

function looksLikeBanner(url: string): boolean {
  return BANNER_URL_HINT.test(url)
}

/**
 * Normalize event listing media from unified events (logo field may hold posters/banners).
 */
export function normalizeEventMedia(event: Pick<UnifiedEvent, 'name' | 'logo' | 'source' | 'c2kSourceId'>): EventMedia {
  const alt = `${event.name} event branding`
  const raw = event.logo?.trim()

  if (!raw) {
    return { alt, source: 'fallback', isBanner: false }
  }

  const source = mediaSource(event as UnifiedEvent)
  const isBanner = looksLikeBanner(raw)

  if (isBanner) {
    return {
      bannerUrl: raw,
      imageUrl: raw,
      logoUrl: raw,
      alt,
      source,
      isBanner: true,
    }
  }

  return {
    logoUrl: raw,
    imageUrl: raw,
    alt,
    source,
    isBanner: false,
  }
}

export function primaryMediaUrl(media: EventMedia): string | undefined {
  return media.bannerUrl ?? media.logoUrl ?? media.imageUrl
}
