/** True when next/image should skip the optimizer (unknown remote host). */
export function listingImageUnoptimized(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return false
  try {
    const host = new URL(src).hostname
    return !(
      host.endsWith('.supabase.co') ||
      host === 'kink.social' ||
      host === 'www.kink.social' ||
      host === 'eastcoastkinkevents.com' ||
      host === 'www.eastcoastkinkevents.com'
    )
  } catch {
    return true
  }
}
