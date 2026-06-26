import EckeLink from '@/components/EckeLink'
import FeaturedGuideCard from '@/components/education/library/FeaturedGuideCard'
import { getLearningPathBySlug } from '@/lib/educationLearningPaths'
import { topicLabel } from '@/components/education/library/EducationLibraryHeader'
import { categoryToTopic } from '@/lib/educationVisual'
import type { PublicEducationItem } from '@/types/publicEducationItem'
import type { RelatedArticleSummary } from '@/lib/articleRelated'

type Props = {
  item: PublicEducationItem
  relatedArticles: RelatedArticleSummary[]
  pathNext?: PublicEducationItem[]
  libraryItems?: PublicEducationItem[]
}

function summaryToItem(summary: RelatedArticleSummary): PublicEducationItem {
  return {
    id: summary.id,
    slug: summary.slug,
    title: summary.title,
    summary: summary.excerpt,
    contentType: 'article',
    topic: categoryToTopic(summary.category),
    lane: 'library',
    featured: summary.featured,
    publishDate: summary.publish_date,
    sourceSystem: 'ecke',
    status: 'published',
  }
}

export default function ArticleRelatedLearning({
  item,
  relatedArticles,
  pathNext = [],
  libraryItems = [],
}: Props) {
  const path = item.learningPathSlug ? getLearningPathBySlug(item.learningPathSlug) : undefined
  const moreByAuthor =
    item.authorSlug && libraryItems.length > 0
      ? libraryItems.filter(
          (a) => a.authorSlug === item.authorSlug && a.slug !== item.slug
        )
      : []

  const hasContent =
    pathNext.length > 0 ||
    relatedArticles.length > 0 ||
    moreByAuthor.length > 0

  if (!hasContent) return null

  return (
    <section className="edu-related" aria-labelledby="edu-related-title">
      <h2 id="edu-related-title" className="edu-related-title">
        Continue your path
      </h2>

      {path && pathNext.length > 0 ? (
        <div className="edu-related-section">
          <h3 className="edu-section-note">Next in {path.title}</h3>
          <div className="edu-guide-grid edu-guide-grid-compact">
            {pathNext.map((next) => (
              <FeaturedGuideCard key={next.slug} item={next} compact />
            ))}
          </div>
        </div>
      ) : null}

      {relatedArticles.length > 0 ? (
        <div className="edu-related-section">
          <h3 className="edu-section-note">Related guides</h3>
          <div className="edu-related-grid">
            {relatedArticles.map((article) => (
              <EckeLink key={article.id} href={`/education/${article.slug}`} className="edu-related-link">
                <p className="edu-related-link-title">{article.title}</p>
                <p className="edu-related-link-meta">
                  {topicLabel(summaryToItem(article).topic)} · {article.excerpt.slice(0, 80)}
                  {article.excerpt.length > 80 ? '…' : ''}
                </p>
              </EckeLink>
            ))}
          </div>
        </div>
      ) : null}

      {moreByAuthor.length > 0 ? (
        <div className="edu-related-section">
          <h3 className="edu-section-note">More by {item.authorName}</h3>
          <div className="edu-related-grid">
            {moreByAuthor.slice(0, 4).map((article) => (
              <EckeLink key={article.slug} href={`/education/${article.slug}`} className="edu-related-link">
                <p className="edu-related-link-title">{article.title}</p>
                <p className="edu-related-link-meta">{topicLabel(article.topic)}</p>
              </EckeLink>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <EckeLink href="/education" className="edu-btn-read">
          Browse the library
        </EckeLink>
      </div>
    </section>
  )
}
