import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import KinkSocialAcquisitionCard from '@/components/kink-social/KinkSocialAcquisitionCard'
import type { GroupListingRecord } from '@/lib/unifiedGroupListings'

type Props = {
  group: GroupListingRecord
}

export default function GroupListingDetailView({ group }: Props) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: group.name, href: `/groups/${group.slug}`, current: true },
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
            <Link
              href="/events"
              className="inline-flex min-h-touch items-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
            >
              ← Browse events
            </Link>
          </div>

          <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-8 shadow-dark">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300/90 sm:text-xs">
              Community group · Published from kink.social
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
              {group.name}
            </h1>
            {group.orgDisplayName ? (
              <p className="mt-2 text-sm text-gray-400">
                Part of {group.orgDisplayName}
              </p>
            ) : null}
            {group.publicLocationSummary ? (
              <p className="mt-4 text-gray-300">{group.publicLocationSummary}</p>
            ) : null}
            {group.description ? (
              <p className="mt-6 text-gray-300 leading-relaxed whitespace-pre-wrap">{group.description}</p>
            ) : null}
          </header>

          {group.kinkSocialCanonicalUrl ? (
            <aside
              className="mt-8 rounded-xl border border-teal-500/25 bg-teal-950/20 p-5 sm:p-6"
              aria-label="kink.social source attribution"
            >
              <p className="text-sm font-medium text-teal-200/90">Published from kink.social.</p>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                Join or follow this group on kink.social for events, updates, and community tools.
              </p>
              <a
                href={group.kinkSocialCanonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-teal-500/40 px-4 text-sm font-medium text-teal-200 hover:bg-teal-500/10 transition"
              >
                View on kink.social
              </a>
            </aside>
          ) : null}

          <div className="mt-10">
            <KinkSocialAcquisitionCard variant="eventsIndex" compact />
          </div>
        </div>
      </div>
    </section>
  )
}
