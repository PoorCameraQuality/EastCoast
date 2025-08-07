import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/education/ArticleCard'
import Breadcrumb from '@/components/Breadcrumb'
import BackToTop from '@/components/BackToTop'
import { EducationStructuredData } from '@/components/StructuredData'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kink Education - Articles, Guides & Resources | East Coast Kink Events',
  description: 'Comprehensive kink education resources including safety guides, negotiation techniques, aftercare essentials, and community guidelines for responsible BDSM practice.',
  keywords: 'kink education, BDSM safety, consent, negotiation, aftercare, community guidelines, kink resources',
  openGraph: {
    title: 'Kink Education - Articles, Guides & Resources | East Coast Kink Events',
    description: 'Comprehensive kink education resources including safety guides, negotiation techniques, aftercare essentials, and community guidelines for responsible BDSM practice.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/education',
    siteName: 'East Coast Kink Events',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - Kink Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kink Education - Articles, Guides & Resources | East Coast Kink Events',
    description: 'Comprehensive kink education resources including safety guides, negotiation techniques, aftercare essentials, and community guidelines for responsible BDSM practice.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://eastcoastkinkevents.com/education',
  },
}

async function getArticlesFromDatabase() {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase is not configured')
      return []
    }

    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    // Filter out any null or invalid articles
    const validArticles = (articles || []).filter(article => 
      article && 
      article.id && 
      article.title && 
      article.content &&
      article.status === 'published'
    )

    return validArticles
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function EducationPage() {
  const articles = await getArticlesFromDatabase()
  const featuredArticles = articles.filter(article => article.featured).slice(0, 3)
  const allArticles = articles

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', current: true }
  ]

  const categories = [
    { name: 'Safety', count: allArticles.filter(a => a.category === 'Safety').length },
    { name: 'Techniques', count: allArticles.filter(a => a.category === 'Techniques').length },
    { name: 'Community', count: allArticles.filter(a => a.category === 'Community').length },
    { name: 'Resources', count: allArticles.filter(a => a.category === 'Resources').length }
  ]

  return (
    <div className="min-h-screen bg-black">
      <EducationStructuredData />
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Kink Education
          </h1>
          <p className="text-lg text-subtle max-w-3xl mx-auto mb-8">
            Comprehensive educational resources, safety guides, and community knowledge for responsible BDSM practice.
          </p>
          
          {/* Category Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {categories.map((category) => (
              <div key={category.name} className="text-center">
                <div className="text-2xl font-bold text-primary-400">{category.count}</div>
                <div className="text-sm text-subtle">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-semibold text-white mb-8 text-center">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* All Articles Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif font-semibold text-white mb-8 text-center">
            All Articles
          </h2>
          {allArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-subtle mb-4">No articles published yet.</p>
              <p className="text-subtle">Check back soon for educational content!</p>
            </div>
          )}
        </div>

        {/* Community Guidelines Section */}
        <div className="max-w-4xl mx-auto">
          <div className="card-elegant text-center">
            <h2 className="text-2xl font-serif font-semibold text-white mb-6">
              Community Guidelines
            </h2>
            <p className="text-lg text-subtle mb-8">
              Our education section follows strict community guidelines to ensure safe, accurate, and respectful content.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Content Standards:</h3>
                <ul className="space-y-2 text-subtle">
                  <li className="flex items-center">
                    <span className="text-primary-400 mr-2">✓</span>
                    Safety-first approach
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary-400 mr-2">✓</span>
                    Expert-reviewed content
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary-400 mr-2">✓</span>
                    Inclusive and respectful
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary-400 mr-2">✓</span>
                    Evidence-based information
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary-400 mr-2">✓</span>
                    Community-focused
                  </li>
                </ul>
              </div>
              
              <div className="text-left">
                <h3 className="text-xl font-serif font-semibold text-white mb-4">Topics Covered:</h3>
                <div className="space-y-2 text-sm text-subtle">
                  <p>• Safety & consent frameworks</p>
                  <p>• Negotiation techniques</p>
                  <p>• Aftercare essentials</p>
                  <p>• Community etiquette</p>
                  <p>• Educational resources</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/events" className="btn-primary">
                Browse Events
              </a>
              <a href="/dungeons" className="btn-secondary">
                Find Dungeons
              </a>
              <a href="/education/submit" className="btn-primary">
                Submit Article
              </a>
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  )
}

