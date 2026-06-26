import Markdown from '@/components/Markdown'
import { isArticleContentHtml } from '@/lib/articleContentFormat'
import { normalizeMarkdown } from '@/lib/normalizeMarkdown'

type Props = {
  content: string
}

const HTML_PROSE_CLASS =
  'prose prose-invert prose-lg article-prose rich-text-content max-w-none w-full min-w-0 overflow-x-hidden'

export default function EducationArticleBody({ content }: Props) {
  if (isArticleContentHtml(content)) {
    return <div className={HTML_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: content }} />
  }

  return <Markdown content={normalizeMarkdown(content)} />
}
