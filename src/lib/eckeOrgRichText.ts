import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

const ORG_HTML_TAGS = [
  'p',
  'br',
  'hr',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'img',
]

const orgHtmlSchema = {
  ...defaultSchema,
  tagNames: ORG_HTML_TAGS,
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), ['href'], ['target'], ['rel']],
    img: [
      ...(defaultSchema.attributes?.img || []),
      ['src'],
      ['alt'],
      ['title'],
      ['width'],
      ['height'],
    ],
  },
} as typeof defaultSchema

const BARE_URL_RE = /(?:https?:\/\/|mailto:)[^\s<]+/gi

/** http(s) and mailto only. Relative `/path` links are kept; javascript: is never safe. */
export function isSafeListingHref(href: string): boolean {
  const trimmed = (href || '').trim()
  if (!trimmed) return false
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return true
  return trimmed.startsWith('/') && !trimmed.startsWith('//')
}

function splitUrlTrailer(raw: string): { href: string; trail: string } {
  let href = raw
  let trail = ''
  while (href.length > 8 && /[),.;:!?]$/.test(href)) {
    if (href.endsWith(')')) {
      const open = (href.match(/\(/g) || []).length
      const close = (href.match(/\)/g) || []).length
      if (open >= close) break
    }
    trail = href.slice(-1) + trail
    href = href.slice(0, -1)
  }
  return { href, trail }
}

function listingAnchor(href: string, label?: string): string {
  const external = /^https?:\/\//i.test(href)
  const attrs = external
    ? ' rel="noopener noreferrer" target="_blank"'
    : ' rel="noopener noreferrer"'
  const text = label ?? href.replace(/^mailto:/i, '')
  return `<a href="${href}"${attrs}>${text}</a>`
}

function linkifyPlainUrls(escapedText: string): string {
  return escapedText.replace(BARE_URL_RE, (raw) => {
    const { href, trail } = splitUrlTrailer(raw)
    const decoded = href.replace(/&amp;/g, '&')
    if (!isSafeListingHref(decoded)) return raw
    return `${listingAnchor(decoded)}${trail}`
  })
}

/** Turn bare http(s)/mailto URLs in text nodes into anchors. Leaves existing `<a>` alone. */
export function linkifyBareUrlsInHtml(html: string): string {
  if (!html) return ''
  return html
    .split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi)
    .map((part) => {
      if (/^<a\b/i.test(part)) return part
      return part.replace(/(^|>)([^<]*)/g, (_full, prefix: string, text: string) => {
        return `${prefix}${linkifyPlainUrls(text)}`
      })
    })
    .join('')
}

export function orgCopyLooksLikeHtml(value: string | null | undefined): boolean {
  return /<(p|h[1-6]|ul|ol|li|blockquote|div|br|strong|em|a|img)\b/i.test(value || '')
}

export function orgCopyLooksLikeMarkdown(value: string | null | undefined): boolean {
  const text = (value || '').trim()
  if (!text || orgCopyLooksLikeHtml(text)) return false
  return /(^|\n)\s*#{1,3}\s+\S|^\s*[-*•]\s+\S|\*\*[^*]{1,80}:?\*\*:?/m.test(text)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineMarkdown(value: string): string {
  const escaped = escapeHtml(value)
  const withMarkup = escaped
    .replace(
      /\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^)\s]+)\)/g,
      (_full, label: string, href: string) => {
        const decoded = href.replace(/&amp;/g, '&')
        if (!isSafeListingHref(decoded)) return label
        return listingAnchor(decoded, label)
      },
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  return linkifyBareUrlsInHtml(withMarkup)
}

function listHtml(lines: string[]): string {
  const items = lines
    .map((line) => line.replace(/^[-*•]\s+/, ''))
    .map((line) => `<li>${inlineMarkdown(line)}</li>`)
    .join('')
  return `<ul>${items}</ul>`
}

function matchHeadingLine(line: string): { title: string; body: string } | null {
  const colonInside = line.match(/^\*\*([^*]{1,80}?):\*\*\s*(.*)$/)
  if (colonInside) return { title: colonInside[1]!.trim(), body: (colonInside[2] || '').trim() }
  const colonOutside = line.match(/^\*\*([^*]{1,80}?)\*\*:\s*(.*)$/)
  if (colonOutside) return { title: colonOutside[1]!.trim(), body: (colonOutside[2] || '').trim() }
  const dash = line.match(/^\*\*([^*]{1,80}?)\*\*\s+-\s+(.+)$/)
  if (dash) return { title: dash[1]!.trim(), body: dash[2]!.trim() }
  const alone = line.match(/^\*\*([^*]{1,80}?)\*\*$/)
  if (alone) return { title: alone[1]!.trim(), body: '' }
  const hash = line.match(/^#{1,3}\s+(.+)$/)
  if (!hash) return null
  return { title: hash[1]!.trim(), body: '' }
}

function splitInlineCatalogHeaders(text: string): string {
  return text
    .replace(/\s+(\*\*[^*]{1,80}:\*\*)/g, '\n\n$1 ')
    .replace(/\s+(\*\*[^*]{1,80}\*\*:)/g, '\n\n$1 ')
}

export function orgPlainTextToHtml(text: string): string {
  const normalized = splitInlineCatalogHeaders(text.replace(/\r\n/g, '\n').trim())
  if (!normalized) return ''
  const blocks = normalized.split(/\n{2,}/)
  const html: string[] = []

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    if (!lines.length) continue

    const firstHeading = matchHeadingLine(lines[0]!)
    if (firstHeading) {
      html.push(`<h2>${escapeHtml(firstHeading.title)}</h2>`)
      const rest = firstHeading.body ? [firstHeading.body, ...lines.slice(1)] : lines.slice(1)
      if (!rest.length) continue
      if (rest.every((line) => /^[-*•]\s+/.test(line))) {
        html.push(listHtml(rest))
      } else {
        html.push(`<p>${rest.map((line) => inlineMarkdown(line)).join('<br>')}</p>`)
      }
      continue
    }

    if (lines.every((line) => /^[-*•]\s+/.test(line))) {
      html.push(listHtml(lines))
      continue
    }

    html.push(`<p>${lines.map((line) => inlineMarkdown(line)).join('<br>')}</p>`)
  }

  return html.join('')
}

/** Turn stored markdown or HTML into editor HTML without inventing copy. */
export function orgCopyToEditorHtml(input: string | null | undefined): string {
  const raw = (input || '').trim()
  if (!raw) return ''
  if (orgCopyLooksLikeHtml(raw)) return raw
  return orgPlainTextToHtml(raw)
}

/** Allow org listing markup in Supabase without scripts or handlers. */
export function sanitizeOrgHtml(html: string): string {
  const raw = (html ?? '').trim()
  if (!raw) return ''
  try {
    return String(
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSanitize, orgHtmlSchema)
        .use(rehypeStringify)
        .processSync(raw),
    ).trim()
  } catch (error) {
    console.error('[eckeOrgRichText] sanitizeOrgHtml failed', {
      what: 'strip unsafe listing HTML',
      next: 'store plain text without tags',
      error,
    })
    return raw.replace(/<[^>]+>/g, '').trim()
  }
}

/** Stored markdown or HTML → sanitized HTML for public listing pages. */
export function listingCopyToSafeHtml(input: string | null | undefined): string {
  return sanitizeOrgHtml(linkifyBareUrlsInHtml(orgCopyToEditorHtml(input)))
}

/** Card/meta copy: no tags, no leftover markdown asterisks. */
export function listingCopyToPlainText(input: string | null | undefined): string {
  const html = listingCopyToSafeHtml(input)
  if (!html) return (input || '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim()
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|h2|h3|li|div|blockquote)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\*+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
