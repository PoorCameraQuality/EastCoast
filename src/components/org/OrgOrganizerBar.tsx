import EckeLink from '@/components/EckeLink'

export default function OrgOrganizerBar({ slug }: { slug: string }) {
  return (
    <div className="mb-6 rounded-xl border border-sf-violet/30 bg-sf-violet/10 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-sf-muted">Organizer tools</p>
      <p className="mt-1 text-sm text-sf-body">You manage this event</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <EckeLink href={`/events/${slug}/edit`} className="sf-btn-ghost min-h-10 px-3 text-sm">
          Edit event
        </EckeLink>
        <EckeLink href={`/events/${slug}/posts`} className="sf-btn-ghost min-h-10 px-3 text-sm">
          Add post
        </EckeLink>
        <EckeLink href={`/events/${slug}/media`} className="sf-btn-ghost min-h-10 px-3 text-sm">
          Manage media
        </EckeLink>
        <EckeLink href={`/events/${slug}/manage`} className="sf-btn-ghost min-h-10 px-3 text-sm">
          Manage
        </EckeLink>
        <EckeLink href={`/events/${slug}/settings`} className="sf-btn-ghost min-h-10 px-3 text-sm">
          Settings
        </EckeLink>
      </div>
    </div>
  )
}
