import EckeLink from '@/components/EckeLink'
import type { PublicEducationItem } from '@/types/publicEducationItem'
import { TOPIC_LABELS } from '@/lib/educationVisual'

type Props = {
  items: PublicEducationItem[]
  stateName: string
}

export default function StateEducationShelf({ items, stateName }: Props) {
  return (
    <section className="st-section" aria-labelledby="st-education">
      <div className="st-section-head">
        <h2 id="st-education" className="st-section-title">
          Education &amp; guides
        </h2>
        <EckeLink href="/education" className="st-btn-violet">
          Learning library
        </EckeLink>
      </div>
      {items.length > 0 ? (
        <div className="st-shelf-grid">
          {items.slice(0, 4).map((item) => (
            <EckeLink key={item.slug} href={`/education/${item.slug}`} className="st-shelf-card block">
              <p className="st-shelf-card-title">{item.title}</p>
              <p className="st-shelf-card-meta">
                {TOPIC_LABELS[item.topic]}
                {item.readTimeLabel ? ` · ${item.readTimeLabel}` : ''}
              </p>
              {item.summary ? <p className="st-shelf-card-summary">{item.summary}</p> : null}
            </EckeLink>
          ))}
        </div>
      ) : (
        <div className="st-empty">
          Browse the{' '}
          <EckeLink href="/education" className="text-violet-300 underline">
            education library
          </EckeLink>{' '}
          for beginner guides before exploring {stateName}.
        </div>
      )}
    </section>
  )
}
