import type { EventPageRecord } from '@/lib/unifiedEvents'

export type EventDescriptionSection = {
  title: string
  body: string
}

export type ParsedEventDescription = {
  intro: string
  sections: EventDescriptionSection[]
}

const SECTION_HEADER = /\*\*([^*]+?)\*\*/g

/** Split organizer long copy into scannable modules. */
export function parseEventDescription(longDescription: string): ParsedEventDescription {
  const trimmed = longDescription.trim()
  if (!trimmed) return { intro: '', sections: [] }

  const parts: { title: string; start: number; end: number }[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(SECTION_HEADER.source, 'g')

  while ((match = re.exec(trimmed)) !== null) {
    parts.push({
      title: match[1].replace(/:$/, '').trim(),
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  if (parts.length === 0) {
    return { intro: trimmed, sections: [] }
  }

  const intro = trimmed.slice(0, parts[0]!.start).trim()
  const sections: EventDescriptionSection[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    const bodyStart = part.end
    const bodyEnd = i + 1 < parts.length ? parts[i + 1]!.start : trimmed.length
    const body = trimmed.slice(bodyStart, bodyEnd).trim()
    if (body) sections.push({ title: part.title, body })
  }

  return { intro, sections }
}

function featureTitle(raw: string): string {
  const dash = raw.indexOf(' - ')
  if (dash > 0) return raw.slice(0, dash).replace(/^[-*•]\s*/, '').trim()
  const colon = raw.indexOf(': ')
  if (colon > 0 && colon < 48) return raw.slice(0, colon).trim()
  if (raw.length <= 52) return raw
  return `${raw.slice(0, 49).trim()}…`
}

function featureDetail(raw: string): string | undefined {
  const dash = raw.indexOf(' - ')
  if (dash > 0) {
    const detail = raw.slice(dash + 3).trim()
    return detail.length > 120 ? `${detail.slice(0, 117)}…` : detail
  }
  return undefined
}

export type EventFeatureTile = {
  title: string
  detail?: string
}

export function eventFeatureTiles(features: string[]): EventFeatureTile[] {
  return features.map((f) => ({
    title: featureTitle(f),
    detail: featureDetail(f),
  }))
}

export function buildWhyGoPoints(event: EventPageRecord): string[] {
  const fromFeatures = (event.features ?? [])
    .slice(0, 5)
    .map((f) => {
      const dash = f.indexOf(' - ')
      if (dash > 0) return f.slice(dash + 3).trim()
      return f.replace(/^[-*•]\s*/, '').trim()
    })
    .filter((s) => s.length > 12 && s.length < 140)

  if (fromFeatures.length >= 3) return fromFeatures.slice(0, 4)

  if (event.excerpt) {
    const sentences = event.excerpt
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 16)
    if (sentences.length >= 2) return sentences.slice(0, 4)
    if (sentences.length === 1) return [sentences[0]!]
  }

  return fromFeatures.length > 0 ? fromFeatures : []
}

export function eventListingSourceLabel(event: EventPageRecord): string {
  if (event.c2kSourceId) return 'Synced from kink.social'
  return 'Organizer-provided listing'
}
