'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/education/ArticleCard'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import SupportCTAInline from '@/components/SupportCTAInline'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  author_name: string
  author_credentials?: string
  author_bio?: string
  category: string
  tags?: string | string[]
  featured: boolean
  status: string
  publish_date: string
  read_time?: string
  slug?: string
}

/** Preferred tab order; any other category from CMS is appended alphabetically. */
const CATEGORY_ORDER = [
  'Safety',
  'Consent',
  'Techniques',
  'Community',
  'Resources',
  'Education',
  'Identity',
  'Aftercare',
  'Mental Health',
  'Legal',
]

function categoryTabClass(category: string, selected: boolean): string {
  const base =
    'shrink-0 snap-start min-h-touch rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition duration-200'
  const palettes: Record<string, { on: string; off: string }> = {
    Safety: {
      on: 'border-red-400 bg-red-600/90 text-white shadow-md shadow-red-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-red-500/40',
    },
    Consent: {
      on: 'border-amber-300 bg-amber-500 text-black shadow-md shadow-amber-900/20',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-amber-400/40',
    },
    Techniques: {
      on: 'border-primary-400 bg-primary-600 text-white shadow-md shadow-primary-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-primary-500/40',
    },
    Community: {
      on: 'border-emerald-400 bg-emerald-700 text-white shadow-md shadow-emerald-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-emerald-500/40',
    },
    Resources: {
      on: 'border-violet-400 bg-violet-700 text-white shadow-md shadow-violet-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-violet-500/40',
    },
    Education: {
      on: 'border-sky-400 bg-sky-800 text-white shadow-md shadow-sky-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-sky-500/40',
    },
    Identity: {
      on: 'border-fuchsia-400 bg-fuchsia-900/80 text-white shadow-md shadow-fuchsia-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-fuchsia-500/40',
    },
    Aftercare: {
      on: 'border-rose-400 bg-rose-900/70 text-white shadow-md shadow-rose-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-rose-500/40',
    },
    'Mental Health': {
      on: 'border-cyan-400 bg-cyan-900/70 text-white shadow-md shadow-cyan-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-cyan-500/40',
    },
    Legal: {
      on: 'border-slate-300 bg-slate-700 text-white shadow-md shadow-slate-900/30',
      off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-slate-400/40',
    },
  }
  const p = palettes[category] ?? {
    on: 'border-primary-400 bg-primary-700 text-white shadow-md shadow-primary-900/20',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-primary-500/35',
  }
  return `${base} ${selected ? p.on : p.off}`
}

type Props = {
  initialArticles: Article[]
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

  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education', current: true },
  ]

  const categoriesInUse = useMemo(() => {
    const set = new Set<string>()
    for (const a of articles) {
      if (a.category?.trim()) set.add(a.category.trim())
    }
    const preferred = CATEGORY_ORDER.filter((c) => set.has(c))
    const rest = [...set].filter((c) => !CATEGORY_ORDER.includes(c)).sort((a, b) => a.localeCompare(b))
    return [...preferred, ...rest]
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

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      const client = supabase
      if (!client) {
        throw new Error('Supabase client not configured')
      }

      const { data: articlesData, error: articlesError } = await client
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('publish_date', { ascending: false })

      if (articlesError) {
        throw articlesError
      }

      setArticles(articlesData || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError('Unable to load articles at this time.')
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles =
    selectedCategory === 'all' ? articles : articles.filter((a) => a.category === selectedCategory)

  const featuredArticles = filteredArticles.filter((a) => a.featured)
  const regularArticles = filteredArticles.filter((a) => !a.featured)

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return articles.length
    return articles.filter((a) => a.category === categoryId).length
  }

  const featuredTotal = useMemo(() => articles.filter((a) => a.featured).length, [articles])

  if (loading) {
    return (
      <div className="min-h-screen bg-black section-padding">
        <div className="container-custom flex min-h-[50vh] items-center justify-center">
          <div
            className="h-12 w-12 animate-spin rounded-full border-2 border-primary-500 border-t-transparent motion-reduce:animate-none"
            aria-label="Loading"
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black section-padding">
        <div className="container-custom py-12 text-center">
          <h1 className="font-serif text-2xl font-bold text-white">Couldn&apos;t load articles</h1>
          <p className="mt-2 text-gray-400">{error}</p>
          <button
            type="button"
            onClick={fetchArticles}
            className="btn-primary mt-6 inline-flex min-h-touch items-center justify-center px-6 py-2.5"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black section-padding">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute left-0 top-10 h-72 w-72 rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-64 w-64 rounded-full bg-violet-600/60 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <Breadcrumb items={breadcrumbItems} />
        <SupportCTAInline contextLabel="Education" />

        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-950/40 via-black to-black p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-serif text-lg font-semibold text-white">Guides &amp; funnel articles</h2>
            <p className="mt-1 max-w-xl text-sm text-gray-400">
              Pillar posts and regional hubs that connect reading to real{' '}
              <Link href="/events" className="text-primary-400 underline underline-offset-2">
                events
              </Link>
              ,{' '}
              <Link href="/vendors" className="text-primary-400 underline underline-offset-2">
                vendors
              </Link>
              , and{' '}
              <Link href="/dungeons" className="text-primary-400 underline underline-offset-2">
                dungeons
              </Link>
              .
            </p>
          </div>
          <Link
            href="/blog"
            className="btn-primary inline-flex min-h-touch shrink-0 items-center justify-center px-5 py-2.5"
          >
            Open blog guides
          </Link>
        </div>

        <header className="mx-auto mb-10 max-w-3xl md:mb-12">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">Library</p>
          <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            BDSM &amp; kink{' '}
            <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent">
              education
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-300 md:text-lg">
            Consent, safety, techniques, and community—articles you can use before you play. When you&apos;re ready
            to go out, pair reading with the{' '}
            <Link href="/calendar" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
              calendar
            </Link>{' '}
            or{' '}
            <Link href="/states" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
              state hubs
            </Link>
            .
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
              <span className="font-semibold tabular-nums text-white">{articles.length}</span> articles
            </div>
            <div className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm text-amber-100/90">
              <span className="font-semibold tabular-nums">{featuredTotal}</span> featured
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
              <span className="font-semibold tabular-nums text-white">{categoriesInUse.length}</span> topics
            </div>
          </div>
        </header>

        <div className="mb-10 md:mb-12">
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
                className={categoryTabClass(cat, selectedCategory === cat)}
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
            <div className="mb-6 border-b border-white/10 pb-3">
              <h2 id="all-edu-heading" className="font-serif text-2xl font-semibold text-white">
                {selectedCategory === 'all' ? 'All articles' : `${selectedCategory} · articles`}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {filteredArticles.length === 0 && (
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
