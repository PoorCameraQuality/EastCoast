import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/education/ArticleCard'

export const metadata: Metadata = {
  title: 'Education | East Coast Kink Events',
  description: 'Educational articles and resources about kink, BDSM, and the community.',
  keywords: ['education', 'kink', 'BDSM', 'articles', 'resources', 'community'],
  openGraph: {
    title: 'Education | East Coast Kink Events',
    description: 'Educational articles and resources about kink, BDSM, and the community.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/education',
    siteName: 'East Coast Kink Events',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Education - East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Education | East Coast Kink Events',
    description: 'Educational articles and resources about kink, BDSM, and the community.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://eastcoastkinkevents.com/education',
  },
}

export const dynamic = 'force-dynamic'

export default async function EducationPage() {
  try {
    const client = supabase
    if (!client) {
      throw new Error('Supabase client not configured')
    }

    const { data: articles, error } = await client
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      return (
        <div className="min-h-screen bg-dark-900">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Education</h1>
            <p className="text-gray-400">Unable to load articles at this time.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Education</h1>
          
          {articles && articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No articles available at this time.</p>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in education page:', error)
    return (
      <div className="min-h-screen bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Education</h1>
          <p className="text-gray-400">Unable to load articles at this time.</p>
        </div>
      </div>
    )
  }
}

