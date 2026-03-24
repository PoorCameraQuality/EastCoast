import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedArticlesSection from '@/components/education/RelatedArticlesSection'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import Markdown from '@/components/Markdown'
import { normalizeMarkdown } from '@/lib/normalizeMarkdown'
import { BASE_URL } from '@/lib/seo'
import { countWordsFromArticleContent, resolveArticleOgImageUrl } from '@/lib/articleSeo'
import { fetchRelatedArticleSummaries } from '@/lib/articleRelated'

const DEFAULT_OG = `${BASE_URL}/og-image.png`

// Article JSON-LD structured data
function ArticleStructuredData({ article }: { article: Article }) {
  const imageUrl = resolveArticleOgImageUrl(article.og_image, article.content)
  const wordCount = countWordsFromArticleContent(article.content)
  const dateModified = article.last_updated || article.publish_date

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publish_date,
    dateModified,
    publisher: {
      '@type': 'Organization',
      name: 'East Coast Kink Events',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/education/${article.slug}`,
    },
    url: `${BASE_URL}/education/${article.slug}`,
    image: imageUrl,
    articleSection: article.category,
    wordCount,
  }

  const rawKw = article.focus_keywords || article.tags
  const normalizedKw = Array.isArray(rawKw)
    ? rawKw
    : typeof rawKw === 'string'
      ? rawKw.split(',').map((s) => s.trim()).filter(Boolean)
      : []
  if (normalizedKw.length) {
    structuredData.keywords = normalizedKw
  }

  if (article.author_name?.trim()) {
    structuredData.author = {
      '@type': 'Person',
      name: article.author_name.trim(),
      ...(article.author_bio?.trim() ? { description: article.author_bio.trim() } : {}),
    }
  }

  try {
    const jsonString = JSON.stringify(structuredData).replace(/</g, '\\u003c')
    return (
      <script
        id={`article-structured-data-${article.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in ArticleStructuredData:', error)
    return null
  }
}

interface ArticlePageProps {
  params: { slug: string }
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author_name: string
  author_credentials?: string
  author_bio?: string
  category: string
  tags?: string[] | string
  featured: boolean
  status: string
  publish_date: string
  last_updated?: string
  read_time?: string
  seo_title?: string
  meta_description?: string
  focus_keywords?: string[] | string
  og_image?: string | null
}

async function getArticleBySlug(slug: string) {
  try {
    const client = supabase
    if (!client) {
      console.error('Supabase is not configured')
      return null
    }

    const { data: article, error } = await client
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      console.error('Error fetching article:', error)
      return null
    }

    return article
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found | East Coast Kink Events',
      description: 'The requested article could not be found.',
    }
  }

  const title = article.seo_title || article.title
  const description = article.meta_description || article.excerpt
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
    title: `${title} | East Coast Kink Events`,
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
  try {
    if (!supabase) return []

    const { data: articles } = await supabase
      .from('articles')
      .select('slug')
      .eq('status', 'published')
      .limit(50) // Generate top 50 articles at build time

    return (
      articles?.map((article) => ({
        slug: article.slug,
      })) || []
    )
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params

  try {
    const client = supabase
    if (!client) {
      throw new Error('Supabase client not configured')
    }

    const { data: article, error } = await client
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      notFound()
    }

    const relatedArticles = await fetchRelatedArticleSummaries(client, {
      id: article.id,
      category: article.category,
    })

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

    // Process content for markdown rendering
    const processedContent = normalizeMarkdown(article.content || '')

    // Get category color
    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'Safety':
          return 'bg-gradient-to-r from-red-600 to-red-700'
        case 'Techniques':
          return 'bg-gradient-to-r from-blue-600 to-blue-700'
        case 'Community':
          return 'bg-gradient-to-r from-green-600 to-green-700'
        case 'Resources':
          return 'bg-gradient-to-r from-purple-600 to-purple-700'
        case 'Consent':
          return 'bg-gradient-to-r from-yellow-600 to-yellow-700'
        default:
          return 'bg-gradient-to-r from-gray-600 to-gray-700'
      }
    }

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
                className={`inline-flex min-h-touch items-center text-white text-sm font-medium px-4 py-2 rounded-full ${getCategoryColor(article.category)} shadow-lg order-1 sm:order-2 self-start`}
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
                      {article.title}
                    </h1>

                    <p className="text-lg md:text-xl text-subtle leading-relaxed mb-6">{article.excerpt}</p>

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

                  <section className="mt-8">
                    <Markdown content={processedContent} />
                  </section>
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
