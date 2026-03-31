'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import VendorImage from '@/components/vendors/VendorImage'
import { getVendorCardPreviewText, type VendorRecord } from '@/lib/vendorFiltering'
import { tagGroupsById, tagsBySlug } from '@/data/vendorTaxonomy'
import { shuffleCopy } from '@/lib/shuffle'

const TARGET_FEATURED_COUNT = 6
const POPULAR_FILTERS_COUNT = 8

type Props = {
  /** Merged static + Supabase catalog from the home page server component */
  vendors: VendorRecord[]
}

export default function FeaturedVendorsSection({ vendors: all }: Props) {

  const supporters = useMemo(() => all.filter((v) => Boolean(v.isPaid)), [all])
  const nonSupporters = useMemo(
    () => all.filter((v) => !v.isPaid),
    [all]
  )

  const nonSupportersNeeded = Math.max(0, TARGET_FEATURED_COUNT - supporters.length)

  // Stable initial selection for SSR/hydration; rotates after mount.
  const deterministicNonSupporters = useMemo(() => {
    return [...nonSupporters].sort((a, b) => a.slug.localeCompare(b.slug)).slice(0, nonSupportersNeeded)
  }, [nonSupporters, nonSupportersNeeded])

  const [rotatingNonSupporters, setRotatingNonSupporters] = useState(deterministicNonSupporters)

  useEffect(() => {
    if (nonSupportersNeeded <= 0) return
    setRotatingNonSupporters(shuffleCopy(nonSupporters).slice(0, nonSupportersNeeded))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // rotate per fresh visit/mount

  const featured = useMemo(() => {
    const merged = [...supporters, ...rotatingNonSupporters]
    // If we have fewer than the target count total, just show what we have.
    return merged
  }, [supporters, rotatingNonSupporters])

  const popularFilters = useMemo(() => {
    // Build tag usage counts based on current vendor data, then show the most common *visible* tags.
    const counts = new Map<string, number>()
    for (const v of all) {
      for (const slug of v.tagSlugs || []) {
        counts.set(slug, (counts.get(slug) || 0) + 1)
      }
    }

    const candidates = Array.from(counts.entries())
      .map(([slug, count]) => ({ slug, count, tag: tagsBySlug[slug] }))
      .filter((x) => {
        if (!x.tag) return false
        if (!x.tag.isActive) return false
        const g = tagGroupsById[x.tag.groupId]
        return Boolean(g?.isActive)
      })
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.tag.name.localeCompare(b.tag.name)
      })
      .slice(0, POPULAR_FILTERS_COUNT)

    return candidates.map((c) => ({ label: c.tag.name, tag: c.slug }))
  }, [all])

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden" aria-labelledby="featured-vendors-title">
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h2 id="featured-vendors-title" className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">
              Featured Vendors
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
              A growing list of makers and shops to help you discover gear, apparel, and more.
            </p>
          </div>
          <Link href="/vendors" className="btn-outline text-sm px-5 py-2 whitespace-nowrap min-h-touch inline-flex items-center justify-center w-full sm:w-auto md:w-auto" aria-label="Browse vendors marketplace">
            Browse Vendors
          </Link>
        </div>

        {/* Popular filters (links into the real filter UI) */}
        <div
          className="flex flex-nowrap sm:flex-wrap gap-2 mb-8 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory"
          aria-label="Popular vendor filters"
        >
          {popularFilters.map((f) => (
            <Link
              key={f.tag}
              href={`/vendors?tag=${encodeURIComponent(f.tag)}`}
              className="shrink-0 snap-start inline-flex min-h-touch items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/25 transition-colors"
              aria-label={`Filter vendors by ${f.label}`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Mobile: horizontal swipe */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {featured.map((vendor) => (
              <Link
                key={vendor.slug}
                href={`/vendors/${vendor.slug}`}
                className="snap-start min-w-[280px] group"
                aria-label={`View vendor: ${vendor.name}`}
              >
                <article className={`relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:border-primary-400/25 group-hover:shadow-elegant-lg ${vendor.isPaid ? 'vendor-paid-sparkle' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-primary-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <VendorImage src={vendor.logo125Url} alt={`${vendor.name} logo`} size={48} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-serif font-semibold text-white leading-tight line-clamp-1 group-hover:text-primary-300 transition-colors duration-300">
                            {vendor.name}
                          </h3>
                          {vendor.isPaid ? (
                            <span className="vendor-supporter-badge" aria-label="Supporter vendor">
                              Supporter
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {vendor.location}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                      {getVendorCardPreviewText({ vendor, maxSentences: 3 })}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-primary-300 font-semibold">
                      <span>View Vendor</span>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((vendor) => (
            <Link
              key={vendor.slug}
              href={`/vendors/${vendor.slug}`}
              className="group"
              aria-label={`View vendor: ${vendor.name}`}
            >
              <article className={`relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-colors duration-500 md:hover:scale-[1.02] motion-reduce:md:hover:scale-100 hover:border-primary-400/25 hover:shadow-elegant-lg ${vendor.isPaid ? 'vendor-paid-sparkle' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-primary-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <VendorImage src={vendor.logo125Url} alt={`${vendor.name} logo`} size={48} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-serif font-semibold text-white leading-tight line-clamp-1 group-hover:text-primary-300 transition-colors duration-300">
                          {vendor.name}
                        </h3>
                        {vendor.isPaid ? (
                          <span className="vendor-supporter-badge" aria-label="Supporter vendor">
                            Supporter
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {vendor.location}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
                    {getVendorCardPreviewText({ vendor, maxSentences: 3 })}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

