import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import {
  formatCardMeta,
  topicBadgeClass,
  topicLabel,
} from '@/components/education/library/EducationLibraryHeader'
import type { PublicEducationItem } from '@/types/publicEducationItem'

type Props = {
  item: PublicEducationItem
  compact?: boolean
}

export default function FeaturedGuideCard({ item, compact = false }: Props) {
  const href = `/education/${item.slug}`

  return (
    <article className="edu-learning-card">
      <span className={topicBadgeClass(item.topic)}>{topicLabel(item.topic)}</span>
      <EckeLink href={href} className="edu-card-title">
        {item.title}
      </EckeLink>
      {item.summary ? <p className="edu-card-promise">{item.summary}</p> : null}
      <p className="edu-card-meta">{formatCardMeta(item)}</p>
      {!compact && item.tags && item.tags.length > 0 ? (
        <div className="edu-card-tags">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="edu-card-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {item.authorName ? <p className="edu-card-author">{item.authorName}</p> : null}
      <div className="edu-card-actions">
        <EckeLink href={href} className="edu-btn-read">
          Read guide
        </EckeLink>
        {item.saveUrl ? (
          <KinkSocialCtaLink
            href={item.saveUrl}
            label="Save on kink.social"
            variant="education"
            surface="education_save"
            className="edu-btn-save"
          />
        ) : null}
      </div>
    </article>
  )
}
