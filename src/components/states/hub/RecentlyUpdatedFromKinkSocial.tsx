import EckeLink from '@/components/EckeLink'
import { publicLocationLabel } from '@/lib/publicStateIndex'
import type { PublicRegionalListing } from '@/types/publicRegionalListing'

function badgeClass(type: PublicRegionalListing['listingType']): string {
  switch (type) {
    case 'convention':
    case 'event':
      return 'st-badge-event'
    case 'place':
      return 'st-badge-place'
    case 'vendor':
      return 'st-badge-vendor'
    case 'article':
      return 'st-badge-education'
    default:
      return 'st-badge-event'
  }
}

type Props = {
  items: PublicRegionalListing[]
}

export default function RecentlyUpdatedFromKinkSocial({ items }: Props) {
  if (items.length === 0) return null

  return (
    <section className="st-section" aria-labelledby="st-recent-ks">
      <div className="st-section-head">
        <h2 id="st-recent-ks" className="st-section-title">
          Recently updated from kink.social
        </h2>
        <p className="st-section-note">Organizer-managed public listings</p>
      </div>
      <ul className="st-nationwide-list">
        {items.map((item) => (
          <li key={`${item.listingType}-${item.slug}`}>
            <EckeLink href={item.href} className="st-listing-row">
              <div>
                <p className="st-listing-title">{item.title}</p>
                <p className="st-listing-meta">
                  {publicLocationLabel(item)}
                  {item.lastSyncedAt ? ` · Updated ${item.lastSyncedAt}` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`st-listing-badge ${badgeClass(item.listingType)}`}>
                  {item.listingType}
                </span>
                {item.sourceSystem === 'kink_social' ? (
                  <span className="st-listing-badge st-badge-ks">kink.social</span>
                ) : null}
              </div>
            </EckeLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
