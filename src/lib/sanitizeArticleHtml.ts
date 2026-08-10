import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

/** Allow article markup from kink.social ingest without scripts/handlers. */
// Schema typing from rehype-sanitize is stricter than our spread merge; runtime shape matches Markdown.tsx.
const articleHtmlSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'br',
    'hr',
    'em',
    'i',
    'strong',
    'u',
    'blockquote',
    'figure',
    'figcaption',
    'sup',
    'sub',
    'section',
    'article',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), ['target'], ['rel']],
    img: [
      ...(defaultSchema.attributes?.img || []),
      ['alt'],
      ['title'],
      ['width'],
      ['height'],
      ['loading'],
      ['decoding'],
    ],
    div: [...(defaultSchema.attributes?.div || []), ['className'], ['class']],
    span: [...(defaultSchema.attributes?.span || []), ['className'], ['class']],
    p: [...(defaultSchema.attributes?.p || []), ['className'], ['class']],
    h1: [...(defaultSchema.attributes?.h1 || []), ['id']],
    h2: [...(defaultSchema.attributes?.h2 || []), ['id']],
    h3: [...(defaultSchema.attributes?.h3 || []), ['id']],
    h4: [...(defaultSchema.attributes?.h4 || []), ['id']],
  },
} as typeof defaultSchema

/** Strip scripts/event handlers from HTML article bodies before render or store. */
export function sanitizeArticleHtml(html: string): string {
  if (!html?.trim()) return ''
  return String(
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeSanitize, articleHtmlSchema)
      .use(rehypeStringify)
      .processSync(html),
  )
}
