import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm) // tables, strikethrough, task lists, etc.
    .use(html)
    .process(markdown)
  
  return String(result)
}

// Helper function to strip the first H1 if it exists (to avoid double H1s)
export function stripFirstH1(markdown: string): string {
  const lines = markdown.split('\n')
  if (lines[0]?.startsWith('# ')) {
    return lines.slice(1).join('\n')
  }
  return markdown
}
