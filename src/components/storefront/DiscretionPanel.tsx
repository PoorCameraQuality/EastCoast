const PILLARS = [
  {
    title: 'No account required to browse',
    body: 'ECKE stays public and searchable. Explore events, places, vendors, and education without signing in.',
  },
  {
    title: 'Confirm details with organizers',
    body: 'Listings are starting points. Verify dates, rules, and access directly with the people running the event or space.',
  },
  {
    title: 'Privacy-aware community tools on kink.social',
    body: 'When you are ready to save, follow, publish, or connect, kink.social gives you the account-based layer.',
  },
] as const

export default function DiscretionPanel() {
  return (
    <section className="sf-section bg-sf-surface/30" aria-labelledby="discretion-title">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="discretion-title" className="sf-title">
            Browse without making yourself the product.
          </h2>
          <p className="sf-subhead mx-auto">
            ECKE stays public and searchable so listings can be found. You do not need an account to browse.
            When you want to save, follow, publish, or connect, kink.social gives you the account-based layer.
          </p>
        </div>

        <ul className="mt-ecke-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <li
              key={p.title}
              className="rounded-2xl border border-sf-border bg-sf-card/60 p-6 text-center md:text-left"
            >
              <h3 className="font-semibold text-sf-strong">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-sf-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
