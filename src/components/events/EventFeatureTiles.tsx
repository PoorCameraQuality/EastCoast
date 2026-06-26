import { eventFeatureTiles } from '@/lib/eventPageContent'

const TILE_ICONS = ['◆', '◇', '○', '●', '▣', '◈', '◎', '◐'] as const

type Props = {
  features: string[]
}

export default function EventFeatureTiles({ features }: Props) {
  if (features.length === 0) return null

  const tiles = eventFeatureTiles(features)

  return (
    <section className="event-features" aria-labelledby="event-features-title">
      <h2 id="event-features-title" className="event-section-title">
        Highlights
      </h2>
      <ul className="event-feature-grid">
        {tiles.map((tile, i) => (
          <li key={tile.title} className="event-feature-tile">
            <span className="event-feature-icon" aria-hidden>
              {TILE_ICONS[i % TILE_ICONS.length]}
            </span>
            <div>
              <h3 className="event-feature-title">{tile.title}</h3>
              {tile.detail ? <p className="event-feature-detail">{tile.detail}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
