import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { parseBlogSlug, parseBlogSlugSafe } from '@/lib/parseBlogSlug'
import { loadBlogPillar } from '@/lib/loadBlogPillar'
import { isBlogPillarSlug } from '@/lib/blogPillarRegistry'
import { buildStateEventsGuideCopy, buildCityStartGuideCopy } from '@/lib/seo/blogProgrammaticCopy'
import {
  getBlogInternalLinks,
  getProgrammaticUpcomingEventStats,
} from '@/lib/blogInternalLinks'
import { getUnifiedEvents, getUpcomingUnified } from '@/lib/unifiedEvents'
import { buildBlogCatchAllStaticParams, blogRobotsMeta } from '@/lib/blogDiscoveryTier'
import { BASE_URL } from '@/lib/seo'
import BlogArticleJsonLd from '@/components/blog/BlogArticleJsonLd'
import BlogArticleLayout from '@/components/blog/BlogArticleLayout'
import { FaqStructuredData } from '@/components/StructuredData'
import { getBlogPillarFaqs } from '@/lib/blogPillarFaqs'

export const revalidate = 1800

/** Allow DB-only or future slugs — but all catalog geo guides are prelisted via buildBlogCatchAllStaticParams. */
export const dynamicParams = true

interface PageProps {
  params: { slug: string[] }
}

export async function generateStaticParams() {
  return buildBlogCatchAllStaticParams()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseBlogSlugSafe(params.slug)
  if (!parsed) {
    return { title: 'Not found', description: 'The requested page could not be found.' }
  }

  const path = `/blog/${params.slug.join('/')}`

  if (parsed.kind === 'pillar') {
    if (!isBlogPillarSlug(parsed.slug)) {
      return { title: 'Not found', description: 'Article not found.' }
    }
    const doc = loadBlogPillar(parsed.slug)
    if (!doc) {
      return { title: 'Not found', description: 'Article not found.' }
    }
    return {
      title: `${doc.title} | East Coast Kink Events`,
      description: doc.description,
      keywords: [doc.focusKeyword],
      alternates: { canonical: `${BASE_URL}${path}` },
      openGraph: {
        title: doc.title,
        description: doc.description,
        url: `${BASE_URL}${path}`,
        siteName: 'East Coast Kink Events',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: doc.title,
        description: doc.description,
      },
    }
  }

  if (parsed.kind === 'stateEventsGuide') {
    const copy = buildStateEventsGuideCopy(parsed.stateSlug)
    const desc = [copy.lead, ...copy.intro].join(' ').slice(0, 160)
    const robots = blogRobotsMeta(params.slug, 'stateEventsGuide')
    return {
      title: `${copy.h1} | East Coast Kink Events`,
      description: desc,
      robots,
      alternates: { canonical: `${BASE_URL}${path}` },
      openGraph: {
        title: copy.h1,
        description: desc,
        url: `${BASE_URL}${path}`,
        siteName: 'East Coast Kink Events',
        type: 'article',
      },
    }
  }

  const copy = buildCityStartGuideCopy(parsed.citySlug)
  const desc = [copy.lead, ...copy.intro].join(' ').slice(0, 160)
  const robots = blogRobotsMeta(params.slug, 'cityStartGuide')
  return {
    title: `${copy.h1} | East Coast Kink Events`,
    description: desc,
    robots,
    alternates: { canonical: `${BASE_URL}${path}` },
    openGraph: {
      title: copy.h1,
      description: desc,
      url: `${BASE_URL}${path}`,
      siteName: 'East Coast Kink Events',
      type: 'article',
    },
  }
}

export default async function BlogCatchAllPage({ params }: PageProps) {
  const parsed = parseBlogSlug(params.slug)
  if (!parsed) {
    notFound()
  }

  const path = `/blog/${params.slug.join('/')}`
  const merged = await getUnifiedEvents()
  const upcoming = getUpcomingUnified(merged)
  const links = await getBlogInternalLinks(parsed, merged)
  const programmaticStats = getProgrammaticUpcomingEventStats(parsed, upcoming)

  if (parsed.kind === 'pillar') {
    if (!isBlogPillarSlug(parsed.slug)) notFound()
    const doc = loadBlogPillar(parsed.slug)
    if (!doc) notFound()

    const jsonLdDesc = [doc.description, doc.bodyMarkdown.slice(0, 500)].join(' ').slice(0, 500)
    const pillarFaqs = getBlogPillarFaqs(parsed.slug)

    return (
      <div>
        <BlogArticleJsonLd
          urlPath={path}
          headline={doc.title}
          description={jsonLdDesc}
          datePublished={doc.datePublished}
          variant="blogPosting"
        />
        <FaqStructuredData
          faqs={pillarFaqs}
          id={`blog-pillar-faq-${parsed.slug}`}
        />
        <BlogArticleLayout
          variant="pillar"
          pillarSlug={parsed.slug}
          path={path}
          title={doc.title}
          lead={doc.description}
          bodyMarkdown={doc.bodyMarkdown}
          category={doc.category}
          links={links}
        />
      </div>
    )
  }

  if (parsed.kind === 'stateEventsGuide') {
    const sections = buildStateEventsGuideCopy(parsed.stateSlug)
    const flat = [sections.lead, ...sections.intro, ...sections.main, ...sections.practical, sections.cta].join(' ')
    return (
      <div>
        <BlogArticleJsonLd
          urlPath={path}
          headline={sections.h1}
          description={flat.slice(0, 500)}
          variant="webPage"
        />
        <BlogArticleLayout
          variant="programmatic"
          path={path}
          sections={sections}
          links={links}
          programmaticStats={programmaticStats}
        />
      </div>
    )
  }

  const sections = buildCityStartGuideCopy(parsed.citySlug)
  const flat = [sections.lead, ...sections.intro, ...sections.main, ...sections.practical, sections.cta].join(' ')
  return (
    <div>
      <BlogArticleJsonLd
        urlPath={path}
        headline={sections.h1}
        description={flat.slice(0, 500)}
        variant="webPage"
      />
      <BlogArticleLayout
        variant="programmatic"
        path={path}
        sections={sections}
        links={links}
        programmaticStats={programmaticStats}
      />
    </div>
  )
}
