import Link from 'next/link'
import { getCategoryColorClass } from '@/lib/educationCategoryColors'
import type { EducationArticle } from '@/lib/educationArticles'

interface ArticleCardProps {
  article: Pick<
    EducationArticle,
    | 'id'
    | 'slug'
    | 'title'
    | 'excerpt'
    | 'author_name'
    | 'author_credentials'
    | 'category'
    | 'tags'
    | 'featured'
    | 'read_time'
    | 'publish_date'
  >
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
    <Link href={`/education/${article.slug || article.id}`} className="block group">
      <div className="card-elegant group/card h-full overflow-hidden border border-dark-600 transition-all duration-300 hover:border-primary-500/60 hover:shadow-xl motion-safe:md:hover:scale-[1.02] motion-reduce:hover:scale-100">
        {/* Header with category and featured badge */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColorClass(article.category)} shadow-lg`}>
              {article.category}
            </span>
            {article.featured && (
              <span className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1 text-xs font-semibold text-black shadow-md ring-2 ring-amber-300/40">
                Featured
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
