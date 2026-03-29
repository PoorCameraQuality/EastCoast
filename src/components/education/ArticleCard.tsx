import Link from 'next/link'

interface ArticleCardProps {
  article: {
    id: string
    slug?: string
    title: string
    excerpt: string
    author_name: string
    author_credentials?: string
    category: string
    tags?: string | string[]
    featured: boolean
    read_time?: string
    publish_date?: string
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

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Safety':
        return 'bg-gradient-to-r from-red-600 to-red-700'
      case 'Techniques':
        return 'bg-gradient-to-r from-primary-600 to-primary-700'
      case 'Community':
        return 'bg-gradient-to-r from-green-600 to-green-700'
      case 'Resources':
        return 'bg-gradient-to-r from-purple-600 to-purple-700'
      case 'Consent':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-700'
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700'
    }
  }

  return (
    <Link href={`/education/${article.slug || article.id}`} className="block group">
      <div className="card-elegant h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-dark-600 hover:border-primary-500 overflow-hidden">
        {/* Header with category and featured badge */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(article.category)} shadow-lg`}>
              {article.category}
            </span>
            {article.featured && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg animate-pulse">
                ⭐ Featured
              </span>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-subtle text-sm mb-4 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Tags Section */}
          {articleTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {articleTags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs bg-dark-700 text-gray-300 border border-dark-600 hover:border-primary-500 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {articleTags.length > 3 && (
                <span className="px-2 py-1 rounded-full text-xs bg-dark-700 text-gray-400 border border-dark-600">
                  +{articleTags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer with author and date */}
        <div className="px-6 pb-6 mt-auto">
          <div className="flex items-center justify-between text-sm text-subtle border-t border-dark-600 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {article.author_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-white">{article.author_name}</div>
                {article.author_credentials && (
                  <div className="text-xs text-gray-400">{article.author_credentials}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              {article.read_time && (
                <div className="text-xs text-gray-400 mb-1">{article.read_time}</div>
              )}
              <div className="text-xs text-gray-500">{formatDate(article.publish_date)}</div>
            </div>
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/0 to-primary-900/0 group-hover:from-primary-900/10 group-hover:to-primary-900/5 transition-all duration-300 pointer-events-none"></div>
      </div>
    </Link>
  )
}
