import Image from 'next/image'
import {
  formatCardMeta,
  topicBadgeClass,
  topicLabel,
} from '@/lib/educationLibraryMeta'
import { listingImageUnoptimized } from '@/lib/nextImageSrc'
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
      {item.heroImageUrl ? (
        <div className="edu-hero-media edu-hero-media-adaptive">
          <Image
            src={item.heroImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
            unoptimized={listingImageUnoptimized(item.heroImageUrl)}
          />
        </div>
      ) : null}
    </header>
  )
}
