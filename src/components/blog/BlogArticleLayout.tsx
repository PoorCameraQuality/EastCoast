import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import Markdown from '@/components/Markdown'
import { normalizeMarkdown } from '@/lib/normalizeMarkdown'
import BlogExplorePlatformSection from '@/components/blog/BlogExplorePlatformSection'
import type { BlogInternalLinksBundle } from '@/lib/blogInternalLinks'
import type { BlogProgrammaticSections } from '@/lib/seo/blogProgrammaticCopy'
import type { BlogPillarSlug } from '@/lib/blogPillarRegistry'
import { getEducationDeepDiveForBlogPillar } from '@/lib/contentCanonicalMap'

type PillarProps = {
  variant: 'pillar'
  pillarSlug: BlogPillarSlug
  title: string
  lead: string
  bodyMarkdown: string
  category?: string
  path: string
  links: BlogInternalLinksBundle
}

type ProgrammaticProps = {
  variant: 'programmatic'
  path: string
  sections: BlogProgrammaticSections
  links: BlogInternalLinksBundle
}

type Props = PillarProps | ProgrammaticProps

export default function BlogArticleLayout(props: Props) {
  const path = props.path
  const educationDeepDiveSlug =
    props.variant === 'pillar' ? getEducationDeepDiveForBlogPillar(props.pillarSlug) : undefined
  const breadcrumbItems =
    props.variant === 'pillar'
      ? [
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: props.title, href: path, current: true },
        ]
      : [
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: props.sections.h1, href: path, current: true },
        ]

  return (
    <div className="min-h-screen bg-black">
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <Breadcrumb items={breadcrumbItems} />
          <Link
            href="/blog"
            className="inline-flex min-h-touch items-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors mt-2"
          >
            ← Back to Blog
          </Link>

          {props.variant === 'pillar' ? (
            <article className="mt-8">
              {props.category ? (
                <p className="text-sm uppercase tracking-wide text-primary-400 mb-3">{props.category}</p>
              ) : null}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                {props.title}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-10">{props.lead}</p>
              {educationDeepDiveSlug ? (
                <p className="text-sm text-primary-300/90 mb-8 rounded-lg border border-primary-500/25 bg-primary-500/5 px-4 py-3">
                  <Link
                    href={`/education/${educationDeepDiveSlug}`}
                    className="underline underline-offset-2 hover:text-primary-200"
                  >
                    Go deeper: related long-form article in the education library
                  </Link>
                </p>
              ) : null}
              <div className="prose prose-invert prose-lg max-w-none">
                <Markdown content={normalizeMarkdown(props.bodyMarkdown)} />
              </div>
            </article>
          ) : (
            <article className="mt-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                {props.sections.h1}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-10">{props.sections.lead}</p>

              <h2 className="text-xl font-serif font-semibold text-white mt-10 mb-4">Introduction</h2>
              <div className="prose prose-invert prose-lg max-w-none space-y-4 text-gray-300">
                {props.sections.intro.map((p, i) => (
                  <InlineBoldParagraph key={i} text={p} />
                ))}
              </div>

              <h2 className="text-xl font-serif font-semibold text-white mt-12 mb-4">Main topics</h2>
              <div className="prose prose-invert prose-lg max-w-none space-y-4 text-gray-300">
                {props.sections.main.map((p, i) => (
                  <InlineBoldParagraph key={i} text={p} />
                ))}
              </div>

              <h2 className="text-xl font-serif font-semibold text-white mt-12 mb-4">Practical advice</h2>
              <div className="prose prose-invert prose-lg max-w-none space-y-4 text-gray-300">
                {props.sections.practical.map((p, i) => (
                  <InlineBoldParagraph key={i} text={p} />
                ))}
              </div>

              <h2 className="text-xl font-serif font-semibold text-white mt-12 mb-4">Next steps</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{props.sections.cta}</p>
            </article>
          )}

          <BlogExplorePlatformSection bundle={props.links} />
        </div>
      </section>
    </div>
  )
}

/** Turn `**text**` into bold for programmatic paragraphs (content is authored by us). */
function formatInlineBold(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

function InlineBoldParagraph({ text }: { text: string }) {
  // eslint-disable-next-line react/no-danger -- trusted programmatic copy only
  return <p dangerouslySetInnerHTML={{ __html: formatInlineBold(text) }} />
}
