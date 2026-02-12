import type { VendorTag, VendorTagGroup } from '@/data/vendorTaxonomy'

export type VendorFilterMode = 'or' | 'and'

export type VendorRecord = {
  slug: string
  name: string
  description?: string
  story?: string
  websiteUrl?: string
  logo125Url?: string
  location?: string
  tagSlugs: string[]
  isPaid?: boolean
  productImage125ByTagSlug?: Record<string, string>
}

export function getVendorCardPreviewText(args: { vendor: VendorRecord; maxSentences: number }): string {
  const { vendor, maxSentences } = args
  const text = (vendor.story || vendor.description || '').trim()
  if (!text) return ''

  // Split on sentence-ending punctuation. This is intentionally simple and predictable.
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (sentences.length <= maxSentences) return text
  return sentences.slice(0, maxSentences).join(' ')
}

export function normalizeFilterMode(mode: string | null | undefined): VendorFilterMode {
  return mode === 'and' ? 'and' : 'or'
}

export function getSelectedTagSlugsFromSearchParams(sp: URLSearchParams): string[] {
  // Preserves the order the user selected tags (URLSearchParams maintains insertion order).
  const raw = sp.getAll('tag').map((t) => t.trim()).filter(Boolean)
  // Dedupe while preserving order.
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of raw) {
    if (seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

export function filterVendorsBySelectedTags(args: {
  vendors: VendorRecord[]
  selectedTagSlugs: string[]
  mode: VendorFilterMode
  tagsBySlug: Record<string, VendorTag>
  tagGroupsById: Record<string, VendorTagGroup>
}): VendorRecord[] {
  const { vendors, selectedTagSlugs, mode, tagsBySlug } = args

  if (selectedTagSlugs.length === 0) return vendors

  if (mode === 'or') {
    const selected = new Set(selectedTagSlugs)
    return vendors.filter((v) => v.tagSlugs?.some((t) => selected.has(t)))
  }

  // mode === 'and'
  // Recommended behavior: AND across groups, OR within each group.
  const selectedByGroup = new Map<string, Set<string>>()
  for (const slug of selectedTagSlugs) {
    const tag = tagsBySlug[slug]
    if (!tag) continue
    if (!selectedByGroup.has(tag.groupId)) selectedByGroup.set(tag.groupId, new Set())
    selectedByGroup.get(tag.groupId)!.add(slug)
  }

  // If all selected tags were invalid/unrecognized, don't filter.
  if (selectedByGroup.size === 0) return vendors

  return vendors.filter((v) => {
    const vendorSet = new Set(v.tagSlugs || [])
    const groups = Array.from(selectedByGroup.values())
    for (let i = 0; i < groups.length; i++) {
      const groupSlugs = groups[i]
      const slugs = Array.from(groupSlugs)
      let hit = false
      for (let j = 0; j < slugs.length; j++) {
        const slug = slugs[j]
        if (vendorSet.has(slug)) {
          hit = true
          break
        }
      }
      if (!hit) return false
    }
    return true
  })
}

export function getVendorPaidImage125Url(args: {
  vendor: VendorRecord
  selectedTagSlugs: string[]
}): string | null {
  const { vendor, selectedTagSlugs } = args

  if (!vendor.isPaid) return null
  const map = vendor.productImage125ByTagSlug
  if (!map) return null

  // Prefer the first selected tag that has a paid image.
  for (const slug of selectedTagSlugs) {
    const img = map[slug]
    if (img) return img
  }

  return map.default || null
}

