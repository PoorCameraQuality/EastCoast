'use client'

import { useRouter } from 'next/navigation'
import { LEARNING_PATHS } from '@/lib/educationLearningPaths'
import { countForLearningPath } from '@/lib/publicEducationIndex'
import { levelLabel } from '@/lib/educationLearningPaths'
import type { PublicEducationItem } from '@/types/publicEducationItem'

type Props = {
  libraryItems: PublicEducationItem[]
}

export default function LearningPathGrid({ libraryItems }: Props) {
  const router = useRouter()

  return (
    <section className="edu-section" aria-labelledby="edu-start-here">
      <div className="edu-section-head">
        <h2 id="edu-start-here" className="edu-section-title">
          Start here
        </h2>
        <p className="edu-section-note">Curated shelves for what you are trying to do</p>
      </div>
      <div className="edu-path-grid">
        {LEARNING_PATHS.map((path) => {
          const count = countForLearningPath(path, libraryItems)
          return (
            <button
              key={path.slug}
              type="button"
              className="edu-path-card"
              onClick={() => router.push(`/education?path=${path.slug}`)}
            >
              <span className="edu-path-level">{levelLabel(path.level)}</span>
              <span className="edu-path-title">{path.title}</span>
              <span className="edu-path-promise">{path.promise}</span>
              <span className="edu-path-meta">
                <span>{count > 0 ? `${count} guides` : 'Growing shelf'}</span>
                <span className="edu-path-cta">Start path →</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
