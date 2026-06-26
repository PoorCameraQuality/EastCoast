import EckeLink from '@/components/EckeLink'
import type { PublicEducationItem } from '@/types/publicEducationItem'

type Props = {
  items: PublicEducationItem[]
}

export default function PlatformUpdateShelf({ items }: Props) {
  if (items.length === 0) return null

  return (
    <section className="edu-section" aria-labelledby="edu-platform-updates">
      <div className="edu-section-head">
        <h2 id="edu-platform-updates" className="edu-section-title">
          Platform updates
        </h2>
        <p className="edu-section-note">ECKE and kink.social tooling notes — separate from core education</p>
      </div>
      <div className="edu-platform-shelf">
        <ul className="edu-platform-list">
          {items.slice(0, 6).map((item) => (
            <li key={item.id}>
              <EckeLink href={`/education/${item.slug}`} className="edu-platform-item">
                <span>{item.title}</span>
                {item.publishDate ? (
                  <span className="edu-platform-date">
                    {new Date(item.publishDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                ) : null}
              </EckeLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
