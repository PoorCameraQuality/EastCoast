type ListingStatus = 'published' | 'draft' | 'past' | 'archived' | 'attention'

const LABELS: Record<ListingStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  past: 'Past',
  archived: 'Archived',
  attention: 'Needs attention',
}

export default function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <span className={`org-listing-status org-listing-status-${status}`}>{LABELS[status]}</span>
}
