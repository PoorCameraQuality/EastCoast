import Link from 'next/link'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    excerpt: string
    author_name: string
    author_credentials?: string
    category: string
    tags?: string | string[]
    featured: boolean
    read_time?: string
    created_at?: string
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently published'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Handle tags formatting
  const formatTags = (tags?: string | string[]) => {
    if (!tags) return []
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }
    return []
  }

  const articleTags = formatTags(article.tags)

  return (
    <Link href={`/education/${article.id}`} className="block">
      <div className="bg-dark-800 rounded-lg p-6 border border-dark-600 hover:border-primary-500 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-primary-500 text-white">
                {article.category}
              </span>
              {article.featured && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500 text-black">
                  Featured
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
              {article.title}
            </h3>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {article.excerpt}
            </p>

            {/* Tags Section */}
            {articleTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {articleTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded text-xs bg-dark-700 text-gray-300 border border-dark-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span>{article.author_name}</span>
                {article.author_credentials && (
                  <span className="text-xs">• {article.author_credentials}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {article.read_time && (
                  <span>{article.read_time}</span>
                )}
                <span>{formatDate(article.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
