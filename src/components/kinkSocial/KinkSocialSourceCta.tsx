import Link from 'next/link'

type KinkSocialSourceCtaProps = {
  canonicalUrl?: string | null
}

function resolveCtaHref(canonicalUrl?: string | null): string | null {
  const trimmed = canonicalUrl?.trim()
  if (trimmed) {
    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.toString()
      }
    } catch {
      // fall through to env fallback
    }
  }

  const fallback = process.env.NEXT_PUBLIC_C2K_PUBLIC_URL?.trim()
  return fallback || null
}

export default function KinkSocialSourceCta({ canonicalUrl }: KinkSocialSourceCtaProps) {
  const href = resolveCtaHref(canonicalUrl)
  if (!href) return null

  return (
    <aside
      className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6"
      aria-label="Source listing"
    >
      <p className="text-sm font-medium text-gray-200">Directory listing</p>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed">
        This article was shared by a community member. East Coast Kink Events hosts the public listing.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-gray-200 hover:bg-white/10 transition"
      >
        View source listing
      </a>
      <Link href="/education" className="sr-only">
        Back to education articles
      </Link>
    </aside>
  )
}
