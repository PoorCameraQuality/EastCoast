import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface ArticlePageProps {
  params: { slug: string }
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
    keywords: article.tags ? (Array.isArray(article.tags) ? article.tags : article.tags.split(',').map((tag: string) => tag.trim())) : [],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://eastcoastkinkevents.com/education/${article.id}`,
      siteName: 'East Coast Kink Events',
      images: [
        {
          url: 'https://eastcoastkinkevents.com/og-image.png',
          width: 1200,
          height: 630,
          alt: `${article.title} - East Coast Kink Events`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: ['https://eastcoastkinkevents.com/og-image.png'],
    },
    alternates: {
      canonical: `https://eastcoastkinkevents.com/education/${article.id}`,
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
      .eq('id', slug)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
              <div className="text-gray-400 mb-4">
                <p>By {article.author_name}</p>
                <p>{article.read_time}</p>
              </div>
              <p className="text-lg text-gray-300">{article.excerpt}</p>
            </header>

            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            <footer className="mt-8 pt-8 border-t border-gray-700">
              <div className="text-gray-400">
                <p>Author: {article.author_name}</p>
                {article.author_credentials && (
                  <p>Credentials: {article.author_credentials}</p>
                )}
                {article.author_bio && (
                  <p>Bio: {article.author_bio}</p>
                )}
              </div>
            </footer>
          </article>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    notFound()
  }
}
