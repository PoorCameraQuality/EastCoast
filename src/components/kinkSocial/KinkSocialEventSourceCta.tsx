import {
  isKinkSocialSourcedEvent,
  resolveKinkSocialEventCtaUrl,
} from '@/lib/kinkSocialIngestValidation'

type KinkSocialEventSourceCtaProps = {
  c2kSourceId?: string | null
  c2kSourceType?: string | null
  eckeSlug: string
}

export default function KinkSocialEventSourceCta({
  c2kSourceId,
  c2kSourceType,
  eckeSlug,
}: KinkSocialEventSourceCtaProps) {
  if (!isKinkSocialSourcedEvent({ c2kSourceId, c2kSourceType })) return null

  const href = resolveKinkSocialEventCtaUrl({ c2kSourceId, c2kSourceType, eckeSlug })
  if (!href) return null

  return (
    <aside
      className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6"
      aria-label="Source listing"
    >
      <p className="text-sm font-medium text-gray-200">Directory listing</p>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed">
        Confirm details with the organizer. A source listing is available when you need the original page.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-gray-200 hover:bg-white/10 transition"
      >
        View source listing
      </a>
    </aside>
  )
}
