'use client'

import type { TocEntry } from '@/lib/educationVisual'

type Props = {
  entries: TocEntry[]
}

export default function ArticleTableOfContents({ entries }: Props) {
  if (entries.length < 3) return null

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="edu-toc" aria-labelledby="edu-toc-title">
      <h2 id="edu-toc-title" className="edu-toc-title">
        In this guide
      </h2>
      <ol className="edu-toc-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => scrollTo(entry.id)}
              className={entry.level === 3 ? 'edu-toc-link edu-toc-link-h3' : 'edu-toc-link'}
            >
              {entry.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
