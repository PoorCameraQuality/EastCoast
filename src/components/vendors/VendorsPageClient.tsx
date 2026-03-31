'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { VendorTag, VendorTagGroup } from '@/data/vendorTaxonomy'
import VendorFilters from '@/components/vendors/VendorFilters'
import VendorCard from '@/components/vendors/VendorCard'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import Breadcrumb from '@/components/Breadcrumb'
import SupportCTAInline from '@/components/SupportCTAInline'
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

  return (
    <section className="relative overflow-hidden section-padding bg-black">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-64 w-64 rounded-full bg-teal-600/80 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={breadcrumbItems} />
          <SupportCTAInline contextLabel="Vendors" />

          <header className="mb-10 md:mb-12">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">Marketplace</p>
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Kink vendors &amp;{' '}
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent">
                independent makers
              </span>
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
              Impact gear, leather, rope, wearables, books, and services—curated as a discovery aid (not an
              endorsement of every product). Pair with{' '}
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
              when you are planning a trip or booth crawl.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                <span className="font-semibold tabular-nums text-white">{vendors.length}</span> listings
              </div>
              <div className="rounded-full border border-primary-500/25 bg-primary-500/10 px-4 py-2 text-sm text-primary-100/90">
                <span className="font-semibold tabular-nums">{supporterCount}</span> supporters highlighted
              </div>
              {selectedTagSlugs.length > 0 ? (
                <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100/90">
                  <span className="font-semibold tabular-nums">{displayVendors.length}</span> match filters
                </div>
              ) : null}
            </div>

            {popularTags.length > 0 ? (
              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Popular topics · one tap
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/vendors?tag=${encodeURIComponent(t.slug)}`}
                      scroll={false}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        selectedTagSlugs.includes(t.slug)
                          ? 'border-primary-400 bg-primary-500/20 text-primary-100'
                          : 'border-white/15 bg-white/5 text-gray-200 hover:border-primary-500/40 hover:bg-primary-950/30'
                      }`}
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="mt-6 max-w-2xl text-xs text-gray-600">
              Non-supporter rows shuffle between visits so different makers surface; sponsors and paid supporters stay
              pinned at the top.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-10">
            <aside className="md:col-span-4 lg:col-span-3">
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

            <div className="md:col-span-8 lg:col-span-9">
              <div
                id="vendor-results"
                className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="text-sm text-gray-400">
                  Showing{' '}
                  <span className="font-semibold text-white">{displayVendors.length}</span> of{' '}
                  <span className="tabular-nums text-gray-300">{vendors.length}</span>
                  {selectedTagSlugs.length > 0 ? (
                    <span className="text-gray-500"> (filtered)</span>
                  ) : null}
                </div>
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
                    className="inline-flex min-h-touch items-center text-sm text-gray-400 underline underline-offset-2 decoration-white/20 hover:text-white hover:decoration-white/40"
                    aria-label="Contact us"
                  >
                    {CONTACT_US_LABEL}
                  </Link>
                </div>
              </div>

              {displayVendors.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center sm:p-10">
                  <h2 className="font-serif text-xl font-semibold text-white">No listings match</h2>
                  <p className="mt-2 text-gray-400">
                    Try removing a tag or browse a popular topic above.
                  </p>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="btn-primary mt-6 inline-flex min-h-touch items-center justify-center px-6"
                  >
                    Show all vendors
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
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
          </div>
        </div>
      </div>
    </section>
  )
}
