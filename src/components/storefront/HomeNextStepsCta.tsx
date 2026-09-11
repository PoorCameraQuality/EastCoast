import EckeLink from '@/components/EckeLink'

/** Compact optional bottom CTA — ECKE-native next steps, no partner acquisition. */
export default function HomeNextStepsCta() {
  return (
    <section className="sf-section-tight" aria-labelledby="home-next-steps-title">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-sf-card/60 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3">
            <div>
              <h2 id="home-next-steps-title" className="text-base font-semibold tracking-normal text-sf-strong">
                Ready to organize?
              </h2>
              <p className="mt-1 text-sm leading-relaxed tracking-normal text-sf-muted">
                Create an organization account and publish your own listing on the public calendar.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <EckeLink
                href="/auth/org/signup"
                className="sf-btn-ghost inline-flex min-h-11 w-full items-center justify-center text-sm sm:w-auto"
              >
                Create an organization
              </EckeLink>
              <EckeLink
                href="/auth/org/login"
                className="inline-flex min-h-11 items-center justify-center px-1 text-sm text-sf-muted hover:text-sf-strong"
              >
                Sign in
              </EckeLink>
            </div>
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
