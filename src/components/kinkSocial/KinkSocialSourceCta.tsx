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
      className="mt-8 rounded-xl border border-teal-500/25 bg-teal-950/20 p-5 sm:p-6"
      aria-label="kink.social source attribution"
    >
      <p className="text-sm font-medium text-teal-200/90">Published from kink.social.</p>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed">
        View the full community context on kink.social.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-teal-500/40 px-4 text-sm font-medium text-teal-200 hover:bg-teal-500/10 transition"
      >
        Continue on kink.social
      </a>
      <p className="mt-3 text-xs text-gray-500">
        This article was shared by a community member. East Coast Kink Events hosts the public listing only.
      </p>
      <Link href="/education" className="sr-only">
        Back to education articles
      </Link>
    </aside>
  )
}
