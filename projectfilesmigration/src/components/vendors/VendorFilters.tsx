'use client'

import React, { useMemo, useState } from 'react'
import type { VendorTag, VendorTagGroup } from '@/data/vendorTaxonomy'

type Props = {
  tagGroups: VendorTagGroup[]
  tags: VendorTag[]
  selectedTagSlugs: string[]
  availableTagSlugs?: string[]
  onToggleTag: (tagSlug: string) => void
  onRemoveTag: (tagSlug: string) => void
  onClearAll: () => void
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/25 transition"
      aria-label={`Remove filter ${label}`}
    >
      <span className="max-w-[180px] truncate">{label}</span>
      <span aria-hidden="true" className="text-gray-400">×</span>
    </button>
  )
}

function GroupAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden" open={defaultOpen}>
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-white flex items-center justify-between">
        <span>{title}</span>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 pt-2">{children}</div>
    </details>
  )
}

function TagRow({
  tag,
  checked,
  onToggle,
}: {
  tag: VendorTag
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex items-center gap-3 py-2 text-sm text-gray-300 hover:text-white cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 accent-primary-600"
      />
      <span className="min-w-0 flex-1 truncate">{tag.name}</span>
    </label>
  )
}

export default function VendorFilters({
  tagGroups,
  tags,
  selectedTagSlugs,
  availableTagSlugs,
  onToggleTag,
  onRemoveTag,
  onClearAll,
}: Props) {
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const selectedSet = useMemo(() => new Set(selectedTagSlugs), [selectedTagSlugs])
  const availableSet = useMemo(() => new Set(availableTagSlugs || []), [availableTagSlugs])

  const tagsByGroup = useMemo(() => {
    const map = new Map<string, VendorTag[]>()
    for (const t of tags) {
      if (!t.isActive) continue
      if (availableTagSlugs && !availableSet.has(t.slug)) continue
      if (query && !t.name.toLowerCase().includes(query.toLowerCase()) && !t.slug.toLowerCase().includes(query.toLowerCase())) {
        continue
      }
      const arr = map.get(t.groupId) || []
      arr.push(t)
      map.set(t.groupId, arr)
    }
    // Stable-ish ordering: higher weight first, then name.
    map.forEach((arr, k) => {
      arr.sort((a, b) => (b.searchWeight - a.searchWeight) || a.name.localeCompare(b.name))
      map.set(k, arr)
    })
    return map
  }, [tags, query, availableTagSlugs, availableSet])

  const selectedLabels = useMemo(() => {
    const bySlug = new Map(tags.map((t) => [t.slug, t.name]))
    return selectedTagSlugs.map((s) => ({ slug: s, name: bySlug.get(s) || s }))
  }, [selectedTagSlugs, tags])

  const Panel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-300">
          <span className="font-semibold text-white">Filter</span>{' '}
          <span className="text-gray-500">(tags are hidden on cards)</span>
        </div>
        {selectedTagSlugs.length > 0 ? (
          <button type="button" className="text-xs text-gray-300 hover:text-white underline underline-offset-4" onClick={onClearAll}>
            Clear all
          </button>
        ) : null}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2" htmlFor="tag-search">
          Search tags
        </label>
        <input
          id="tag-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tags..."
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
        />
      </div>

      {selectedTagSlugs.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Selected filters">
          {selectedLabels.map((t) => (
            <Chip key={t.slug} label={t.name} onRemove={() => onRemoveTag(t.slug)} />
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {tagGroups
          .filter((g) => g.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((g, idx) => {
            const groupTags = tagsByGroup.get(g.id) || []
            if (groupTags.length === 0) return null
            return (
              <GroupAccordion key={g.id} title={g.name} defaultOpen={idx === 0}>
                <div className="max-h-64 overflow-auto pr-2">
                  {groupTags.map((t) => (
                    <TagRow
                      key={t.slug}
                      tag={t}
                      checked={selectedSet.has(t.slug)}
                      onToggle={() => onToggleTag(t.slug)}
                    />
                  ))}
                </div>
              </GroupAccordion>
            )
          })}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile button */}
      <div className="md:hidden flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="btn-outline py-2 px-4 text-sm"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
        >
          Filters {selectedTagSlugs.length > 0 ? `(${selectedTagSlugs.length})` : ''}
        </button>
        {selectedTagSlugs.length > 0 ? (
          <button type="button" className="text-sm text-gray-300 underline underline-offset-4" onClick={onClearAll}>
            Clear
          </button>
        ) : null}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-24">
        {Panel}
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Vendor filters">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-black border-l border-white/10 p-5 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-serif font-semibold text-white">Filters</div>
              <button type="button" onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white">
                Close
              </button>
            </div>
            {Panel}
          </div>
        </div>
      ) : null}
    </>
  )
}

