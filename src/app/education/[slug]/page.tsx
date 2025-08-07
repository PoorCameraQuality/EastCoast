import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import BackToTop from '@/components/BackToTop'
import ReadingProgress from '@/components/ReadingProgress'
import TableOfContents from '@/components/TableOfContents'
import { ArticleStructuredData } from '@/components/StructuredData'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }

  return {
    title: `${article.title} - Kink Education | East Coast Kink Events`,
    description: article.excerpt,
    keywords: article.tags ? article.tags.join(', ') : '',
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://eastcoastkinkevents.com/education/${params.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
    alternates: {
      canonical: `https://eastcoastkinkevents.com/education/${params.slug}`,
    },
  }
}

// Generate static paths for all articles
export async function generateStaticParams() {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('slug')
      .eq('status', 'published')

    if (error) {
      console.error('Error fetching articles for static paths:', error)
      return []
    }

    return articles?.map((article) => ({
      slug: article.slug,
    })) || []
  } catch (error) {
    console.error('Error generating static paths:', error)
    return []
  }
}

async function getArticleBySlug(slug: string) {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Error fetching article:', error)
      return null
    }

    return article
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-subtle mb-8">The requested article could not be found.</p>
            <p className="text-sm text-subtle mb-4">Slug: {params.slug}</p>
            <Link href="/education" className="btn-primary">
              Browse All Articles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education' },
    { label: article.title, current: true }
  ]

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently published'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Check if article is long (more than 2000 words)
  const isLongArticle = article.content.split(' ').length > 2000

  return (
    <div className="min-h-screen bg-black">
      <ReadingProgress />
      <ArticleStructuredData article={article} />
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link href="/education" className="text-primary-400 hover:text-primary-300 transition-colors">
              ← Back to Education
            </Link>
            <span className="inline-block bg-primary-900 text-primary-300 text-sm font-medium px-3 py-1 rounded-none border border-primary-700">
              {article.category}
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Author Info and Meta */}
            <div className="lg:col-span-1">
              <div className="card-elegant">
                {/* Author Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-serif font-semibold text-white mb-4">About the Author</h3>
                  <div className="mb-4">
                    <h4 className="text-white font-semibold">{article.author_name}</h4>
                    {article.author_credentials && (
                      <p className="text-sm text-subtle">{article.author_credentials}</p>
                    )}
                  </div>
                  <p className="text-sm text-subtle leading-relaxed">
                    {article.author_bio}
                  </p>
                </div>
                
                {/* Article Meta */}
                <div className="space-y-4 text-subtle">
                  <div>
                    <span className="font-medium text-white">Published:</span>
                    <p className="text-sm">{formatDate(article.created_at)}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-white">Read Time:</span>
                    <p className="text-sm">{article.read_time}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-white">Category:</span>
                    <p className="text-sm">{article.category}</p>
                  </div>
                </div>
              </div>

              {/* Table of Contents for long articles */}
              {isLongArticle && (
                <TableOfContents content={article.content} />
              )}
            </div>
            
            {/* Article Content */}
            <div className="lg:col-span-3">
              <div className="card-elegant">
                <h1 className="text-3xl font-serif font-bold text-white mb-6">
                  {article.title}
                </h1>
                
                <div className="prose prose-invert max-w-none">
                  {/* Render HTML content directly */}
                  <div 
                    className="text-lg text-subtle leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: article.content
                    }}
                  />
                </div>
                
                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-serif font-semibold text-white mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-none border border-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Articles Section */}
        <div className="mt-16">
          <div className="card-elegant text-center">
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">
              Explore More Education
            </h2>
            <p className="text-lg text-subtle mb-6 max-w-2xl mx-auto">
              Continue your learning journey with more articles and resources from our education section.
            </p>
            <Link 
              href="/education"
              className="btn-primary inline-flex items-center gap-2"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  )
}
