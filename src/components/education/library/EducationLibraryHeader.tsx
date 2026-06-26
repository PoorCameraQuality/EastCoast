import EckeLink from '@/components/EckeLink'
import type { PublicEducationItem } from '@/types/publicEducationItem'
import { TOPIC_LABELS } from '@/lib/educationVisual'
import { levelDisplay } from '@/lib/educationVisual'

type Props = {
  libraryCount: number
  resourceCount: number
  pathCount: number
  educatorCount: number
}

export default function EducationLibraryHeader({
  libraryCount,
  resourceCount,
  pathCount,
  educatorCount,
}: Props) {
  return (
    <header className="edu-index-hero">
      <p className="edu-kicker">Public learning library</p>
      <h1 className="edu-title">Learn</h1>
      <p className="edu-subhead">
        Guides, resources, and learning paths for showing up prepared, connecting safely, and understanding the scene.
      </p>
      <p className="edu-support">
        Pair reading with the{' '}
        <EckeLink href="/calendar">calendar</EckeLink>,{' '}
        <EckeLink href="/events">events</EckeLink>, and{' '}
        <EckeLink href="/states">state hubs</EckeLink> when you are ready to go out.
      </p>
      <div className="edu-stats">
        <span className="edu-stat-pill">
          <strong>{libraryCount}</strong> guides
        </span>
        <span className="edu-stat-pill">
          <strong>{resourceCount}</strong> curated links
        </span>
        <span className="edu-stat-pill">
          <strong>{pathCount}</strong> learning paths
        </span>
        {educatorCount > 0 ? (
          <span className="edu-stat-pill">
            <strong>{educatorCount}</strong> educators
          </span>
        ) : null}
      </div>
    </header>
  )
}

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
