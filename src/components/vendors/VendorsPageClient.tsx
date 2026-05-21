'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { VendorTag, VendorTagGroup } from '@/data/vendorTaxonomy'
import VendorFilters from '@/components/vendors/VendorFilters'
import VendorCard from '@/components/vendors/VendorCard'
import SupportCTAInline from '@/components/SupportCTAInline'
import DirectoryCompactStats from '@/components/discovery/DirectoryCompactStats'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import Breadcrumb from '@/components/Breadcrumb'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import { DancecardShowcase } from '@/components/dancecard/DancecardShowcase'
import {
  filterVendorsBySelectedTags,
  type VendorRecord,
} from '@/lib/vendorFiltering'
import { shuffleCopy } from '@/lib/shuffle'
import { SITE_SPONSOR_VENDOR_SLUG } from '@/data/vendors'

function splitPinnedHeadAndTail(list: VendorRecord[]): { head: VendorRecord[]; tail: VendorRecord[] } {
  const head: VendorRecord[] = []
  const used = new Set<string>()

  if (SITE_SPONSOR_VENDOR_SLUG) {
    const sponsor = list.find((v) => v.slug === SITE_SPONSOR_VENDOR_SLUG)
    if (sponsor) {
      head.push(sponsor)
      used.add(sponsor.slug)
    }
  }

  const paid = list
    .filter((v) => Boolean(v.isPaid) && !used.has(v.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug))
  for (const v of paid) {
    head.push(v)
    used.add(v.slug)
  }

  const tail = list.filter((v) => !used.has(v.slug))
  return { head, tail }
}

type Props = {
  vendors: VendorRecord[]
  tagGroups: VendorTagGroup[]
  tags: VendorTag[]
  tagsBySlug: Record<string, VendorTag>
  tagGroupsById: Record<string, VendorTagGroup>
  selectedTagSlugs: string[]
}

export default function VendorsPageClient({
  vendors,
  tagGroups,
  tags,
  tagsBySlug,
  tagGroupsById,
  selectedTagSlugs,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const availableTagSlugs = useMemo(() => {
    const set = new Set<string>()
    for (const v of vendors) {
      for (const slug of v.tagSlugs || []) set.add(slug)
    }
    return Array.from(set).sort()
  }, [vendors])

  const filtered = useMemo(() => {
    return filterVendorsBySelectedTags({
      vendors,
      selectedTagSlugs,
      mode: 'or',
      tagsBySlug,
      tagGroupsById,
    })
  }, [vendors, selectedTagSlugs, tagsBySlug, tagGroupsById])

  const filteredStableKey = useMemo(() => {
    const t = [...selectedTagSlugs].sort().join('\0')
    const slugs = filtered.map((v) => v.slug).sort().join('\0')
    return `${t}::${slugs}`
  }, [selectedTagSlugs, filtered])

  const sortedForHydration = useMemo(() => {
    const { head, tail } = splitPinnedHeadAndTail([...filtered])
    const tailSorted = [...tail].sort((a, b) => a.slug.localeCompare(b.slug))
    return [...head, ...tailSorted]
  }, [filtered])

  const [shuffledVendors, setShuffledVendors] = useState<VendorRecord[] | null>(null)

  useEffect(() => {
    const { head, tail } = splitPinnedHeadAndTail(filtered)
    setShuffledVendors([...head, ...shuffleCopy(tail)])
  }, [filteredStableKey, filtered])

  const displayVendors = shuffledVendors ?? sortedForHydration

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const v of vendors) {
      for (const s of v.tagSlugs || []) {
        counts.set(s, (counts.get(s) || 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([slug]) => tagsBySlug[slug])
      .filter(Boolean) as VendorTag[]
  }, [vendors, tagsBySlug])

  const supporterCount = useMemo(() => vendors.filter((v) => v.isPaid).length, [vendors])

  const setParams = (nextSelected: string[]) => {
    const next = new URLSearchParams()
    for (const t of nextSelected) next.append('tag', t)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const toggleTag = (tagSlug: string) => {
    const has = selectedTagSlugs.includes(tagSlug)
    const next = has ? selectedTagSlugs.filter((t) => t !== tagSlug) : [...selectedTagSlugs, tagSlug]
    setParams(next)
  }

  const removeTag = (tagSlug: string) => {
    setParams(selectedTagSlugs.filter((t) => t !== tagSlug))
  }

  const clearAll = () => setParams([])

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Vendors', href: '/vendors', current: true },
  ]

  const stats = [
    { label: 'listings', value: vendors.length },
    { label: 'supporters', value: supporterCount, accent: true },
    ...(selectedTagSlugs.length > 0
      ? [{ label: 'matching filters', value: displayVendors.length }]
      : []),
  ]

  return (
    <DiscoveryPageShell accent="teal">
      <section className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mb-4 max-w-3xl md:mb-5">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary-400/90">Marketplace</p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
              Kink vendors &amp;{' '}
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent">
                independent makers
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-300">
              Gear, leather, rope, and services—browse by topic or open a profile.
            </p>
            <details className="group mt-3">
              <summary className="flex min-h-touch cursor-pointer list-none items-center text-sm font-medium text-primary-400 underline-offset-2 hover:text-primary-300 hover:underline [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block transition group-open:rotate-90" aria-hidden>
                  ▶
                </span>
                About the marketplace
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Curated as a discovery aid, not an endorsement of every product. Pair with{' '}
                <Link href="/events" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  events
                </Link>
                ,{' '}
                <Link href="/calendar" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  calendar
                </Link>
                , and{' '}
                <Link href="/dungeons" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  dungeons
                </Link>{' '}
                when planning a trip. Non-supporter rows shuffle between visits; supporters stay pinned at the top.
              </p>
            </details>

            {popularTags.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Popular topics</p>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/vendors?tag=${encodeURIComponent(t.slug)}`}
                      scroll={false}
                      className={`discovery-filter-pill px-3 py-1.5 text-xs ${
                        selectedTagSlugs.includes(t.slug) ? 'discovery-filter-pill-active' : ''
                      }`}
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8 xl:col-span-9">
              <div
                id="vendor-results"
                className="mb-4 flex flex-wrap items-center justify-between gap-2"
              >
                <p className="text-sm text-gray-500">
                  <span className="font-serif text-xl font-bold text-white sm:text-2xl">
                    <span className="bg-gradient-to-r from-primary-300 to-cyan-300 bg-clip-text text-transparent">
                      Makers
                    </span>
                  </span>
                  <span className="mx-2 text-gray-600">·</span>
                  <span className="tabular-nums font-semibold text-gray-300">{displayVendors.length}</span> showing
                </p>
                <div className="flex flex-wrap gap-3">
                  {selectedTagSlugs.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-sm font-medium text-primary-400 underline underline-offset-2 hover:text-primary-300"
                    >
                      Clear filters
                    </button>
                  ) : null}
                  <Link
                    href="/contact"
                    className="text-sm text-gray-400 underline underline-offset-2 decoration-white/20 hover:text-white"
                  >
                    {CONTACT_US_LABEL}
                  </Link>
                </div>
              </div>

              {displayVendors.length === 0 ? (
                <div className="discovery-empty-panel p-8 sm:p-10">
                  <h2 className="font-serif text-xl font-semibold text-white">No listings match</h2>
                  <p className="mt-2 text-gray-400">Try removing a tag or pick a popular topic above.</p>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="btn-primary mt-6 inline-flex min-h-touch items-center justify-center px-6"
                  >
                    Show all vendors
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
                  {displayVendors.map((v) => (
                    <VendorCard
                      key={v.slug}
                      vendor={v}
                      selectedTagSlugs={selectedTagSlugs}
                      tagsBySlug={tagsBySlug}
                      itemListName="vendors_page"
                    />
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-4 xl:col-span-3">
              <VendorFilters
                tagGroups={tagGroups}
                tags={tags}
                selectedTagSlugs={selectedTagSlugs}
                availableTagSlugs={availableTagSlugs}
                onToggleTag={toggleTag}
                onRemoveTag={removeTag}
                onClearAll={clearAll}
              />
            </aside>
          </div>

          <div className="mt-10 md:mt-12">
            <DancecardShowcase className="mx-auto max-w-3xl lg:max-w-none" />
          </div>

          <div className="stack-ecke-md mt-10 border-t border-white/[0.06] pt-8 md:mt-12">
            <DirectoryCompactStats stats={stats} />
            <SupportCTAInline contextLabel="Vendors" variant="stack" />
          </div>
        </div>
      </section>
    </DiscoveryPageShell>
  )
}
