import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedArticlesSection from '@/components/education/RelatedArticlesSection'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import Markdown from '@/components/Markdown'
import { normalizeMarkdown } from '@/lib/normalizeMarkdown'
import { BASE_URL } from '@/lib/seo'
import { resolveArticleOgImageUrl } from '@/lib/articleSeo'
import {
  fetchRelatedEducationSummaries,
  getPublishedEducationArticleBySlug,
  getPublishedEducationSlugs,
  type EducationArticle,
} from '@/lib/educationArticles'
import { ArticleStructuredData } from '@/components/ArticleStructuredData'
import KinkSocialSourceCta from '@/components/kinkSocial/KinkSocialSourceCta'
import { getArticleSerpOverride } from '@/lib/articleSerpOverrides'
import { getCategoryColorClass } from '@/lib/educationCategoryColors'
import { isKinkSocialSourcedArticle } from '@/lib/kinkSocialIngestValidation'

const DEFAULT_OG = `${BASE_URL}/og-image.png`

interface ArticlePageProps {
  params: { slug: string }
}

type Article = EducationArticle

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

// Enable ISR - regenerate every 30 minutes
export const revalidate = 1800

// Generate static params for published articles
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

    const relatedArticles = await fetchRelatedEducationSummaries({
      id: article.id,
      category: article.category,
    })

    const serp = getArticleSerpOverride(article.slug)
    const heroTitle = serp?.h1 ?? article.title
    const heroLead = serp?.lead ?? article.excerpt

    // Handle tags formatting
    const formatTags = (tags?: string | string[]) => {
      if (!tags) return []
      if (Array.isArray(tags)) return tags
      if (typeof tags === 'string') {
        return tags.split(',').map((tag) => tag.trim()).filter((tag) => tag)
      }
      return []
    }

    const articleTags = formatTags(article.tags)
    const contentWarnings = Array.isArray(article.content_warnings)
      ? article.content_warnings.filter((warning) => warning.trim().length > 0)
      : []
    const showKinkSocialCta = isKinkSocialSourcedArticle(article)

    // Process content for markdown rendering
    const processedContent = normalizeMarkdown(article.content || '')

    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Education', href: '/education' },
      { label: article.title, href: `/education/${article.slug}`, current: true },
    ]

    return (
      <div className="min-h-screen bg-black">
        <ArticleStructuredData article={article} />

        <div className="container-custom py-8 md:py-16">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mb-10 md:mb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <Link
                href="/education"
                className="inline-flex min-h-touch items-center text-primary-400 hover:text-primary-300 transition-colors order-2 sm:order-1"
              >
                ← Back to Education
              </Link>
              <span
                className={`inline-flex min-h-touch items-center text-white text-sm font-medium px-4 py-2 rounded-full ${getCategoryColorClass(article.category)} shadow-lg order-1 sm:order-2 self-start`}
              >
                {article.category}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 order-1 lg:order-none">
                <div className="card-elegant px-4 sm:px-6 lg:px-8">
                  <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      {article.featured && (
                        <span className="inline-flex min-h-touch items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg animate-pulse motion-reduce:animate-none">
                          <span aria-hidden>⭐ </span>Featured Article
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                      {heroTitle}
                    </h1>

                    <p className="text-lg md:text-xl text-subtle leading-relaxed mb-6">{heroLead}</p>

                    {articleTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {articleTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex min-h-touch items-center px-3 py-1 rounded-full text-sm bg-dark-700 text-gray-300 border border-dark-600 hover:border-primary-500 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </header>

                  {contentWarnings.length > 0 && (
                    <div
                      role="note"
                      className="mb-6 rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3"
                      aria-label="Content warnings"
                    >
                      <p className="text-sm font-semibold text-amber-200">Content warnings</p>
                      <ul className="mt-2 list-disc pl-5 text-sm text-amber-100/90 space-y-1">
                        {contentWarnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <section className="mt-8">
                    <Markdown content={processedContent} />
                  </section>

                  {showKinkSocialCta ? (
                    <KinkSocialSourceCta canonicalUrl={article.kink_social_canonical_url} />
                  ) : null}
                </div>
              </div>

              <div className="lg:col-span-1 order-2 lg:order-none">
                <div className="card-elegant lg:sticky lg:top-8 p-4 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-serif font-semibold text-white mb-4">About the Author</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-12 h-12 shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center"
                        aria-hidden
                      >
                        <span className="text-white font-bold text-lg">
                          {article.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-white">{article.author_name}</div>
                        {article.author_credentials && (
                          <div className="text-sm text-gray-400">{article.author_credentials}</div>
                        )}
                      </div>
                    </div>
                    {article.author_bio && (
                      <p className="text-subtle text-sm leading-relaxed">{article.author_bio}</p>
                    )}
                  </div>

                  <div className="mt-8 border-t border-dark-600 pt-6 space-y-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium text-white">Category:</span>
                      <p>{article.category}</p>
                    </div>
                    {article.read_time && (
                      <div>
                        <span className="font-medium text-white">Read Time:</span>
                        <p>{article.read_time}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-white">Published:</span>
                      <p>
                        {new Date(article.publish_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RelatedArticlesSection articles={relatedArticles} />

          <div className="mt-16">
            <div className="card-elegant text-center">
              <h2 className="text-2xl font-serif font-semibold text-white mb-4">Explore More Articles</h2>
              <p className="text-lg text-subtle mb-6 max-w-2xl mx-auto">
                Discover more educational content, safety guidelines, and community resources. Learn from experts and
                share your knowledge with the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/education" className="btn-primary min-h-touch inline-flex items-center justify-center">
                  Browse All Articles
                </Link>
                <Link
                  href="/contact"
                  className="btn-outline min-h-touch inline-flex items-center justify-center"
                  aria-label="Contact us"
                >
                  {CONTACT_US_LABEL}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    notFound()
  }
}
