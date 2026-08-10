import { levelDisplay, TOPIC_LABELS } from '@/lib/educationVisual'
import type { PublicEducationItem } from '@/types/publicEducationItem'

/** Topic chip class for education cards and article chrome (server-safe). */
export function topicBadgeClass(topic: PublicEducationItem['topic']): string {
  return `edu-topic-badge edu-topic-badge-${topic}`
}

export function formatCardMeta(item: PublicEducationItem): string {
  const parts: string[] = []
  const level = levelDisplay(item.level)
  if (level) parts.push(level)
  if (item.readTimeLabel) parts.push(item.readTimeLabel)
  else if (item.readTimeMinutes) parts.push(`${item.readTimeMinutes} min read`)
  return parts.join(' · ')
}

export function topicLabel(topic: PublicEducationItem['topic']): string {
  return TOPIC_LABELS[topic] ?? topic
}
