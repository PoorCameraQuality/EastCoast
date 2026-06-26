import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import EducationArticleBody from '@/components/education/EducationArticleBody'
import ArticleMasthead from '@/components/education/library/ArticleMasthead'
import ArticleKeyTakeaways from '@/components/education/library/ArticleKeyTakeaways'
import ArticleTableOfContents from '@/components/education/library/ArticleTableOfContents'
import ArticleAuthorPanel from '@/components/education/library/ArticleAuthorPanel'
import ArticleRelatedLearning from '@/components/education/library/ArticleRelatedLearning'
import EducationKinkSocialCta from '@/components/education/library/EducationKinkSocialCta'
import { BASE_URL } from '@/lib/seo'
import { resolveArticleOgImageUrl } from '@/lib/articleSeo'
import {
  fetchRelatedEducationSummaries,
  getPublishedEducationArticleBySlug,
  getPublishedEducationArticles,
  getPublishedEducationSlugs,
} from '@/lib/educationArticles'
import { ArticleStructuredData } from '@/components/ArticleStructuredData'
import { getArticleSerpOverride } from '@/lib/articleSerpOverrides'
import {
  attachLearningPath,
  articleToPublicItem,
  buildEducationIndex,
  relatedInLearningPath,
} from '@/lib/publicEducationIndex'
import {
  extractKeyTakeaways,
  extractTableOfContents,
  formatTags,
  injectHeadingIds,
} from '@/lib/educationVisual'
import { getLearningPathBySlug } from '@/lib/educationLearningPaths'
import EckeLink from '@/components/EckeLink'

const DEFAULT_OG = `${BASE_URL}/og-image.png`

interface ArticlePageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getPublishedEducationArticleBySlug(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    }
  }

  const serp = getArticleSerpOverride(article.slug)
  const title = serp?.seo_title || article.seo_title || article.title
  const description = serp?.meta_description || article.meta_description || article.excerpt
  const keywords =
    article.focus_keywords ||
    (article.tags
      ? Array.isArray(article.tags)
        ? article.tags
        : article.tags.split(',').map((tag: string) => tag.trim())
      : [])

  const ogImageUrl = resolveArticleOgImageUrl(article.og_image, article.content)
  const ogImageEntry =
    ogImageUrl === DEFAULT_OG
      ? { url: ogImageUrl, width: 1200, height: 630, alt: `${title} - East Coast Kink Events` }
      : { url: ogImageUrl, alt: `${title} - East Coast Kink Events` }

  return {
    title,
    description: description,
    keywords: keywords,
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      url: `${BASE_URL}/education/${article.slug}`,
      siteName: 'East Coast Kink Events',
      images: [ogImageEntry],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${BASE_URL}/education/${article.slug}`,
    },
  }
}

export const revalidate = 1800

export async function generateStaticParams() {
  const slugs = await getPublishedEducationSlugs()
  return slugs.slice(0, 50).map((slug) => ({ slug }))
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params

  try {
    const article = await getPublishedEducationArticleBySlug(slug)
    if (!article) {
      notFound()
    }

    const allArticles = await getPublishedEducationArticles()
    const libraryItems = buildEducationIndex(allArticles).filter((i) => i.lane === 'library')
    const publicItem = attachLearningPath(articleToPublicItem(article), libraryItems)

    const relatedArticles = await fetchRelatedEducationSummaries({
      id: article.id,
      category: article.category,
    })

    const serp = getArticleSerpOverride(article.slug)
    const heroTitle = serp?.h1 ?? article.title
    const heroLead = serp?.lead ?? article.excerpt

    const articleTags = formatTags(article.tags)
    const contentWarnings = Array.isArray(article.content_warnings)
      ? article.content_warnings.filter((warning) => warning.trim().length > 0)
      : []

    const takeaways = extractKeyTakeaways(article.content || '', heroLead)
    const toc = extractTableOfContents(article.content || '')
    const bodyContent = injectHeadingIds(article.content || '', toc)

    const pathNext = relatedInLearningPath(publicItem, libraryItems)
    const path = publicItem.learningPathSlug ? getLearningPathBySlug(publicItem.learningPathSlug) : undefined

    const moreByAuthor =
      publicItem.authorSlug
        ? libraryItems.filter(
            (a) => a.authorSlug === publicItem.authorSlug && a.slug !== publicItem.slug
          )
        : []

    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Education', href: '/education' },
      { label: article.title, href: `/education/${article.slug}`, current: true },
    ]

    return (
      <div className="edu-article-page">
        <ArticleStructuredData article={article} />

        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <EckeLink href="/education" className="text-sm text-violet-300 hover:text-violet-200">
              ← Back to library
            </EckeLink>
            {publicItem.lane === 'platform_update' ? (
              <span className="edu-topic-badge edu-topic-badge-platform">Platform update</span>
            ) : null}
          </div>

          <div className="edu-article-layout">
            <div className="edu-article-main">
              <ArticleMasthead item={publicItem} heroTitle={heroTitle} heroLead={heroLead} />

              {path ? (
                <p className="edu-path-banner">
                  Part of the learning path{' '}
                  <Link href={`/education?path=${path.slug}`}>{path.title}</Link>
                </p>
              ) : null}

              {contentWarnings.length > 0 && (
                <div className="edu-warnings" role="note" aria-label="Content warnings">
                  <p className="edu-warnings-title">Content warnings</p>
                  <ul className="edu-warnings-list">
                    {contentWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <ArticleKeyTakeaways items={takeaways} />
              <ArticleTableOfContents entries={toc} />

              {articleTags.length > 0 && (
                <div className="edu-card-tags mb-4">
                  {articleTags.map((tag) => (
                    <span key={tag} className="edu-card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="edu-article-body-wrap">
                <EducationArticleBody content={bodyContent} />
              </div>

              <div className="mt-8">
                <EducationKinkSocialCta compact />
              </div>

              <ArticleRelatedLearning
                item={publicItem}
                relatedArticles={relatedArticles}
                pathNext={pathNext}
                libraryItems={libraryItems}
              />
            </div>

            <aside className="edu-article-rail" aria-label="Article sidebar">
              <ArticleAuthorPanel
                item={publicItem}
                authorBio={article.author_bio}
                moreByAuthor={moreByAuthor}
              />
              {toc.length >= 3 ? (
                <nav className="edu-rail-card" aria-label="On this page">
                  <h3 className="edu-rail-title">On this page</h3>
                  <ol className="edu-toc-list mt-2">
                    {toc.slice(0, 8).map((entry) => (
                      <li key={entry.id}>
                        <a href={`#${entry.id}`} className="edu-toc-link">
                          {entry.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
              <div className="edu-rail-card">
                <h3 className="edu-rail-title">Keep exploring</h3>
                <p className="edu-rail-body">
                  Browse learning paths, curated resources, and educator profiles in the full library.
                </p>
                <EckeLink href="/education" className="edu-btn-read mt-3 inline-flex">
                  Education library
                </EckeLink>
              </div>
            </aside>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    notFound()
  }
}
