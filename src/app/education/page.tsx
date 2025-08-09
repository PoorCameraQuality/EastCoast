'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/education/ArticleCard'

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

// Define the available categories
const CATEGORIES = [
  { id: 'all', name: 'All Articles', color: 'bg-gray-600' },
  { id: 'Safety', name: 'Safety', color: 'bg-red-600' },
  { id: 'Techniques', name: 'Techniques', color: 'bg-blue-600' },
  { id: 'Community', name: 'Community', color: 'bg-green-600' },
  { id: 'Resources', name: 'Resources', color: 'bg-purple-600' },
  { id: 'Consent', name: 'Consent', color: 'bg-yellow-600' }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Education</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Education</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Education</h1>
        
        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? `${category.color} text-white shadow-lg`
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Articles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
        
        {/* All Articles Section */}
        {filteredArticles.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              {featuredArticles.length > 0 ? 'All Articles' : 'Articles'}
              {selectedCategory !== 'all' && ` - ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {selectedCategory === 'all' 
                ? 'No articles available at this time.' 
                : `No articles found in the ${CATEGORIES.find(c => c.id === selectedCategory)?.name} category.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

