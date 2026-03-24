import Link from 'next/link'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import type { RelatedArticleSummary } from '@/lib/articleRelated'

function categoryChipClass(category: string) {
  switch (category) {
    case 'Safety':
      return 'bg-red-600/20 text-red-300 border-red-600/30'
    case 'Techniques':
      return 'bg-blue-600/20 text-blue-300 border-blue-600/30'
    case 'Community':
      return 'bg-green-600/20 text-green-300 border-green-600/30'
    case 'Resources':
      return 'bg-purple-600/20 text-purple-300 border-purple-600/30'
    case 'Consent':
      return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30'
    default:
      return 'bg-gray-600/20 text-gray-300 border-gray-600/30'
  }
}

export default function RelatedArticlesSection({ articles }: { articles: RelatedArticleSummary[] }) {
  if (articles.length === 0) {
    return (
      <div className="mt-12 border-t border-dark-600 pt-6">
        <div className="card-elegant">
          <h3 className="text-xl font-serif font-semibold text-white mb-4">Continue Your Journey</h3>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-6">Explore more educational content</p>
            <Link
              href="/education"
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 border-t border-dark-600 pt-6">
      <div className="card-elegant">
        <h3 className="text-xl font-serif font-semibold text-white mb-4">Continue Your Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/education/${article.slug}`}
              className="block p-4 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-medium text-white group-hover:text-primary-300 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                {article.featured && (
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded border border-yellow-500/30 flex-shrink-0">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded border ${categoryChipClass(article.category)}`}>
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(article.publish_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-dark-600">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/education"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-500/10 text-primary-300 rounded-lg hover:bg-primary-500/20 transition-colors border border-primary-500/30"
            >
              Browse All Articles
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 bg-dark-700 text-gray-300 rounded-lg border border-dark-600 hover:bg-dark-600 transition-colors"
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
