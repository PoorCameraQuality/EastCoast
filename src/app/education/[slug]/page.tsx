import { Metadata } from 'next'
import { getArticleBySlug, generateArticleSEO } from '@/data/education'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { ArticleStructuredData } from '@/components/StructuredData'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = getArticleBySlug(params.slug)
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }

  const seo = generateArticleSEO(article)
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
      type: 'article',
      url: `https://eastcoastkinkevents.com/education/${params.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
    },
    alternates: {
      canonical: `https://eastcoastkinkevents.com/education/${params.slug}`,
    },
  }
}

// Generate static paths for all articles
export async function generateStaticParams() {
  const { getAllArticles } = await import('@/data/education')
  const articles = getAllArticles()
  
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug)

  if (!article) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-subtle mb-8">The requested article could not be found.</p>
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-black">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Author Info and Meta */}
            <div className="lg:col-span-1">
              <div className="card-elegant">
                {/* Author Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-serif font-semibold text-white mb-4">About the Author</h3>
                  <div className="mb-4">
                    <h4 className="text-white font-semibold">{article.author.name}</h4>
                    {article.author.credentials && (
                      <p className="text-sm text-subtle">{article.author.credentials}</p>
                    )}
                  </div>
                  <p className="text-sm text-subtle leading-relaxed">
                    {article.author.bio}
                  </p>
                </div>
                
                {/* Article Meta */}
                <div className="space-y-4 text-subtle">
                  <div>
                    <span className="font-medium text-white">Published:</span>
                    <p className="text-sm">{formatDate(article.publishDate)}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-white">Read Time:</span>
                    <p className="text-sm">{article.readTime}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-white">Category:</span>
                    <p className="text-sm">{article.category}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Article Content */}
            <div className="lg:col-span-2">
              <div className="card-elegant">
                <h1 className="text-3xl font-serif font-bold text-white mb-6">
                  {article.title}
                </h1>
                
                <div className="prose prose-invert max-w-none">
                  {/* Convert markdown content to HTML */}
                  <div 
                    className="text-lg text-subtle leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: article.content
                        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-serif font-bold text-white mb-4">$1</h1>')
                        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-serif font-semibold text-white mb-3 mt-6">$1</h2>')
                        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-serif font-semibold text-white mb-2 mt-4">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="text-subtle">$1</em>')
                        .replace(/\n\n/g, '</p><p class="mb-4">')
                        .replace(/^/g, '<p class="mb-4">')
                        .replace(/$/g, '</p>')
                    }}
                  />
                </div>
                
                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-serif font-semibold text-white mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
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
    </div>
  )
}
