'use client'

import { Suspense, useEffect, useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ArticleCard from '@/components/education/ArticleCard'
import ExternalResourceCard from '@/components/education/ExternalResourceCard'
import Breadcrumb from '@/components/Breadcrumb'
import { EXTERNAL_EDUCATION_RESOURCES } from '@/data/externalEducationResources'
import { getCategoryTabClass, sortEducationCategories } from '@/lib/educationCategoryColors'
import type { EducationArticle } from '@/lib/educationArticles'
import Link from 'next/link'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import HeroSponsorLayout from '@/components/HeroSponsorLayout'

type Props = {
  initialArticles: EducationArticle[]
}

function EducationIndexSuspenseFallback() {
  return (
    <div className="min-h-screen bg-black section-padding">
      <div className="container-custom flex min-h-[40vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none"
          aria-label="Loading"
        />
      </div>
    </div>
  )
}

function EducationPageInner({ initialArticles }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isRefreshing, startRefresh] = useTransition()

  const articles = initialArticles

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education', current: true },
  ]

  const categoriesInUse = useMemo(() => {
    const names: string[] = []
    for (const a of articles) {
      if (a.category?.trim()) names.push(a.category.trim())
    }
    for (const r of EXTERNAL_EDUCATION_RESOURCES) {
      if (r.category?.trim()) names.push(r.category.trim())
    }
    return sortEducationCategories(names)
  }, [articles])

  const selectedCategory = useMemo(() => {
    const raw = searchParams.get('category')?.trim()
    if (!raw || raw === 'all') return 'all'
    if (categoriesInUse.includes(raw)) return raw
    return 'all'
  }, [searchParams, categoriesInUse])

  useEffect(() => {
    const raw = searchParams.get('category')?.trim()
    if (!raw || raw === 'all') return
    if (!categoriesInUse.includes(raw)) {
      const p = new URLSearchParams(searchParams.toString())
      p.delete('category')
      const qs = p.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }
  }, [searchParams, categoriesInUse, pathname, router])

  const selectCategory = (cat: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (cat === 'all') p.delete('category')
    else p.set('category', cat)
    const qs = p.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const refreshArticles = () => {
    startRefresh(() => {
      router.refresh()
    })
  }

  const filteredArticles =
    selectedCategory === 'all' ? articles : articles.filter((a) => a.category === selectedCategory)

  const filteredExternal =
    selectedCategory === 'all'
      ? EXTERNAL_EDUCATION_RESOURCES
      : EXTERNAL_EDUCATION_RESOURCES.filter((r) => r.category === selectedCategory)

  const featuredArticles = filteredArticles.filter((a) => a.featured)
  const regularArticles = filteredArticles.filter((a) => !a.featured)

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return articles.length + EXTERNAL_EDUCATION_RESOURCES.length
    const internal = articles.filter((a) => a.category === categoryId).length
    const external = EXTERNAL_EDUCATION_RESOURCES.filter((r) => r.category === categoryId).length
    return internal + external
  }

  const featuredTotal = useMemo(() => articles.filter((a) => a.featured).length, [articles])
  const curatedTotal = EXTERNAL_EDUCATION_RESOURCES.length

  return (
    <div className="relative min-h-screen overflow-hidden bg-black section-padding">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-64 w-64 rounded-full bg-violet-600/60 blur-3xl" />
      </div>

      {isRefreshing ? (
        <div
          className="fixed inset-x-0 top-0 z-50 h-1 animate-pulse bg-primary-500 motion-reduce:animate-none"
          aria-hidden
        />
      ) : null}

      <div className="container-custom relative z-10">
        <Breadcrumb items={breadcrumbItems} />

        <HeroSponsorLayout contextLabel="Education">
          <header className="max-w-3xl">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">
              Library &amp; curated links
            </p>
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              BDSM &amp; kink{' '}
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent">
                education
              </span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-300 md:text-lg">
              Our articles plus trusted guides from across the community—short teasers here, full reads on the source
              site. Consent, safety, techniques, and more before you play. When you&apos;re ready to go out, pair reading
              with the{' '}
              <Link href="/calendar" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                calendar
              </Link>{' '}
              or{' '}
              <Link href="/states" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                state hubs
              </Link>
              .
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                <span className="font-semibold tabular-nums text-white">{articles.length}</span> on-site articles
              </div>
              <div className="rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm text-violet-100/90">
                <span className="font-semibold tabular-nums">{curatedTotal}</span> curated links
              </div>
              <div className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm text-amber-100/90">
                <span className="font-semibold tabular-nums">{featuredTotal}</span> featured
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                <span className="font-semibold tabular-nums text-white">{categoriesInUse.length}</span> topics
              </div>
              <button
                type="button"
                onClick={refreshArticles}
                disabled={isRefreshing}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 transition hover:border-white/25 hover:text-white disabled:opacity-50"
                aria-label="Refresh article list"
              >
                {isRefreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </header>
        </HeroSponsorLayout>

        <div className="mb-8 md:mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Filter by topic</p>
          <div
            className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:justify-start md:gap-3 md:overflow-visible md:px-0"
            role="toolbar"
            aria-label="Filter articles by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'all'}
              onClick={() => selectCategory('all')}
              className={`shrink-0 snap-start min-h-touch rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition ${
                selectedCategory === 'all'
                  ? 'border-white/30 bg-white/15 text-white shadow-lg'
                  : 'border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/25'
              }`}
            >
              All ({getCategoryCount('all')})
            </button>
            {categoriesInUse.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => selectCategory(cat)}
                className={getCategoryTabClass(cat, selectedCategory === cat)}
              >
                {cat} ({getCategoryCount(cat)})
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Tip: filtered views are shareable—copy the URL (e.g.{' '}
            <code className="text-gray-500">?category=Safety</code>).
          </p>
        </div>

        {featuredArticles.length > 0 && (
          <section className="mb-14 md:mb-16" aria-labelledby="featured-edu-heading">
            <div className="mb-6 border-b border-white/10 pb-3 md:flex md:items-end md:justify-between">
              <h2 id="featured-edu-heading" className="font-serif text-2xl font-semibold text-white">
                Featured
              </h2>
              <p className="mt-2 text-sm text-gray-500 md:mt-0">Editors&apos; picks and high-signal primers</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {regularArticles.length > 0 && (
          <section aria-labelledby="all-edu-heading">
            <div className="mb-6 border-b border-white/10 pb-3 md:flex md:items-end md:justify-between">
              <h2 id="all-edu-heading" className="font-serif text-2xl font-semibold text-white">
                {selectedCategory === 'all' ? 'From East Coast Kink Events' : `${selectedCategory} · our articles`}
              </h2>
              <p className="mt-2 text-sm text-gray-500 md:mt-0">Read in full on this site</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {filteredExternal.length > 0 && (
          <section className="mt-14 md:mt-16" aria-labelledby="curated-edu-heading">
            <div className="mb-6 border-b border-white/10 pb-3 md:flex md:items-end md:justify-between">
              <h2 id="curated-edu-heading" className="font-serif text-2xl font-semibold text-white">
                {selectedCategory === 'all' ? 'Recommended reading' : `${selectedCategory} · recommended reading`}
              </h2>
              <p className="mt-2 text-sm text-gray-500 md:mt-0">Curated off-site guides — opens in a new tab</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {filteredExternal.map((resource) => (
                <ExternalResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}

        {filteredArticles.length === 0 && filteredExternal.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-12 text-center md:py-16">
            <h3 className="font-serif text-xl font-semibold text-white">No articles here yet</h3>
            <p className="mx-auto mt-2 max-w-md text-gray-400">
              {selectedCategory === 'all'
                ? 'Nothing published at the moment—check back soon.'
                : `No published pieces in “${selectedCategory}” yet. Try All or another topic.`}
            </p>
            {selectedCategory !== 'all' ? (
              <button
                type="button"
                onClick={() => selectCategory('all')}
                className="btn-outline mt-6 inline-flex min-h-touch items-center justify-center px-6"
              >
                View all articles
              </button>
            ) : null}
            <button
              type="button"
              onClick={refreshArticles}
              disabled={isRefreshing}
              className="btn-primary mt-6 inline-flex min-h-touch items-center justify-center px-6 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing…' : 'Refresh list'}
            </button>
            <Link
              href="/contact"
              className="mt-4 inline-flex min-h-touch items-center justify-center text-sm text-primary-400 underline underline-offset-2"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
          </div>
        )}

        <section
          className="relative mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-primary-500/25 bg-gradient-to-br from-primary-950/50 via-black to-black p-8 text-center shadow-[0_0_40px_-12px_rgba(20,184,166,0.35)] sm:p-10"
          aria-labelledby="edu-cta"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at top, rgba(45,212,191,0.12), transparent 55%)' }}
            aria-hidden
          />
          <h3 id="edu-cta" className="relative font-serif text-xl font-bold text-white sm:text-2xl">
            Share your knowledge
          </h3>
          <p className="relative mx-auto mt-3 max-w-lg text-gray-300">
            Have something rigorous, kind, and useful for the community? Reach out about educational submissions.
          </p>
          <Link
            href="/contact"
            className="btn-primary relative mt-6 inline-flex min-h-touch items-center justify-center px-8"
            aria-label="Contact us"
          >
            {CONTACT_US_LABEL}
          </Link>
        </section>
      </div>
    </div>
  )
}

export default function EducationPageClient(props: Props) {
  return (
    <Suspense fallback={<EducationIndexSuspenseFallback />}>
      <EducationPageInner {...props} />
    </Suspense>
  )
}
