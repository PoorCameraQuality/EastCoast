'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/education/ArticleCard'
import Link from 'next/link'

// Define the article type
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
  created_at: string
  read_time?: string
}

// Define the available categories with enhanced colors
const CATEGORIES = [
  { id: 'all', name: 'All Articles', color: 'bg-gradient-to-r from-gray-600 to-gray-700', textColor: 'text-white', borderColor: 'border-gray-500' },
  { id: 'Safety', name: 'Safety', color: 'bg-gradient-to-r from-red-600 to-red-700', textColor: 'text-white', borderColor: 'border-red-500' },
  { id: 'Techniques', name: 'Techniques', color: 'bg-gradient-to-r from-blue-600 to-blue-700', textColor: 'text-white', borderColor: 'border-blue-500' },
  { id: 'Community', name: 'Community', color: 'bg-gradient-to-r from-green-600 to-green-700', textColor: 'text-white', borderColor: 'border-green-500' },
  { id: 'Resources', name: 'Resources', color: 'bg-gradient-to-r from-purple-600 to-purple-700', textColor: 'text-white', borderColor: 'border-purple-500' },
  { id: 'Consent', name: 'Consent', color: 'bg-gradient-to-r from-yellow-600 to-yellow-700', textColor: 'text-black', borderColor: 'border-yellow-500' }
]

export default function EducationPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const client = supabase
      if (!client) {
        throw new Error('Supabase client not configured')
      }

      const { data: articlesData, error: articlesError } = await client
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('id', { ascending: false })

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

  // Filter articles based on selected category
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory)

  // Separate featured and regular articles
  const featuredArticles = filteredArticles.filter(article => article.featured)
  const regularArticles = filteredArticles.filter(article => !article.featured)

  // Get category counts
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return articles.length
    return articles.filter(article => article.category === categoryId).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-400 text-center">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              Kink Education
              <br />
              <span className="text-primary-400">Knowledge & Community</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-subtle max-w-3xl mx-auto leading-relaxed">
              Discover educational content, safety guidelines, and community resources. 
              Learn from experts and share your knowledge with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/education/submit" className="btn-primary min-w-[200px] group">
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  Submit Your Article
                </span>
              </Link>
              <Link href="#articles" className="btn-outline min-w-[200px]">
                Browse Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters with Counters */}
      <section className="py-12 border-b border-dark-700">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-white mb-8 text-center">
              Explore by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative group p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    selectedCategory === category.id
                      ? `${category.color} ${category.textColor} ${category.borderColor} shadow-2xl scale-105`
                      : 'bg-dark-800/50 border-dark-600 text-gray-300 hover:border-primary-500 hover:bg-dark-700/50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${
                      selectedCategory === category.id ? category.textColor : 'text-white'
                    }`}>
                      {getCategoryCount(category.id)}
                    </div>
                    <div className={`text-sm font-medium ${
                      selectedCategory === category.id ? category.textColor : 'text-gray-300'
                    }`}>
                      {category.name}
                    </div>
                  </div>
                  {/* Glow effect */}
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Featured Articles Section */}
            {featuredArticles.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif font-bold text-white">
                    Featured Articles
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 font-medium">{featuredArticles.length} featured</span>
                  </div>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {featuredArticles.map((article) => (
                    <div key={article.id} className="transform hover:scale-105 transition-transform duration-300">
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Articles Section */}
            {filteredArticles.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif font-bold text-white">
                    {featuredArticles.length > 0 ? 'All Articles' : 'Articles'}
                    {selectedCategory !== 'all' && (
                      <span className="text-primary-400 ml-2">
                        - {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                      </span>
                    )}
                  </h2>
                  <div className="text-gray-400">
                    {regularArticles.length} {regularArticles.length === 1 ? 'article' : 'articles'}
                  </div>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {regularArticles.map((article) => (
                    <div key={article.id} className="transform hover:scale-105 transition-transform duration-300">
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedCategory === 'all' 
                      ? 'No articles available yet' 
                      : `No articles in ${CATEGORIES.find(c => c.id === selectedCategory)?.name} category`
                    }
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {selectedCategory === 'all' 
                      ? 'Be the first to contribute educational content to our community.'
                      : 'Consider submitting an article in this category.'
                    }
                  </p>
                  <Link href="/education/submit" className="btn-primary">
                    Submit Your First Article
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Submit Article CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-900/20 to-secondary-900/20 border-t border-dark-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Share Your Knowledge
            </h2>
            <p className="text-lg text-subtle mb-8 max-w-2xl mx-auto">
              Have valuable insights to share? Submit your educational article and help build our community's knowledge base.
            </p>
            <Link href="/education/submit" className="btn-primary text-lg px-8 py-4 group">
              <span className="group-hover:translate-x-1 transition-transform inline-block">
                Submit Your Article →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

