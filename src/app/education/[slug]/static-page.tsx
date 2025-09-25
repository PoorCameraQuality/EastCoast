import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface ArticlePageProps {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export default async function StaticArticlePage({ params }: { params: { slug: string } }) {
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

    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/education" className="text-blue-400 hover:text-blue-300 mb-4 block">
            ← Back to Education
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          <p className="text-gray-300 mb-6">{article.excerpt}</p>
          
          <div className="mb-6">
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              {article.category}
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {article.content}
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
