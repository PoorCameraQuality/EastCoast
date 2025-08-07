import Link from 'next/link'

interface ArticleCardProps {
  article: {
    id: string
    slug: string
    title: string
    excerpt: string
    author_name: string
    author_credentials?: string
    category: string
    tags?: string[]
    read_time: string
    created_at?: string
    featured?: boolean
  }
  featured?: boolean
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently published'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`card-elegant hover-lift group ${featured ? 'ring-2 ring-primary-500' : ''}`}>
      {/* Author Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-white">{article.author_name}</p>
          {article.author_credentials && (
            <p className="text-xs text-subtle">{article.author_credentials}</p>
          )}
        </div>
        <div>
          <span className="inline-block bg-primary-900 text-primary-300 text-xs font-medium px-2 py-1 rounded-none border border-primary-700">
            {article.category}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <div className="mb-4">
        <Link href={`/education/${article.slug}`}>
          <h3 className="text-xl font-serif font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 cursor-pointer hover:text-primary-400">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-subtle leading-relaxed mb-4">
          {article.excerpt}
        </p>
      </div>

      {/* Meta Information */}
      <div className="flex items-center justify-between text-xs text-subtle mb-4">
        <span>{formatDate(article.created_at)}</span>
        <span>{article.read_time}</span>
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-none border border-gray-700"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-subtle">+{article.tags.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Read More Link */}
      <Link 
        href={`/education/${article.slug}`}
        className="text-primary-400 hover:text-primary-300 font-medium text-sm border-b border-primary-600 hover:border-primary-500 transition-all duration-300 inline-block"
      >
        Read Article →
      </Link>
    </div>
  )
}
