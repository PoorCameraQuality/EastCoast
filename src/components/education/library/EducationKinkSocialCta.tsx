import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { getKinkSocialJoinUrl, KINK_SOCIAL_LABELS, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import { buildKinkSocialUrl } from '@/lib/kinkSocialMarketing'

type Props = {
  compact?: boolean
}

export default function EducationKinkSocialCta({ compact = false }: Props) {
  const joinUrl = getKinkSocialJoinUrl('education_article')
  const educationUrl = buildKinkSocialUrl(KINK_SOCIAL_PATHS.educationBrowse, 'education_article')

  return (
    <section className={`edu-platform-cta ${compact ? 'edu-platform-cta-compact' : ''}`} aria-labelledby="edu-ks-cta">
      <h2 id="edu-ks-cta" className="edu-platform-cta-title">
        Keep learning on kink.social
      </h2>
      <p className="edu-platform-cta-body">
        Save articles, follow educators, publish your own writing, and connect education to presenter profiles,
        events, and community work.
      </p>
      <ul className="edu-platform-cta-list">
        <li>Save articles for later reading</li>
        <li>Follow educators and presenters</li>
        <li>Publish public education with moderation</li>
      </ul>
      <div className="edu-platform-cta-actions">
        <KinkSocialCtaLink
          href={joinUrl}
          label={KINK_SOCIAL_LABELS.joinFree}
          variant="education"
          surface="education_platform_cta"
          className="edu-btn-save"
        />
        <KinkSocialCtaLink
          href={educationUrl}
          label={KINK_SOCIAL_LABELS.exploreEducation}
          variant="education"
          surface="education_platform_cta"
          className="edu-btn-read"
        />
      </div>
    </section>
  )
}
