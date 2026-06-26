import type { EventPageRecord } from '@/lib/unifiedEvents'
import { buildWhyGoPoints } from '@/lib/eventPageContent'

export default function EventWhyGoSection({ event }: { event: EventPageRecord }) {
  const points = buildWhyGoPoints(event)
  if (points.length === 0) return null

  return (
    <section className="event-why-go" aria-labelledby="event-why-go-title">
      <h2 id="event-why-go-title" className="event-section-title">
        Why go
      </h2>
      <ul className="event-why-go-grid">
        {points.map((point) => (
          <li key={point} className="event-why-go-card">
            <p>{point}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
