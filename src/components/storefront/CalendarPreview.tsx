import Link from 'next/link'
import type { MonthPreview, StorefrontEvent } from '@/lib/homepageStorefrontData'

type Props = {
  months: MonthPreview[]
  upcomingEvents: StorefrontEvent[]
}

export default function CalendarPreview({ months, upcomingEvents }: Props) {
  const thisWeek = upcomingEvents.slice(0, 2)
  const thisMonth = upcomingEvents.slice(0, 4)
  const majorWeekends = upcomingEvents.filter((e) =>
    /convention|weekend|conference/i.test(e.category),
  ).slice(0, 3)

  return (
    <section className="sf-section" aria-labelledby="calendar-preview-title">
      <div className="container-custom">
        <div className="mb-ecke-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sf-eyebrow">Plan by month</p>
            <h2 id="calendar-preview-title" className="sf-title">
              A cleaner way to see what is coming next.
            </h2>
          </div>
          <Link href="/calendar" className="sf-btn-gold">
            Open full calendar
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-sf-muted">Next four months</p>
            <ul className="grid grid-cols-4 gap-2">
              {months.map((m) => (
                <li key={m.key}>
                  <Link
                    href={`/calendar?month=${m.key}`}
                    className={`flex flex-col items-center rounded-xl border p-3 text-center transition-colors ${
                      m.isActive
                        ? 'border-sf-gold/50 bg-sf-gold/10'
                        : 'border-sf-border bg-sf-card/60 hover:border-sf-gold/30'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase text-sf-gold">{m.shortLabel}</span>
                    <span className="mt-1 text-2xl font-bold tabular-nums text-sf-strong">{m.eventCount}</span>
                    <span className="text-[10px] text-sf-muted">events</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <CalendarStack title="This week" events={thisWeek} />
            <CalendarStack title="This month" events={thisMonth} />
            {majorWeekends.length > 0 ? (
              <CalendarStack title="Major weekends" events={majorWeekends} />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function CalendarStack({ title, events }: { title: string; events: StorefrontEvent[] }) {
  if (events.length === 0) return null

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sf-muted">{title}</h3>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={`${title}-${e.slug}`}>
            <Link
              href={`/events/${e.slug}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-sf-border bg-sf-card/50 px-4 py-3 transition-colors hover:border-sf-gold/30"
            >
              <span className="min-w-0 truncate text-sm font-medium text-sf-strong">{e.name}</span>
              <span className="shrink-0 text-xs tabular-nums text-sf-muted">{e.date.display}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
