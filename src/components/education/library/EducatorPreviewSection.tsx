import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { TOPIC_LABELS } from '@/lib/educationVisual'
import type { PublicEducatorPreview } from '@/types/publicEducationItem'

type Props = {
  educators: PublicEducatorPreview[]
}

export default function EducatorPreviewSection({ educators }: Props) {
  return (
    <section className="edu-section" aria-labelledby="edu-educators">
      <div className="edu-section-head">
        <h2 id="edu-educators" className="edu-section-title">
          Educators and presenters
        </h2>
        <p className="edu-section-note">Public educator profiles from published articles</p>
      </div>

      {educators.length > 0 ? (
        <div className="edu-educator-grid">
          {educators.map((educator) => (
            <article key={educator.slug} className="edu-educator-card">
              <div className="edu-educator-avatar" aria-hidden>
                {educator.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                {educator.profileUrl ? (
                  <a
                    href={educator.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="edu-educator-name"
                  >
                    {educator.name}
                  </a>
                ) : (
                  <p className="edu-educator-name">{educator.name}</p>
                )}
                {educator.role ? <p className="edu-educator-role">{educator.role}</p> : null}
                {educator.topics.length > 0 ? (
                  <p className="edu-educator-topics">
                  {educator.topics.slice(0, 3).map((t) => TOPIC_LABELS[t as keyof typeof TOPIC_LABELS] ?? t).join(' · ')}
                  </p>
                ) : null}
                <p className="edu-educator-meta">
                  {educator.articleCount} article{educator.articleCount === 1 ? '' : 's'}
                </p>
                {educator.followUrl ? (
                  <div className="mt-2">
                    <KinkSocialCtaLink
                      href={educator.followUrl}
                      label="Follow on kink.social"
                      variant="education"
                      surface="education_follow_educator"
                      className="edu-btn-save"
                    />
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="edu-placeholder-cta">
          Educators can publish public articles from{' '}
          <EckeLink href="https://kink.social" className="text-violet-300 underline">
            kink.social
          </EckeLink>
          . Presenter profiles and learning paths will appear here as they are published.
        </div>
      )}
    </section>
  )
}
