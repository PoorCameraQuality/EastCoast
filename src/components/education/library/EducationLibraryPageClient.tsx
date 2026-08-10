'use client'

import { Suspense, useEffect, useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import EducationLibraryHeader, {
  type EducationContentView,
} from '@/components/education/library/EducationLibraryHeader'
import LearningPathGrid from '@/components/education/library/LearningPathGrid'
import EducationTopicMap from '@/components/education/library/EducationTopicMap'
import FeaturedGuideCard from '@/components/education/library/FeaturedGuideCard'
import EducationResourceCard from '@/components/education/library/EducationResourceCard'
import EducatorPreviewSection from '@/components/education/library/EducatorPreviewSection'
import PlatformUpdateShelf from '@/components/education/library/PlatformUpdateShelf'
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
import type { EducationLevel, EducationTopic, PublicEducationItem } from '@/types/publicEducationItem'
import { categoryToTopic } from '@/lib/educationVisual'

type Props = {
  initialArticles: EducationArticle[]
}

type LevelFilter = '' | 'beginner' | 'intermediate' | 'advanced'

const CONTENT_VIEWS: { id: EducationContentView; label: string }[] = [
  { id: 'all', label: 'All content' },
  { id: 'guides', label: 'Guides' },
  { id: 'links', label: 'Curated links' },
  { id: 'paths', label: 'Learning paths' },
  { id: 'educators', label: 'Educators' },
]

const LEVEL_OPTIONS: { id: LevelFilter; label: string }[] = [
  { id: '', label: 'Any level' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
]

function matchesEducationSearch(item: PublicEducationItem, query: string): boolean {
  if (!query) return true
  if (item.title.toLowerCase().includes(query)) return true
  if (item.summary?.toLowerCase().includes(query)) return true
  if (item.tags?.some((tag) => tag.toLowerCase().includes(query))) return true
  if (item.authorName?.toLowerCase().includes(query)) return true
  return false
}

function matchesLevel(item: PublicEducationItem, level: LevelFilter): boolean {
  if (!level) return true
  if (!item.level || item.level === 'all_levels') return true
  return item.level === (level as EducationLevel)
}

function EducationLibraryInner({ initialArticles }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isRefreshing, startRefresh] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [contentView, setContentView] = useState<EducationContentView>('all')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('')
  const [showAllLinks, setShowAllLinks] = useState(false)

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

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const topicFilteredLibrary = useMemo(
    () => filterByTopic(library, selectedTopic),
    [library, selectedTopic]
  )

  const pathFilteredLibrary = useMemo(() => {
    if (!selectedPath) return topicFilteredLibrary
    return articlesForLearningPath(selectedPath, topicFilteredLibrary)
  }, [selectedPath, topicFilteredLibrary])

  const searchableLibrary = useMemo(() => {
    return pathFilteredLibrary
      .filter((item) => matchesEducationSearch(item, normalizedQuery))
      .filter((item) => matchesLevel(item, levelFilter))
  }, [pathFilteredLibrary, normalizedQuery, levelFilter])

  const featured = useMemo(() => {
    if (
      selectedPath ||
      selectedTopic !== 'all' ||
      contentView !== 'all' ||
      normalizedQuery ||
      levelFilter
    ) {
      return []
    }
    return pickFeaturedGuides(library, 6)
  }, [library, selectedPath, selectedTopic, contentView, normalizedQuery, levelFilter])

  const articleGrid = useMemo(() => {
    const featuredSlugs = new Set(featured.map((item) => item.slug))
    return searchableLibrary.filter((item) => !featuredSlugs.has(item.slug))
  }, [searchableLibrary, featured])

  const filteredResources = useMemo(() => {
    return filterByTopic(resources, selectedTopic)
      .filter((item) => matchesEducationSearch(item, normalizedQuery))
      .filter((item) => matchesLevel(item, levelFilter))
  }, [resources, selectedTopic, normalizedQuery, levelFilter])

  const visibleResources = showAllLinks ? filteredResources : filteredResources.slice(0, 20)

  const educators = useMemo(() => buildEducatorPreviews(library), [library])
  const counts = useMemo(() => topicCounts(library), [library])

  const selectTopic = (topic: EducationTopic | 'all') => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    if (topic === 'all') params.delete('topic')
    else params.set('topic', topic)
    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  const clearPath = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('path')
    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  const selectContentView = (view: EducationContentView) => {
    setContentView(view)
    setShowAllLinks(false)
    if (view === 'paths' && selectedPathSlug) clearPath()
  }

  useEffect(() => {
    if (!selectedPathSlug) return
    if (!selectedPath) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('path')
      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    }
  }, [selectedPathSlug, selectedPath, searchParams, pathname, router])

  const refreshArticles = () => {
    startRefresh(() => router.refresh())
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education', current: true },
  ]

  const showPaths =
    (contentView === 'all' || contentView === 'paths') && !selectedPath && selectedTopic === 'all'
  const showFeatured = contentView === 'all' && featured.length > 0
  const showGuides = contentView === 'all' || contentView === 'guides'
  const showLinks = contentView === 'all' || contentView === 'links'
  const showEducators = contentView === 'all' || contentView === 'educators'
  const showTopics = contentView === 'all' || contentView === 'guides'
  const showPlatform =
    contentView === 'all' && !selectedPath && selectedTopic === 'all' && !normalizedQuery

  const resultCountLabel = (() => {
    if (contentView === 'links') {
      const count = filteredResources.length
      return `Showing ${count} link${count === 1 ? '' : 's'}${
        normalizedQuery ? ` for “${searchQuery.trim()}”` : ''
      }`
    }
    if (contentView === 'paths') {
      return `Showing ${LEARNING_PATHS.length} learning paths`
    }
    if (contentView === 'educators') {
      return `Showing ${educators.length} educator${educators.length === 1 ? '' : 's'}`
    }
    const count = searchableLibrary.length
    return `Showing ${count} guide${count === 1 ? '' : 's'}${
      normalizedQuery ? ` for “${searchQuery.trim()}”` : ''
    }${levelFilter ? ` · ${levelFilter}` : ''}`
  })()

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
          activeView={contentView}
          onSelectView={selectContentView}
        />

        <div className="edu-filter-controls">
          <label className="sr-only" htmlFor="education-list-search">
            Search education content
          </label>
          <input
            id="education-list-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search guides by topic (e.g., 'rope', 'consent', 'impact')…"
            className="edu-list-search-input"
            aria-label="Search education content"
          />

          <div className="edu-content-tabs hidden md:flex" role="toolbar" aria-label="Content type">
            {CONTENT_VIEWS.map((view) => {
              const isActive = contentView === view.id
              return (
                <button
                  key={view.id}
                  type="button"
                  className={isActive ? 'edu-content-tab edu-content-tab-active' : 'edu-content-tab'}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => selectContentView(view.id)}
                >
                  {view.label}
                  {view.id === 'guides' ? (
                    <span className="edu-content-count">{library.length}</span>
                  ) : null}
                  {view.id === 'links' ? (
                    <span className="edu-content-count">{resources.length}</span>
                  ) : null}
                  {view.id === 'paths' ? (
                    <span className="edu-content-count">{LEARNING_PATHS.length}</span>
                  ) : null}
                  {view.id === 'educators' && educators.length > 0 ? (
                    <span className="edu-content-count">{educators.length}</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="md:hidden">
            <label className="sr-only" htmlFor="education-content-select">
              Filter by content type
            </label>
            <select
              id="education-content-select"
              className="edu-filter-select"
              value={contentView}
              onChange={(event) => selectContentView(event.target.value as EducationContentView)}
            >
              {CONTENT_VIEWS.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.label}
                </option>
              ))}
            </select>
          </div>

          {(contentView === 'all' || contentView === 'guides') && (
            <div className="edu-level-rail" role="toolbar" aria-label="Filter by level">
              {LEVEL_OPTIONS.map((option) => {
                const isActive = levelFilter === option.id
                return (
                  <button
                    key={option.id || 'any'}
                    type="button"
                    className={isActive ? 'edu-level-chip edu-level-chip-active' : 'edu-level-chip'}
                    onClick={() => setLevelFilter(option.id)}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}

          <p className="edu-result-count" aria-live="polite">
            {resultCountLabel}
          </p>
        </div>

        <div className="edu-layout edu-layout-full">
          <div className="edu-main">
            {showPaths ? <LearningPathGrid libraryItems={library} /> : null}

            {selectedPath ? (
              <section className="edu-section" aria-labelledby="edu-path-view">
                <div className="edu-section-head">
                  <h2 id="edu-path-view" className="edu-section-title">
                    {selectedPath.title}
                  </h2>
                  <button type="button" onClick={clearPath} className="edu-btn-read min-h-11">
                    All paths
                  </button>
                </div>
                <p className="edu-subhead">{selectedPath.promise}</p>
              </section>
            ) : null}

            {showFeatured ? (
              <section className="edu-section" aria-labelledby="edu-featured">
                <div className="edu-section-head">
                  <h2 id="edu-featured" className="edu-section-title">
                    Featured guides
                  </h2>
                  <button
                    type="button"
                    className="edu-btn-read min-h-11"
                    onClick={() => selectContentView('guides')}
                  >
                    View all guides →
                  </button>
                </div>
                <p className="edu-section-note">High-signal primers and editor picks</p>
                <div className="edu-guide-grid">
                  {featured.map((item) => (
                    <FeaturedGuideCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ) : null}

            {showTopics ? (
              <EducationTopicMap selectedTopic={selectedTopic} counts={counts} onSelect={selectTopic} />
            ) : null}

            {showEducators && !selectedPath ? (
              <div id="educators">
                <EducatorPreviewSection educators={educators} />
              </div>
            ) : null}

            {showGuides ? (
              <section className="edu-section" aria-labelledby="edu-articles">
                <div className="edu-section-head">
                  <h2 id="edu-articles" className="edu-section-title">
                    {selectedPath
                      ? `${selectedPath.title} · guides`
                      : contentView === 'guides'
                        ? 'All guides'
                        : 'Articles and guides'}
                  </h2>
                  <button
                    type="button"
                    onClick={refreshArticles}
                    disabled={isRefreshing}
                    className="edu-btn-read min-h-11 disabled:opacity-50"
                  >
                    {isRefreshing ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
                {articleGrid.length > 0 || featured.length > 0 ? (
                  <div className="edu-guide-grid edu-guide-grid-compact">
                    {(contentView === 'guides' ? searchableLibrary : articleGrid).map((item) => (
                      <FeaturedGuideCard key={item.id} item={item} compact />
                    ))}
                  </div>
                ) : (
                  <div className="edu-empty">
                    <p className="edu-empty-title">No guides match this view</p>
                    <p className="edu-empty-body">Try another topic, level, or search term.</p>
                  </div>
                )}
              </section>
            ) : null}

            {showLinks && filteredResources.length > 0 ? (
              <section className="edu-section" aria-labelledby="edu-resources">
                <div className="edu-section-head">
                  <h2 id="edu-resources" className="edu-section-title">
                    Curated resources
                  </h2>
                  <p className="edu-section-note">Trusted external links — opens in a new tab</p>
                </div>
                <div className="edu-guide-grid edu-guide-grid-compact">
                  {visibleResources.map((item) => (
                    <EducationResourceCard key={item.id} item={item} />
                  ))}
                </div>
                {filteredResources.length > 20 ? (
                  <button
                    type="button"
                    className="edu-expand-links min-h-11"
                    onClick={() => setShowAllLinks((open) => !open)}
                  >
                    {showAllLinks
                      ? 'Show fewer links'
                      : `View all ${filteredResources.length} curated links →`}
                  </button>
                ) : null}
              </section>
            ) : null}

            {showPlatform ? <PlatformUpdateShelf items={platformUpdates} /> : null}
          </div>
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
