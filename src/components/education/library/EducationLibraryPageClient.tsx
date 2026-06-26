'use client'

import { Suspense, useEffect, useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import EducationLibraryHeader from '@/components/education/library/EducationLibraryHeader'
import LearningPathGrid from '@/components/education/library/LearningPathGrid'
import EducationTopicMap from '@/components/education/library/EducationTopicMap'
import FeaturedGuideCard from '@/components/education/library/FeaturedGuideCard'
import EducationResourceCard from '@/components/education/library/EducationResourceCard'
import EducatorPreviewSection from '@/components/education/library/EducatorPreviewSection'
import PlatformUpdateShelf from '@/components/education/library/PlatformUpdateShelf'
import EducationSponsorCard from '@/components/education/library/EducationSponsorCard'
import EducationKinkSocialCta from '@/components/education/library/EducationKinkSocialCta'
import { EXTERNAL_EDUCATION_RESOURCES } from '@/data/externalEducationResources'
import { LEARNING_PATHS, getLearningPathBySlug } from '@/lib/educationLearningPaths'
import {
  articlesForLearningPath,
  buildEducationIndex,
  buildEducatorPreviews,
  externalResourceToPublicItem,
  filterByTopic,
  pickFeaturedGuides,
  splitByLane,
  topicCounts,
} from '@/lib/publicEducationIndex'
import type { EducationArticle } from '@/lib/educationArticles'
import type { EducationTopic } from '@/types/publicEducationItem'
import { categoryToTopic } from '@/lib/educationVisual'

type Props = {
  initialArticles: EducationArticle[]
}

function EducationLibraryInner({ initialArticles }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isRefreshing, startRefresh] = useTransition()

  const allItems = useMemo(() => {
    const articleItems = buildEducationIndex(initialArticles)
    const resourceItems = EXTERNAL_EDUCATION_RESOURCES.map(externalResourceToPublicItem)
    return [...articleItems, ...resourceItems]
  }, [initialArticles])

  const { library, resources, platformUpdates } = useMemo(() => splitByLane(allItems), [allItems])

  const selectedTopic = useMemo((): EducationTopic | 'all' => {
    const topicRaw = searchParams.get('topic')?.trim()
    if (topicRaw && topicRaw !== 'all') {
      const valid = [
        'consent',
        'safety',
        'technique',
        'community',
        'resources',
        'identity',
        'aftercare',
        'mental_health',
        'legal',
        'beginner',
        'gear',
        'organizer',
        'presenter',
        'platform',
      ] as const
      if ((valid as readonly string[]).includes(topicRaw)) return topicRaw as EducationTopic
    }

    const legacyCategory = searchParams.get('category')?.trim()
    if (legacyCategory && legacyCategory !== 'all') {
      return categoryToTopic(legacyCategory)
    }

    return 'all'
  }, [searchParams])

  const selectedPathSlug = searchParams.get('path')?.trim() ?? null
  const selectedPath = selectedPathSlug ? getLearningPathBySlug(selectedPathSlug) : undefined

  const topicFilteredLibrary = useMemo(
    () => filterByTopic(library, selectedTopic),
    [library, selectedTopic]
  )

  const pathFilteredLibrary = useMemo(() => {
    if (!selectedPath) return topicFilteredLibrary
    return articlesForLearningPath(selectedPath, topicFilteredLibrary)
  }, [selectedPath, topicFilteredLibrary])

  const featured = useMemo(() => {
    if (selectedPath || selectedTopic !== 'all') return []
    return pickFeaturedGuides(library, 6)
  }, [library, selectedPath, selectedTopic])

  const articleGrid = useMemo(() => {
    const featuredSlugs = new Set(featured.map((f) => f.slug))
    return pathFilteredLibrary.filter((item) => !featuredSlugs.has(item.slug))
  }, [pathFilteredLibrary, featured])

  const filteredResources = useMemo(
    () => filterByTopic(resources, selectedTopic),
    [resources, selectedTopic]
  )

  const educators = useMemo(() => buildEducatorPreviews(library), [library])
  const counts = useMemo(() => topicCounts(library), [library])

  const selectTopic = (topic: EducationTopic | 'all') => {
    const p = new URLSearchParams(searchParams.toString())
    p.delete('category')
    if (topic === 'all') p.delete('topic')
    else p.set('topic', topic)
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const clearPath = () => {
    const p = new URLSearchParams(searchParams.toString())
    p.delete('path')
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  useEffect(() => {
    if (!selectedPathSlug) return
    if (!selectedPath) {
      const p = new URLSearchParams(searchParams.toString())
      p.delete('path')
      const qs = p.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }
  }, [selectedPathSlug, selectedPath, searchParams, pathname, router])

  const refreshArticles = () => {
    startRefresh(() => router.refresh())
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education', current: true },
  ]

  return (
    <div className="edu-page">
      {isRefreshing ? (
        <div
          className="fixed inset-x-0 top-0 z-50 h-1 animate-pulse bg-violet-500 motion-reduce:animate-none"
          aria-hidden
        />
      ) : null}

      <div className="container-custom">
        <Breadcrumb items={breadcrumbItems} />

        <EducationLibraryHeader
          libraryCount={library.length}
          resourceCount={resources.length}
          pathCount={LEARNING_PATHS.length}
          educatorCount={educators.length}
        />

        <div className="edu-layout">
          <div className="edu-main">
            {!selectedPath && selectedTopic === 'all' ? <LearningPathGrid libraryItems={library} /> : null}

            {selectedPath ? (
              <section className="edu-section" aria-labelledby="edu-path-view">
                <div className="edu-section-head">
                  <h2 id="edu-path-view" className="edu-section-title">
                    {selectedPath.title}
                  </h2>
                  <button type="button" onClick={clearPath} className="edu-btn-read">
                    All paths
                  </button>
                </div>
                <p className="edu-subhead">{selectedPath.promise}</p>
              </section>
            ) : null}

            {featured.length > 0 ? (
              <section className="edu-section" aria-labelledby="edu-featured">
                <div className="edu-section-head">
                  <h2 id="edu-featured" className="edu-section-title">
                    Featured guides
                  </h2>
                  <p className="edu-section-note">High-signal primers and editor picks</p>
                </div>
                <div className="edu-guide-grid">
                  {featured.map((item) => (
                    <FeaturedGuideCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ) : null}

            <EducationTopicMap selectedTopic={selectedTopic} counts={counts} onSelect={selectTopic} />

            {!selectedPath ? <EducatorPreviewSection educators={educators} /> : null}

            <section className="edu-section" aria-labelledby="edu-articles">
              <div className="edu-section-head">
                <h2 id="edu-articles" className="edu-section-title">
                  {selectedPath ? `${selectedPath.title} · guides` : 'Articles and guides'}
                </h2>
                <button
                  type="button"
                  onClick={refreshArticles}
                  disabled={isRefreshing}
                  className="edu-btn-read disabled:opacity-50"
                >
                  {isRefreshing ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
              {articleGrid.length > 0 ? (
                <div className="edu-guide-grid edu-guide-grid-compact">
                  {articleGrid.map((item) => (
                    <FeaturedGuideCard key={item.id} item={item} compact />
                  ))}
                </div>
              ) : (
                <div className="edu-empty">
                  <p className="edu-empty-title">No guides match this view</p>
                  <p className="edu-empty-body">Try another topic or learning path.</p>
                </div>
              )}
            </section>

            {filteredResources.length > 0 ? (
              <section className="edu-section" aria-labelledby="edu-resources">
                <div className="edu-section-head">
                  <h2 id="edu-resources" className="edu-section-title">
                    Curated resources
                  </h2>
                  <p className="edu-section-note">Trusted external links — opens in a new tab</p>
                </div>
                <div className="edu-guide-grid edu-guide-grid-compact">
                  {filteredResources.map((item) => (
                    <EducationResourceCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ) : null}

            {!selectedPath && selectedTopic === 'all' ? (
              <PlatformUpdateShelf items={platformUpdates} />
            ) : null}

            <div className="edu-section">
              <EducationKinkSocialCta />
            </div>

            <div className="edu-mobile-sponsor">
              <EducationSponsorCard />
            </div>
          </div>

          <aside className="edu-rail" aria-label="Education sidebar">
            <div className="edu-rail-card">
              <h3 className="edu-rail-title">Library at a glance</h3>
              <p className="edu-rail-stat">
                <strong>{library.length}</strong> on-site guides
              </p>
              <p className="edu-rail-stat">
                <strong>{resources.length}</strong> curated links
              </p>
              <p className="edu-rail-body">
                Platform updates and tooling notes are kept separate from core education content.
              </p>
            </div>
            <EducationKinkSocialCta compact />
            <EducationSponsorCard />
          </aside>
        </div>
      </div>
    </div>
  )
}

function EducationLibraryFallback() {
  return (
    <div className="edu-page">
      <div className="container-custom flex min-h-[40vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent motion-reduce:animate-none"
          aria-label="Loading"
        />
      </div>
    </div>
  )
}

export default function EducationLibraryPageClient(props: Props) {
  return (
    <Suspense fallback={<EducationLibraryFallback />}>
      <EducationLibraryInner {...props} />
    </Suspense>
  )
}
