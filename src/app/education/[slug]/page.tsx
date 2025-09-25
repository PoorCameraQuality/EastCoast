import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import Script from 'next/script'
import { markdownToHtml, stripFirstH1 } from '@/lib/markdown'
import ContinueYourJourney from '@/components/education/ContinueYourJourney'

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
  tags?: string[]
  featured: boolean
  status: string
  publish_date: string
  read_time?: string
  seo_title?: string
  meta_description?: string
  focus_keywords?: string[]
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
      description: 'The requested article could not be found.'
    }
  }

  const title = article.seo_title || article.title
  const description = article.meta_description || article.excerpt
  const keywords = article.focus_keywords || (article.tags ? (Array.isArray(article.tags) ? article.tags : article.tags.split(',').map((tag: string) => tag.trim())) : [])

  return {
    title: `${title} | East Coast Kink Events`,
    description: description,
    keywords: keywords,
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      url: `https://eastcoastkinkevents.com/education/${article.slug}`,
      siteName: 'East Coast Kink Events',
      images: [
        {
          url: 'https://eastcoastkinkevents.com/og-image.png',
          width: 1200,
          height: 630,
          alt: `${title} - East Coast Kink Events`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ['https://eastcoastkinkevents.com/og-image.png'],
    },
    alternates: {
      canonical: `https://eastcoastkinkevents.com/education/${article.slug}`,
    },
  }
}

export const dynamic = 'force-dynamic'

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

    // Handle tags formatting
    const formatTags = (tags?: string | string[]) => {
      if (!tags) return []
      if (Array.isArray(tags)) return tags
      if (typeof tags === 'string') {
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
      return []
    }

    const articleTags = formatTags(article.tags)

    // Check if content is HTML or markdown and process accordingly
    let contentHtml: string
    
    if (article.content.includes('<p>') || article.content.includes('<h1>') || article.content.includes('<div>') || article.content.includes('<br>')) {
      // Content is already HTML, use it directly
      contentHtml = article.content
    } else if (article.content.includes('# ') || article.content.includes('## ') || article.content.includes('**') || article.content.includes('*')) {
      // Content is markdown, process it
      const processedContent = stripFirstH1(article.content)
      contentHtml = await markdownToHtml(processedContent)
    } else {
      // Fallback: treat as plain text
      contentHtml = `<div class="prose">${article.content.replace(/\n/g, '<br>')}</div>`
    }

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
      { label: article.title, current: true }
    ]

    return (
      <div className="min-h-screen bg-black">
        {/* Breadcrumb JSON-LD */}
        <Script
          id={`breadcrumb-structured-data-${article.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {"@type": "ListItem", position: 1, name: 'Home', item: 'https://eastcoastkinkevents.com/'},
                {"@type": "ListItem", position: 2, name: 'Education', item: 'https://eastcoastkinkevents.com/education'},
                {"@type": "ListItem", position: 3, name: article.title, item: `https://eastcoastkinkevents.com/education/${article.slug}`}
              ]
            })
          }}
        />
        
        <div className="container-custom py-16">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <Link href="/education" className="text-primary-400 hover:text-primary-300 transition-colors">
                ← Back to Education
              </Link>
              <span className={`inline-block text-white text-sm font-medium px-4 py-2 rounded-full ${getCategoryColor(article.category)} shadow-lg`}>
                {article.category}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Article Info Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-elegant sticky top-8">
                  {/* Author Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-serif font-semibold text-white mb-4">About the Author</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {article.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
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
                  
                  {/* Article Meta */}
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
                      <p>{new Date(article.publish_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Article Content */}
              <div className="lg:col-span-2">
                <div className="card-elegant px-4 sm:px-6 lg:px-8">
                  {/* Article Header */}
                  <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      {article.featured && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg animate-pulse">
                          ⭐ Featured Article
                        </span>
                      )}
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                      {article.title}
                    </h1>
                    
                    <p className="text-xl text-subtle leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                    
                    {/* Tags Section */}
                    {articleTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {articleTags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm bg-dark-700 text-gray-300 border border-dark-600 hover:border-primary-500 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </header>

                  {/* Article Content */}
                  <div className="prose prose-neutral dark:prose-invert prose-headings:scroll-mt-20 prose-li:marker:text-muted-foreground prose-img:rounded-xl prose-pre:rounded-xl prose-strong:text-white prose-strong:font-semibold prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-p:text-gray-300 prose-li:text-gray-300 prose-ul:text-gray-300 prose-ol:text-gray-300 leading-relaxed max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ __html: contentHtml }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Continue Your Journey - Dynamic Related Articles */}
          <ContinueYourJourney 
            currentArticle={{
              id: article.id,
              slug: article.slug,
              category: article.category,
              tags: articleTags
            }}
          />

          {/* Related Articles CTA */}
          <div className="mt-16">
            <div className="card-elegant text-center">
              <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                Explore More Articles
              </h2>
              <p className="text-lg text-subtle mb-6 max-w-2xl mx-auto">
                Discover more educational content, safety guidelines, and community resources. 
                Learn from experts and share your knowledge with the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/education" className="btn-primary">
                  Browse All Articles
                </Link>
                <Link href="/education/submit" className="btn-outline">
                  Submit Your Article
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
