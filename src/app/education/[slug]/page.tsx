import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import ArticlePageClient from '@/components/education/ArticlePageClient'

interface ArticlePageProps {
  params: { slug: string }
}

async function getArticleBySlug(slug: string) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase is not configured')
      return null
    }

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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug)
  
  if (!article) {
    notFound()
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education' },
    { label: article.title, current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        <ArticlePageClient article={article} breadcrumbItems={breadcrumbItems} />
      </div>
    </div>
  )
}
