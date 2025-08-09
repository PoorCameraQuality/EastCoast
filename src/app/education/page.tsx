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
      <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
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
      <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-400 text-center">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
      {/* Subtle background elements with blue spectrum */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-1/4 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                Kink Education
              </span>
              <br />
              <span className="text-white">Knowledge & Community</span>
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full mb-8"></div>
            <p className="text-xl md:text-2xl mb-12 text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover educational content, safety guidelines, and community resources. 
              Learn from experts and share your knowledge with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/education/submit" className="group inline-block bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 text-white font-bold py-4 px-8 rounded-full hover:from-primary-700 hover:via-blue-700 hover:to-primary-800 transition-all duration-300 shadow-xl hover:shadow-primary-500/25 hover:scale-105 min-w-[200px] text-center">
                <span className="flex items-center gap-2 justify-center group-hover:translate-x-1 transition-transform">
                  Submit Your Article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
              </Link>
              <Link href="#articles" className="group inline-block bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold py-4 px-8 rounded-full hover:bg-white/20 transition-all duration-300 shadow-xl hover:shadow-white/25 hover:scale-105 min-w-[200px] text-center">
                <span className="flex items-center gap-2 justify-center">
                  Browse Articles
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters with Counters */}
      <section className="py-12 border-b border-gray-700/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-white mb-8 text-center">
              <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                Explore by Category
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-2xl shadow-primary-500/25'
                      : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:shadow-primary-500/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{category.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-600/20 text-primary-300'
                    }`}>
                      {getCategoryCount(category.id)}
                    </span>
                  </div>
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-blue-600/20 rounded-2xl"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Featured Articles Section */}
            {featuredArticles.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif font-bold text-white">
                    <span className="inline-block bg-gradient-to-r from-primary-400 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                      Featured Articles
                    </span>
                  </h2>
                  <div className="flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 font-medium">{featuredArticles.length} featured</span>
                  </div>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {featuredArticles.map((article) => (
                    <div key={article.id} className="transform hover:scale-105 transition-transform duration-300">
                      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-purple-500/25">
                        <ArticleCard article={article} />
                      </div>
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
                    <span className="inline-block bg-gradient-to-r from-primary-400 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                      {featuredArticles.length > 0 ? 'All Articles' : 'Articles'}
                    </span>
                    {selectedCategory !== 'all' && (
                      <span className="text-primary-400 ml-2">
                        - {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                      </span>
                    )}
                  </h2>
                  <div className="text-gray-400 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-2">
                    {regularArticles.length} {regularArticles.length === 1 ? 'article' : 'articles'}
                  </div>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {regularArticles.map((article) => (
                    <div key={article.id} className="transform hover:scale-105 transition-transform duration-300">
                      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-purple-500/25">
                        <ArticleCard article={article} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <Link href="/education/submit" className="group inline-block bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 text-white font-bold py-3 px-6 rounded-full hover:from-primary-700 hover:via-blue-700 hover:to-primary-800 transition-all duration-300 shadow-xl hover:shadow-primary-500/25 hover:scale-105">
                    <span className="flex items-center gap-2 justify-center group-hover:translate-x-1 transition-transform">
                      Submit Your First Article
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Submit Article CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-900/20 to-blue-900/20 border-t border-gray-700/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              <span className="inline-block bg-gradient-to-r from-primary-400 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                Share Your Knowledge
              </span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Have valuable insights to share? Submit your educational article and help build our community's knowledge base.
            </p>
            <Link href="/education/submit" className="group inline-block bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 text-white font-bold py-4 px-8 rounded-full hover:from-primary-700 hover:via-blue-700 hover:to-primary-800 transition-all duration-300 shadow-xl hover:shadow-primary-500/25 hover:scale-105 text-lg">
              <span className="flex items-center gap-2 justify-center group-hover:translate-x-1 transition-transform">
                Submit Your Article
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

