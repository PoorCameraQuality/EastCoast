import EckeLink from '@/components/EckeLink'
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
          Learn from community educators
        </h2>
        <p className="edu-section-note">
          Teachers and presenters offering classes, workshops, and resources
        </p>
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
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="edu-placeholder-cta">
          Educators can publish public guides on ECKE. Presenter profiles and learning paths appear here as they are
          listed.{' '}
          <EckeLink href="/auth/org/signup" className="text-violet-300 underline">
            Create an organization
          </EckeLink>
          .
        </div>
      )}
    </section>
  )
}
