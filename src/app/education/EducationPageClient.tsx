'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/education/ArticleCard'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import SupportCTAInline from '@/components/SupportCTAInline'

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
  publish_date: string
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

export default function EducationPageClient() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education', current: true }
  ]

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
        .order('publish_date', { ascending: false })

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
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Error Loading Articles</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <button 
              onClick={fetchArticles}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
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
        <div className="absolute top-40 right-1/4 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Breadcrumb items={breadcrumbItems} />
        <SupportCTAInline contextLabel="Education" />
        
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 relative">
            <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
              Educational Resources
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full"></div>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Expand your knowledge with our curated collection of educational articles, safety guides, and community resources.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-xl hover:scale-105 ${
                  selectedCategory === category.id
                    ? `${category.color} ${category.textColor} ${category.borderColor} border-2`
                    : 'bg-dark-800 text-gray-300 hover:bg-dark-700 border-2 border-dark-600 hover:border-primary-500'
                }`}
              >
                {category.name} ({getCategoryCount(category.id)})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-white mb-8 text-center">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {regularArticles.length > 0 && (
          <div>
            <h2 className="text-3xl font-serif font-bold text-white mb-8 text-center">
              {selectedCategory === 'all' ? 'All Articles' : `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Articles`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* No Articles Message */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-serif font-bold text-white mb-4">No Articles Found</h3>
            <p className="text-gray-400 mb-8">
              {selectedCategory === 'all' 
                ? 'No articles are currently available.' 
                : `No articles found in the "${CATEGORIES.find(c => c.id === selectedCategory)?.name}" category.`
              }
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-200 hover:bg-primary-600/30 hover:border-primary-400/40 transition"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
          </div>
        )}

        {/* Submit Article CTA */}
        <div className="mt-16 text-center">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Share Your Knowledge</h3>
            <p className="text-gray-300 mb-6">
              Have valuable insights to share with the community? Submit an educational article and help others learn and grow.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-200 hover:bg-primary-600/30 hover:border-primary-400/40 transition"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
