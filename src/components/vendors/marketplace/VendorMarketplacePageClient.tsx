'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { VendorTag, VendorTagGroup } from '@/data/vendorTaxonomy'
import Breadcrumb from '@/components/Breadcrumb'
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

function splitPinnedHeadAndTail(list: PublicVendorListing[]): {
  head: PublicVendorListing[]
  tail: PublicVendorListing[]
} {
  const head: PublicVendorListing[] = []
  const used = new Set<string>()

  if (SITE_SPONSOR_VENDOR_SLUG) {
    const sponsor = list.find((vendor) => vendor.slug === SITE_SPONSOR_VENDOR_SLUG)
    if (sponsor) {
      head.push(sponsor)
      used.add(sponsor.slug)
    }
  }

  const paid = list
    .filter((vendor) => vendor.supporterTier === 'supporter' && !used.has(vendor.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug))
  for (const vendor of paid) {
    head.push(vendor)
    used.add(vendor.slug)
  }

  return { head, tail: list.filter((vendor) => !used.has(vendor.slug)) }
}

function matchesVendorSearch(vendor: PublicVendorListing, query: string): boolean {
  if (!query) return true
  if (vendor.name.toLowerCase().includes(query)) return true
  if (vendor.craftTags?.some((tag) => tag.toLowerCase().includes(query))) return true
  if (vendor.tagSlugs.some((slug) => slug.toLowerCase().includes(query))) return true
  if (vendor.productCategories?.some((category) => category.toLowerCase().includes(query))) return true
  return false
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
  tagsBySlug,
  tagGroupsById,
  selectedTagSlugs,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const indexItems = useMemo(
    () => attachVendorEvents(buildVendorIndex(vendors, tagsBySlug), unifiedEvents),
    [vendors, tagsBySlug, unifiedEvents]
  )

  const categoryCounts = useMemo(() => categoryChipCounts(indexItems), [indexItems])

  const visibleCategoryChips = useMemo(
    () => VENDOR_CATEGORY_CHIPS.filter((chip) => (categoryCounts[chip.id] ?? 0) > 0),
    [categoryCounts]
  )

  const tagFiltered = useMemo(() => {
    return filterVendorsBySelectedTags({
      vendors,
      selectedTagSlugs,
      mode: 'or',
      tagsBySlug,
      tagGroupsById,
    })
  }, [vendors, selectedTagSlugs, tagsBySlug, tagGroupsById])

  const tagFilteredSlugs = useMemo(() => new Set(tagFiltered.map((vendor) => vendor.slug)), [tagFiltered])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filtered = useMemo(() => {
    let items = indexItems.filter((vendor) => tagFilteredSlugs.has(vendor.slug))
    items = filterByCategoryChip(items, categoryFilter)
    if (normalizedQuery) {
      items = items.filter((vendor) => matchesVendorSearch(vendor, normalizedQuery))
    }
    return items
  }, [indexItems, tagFilteredSlugs, categoryFilter, normalizedQuery])

  const filteredStableKey = useMemo(() => {
    const tagsKey = [...selectedTagSlugs].sort().join('\0')
    const slugs = filtered.map((vendor) => vendor.slug).sort().join('\0')
    return `${categoryFilter ?? ''}::${tagsKey}::${normalizedQuery}::${slugs}`
  }, [selectedTagSlugs, filtered, categoryFilter, normalizedQuery])

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
    if (selectedTagSlugs.length > 0 || categoryFilter || normalizedQuery) return []
    return pickFeaturedVendors(indexItems, 4)
  }, [indexItems, selectedTagSlugs, categoryFilter, normalizedQuery])

  const featuredSlugs = useMemo(() => new Set(featured.map((vendor) => vendor.slug)), [featured])

  const listing = useMemo(
    () => displayVendors.filter((vendor) => !featuredSlugs.has(vendor.slug)),
    [displayVendors, featuredSlugs]
  )

  const clearAll = () => {
    setCategoryFilter(null)
    setSearchQuery('')
    if (selectedTagSlugs.length > 0) {
      router.replace(pathname, { scroll: false })
    }
  }

  const categoryLabel =
    VENDOR_CATEGORY_CHIPS.find((chip) => chip.id === categoryFilter)?.label ?? 'All vendors'

  const resultCountLabel = (() => {
    const count = filtered.length
    const noun = count === 1 ? 'vendor' : 'vendors'
    let label = `Showing ${count} ${noun}`
    if (normalizedQuery) label += ` for “${searchQuery.trim()}”`
    if (categoryFilter) label += ` in ${categoryLabel}`
    return label
  })()

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
            Browse {indexItems.length} kink gear makers — leather, rope, impact gear, jewelry, art, and custom
            commissions.
          </p>

          <div className="vendor-filter-controls">
            <label className="sr-only" htmlFor="vendors-list-search">
              Search vendors by name or product
            </label>
            <input
              id="vendors-list-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search vendors by name or product…"
              className="vendor-list-search-input"
              aria-label="Search vendors by name or product"
            />

            <div className="vendor-category-rail hidden md:flex" role="toolbar" aria-label="Product categories">
              <button
                type="button"
                className={
                  !categoryFilter
                    ? 'vendor-category-tab vendor-category-tab-active'
                    : 'vendor-category-tab'
                }
                aria-current={!categoryFilter ? 'true' : undefined}
                onClick={() => setCategoryFilter(null)}
              >
                All
                <span className="vendor-category-count">{indexItems.length}</span>
              </button>
              {visibleCategoryChips.map((chip) => {
                const isActive = categoryFilter === chip.id
                return (
                  <button
                    key={chip.id}
                    type="button"
                    className={
                      isActive ? 'vendor-category-tab vendor-category-tab-active' : 'vendor-category-tab'
                    }
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => setCategoryFilter(isActive ? null : chip.id)}
                  >
                    {chip.label}
                    <span className="vendor-category-count">{categoryCounts[chip.id]}</span>
                  </button>
                )
              })}
            </div>

            <div className="md:hidden">
              <label className="sr-only" htmlFor="vendors-category-select">
                Filter by category
              </label>
              <select
                id="vendors-category-select"
                className="vendor-filter-select"
                value={categoryFilter ?? ''}
                onChange={(event) => setCategoryFilter(event.target.value || null)}
              >
                <option value="">All vendors ({indexItems.length})</option>
                {visibleCategoryChips.map((chip) => (
                  <option key={chip.id} value={chip.id}>
                    {chip.label} ({categoryCounts[chip.id]})
                  </option>
                ))}
              </select>
            </div>

            <div className="vendor-marketplace-toolbar">
              <p className="vendor-marketplace-count" aria-live="polite">
                {resultCountLabel}
              </p>
              {selectedTagSlugs.length > 0 || categoryFilter || normalizedQuery ? (
                <button type="button" className="vendor-toolbar-link min-h-11" onClick={clearAll}>
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <div className="vendor-marketplace-layout">
          <div className="vendor-marketplace-main">
            {featured.length > 0 ? (
              <section className="vendor-section" aria-labelledby="featured-makers-title">
                <h2 id="featured-makers-title" className="vendor-section-heading">
                  Featured makers
                </h2>
                <p className="vendor-section-sub">
                  Community-verified vendors &amp; shop recommendations
                </p>
                <p className="vendor-section-note">
                  Featured status recognizes vendors with strong community engagement, consistent quality, and
                  active event presence.
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
                  <button type="button" className="vendor-btn vendor-btn-view min-h-11" onClick={clearAll}>
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

            <div className="vendor-bottom-cta">
              <VendorPlatformCta compact />
            </div>
          </div>

          <aside className="vendor-marketplace-rail" aria-label="Vendor sidebar">
            <div className="vendor-rail-card">
              <h3 className="vendor-rail-title">{filtered.length} makers</h3>
              <p className="vendor-rail-body">
                Curated indie kink market — ECKE sends shoppers to vendor shops. Checkout stays off-platform.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
