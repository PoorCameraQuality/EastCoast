/** Detect TipTap / rich-text HTML vs legacy markdown articles. */
export function isArticleContentHtml(content: string | null | undefined): boolean {
  const trimmed = (content ?? '').trim()
  if (!trimmed) return false
  return /<(p|h[1-6]|div|ul|ol|li|br|img|blockquote|figure|strong|em)\b/i.test(trimmed)
}
