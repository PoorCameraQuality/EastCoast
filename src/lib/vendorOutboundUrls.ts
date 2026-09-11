/** True when a URL is hosted on kink.social (join, profile, shop, or any other KS path). */
export function isKinkSocialHostUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim()
  if (!trimmed) return false
  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase()
    return host === 'kink.social'
  } catch {
    return /(?:^|\/\/)(?:www\.)?kink\.social(?:\/|$)/i.test(trimmed)
  }
}

/** First public shop/website URL that is not a kink.social destination. */
export function vendorOffsiteShopUrl(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim()
    if (!trimmed) continue
    if (isKinkSocialHostUrl(trimmed)) continue
    return trimmed
  }
  return undefined
}
