import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import {
  formatCardMeta,
  topicBadgeClass,
  topicLabel,
} from '@/components/education/library/EducationLibraryHeader'
import type { PublicEducationItem } from '@/types/publicEducationItem'

type Props = {
  item: PublicEducationItem
}

export default function EducationResourceCard({ item }: Props) {
  const href = item.sourceUrl ?? '#'

  return (
    <article className="edu-learning-card">
      <span className={topicBadgeClass(item.topic)}>{topicLabel(item.topic)}</span>
      <span className="edu-resource-external">External resource</span>
      <a href={href} target="_blank" rel="noopener noreferrer" className="edu-card-title">
        {item.title}
      </a>
      {item.externalSourceName ? (
        <p className="edu-resource-source">{item.externalSourceName}</p>
      ) : null}
      {item.summary ? <p className="edu-card-promise">{item.summary}</p> : null}
      <p className="edu-card-meta">{formatCardMeta(item)}</p>
      <div className="edu-card-actions">
        <a href={href} target="_blank" rel="noopener noreferrer" className="edu-btn-read">
          Visit resource
        </a>
        {item.saveUrl ? (
          <KinkSocialCtaLink
            href={item.saveUrl}
            label="Save on kink.social"
            variant="education"
            surface="education_resource_save"
            className="edu-btn-save"
          />
        ) : null}
      </div>
    </article>
  )
}
