'use client'

import EckeLink from '@/components/EckeLink'
import type { PublicEducationItem } from '@/types/publicEducationItem'
import { TOPIC_LABELS } from '@/lib/educationVisual'
import { levelDisplay } from '@/lib/educationVisual'

export type EducationContentView = 'all' | 'guides' | 'links' | 'paths' | 'educators'

type Props = {
  libraryCount: number
  resourceCount: number
  pathCount: number
  educatorCount: number
  activeView: EducationContentView
  onSelectView: (view: EducationContentView) => void
}

export default function EducationLibraryHeader({
  libraryCount,
  resourceCount,
  pathCount,
  educatorCount,
  activeView,
  onSelectView,
}: Props) {
  return (
    <header className="edu-index-hero">
      <p className="edu-kicker">Public learning library</p>
      <h1 className="edu-title">Kink Education Library</h1>
      <p className="edu-subhead">
        Guides, resources, and learning paths for showing up prepared, connecting safely, and understanding
        the scene.
      </p>
      <p className="edu-support">
        Pair reading with the <EckeLink href="/calendar">calendar</EckeLink>,{' '}
        <EckeLink href="/events">events</EckeLink>, and <EckeLink href="/states">state hubs</EckeLink> when
        you are ready to go out.
      </p>
      <div className="edu-stats" role="toolbar" aria-label="Library stats">
        <button
          type="button"
          className={
            activeView === 'guides' ? 'edu-stat-pill edu-stat-pill-active' : 'edu-stat-pill'
          }
          onClick={() => onSelectView('guides')}
        >
          <strong>{libraryCount}</strong> on-site guides
        </button>
        <button
          type="button"
          className={activeView === 'links' ? 'edu-stat-pill edu-stat-pill-active' : 'edu-stat-pill'}
          onClick={() => onSelectView('links')}
        >
          <strong>{resourceCount}</strong> curated links
        </button>
        <button
          type="button"
          className={activeView === 'paths' ? 'edu-stat-pill edu-stat-pill-active' : 'edu-stat-pill'}
          onClick={() => onSelectView('paths')}
        >
          <strong>{pathCount}</strong> learning paths
        </button>
        {educatorCount > 0 ? (
          <button
            type="button"
            className={
              activeView === 'educators' ? 'edu-stat-pill edu-stat-pill-active' : 'edu-stat-pill'
            }
            onClick={() => onSelectView('educators')}
          >
            <strong>{educatorCount}</strong> educators
          </button>
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
