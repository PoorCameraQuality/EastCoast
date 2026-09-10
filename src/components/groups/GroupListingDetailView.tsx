import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import EntityPageViewTracker from '@/components/analytics/EntityPageViewTracker'
import { isRedundantOrgDisplayName } from '@/lib/eckeOrgCatalog'
import { listingCopyToSafeHtml } from '@/lib/eckeOrgRichText'
import type { GroupListingRecord } from '@/lib/unifiedGroupListings'

type Props = {
  group: GroupListingRecord
}

export default function GroupListingDetailView({ group }: Props) {
  const descriptionHtml = listingCopyToSafeHtml(group.description)
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: group.name, href: `/groups/${group.slug}`, current: true },
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black">
      <EntityPageViewTracker
        entityType="group"
        slug={group.slug}
        name={group.name}
        organizerName={group.orgDisplayName || group.name}
        organizerSlug={group.orgSlug || group.slug}
        pagePath={`/groups/${group.slug}`}
      />
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
              Community group
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
              {group.name}
            </h1>
            {group.orgDisplayName && !isRedundantOrgDisplayName(group.orgDisplayName, group.name) ? (
              <p className="mt-2 text-sm text-gray-400">
                Part of {group.orgDisplayName}
              </p>
            ) : null}
            {group.publicLocationSummary ? (
              <p className="mt-4 text-gray-300">{group.publicLocationSummary}</p>
            ) : null}
            {descriptionHtml ? (
              <div
                className="prose prose-invert mt-6 max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : null}
          </header>

          {group.kinkSocialCanonicalUrl ? (
            <aside
              className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6"
              aria-label="Source listing"
            >
              <p className="text-sm font-medium text-gray-200">Directory listing</p>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                Confirm details with the organizer. A source listing is available when you need the original page.
              </p>
              <a
                href={group.kinkSocialCanonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-gray-200 hover:bg-white/10 transition"
              >
                View source listing
              </a>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  )
}
