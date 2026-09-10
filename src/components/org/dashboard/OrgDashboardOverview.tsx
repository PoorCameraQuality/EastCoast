type Props = {
  eventCount: number
  draftCount: number
  hasPlace: boolean
  hasShop: boolean
  attentionCount: number
}

export default function OrgDashboardOverview({
  eventCount,
  draftCount,
  hasPlace,
  hasShop,
  attentionCount,
}: Props) {
  return (
    <p className="org-dashboard-overview">
      <span>
        <strong>{eventCount}</strong> {eventCount === 1 ? 'event' : 'events'}
      </span>
      <span>
        <strong>{draftCount}</strong> {draftCount === 1 ? 'draft' : 'drafts'}
      </span>
      <span>
        <strong>{hasPlace ? 1 : 0}</strong> {hasPlace ? 'place' : 'places'}
      </span>
      <span>
        <strong>{hasShop ? 1 : 0}</strong> {hasShop ? 'shop' : 'shops'}
      </span>
      {attentionCount > 0 ? (
        <span className="org-dashboard-attention">
          <strong>{attentionCount}</strong> {attentionCount === 1 ? 'needs attention' : 'need attention'}
        </span>
      ) : null}
    </p>
  )
}
