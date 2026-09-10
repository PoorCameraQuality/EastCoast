import EckeLink from '@/components/EckeLink'

export default function EventsPlanningStrip() {
  return (
    <aside className="events-planning-strip" aria-label="Plan your weekend">
      <div className="events-planning-strip-inner">
        <div>
          <h2 className="events-planning-title">Make this calendar yours.</h2>
          <p className="events-planning-body">
            Browse by date, city, or interest — then add what you need to your own calendar.
          </p>
        </div>
        <div className="events-planning-actions">
          <EckeLink href="/calendar" className="sf-btn-rose">
            Open calendar
          </EckeLink>
          <EckeLink href="/contact" className="sf-btn-primary">
            List an event
          </EckeLink>
        </div>
      </div>
    </aside>
  )
}
