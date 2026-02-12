'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { VendorTag, VendorTagGroup } from '@/data/vendorTaxonomy'
import VendorFilters from '@/components/vendors/VendorFilters'
import VendorCard from '@/components/vendors/VendorCard'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import Breadcrumb from '@/components/Breadcrumb'
import SupportCTAInline from '@/components/SupportCTAInline'
import {
  filterVendorsBySelectedTags,
  getSelectedTagSlugsFromSearchParams,
  type VendorRecord,
} from '@/lib/vendorFiltering'

type Props = {
  vendors: VendorRecord[]
  tagGroups: VendorTagGroup[]
  tags: VendorTag[]
  tagsBySlug: Record<string, VendorTag>
  tagGroupsById: Record<string, VendorTagGroup>
}

export default function VendorsPageClient({ vendors, tagGroups, tags, tagsBySlug, tagGroupsById }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const spString = sp.toString()
  const selectedTagSlugs = useMemo(() => getSelectedTagSlugsFromSearchParams(new URLSearchParams(spString)), [spString])

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
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black">
      <div className="container-custom">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-10">
            <Breadcrumb items={breadcrumbItems} />
            <SupportCTAInline contextLabel="Vendors" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Vendors</h1>
            <p className="text-gray-300 leading-relaxed max-w-3xl">
              Discover makers, shops, and educators across multiple dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
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
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="text-sm text-gray-400">
                  Showing <span className="text-white font-semibold">{filtered.length}</span> vendor{filtered.length === 1 ? '' : 's'}
                </div>
                <Link href="/contact" className="text-sm text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors" aria-label="Contact us">
                  {CONTACT_US_LABEL}
                </Link>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                  <h2 className="text-xl font-serif font-semibold text-white mb-2">No matches</h2>
                  <p className="text-gray-400">
                    Try removing a filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filtered.map((v) => (
                    <VendorCard key={v.slug} vendor={v} selectedTagSlugs={selectedTagSlugs} />
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

