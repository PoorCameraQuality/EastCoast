import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { BLOG_PILLAR_SLUGS, type BlogPillarSlug } from '@/lib/blogPillarRegistry'

export type BlogPillarFrontmatter = {
  slug: string
  title: string
  focusKeyword: string
  description: string
  category?: string
  /** ISO date YYYY-MM-DD for JSON-LD */
  datePublished?: string
}

export type LoadedBlogPillar = BlogPillarFrontmatter & {
  bodyMarkdown: string
}

/** Minimal YAML frontmatter parser (key: value lines). */
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const trimmed = raw.trimStart()
  if (!trimmed.startsWith('---')) {
    return { meta: {}, body: raw }
  }
  const end = trimmed.indexOf('\n---', 3)
  if (end === -1) {
    return { meta: {}, body: raw }
  }
  const block = trimmed.slice(3, end).trim()
  const body = trimmed.slice(end + 4).trimStart()
  const meta: Record<string, string> = {}
  for (const line of block.split('\n')) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/)
    if (m) meta[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
  return { meta, body }
}

export function loadBlogPillar(slug: BlogPillarSlug): LoadedBlogPillar | null {
  const file = path.join(process.cwd(), 'src', 'content', 'blog', 'pillars', `${slug}.md`)
  if (!existsSync(file)) return null
  const raw = readFileSync(file, 'utf8')
  const { meta, body } = parseFrontmatter(raw)
  const title = meta.title || slug
  const focusKeyword = meta.focusKeyword || meta.focus_keyword || title
  const description = meta.description || ''
  const category = meta.category
  const datePublished = meta.datePublished || meta.date_published
  if (meta.slug && meta.slug !== slug) {
    return null
  }
  return {
    slug,
    title,
    focusKeyword,
    description,
    category,
    datePublished,
    bodyMarkdown: body,
  }
}

export function getAllBlogPillarSlugs(): BlogPillarSlug[] {
  return [...BLOG_PILLAR_SLUGS]
}
