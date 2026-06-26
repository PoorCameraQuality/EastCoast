import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import {
  formatCardMeta,
  topicBadgeClass,
  topicLabel,
} from '@/components/education/library/EducationLibraryHeader'
import type { PublicEducationItem } from '@/types/publicEducationItem'

type Props = {
  item: PublicEducationItem
  heroTitle: string
  heroLead?: string
}

export default function ArticleMasthead({ item, heroTitle, heroLead }: Props) {
  const publishLabel = item.publishDate
    ? new Date(item.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <header className="edu-masthead">
      <span className={topicBadgeClass(item.topic)}>{topicLabel(item.topic)}</span>
      <h1 className="edu-masthead-title">{heroTitle}</h1>
      {heroLead ? <p className="edu-masthead-subtitle">{heroLead}</p> : null}
      <div className="edu-masthead-meta">
        {formatCardMeta(item) ? <span>{formatCardMeta(item)}</span> : null}
        {item.authorName ? (
          <>
            <span className="edu-masthead-meta-sep">·</span>
            <span>{item.authorName}</span>
          </>
        ) : null}
        {publishLabel ? (
          <>
            <span className="edu-masthead-meta-sep">·</span>
            <span>{publishLabel}</span>
          </>
        ) : null}
      </div>
      {(item.saveUrl || item.followAuthorUrl) && (
        <div className="edu-masthead-actions">
          {item.saveUrl ? (
            <KinkSocialCtaLink
              href={item.saveUrl}
              label="Save on kink.social"
              variant="education"
              surface="education_article_save"
              className="edu-btn-save"
            />
          ) : null}
          {item.followAuthorUrl ? (
            <KinkSocialCtaLink
              href={item.followAuthorUrl}
              label="Follow educator"
              variant="education"
              surface="education_follow_author"
              className="edu-btn-read"
            />
          ) : null}
        </div>
      )}
      {item.heroImageUrl ? (
        <div className="edu-hero-media edu-hero-media-adaptive">
          <img src={item.heroImageUrl} alt="" />
        </div>
      ) : null}
    </header>
  )
}
