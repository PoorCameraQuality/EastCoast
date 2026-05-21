import Link from 'next/link'
import { getTopStatesByActivity } from '@/lib/topStatesByActivity'

type Props = {
  mobileLimit?: number
  desktopLimit?: number
}

export default function HomeStateChips({ mobileLimit = 8, desktopLimit = 12 }: Props) {
  const top = getTopStatesByActivity(desktopLimit)
  const mobile = top.slice(0, mobileLimit)
  const extra = top.slice(mobileLimit)

  return (
    <section
      className="relative border-y border-white/[0.06] bg-gradient-to-b from-transparent via-white/[0.02] to-transparent py-6 md:py-8"
      aria-labelledby="home-states-title"
    >
      <div className="container-custom">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="home-states-title" className="font-serif text-lg font-semibold text-white sm:text-xl">
            Browse by state
          </h2>
          <Link
            href="/states"
            className="inline-flex min-h-touch items-center text-sm font-medium text-primary-400 underline-offset-4 transition hover:text-primary-300 hover:underline"
          >
            All states
          </Link>
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 snap-x snap-mandatory md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {mobile.map((s) => (
            <Link
              key={s.slug}
              href={`/states/${s.slug}`}
              className="inline-flex min-h-touch shrink-0 snap-start items-center justify-center rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.03] px-4 py-2 text-sm font-medium text-gray-100 shadow-sm backdrop-blur-sm transition hover:border-primary-400/35 hover:from-primary-500/15 hover:text-white hover:shadow-[0_0_16px_rgba(45,212,191,0.12)] min-w-[5.5rem] sm:min-w-0"
            >
              <span className="sm:hidden">{s.abbr}</span>
              <span className="hidden sm:inline">{s.name}</span>
            </Link>
          ))}
          {extra.map((s) => (
            <Link
              key={s.slug}
              href={`/states/${s.slug}`}
              className="hidden md:inline-flex min-h-touch shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.03] px-4 py-2 text-sm font-medium text-gray-100 shadow-sm backdrop-blur-sm transition hover:border-primary-400/35 hover:from-primary-500/15 hover:text-white"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
