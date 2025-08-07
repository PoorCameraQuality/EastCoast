import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import BackToTop from '@/components/BackToTop'
import TableOfContents from '@/components/TableOfContents'
import ReadingProgress from '@/components/ReadingProgress'
import { ArticleStructuredData } from '@/components/StructuredData'

interface ArticlePageProps {
  params: { slug: string }
}

async function getArticleBySlug(slug: string) {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', slug)
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
      description: 'The requested article could not be found.'
    }
  }

  return {
    title: `${article.title} | East Coast Kink Events`,
    description: article.excerpt,
    keywords: article.tags ? article.tags.split(',').map((tag: string) => tag.trim()) : [],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://eastcoastkinkevents.com/education/${article.id}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
    alternates: {
      canonical: `https://eastcoastkinkevents.com/education/${article.id}`,
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug)
  
  if (!article) {
    notFound()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently published'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education' },
    { label: article.title, current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <ArticleStructuredData article={article} />
      <ReadingProgress />
      
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                {article.category}
              </span>
              {article.featured && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-black">
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between text-gray-300 mb-8">
              <div className="flex items-center gap-4">
                <span className="font-medium">{article.author_name}</span>
                {article.author_credentials && (
                  <span className="text-sm">• {article.author_credentials}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                {article.read_time && (
                  <span>{article.read_time}</span>
                )}
                <span>{formatDate(article.created_at)}</span>
              </div>
            </div>
            
            {article.excerpt && (
              <p className="text-lg text-subtle leading-relaxed mb-8">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Article Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="prose prose-invert prose-lg max-w-none">
                <div 
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <TableOfContents content={article.content} />
              </div>
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t border-dark-600">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>
                <p><strong>Author:</strong> {article.author_name}</p>
                {article.author_bio && (
                  <p className="mt-2 text-gray-300">{article.author_bio}</p>
                )}
              </div>
              <div className="text-right">
                <p><strong>Published:</strong> {formatDate(article.created_at)}</p>
                {article.tags && (
                  <div className="mt-2">
                    <p><strong>Tags:</strong></p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {article.tags.split(',').map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs bg-dark-700 text-gray-300"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BackToTop />
    </div>
  )
}
