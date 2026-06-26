'use client'

import type { EducationTopic } from '@/types/publicEducationItem'
import { TOPIC_MAP_FOR_FILTER } from '@/lib/educationVisual'

type Props = {
  selectedTopic: EducationTopic | 'all'
  counts: Partial<Record<EducationTopic, number>>
  onSelect: (topic: EducationTopic | 'all') => void
}

export default function EducationTopicMap({ selectedTopic, counts, onSelect }: Props) {
  const visibleTopics = TOPIC_MAP_FOR_FILTER.filter(
    (t) => (counts[t.id] ?? 0) > 0 || selectedTopic === t.id
  )

  return (
    <section className="edu-section" aria-labelledby="edu-topics">
      <div className="edu-section-head">
        <h2 id="edu-topics" className="edu-section-title">
          Browse by topic
        </h2>
        <p className="edu-section-note">Shareable filtered views via URL</p>
      </div>
      <div className="edu-topic-map" role="toolbar" aria-label="Filter by topic">
        <button
          type="button"
          className={selectedTopic === 'all' ? 'edu-topic-pill edu-topic-pill-active' : 'edu-topic-pill'}
          onClick={() => onSelect('all')}
        >
          All topics
        </button>
        {visibleTopics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className={selectedTopic === topic.id ? 'edu-topic-pill edu-topic-pill-active' : 'edu-topic-pill'}
            onClick={() => onSelect(topic.id)}
          >
            {topic.label}
            {(counts[topic.id] ?? 0) > 0 ? (
              <span className="edu-topic-count">({counts[topic.id]})</span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  )
}
