import { listingCopyToSafeHtml } from '@/lib/eckeOrgRichText'
import type { ParsedEventDescription } from '@/lib/eventPageContent'

type Props = {
  parsed: ParsedEventDescription
  fallbackExcerpt?: string
}

export default function EventOverviewModules({ parsed, fallbackExcerpt }: Props) {
  const hasIntro = Boolean(parsed.intro?.trim())
  const hasSections = parsed.sections.length > 0
  const introHtml = hasIntro ? listingCopyToSafeHtml(parsed.intro) : ''

  if (!hasIntro && !hasSections) {
    if (!fallbackExcerpt) return null
    return (
      <section className="event-overview" aria-labelledby="event-overview-title">
        <h2 id="event-overview-title" className="event-section-title">
          Overview
        </h2>
        <div
          className="event-overview-fallback prose-event"
          dangerouslySetInnerHTML={{ __html: listingCopyToSafeHtml(fallbackExcerpt) }}
        />
      </section>
    )
  }

  return (
    <section className="event-overview" aria-labelledby="event-overview-title">
      <h2 id="event-overview-title" className="event-section-title">
        {hasSections ? 'Event overview' : 'Overview'}
      </h2>
      <p className="event-overview-note">
        Organizer-provided listing — confirm dates, registration, and policies on the official site.
      </p>

      {introHtml ? (
        <div
          className="event-overview-intro prose-event"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      ) : null}

      {hasSections ? (
        <div className="event-overview-modules">
          {parsed.sections.map((section) => (
            <article key={section.title} className="event-overview-module">
              <h3 className="event-overview-module-title">{section.title}</h3>
              <div
                className="prose-event event-overview-module-body"
                dangerouslySetInnerHTML={{ __html: listingCopyToSafeHtml(section.body) }}
              />
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
