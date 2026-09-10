import EckeLink from '@/components/EckeLink'

type Props = {
  compact?: boolean
  stateName?: string
}

export default function StatePublishingCta({ compact = false, stateName }: Props) {
  const title = stateName ? `Make ${stateName} easier to discover.` : 'Help your local scene show up.'
  const body = stateName
    ? `List public events, venues, and vendors on ECKE so people can find what is happening in ${stateName}.`
    : 'Create a free ECKE organization to publish events, places, and shops to the public directory.'

  return (
    <section className="st-publish-cta" aria-labelledby="st-publish-cta-title">
      <h2 id="st-publish-cta-title" className="st-publish-title">
        {title}
      </h2>
      <p className="st-publish-body">{body}</p>
      <div className="st-publish-actions">
        <EckeLink href="/auth/org/signup" className="st-btn-violet">
          Create an organization
        </EckeLink>
        <EckeLink href="/events/create" className="st-btn-rose">
          List an event
        </EckeLink>
        {!compact ? (
          <EckeLink href="/events" className="st-btn-violet">
            Browse events
          </EckeLink>
        ) : null}
      </div>
    </section>
  )
}
