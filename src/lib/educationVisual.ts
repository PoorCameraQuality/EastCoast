import type { EducationTopic, EducationLevel } from '@/types/publicEducationItem'

export const TOPIC_LABELS: Record<EducationTopic, string> = {
  consent: 'Consent',
  safety: 'Safety',
  technique: 'Techniques',
  community: 'Community',
  resources: 'Resources',
  identity: 'Identity',
  aftercare: 'Aftercare',
  mental_health: 'Mental health',
  legal: 'Legal',
  beginner: 'Beginner',
  gear: 'Gear',
  organizer: 'Organizer',
  presenter: 'Presenter',
  platform: 'Platform',
}

export const TOPIC_MAP_FOR_FILTER: { id: EducationTopic; label: string; legacyCategory?: string }[] = [
  { id: 'safety', label: 'Safety', legacyCategory: 'Safety' },
  { id: 'consent', label: 'Consent', legacyCategory: 'Consent' },
  { id: 'technique', label: 'Techniques', legacyCategory: 'Techniques' },
  { id: 'community', label: 'Community', legacyCategory: 'Community' },
  { id: 'resources', label: 'Resources', legacyCategory: 'Resources' },
  { id: 'beginner', label: 'Beginner', legacyCategory: 'Education' },
  { id: 'identity', label: 'Identity', legacyCategory: 'Identity' },
  { id: 'aftercare', label: 'Aftercare', legacyCategory: 'Aftercare' },
  { id: 'mental_health', label: 'Mental health', legacyCategory: 'Mental Health' },
  { id: 'legal', label: 'Legal', legacyCategory: 'Legal' },
  { id: 'gear', label: 'Gear' },
  { id: 'presenter', label: 'Presenter' },
]

const CATEGORY_TO_TOPIC: Record<string, EducationTopic> = {
  Safety: 'safety',
  Consent: 'consent',
  Techniques: 'technique',
  Community: 'community',
  Resources: 'resources',
  Education: 'beginner',
  Identity: 'identity',
  Aftercare: 'aftercare',
  'Mental Health': 'mental_health',
  Legal: 'legal',
  Platform: 'platform',
}

export function categoryToTopic(category: string): EducationTopic {
  const trimmed = category?.trim()
  if (CATEGORY_TO_TOPIC[trimmed]) return CATEGORY_TO_TOPIC[trimmed]
  const lower = trimmed.toLowerCase()
  for (const [key, topic] of Object.entries(CATEGORY_TO_TOPIC)) {
    if (key.toLowerCase() === lower) return topic
  }
  return 'resources'
}

export function topicToLegacyCategory(topic: EducationTopic): string | undefined {
  return TOPIC_MAP_FOR_FILTER.find((t) => t.id === topic)?.legacyCategory
}

export function parseEducationLevel(raw?: string | null): EducationLevel | undefined {
  if (!raw?.trim()) return undefined
  const d = raw.trim().toLowerCase()
  if (d.includes('begin')) return 'beginner'
  if (d.includes('inter')) return 'intermediate'
  if (d.includes('advanc')) return 'advanced'
  if (d.includes('all')) return 'all_levels'
  return undefined
}

export function parseReadTimeMinutes(readTime?: string | null): number | undefined {
  if (!readTime?.trim()) return undefined
  const match = readTime.match(/(\d+)\s*min/i)
  if (match) return Number.parseInt(match[1], 10)
  return undefined
}

export function formatReadTimeLabel(minutes?: number, fallback?: string): string | undefined {
  if (minutes && minutes > 0) return `${minutes} min read`
  return fallback?.trim() || undefined
}

export function formatTags(raw?: string | string[] | null): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((t) => t.trim()).filter(Boolean)
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return []
}

export function levelDisplay(level?: EducationLevel): string | undefined {
  if (!level) return undefined
  switch (level) {
    case 'beginner':
      return 'Beginner'
    case 'intermediate':
      return 'Intermediate'
    case 'advanced':
      return 'Advanced'
    case 'all_levels':
      return 'All levels'
  }
}

export type TocEntry = { id: string; text: string; level: 2 | 3 }

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/** Extract h2/h3 headings from HTML or markdown for table of contents. */
export function extractTableOfContents(content: string): TocEntry[] {
  if (!content?.trim()) return []
  const entries: TocEntry[] = []
  const usedIds = new Set<string>()

  const htmlPattern = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi
  let htmlMatch: RegExpExecArray | null
  while ((htmlMatch = htmlPattern.exec(content)) !== null) {
    const level = Number.parseInt(htmlMatch[1], 10) as 2 | 3
    const text = htmlMatch[2].replace(/<[^>]+>/g, '').trim()
    if (!text) continue
    let id = slugifyHeading(text)
    let suffix = 2
    while (usedIds.has(id)) {
      id = `${slugifyHeading(text)}-${suffix++}`
    }
    usedIds.add(id)
    entries.push({ id, text, level })
  }

  if (entries.length > 0) return entries

  const mdPattern = /^#{2,3}\s+(.+)$/gm
  let mdMatch: RegExpExecArray | null
  while ((mdMatch = mdPattern.exec(content)) !== null) {
    const hashes = mdMatch[0].match(/^#+/)?.[0].length ?? 2
    const level = (hashes >= 3 ? 3 : 2) as 2 | 3
    const text = mdMatch[1].trim()
    if (!text) continue
    let id = slugifyHeading(text)
    let suffix = 2
    while (usedIds.has(id)) {
      id = `${slugifyHeading(text)}-${suffix++}`
    }
    usedIds.add(id)
    entries.push({ id, text, level })
  }

  return entries
}

/** Pull bullet list near top of article or from first ul block. */
export function extractKeyTakeaways(content: string, excerpt?: string, max = 5): string[] {
  if (content?.trim()) {
    const ulMatch = content.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i)
    if (ulMatch) {
      const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi
      const items: string[] = []
      let liMatch: RegExpExecArray | null
      while ((liMatch = liPattern.exec(ulMatch[1])) !== null) {
        const text = liMatch[1].replace(/<[^>]+>/g, '').trim()
        if (text) items.push(text)
      }
      if (items.length >= 2) return items.slice(0, max)
    }

    const mdBullets = content
      .split('\n')
      .filter((line) => /^[-*]\s+/.test(line.trim()))
      .map((line) => line.replace(/^[-*]\s+/, '').trim())
      .filter(Boolean)
    if (mdBullets.length >= 2) return mdBullets.slice(0, max)
  }

  if (excerpt?.trim()) {
    const sentences = excerpt
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20)
    if (sentences.length >= 2) return sentences.slice(0, Math.min(max, 3))
    return [excerpt.trim()]
  }

  return []
}

export function injectHeadingIds(content: string, toc: TocEntry[]): string {
  if (!content || toc.length === 0) return content
  let index = 0
  return content.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const entry = toc[index++]
    if (!entry) return match
    if (/\bid=/.test(attrs)) return match
    return `<h${level}${attrs} id="${entry.id}">${inner}</h${level}>`
  })
}
