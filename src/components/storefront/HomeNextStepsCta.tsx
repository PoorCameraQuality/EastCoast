import EckeLink from '@/components/EckeLink'

/** Compact optional bottom CTA — ECKE-native next steps, no partner acquisition. */
export default function HomeNextStepsCta() {
  return (
    <section className="sf-section-tight" aria-labelledby="home-next-steps-title">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-sf-card/60 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3">
            <div>
              <h2 id="home-next-steps-title" className="text-base font-semibold text-sf-strong">
                Ready to organize?
              </h2>
              <p className="mt-1 text-sm text-sf-muted">
                Send your listing and we will get it on the public calendar.
              </p>
            </div>
            <EckeLink
              href="/contact"
              className="sf-btn-ghost inline-flex min-h-11 w-full items-center justify-center text-sm sm:w-auto"
            >
              List an event
            </EckeLink>
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div>
              <h3 className="text-base font-semibold text-sf-strong">Browse the calendar</h3>
              <p className="mt-1 text-sm text-sf-muted">
                Find upcoming events, conventions, and local nights by date or state.
              </p>
            </div>
            <EckeLink
              href="/events"
              className="sf-btn-rose inline-flex min-h-11 w-full items-center justify-center text-sm sm:w-auto"
            >
              Browse events
            </EckeLink>
          </div>
        </div>
      </div>
    </section>
  )
}
