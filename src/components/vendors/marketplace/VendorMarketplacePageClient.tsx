'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { VendorTag, VendorTagGroup } from '@/data/vendorTaxonomy'
import Breadcrumb from '@/components/Breadcrumb'
import VendorFilters from '@/components/vendors/VendorFilters'
import AdaptiveVendorCard, { VendorPlatformCta } from '@/components/vendors/marketplace/AdaptiveVendorCard'
import {
  attachVendorEvents,
  buildVendorIndex,
  categoryChipCounts,
  filterByCategoryChip,
  pickFeaturedVendors,
} from '@/lib/publicVendorIndex'
import type { UnifiedVendor } from '@/lib/unifiedVendors'
import { filterVendorsBySelectedTags } from '@/lib/vendorFiltering'
import { shuffleCopy } from '@/lib/shuffle'
import { SITE_SPONSOR_VENDOR_SLUG } from '@/data/vendors'
import { VENDOR_CATEGORY_CHIPS } from '@/types/publicVendorListing'
import type { PublicVendorListing } from '@/types/publicVendorListing'
import type { UnifiedEvent } from '@/lib/unifiedEvents'

function splitPinnedHeadAndTail(list: PublicVendorListing[]): { head: PublicVendorListing[]; tail: PublicVendorListing[] } {
  const head: PublicVendorListing[] = []
  const used = new Set<string>()

  if (SITE_SPONSOR_VENDOR_SLUG) {
    const sponsor = list.find((v) => v.slug === SITE_SPONSOR_VENDOR_SLUG)
    if (sponsor) {
      head.push(sponsor)
      used.add(sponsor.slug)
    }
  }

  const paid = list
    .filter((v) => v.supporterTier === 'supporter' && !used.has(v.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug))
  for (const v of paid) {
    head.push(v)
    used.add(v.slug)
  }

  return { head, tail: list.filter((v) => !used.has(v.slug)) }
}

type Props = {
  vendors: UnifiedVendor[]
  unifiedEvents: UnifiedEvent[]
  tagGroups: VendorTagGroup[]
  tags: VendorTag[]
  tagsBySlug: Record<string, VendorTag>
  tagGroupsById: Record<string, VendorTagGroup>
  selectedTagSlugs: string[]
}

export default function VendorMarketplacePageClient({
  vendors,
  unifiedEvents,
  tagGroups,
  tags,
  tagsBySlug,
  tagGroupsById,
  selectedTagSlugs,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const indexItems = useMemo(
    () => attachVendorEvents(buildVendorIndex(vendors, tagsBySlug), unifiedEvents),
    [vendors, tagsBySlug, unifiedEvents]
  )

  const categoryCounts = useMemo(() => categoryChipCounts(indexItems), [indexItems])

  const tagFiltered = useMemo(() => {
    return filterVendorsBySelectedTags({
      vendors,
      selectedTagSlugs,
      mode: 'or',
      tagsBySlug,
      tagGroupsById,
    })
  }, [vendors, selectedTagSlugs, tagsBySlug, tagGroupsById])

  const tagFilteredSlugs = useMemo(() => new Set(tagFiltered.map((v) => v.slug)), [tagFiltered])

  const filtered = useMemo(() => {
    let items = indexItems.filter((v) => tagFilteredSlugs.has(v.slug))
    items = filterByCategoryChip(items, categoryFilter)
    return items
  }, [indexItems, tagFilteredSlugs, categoryFilter])

  const filteredStableKey = useMemo(() => {
    const t = [...selectedTagSlugs].sort().join('\0')
    const slugs = filtered.map((v) => v.slug).sort().join('\0')
    return `${categoryFilter ?? ''}::${t}::${slugs}`
  }, [selectedTagSlugs, filtered, categoryFilter])

  const sortedForHydration = useMemo(() => {
    const { head, tail } = splitPinnedHeadAndTail([...filtered])
    const tailSorted = [...tail].sort((a, b) => a.slug.localeCompare(b.slug))
    return [...head, ...tailSorted]
  }, [filtered])

  const [displayList, setDisplayList] = useState<PublicVendorListing[] | null>(null)

  useEffect(() => {
    const { head, tail } = splitPinnedHeadAndTail(filtered)
    setDisplayList([...head, ...shuffleCopy(tail)])
  }, [filteredStableKey, filtered])

  const displayVendors = displayList ?? sortedForHydration

  const featured = useMemo(() => {
    if (selectedTagSlugs.length > 0 || categoryFilter) return []
    return pickFeaturedVendors(indexItems, 4)
  }, [indexItems, selectedTagSlugs, categoryFilter])

  const featuredSlugs = useMemo(() => new Set(featured.map((f) => f.slug)), [featured])

  const listing = useMemo(
    () => displayVendors.filter((v) => !featuredSlugs.has(v.slug)),
    [displayVendors, featuredSlugs]
  )

  const availableTagSlugs = useMemo(() => {
    const set = new Set<string>()
    for (const v of vendors) {
      for (const slug of v.tagSlugs || []) set.add(slug)
    }
    return Array.from(set).sort()
  }, [vendors])

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

  const removeTag = (tagSlug: string) => setParams(selectedTagSlugs.filter((t) => t !== tagSlug))
  const clearAll = () => {
    setParams([])
    setCategoryFilter(null)
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Vendors & makers', href: '/vendors', current: true },
  ]

  return (
    <main className="vendor-marketplace-page">
      <div className="container-custom section-padding">
        <Breadcrumb items={breadcrumbItems} />

        <header className="vendor-marketplace-hero">
          <p className="vendor-marketplace-kicker">Maker marketplace</p>
          <h1 className="vendor-marketplace-title">Vendors &amp; makers</h1>
          <p className="vendor-marketplace-subhead">
            Gear, leather, rope, art, books, jewelry, clothing, furniture, services, and custom work from the kink
            event ecosystem.
          </p>
          <div className="vendor-marketplace-actions">
            <a href="#all-vendors" className="vendor-btn vendor-btn-view">
              Browse vendors
            </a>
            <button
              type="button"
              className="vendor-btn vendor-btn-neutral"
              onClick={() => setFiltersOpen(true)}
            >
              Shop by category
            </button>
          </div>
        </header>

        <div className="vendor-category-rail" role="toolbar" aria-label="Product categories">
          <button
            type="button"
            className={!categoryFilter ? 'vendor-category-chip vendor-category-chip-active' : 'vendor-category-chip'}
            onClick={() => setCategoryFilter(null)}
          >
            All
          </button>
          {VENDOR_CATEGORY_CHIPS.filter((c) => (categoryCounts[c.id] ?? 0) > 0).map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={
                categoryFilter === chip.id ? 'vendor-category-chip vendor-category-chip-active' : 'vendor-category-chip'
              }
              onClick={() => setCategoryFilter(categoryFilter === chip.id ? null : chip.id)}
            >
              {chip.label}
              <span className="vendor-category-count">{categoryCounts[chip.id]}</span>
            </button>
          ))}
        </div>

        <div className="vendor-marketplace-toolbar">
          <p className="vendor-marketplace-count">
            <strong>{displayVendors.length}</strong> makers
          </p>
          <div className="vendor-marketplace-toolbar-actions">
            {selectedTagSlugs.length > 0 || categoryFilter ? (
              <button type="button" className="vendor-toolbar-link" onClick={clearAll}>
                Clear filters
              </button>
            ) : null}
            <button type="button" className="vendor-toolbar-link" onClick={() => setFiltersOpen((o) => !o)}>
              {filtersOpen ? 'Hide filters' : 'More filters'}
            </button>
          </div>
        </div>

        {filtersOpen ? (
          <div className="vendor-filter-drawer">
            <VendorFilters
              tagGroups={tagGroups}
              tags={tags}
              selectedTagSlugs={selectedTagSlugs}
              availableTagSlugs={availableTagSlugs}
              onToggleTag={toggleTag}
              onRemoveTag={removeTag}
              onClearAll={clearAll}
            />
          </div>
        ) : null}

        <div className="vendor-marketplace-layout">
          <div className="vendor-marketplace-main">
            {featured.length > 0 ? (
              <section className="vendor-section" aria-label="Featured makers">
                <h2 className="vendor-section-heading">Featured makers</h2>
                <p className="vendor-section-sub">
                  Independent shops, artists, and craftspeople from the community.
                </p>
                <div className="vendor-grid vendor-grid-featured">
                  {featured.map((vendor) => (
                    <AdaptiveVendorCard key={vendor.slug} vendor={vendor} variant="featured" />
                  ))}
                </div>
              </section>
            ) : null}

            <section id="all-vendors" className="vendor-section scroll-mt-24">
              <h2 className="vendor-section-heading">All vendors</h2>
              {listing.length === 0 ? (
                <div className="vendor-empty">
                  <p>No vendors match this view.</p>
                  <button type="button" className="vendor-btn vendor-btn-view" onClick={clearAll}>
                    Show all vendors
                  </button>
                </div>
              ) : (
                <div className="vendor-grid">
                  {listing.map((vendor) => (
                    <AdaptiveVendorCard key={vendor.slug} vendor={vendor} />
                  ))}
                </div>
              )}
            </section>

            <div className="vendor-mobile-cta lg:hidden">
              <VendorPlatformCta compact />
            </div>
          </div>

          <aside className="vendor-marketplace-rail" aria-label="Vendor sidebar">
            <div className="vendor-rail-card">
              <h3 className="vendor-rail-title">{indexItems.length} makers</h3>
              <p className="vendor-rail-body">
                Curated indie kink market — ECKE sends shoppers to vendor shops. Checkout stays off-platform.
              </p>
            </div>
            <VendorPlatformCta compact />
          </aside>
        </div>
      </div>
    </main>
  )
}
