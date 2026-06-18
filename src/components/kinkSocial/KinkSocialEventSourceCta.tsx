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
      className="mt-8 rounded-xl border border-teal-500/25 bg-teal-950/20 p-5 sm:p-6"
      aria-label="kink.social source attribution"
    >
      <p className="text-sm font-medium text-teal-200/90">Published from kink.social.</p>
      <p className="mt-2 text-sm text-gray-300 leading-relaxed">
        View the public listing on kink.social. Organizer details may require a kink.social account.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-teal-500/40 px-4 text-sm font-medium text-teal-200 hover:bg-teal-500/10 transition"
      >
        View public listing
      </a>
    </aside>
  )
}
