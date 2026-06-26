import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import {
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
  KINK_SOCIAL_LABELS,
} from '@/lib/kinkSocialMarketing'

type Props = {
  compact?: boolean
  stateName?: string
}

export default function StatePublishingCta({ compact = false, stateName }: Props) {
  const title = stateName ? `Make ${stateName} easier to discover.` : 'Help your local scene show up.'
  const body = stateName
    ? `Publish public-safe events, venues, vendors, and education from kink.social so people can find what is happening in ${stateName}.`
    : 'Create a kink.social organization, vendor, venue, or event listing and publish the public-safe version to ECKE.'

  return (
    <section className="st-publish-cta" aria-labelledby="st-publish-cta-title">
      <h2 id="st-publish-cta-title" className="st-publish-title">
        {title}
      </h2>
      <p className="st-publish-body">{body}</p>
      <div className="st-publish-actions">
        <KinkSocialCtaLink
          href={getKinkSocialOrgUrl('state_page')}
          label={KINK_SOCIAL_LABELS.createOrg}
          variant="state"
          surface="state_publish_cta"
          className="st-btn-violet"
        />
        <KinkSocialCtaLink
          href={getKinkSocialJoinUrl('state_page')}
          label={KINK_SOCIAL_LABELS.joinFree}
          variant="state"
          surface="state_publish_cta"
          className="st-btn-rose"
        />
        {!compact ? (
          <EckeLink href="/events" className="st-btn-violet">
            Browse events to list
          </EckeLink>
        ) : null}
      </div>
    </section>
  )
}
