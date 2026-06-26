import EckeLink from '@/components/EckeLink'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'

type Props = {
  currentSlug: StateSlug
  nearby: { slug: StateSlug; info: (typeof EAST_COAST_STATES)[StateSlug] }[]
}

export default function NearbyStates({ currentSlug, nearby }: Props) {
  if (nearby.length === 0) return null

  return (
    <section className="st-section" aria-labelledby="st-nearby">
      <h2 id="st-nearby" className="st-section-title mb-3">
        Nearby states
      </h2>
      <div className="st-nearby-grid">
        {nearby.map(({ slug, info }) => (
          <EckeLink key={slug} href={`/states/${slug}`} className="st-nearby-link">
            {info.name}
          </EckeLink>
        ))}
        <EckeLink href="/states" className="st-nearby-link">
          All states
        </EckeLink>
      </div>
    </section>
  )
}
