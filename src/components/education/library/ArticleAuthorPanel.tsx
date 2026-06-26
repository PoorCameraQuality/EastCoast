import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { TOPIC_LABELS } from '@/lib/educationVisual'
import type { PublicEducationItem } from '@/types/publicEducationItem'

type Props = {
  item: PublicEducationItem
  authorBio?: string
  moreByAuthor?: PublicEducationItem[]
}

export default function ArticleAuthorPanel({ item, authorBio, moreByAuthor = [] }: Props) {
  if (!item.authorName) return null

  const profileUrl = item.kinkSocialAuthorUrl ?? item.presenterProfileUrl

  return (
    <aside className="edu-author-panel" aria-labelledby="edu-author-title">
      <h2 id="edu-author-title" className="edu-author-panel-title">
        About the educator
      </h2>
      <div className="edu-author-row">
        <div className="edu-author-avatar" aria-hidden>
          {item.authorName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          {profileUrl ? (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="edu-author-name">
              {item.authorName}
            </a>
          ) : (
            <p className="edu-author-name">{item.authorName}</p>
          )}
          {item.authorRole ? <p className="edu-author-role">{item.authorRole}</p> : null}
        </div>
      </div>
      {authorBio ? <p className="edu-author-bio">{authorBio}</p> : null}
      <div className="edu-author-actions">
        {item.followAuthorUrl ? (
          <KinkSocialCtaLink
            href={item.followAuthorUrl}
            label="Follow on kink.social"
            variant="education"
            surface="education_author_panel"
            className="edu-btn-save"
          />
        ) : null}
        {profileUrl ? (
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="edu-btn-read">
            View profile
          </a>
        ) : null}
      </div>
      {moreByAuthor.length > 0 ? (
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">More by this author</p>
          <ul className="mt-2 space-y-1">
            {moreByAuthor.slice(0, 3).map((article) => (
              <li key={article.slug}>
                <EckeLink href={`/education/${article.slug}`} className="text-sm text-violet-300 hover:text-violet-200">
                  {article.title}
                </EckeLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {item.topic ? (
        <p className="mt-3 text-xs text-slate-500">
          Topics: {TOPIC_LABELS[item.topic] ?? item.topic}
        </p>
      ) : null}
    </aside>
  )
}
