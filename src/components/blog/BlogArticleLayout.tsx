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
  programmaticStats: { count: number; regionLabel: string } | null
}

type Props = PillarProps | ProgrammaticProps

const PROGRAMMATIC_TOC = [
  { href: '#blog-intro', label: 'Introduction', short: 'Intro' },
  { href: '#blog-main', label: 'Main topics', short: 'Topics' },
  { href: '#blog-practical', label: 'Practical advice', short: 'Practical' },
  { href: '#blog-next', label: 'Next steps', short: 'Next' },
  { href: '#blog-explore', label: 'Explore listings', short: 'Listings' },
] as const

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

  const containerClass =
    props.variant === 'programmatic' ? 'container-custom max-w-5xl' : 'container-custom max-w-3xl'

  return (
    <div className="min-h-screen bg-black">
      <section className="section-padding">
        <div className={containerClass}>
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
            <article className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_11.25rem] lg:gap-10 lg:items-start">
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                  {props.sections.h1}
                </h1>
                {props.programmaticStats ? (
                  <p className="text-sm text-gray-400 mb-6">
                    Currently listing{' '}
                    <span className="text-primary-400 font-medium tabular-nums">
                      {props.programmaticStats.count}
                    </span>{' '}
                    upcoming {props.programmaticStats.count === 1 ? 'event' : 'events'} in{' '}
                    {props.programmaticStats.regionLabel} on our calendar (static + published listings).
                  </p>
                ) : null}
                <p className="text-lg text-gray-300 leading-relaxed mb-8">{props.sections.lead}</p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
                  <Link
                    href={props.links.ctaHref}
                    className="btn-primary min-h-touch inline-flex items-center justify-center px-6 py-3 text-base"
                  >
                    {props.links.ctaLabel}
                  </Link>
                  <Link
                    href="/events"
                    className="btn-secondary min-h-touch inline-flex items-center justify-center px-6 py-3 text-base"
                  >
                    Browse all events
                  </Link>
                </div>

                <nav
                  className="lg:hidden flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-primary-300/95 mb-10 pb-6 border-b border-gray-800"
                  aria-label="On this page"
                >
                  {PROGRAMMATIC_TOC.map((item, i) => (
                    <span key={item.href} className="inline-flex items-center gap-x-3">
                      {i > 0 ? <span className="text-gray-600" aria-hidden>·</span> : null}
                      <Link
                        href={item.href}
                        className="hover:text-primary-200 underline-offset-2 hover:underline"
                      >
                        {item.short}
                      </Link>
                    </span>
                  ))}
                </nav>

                <section
                  id="blog-intro"
                  className="scroll-mt-24 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 mb-10"
                >
                  <h2 className="text-xl font-serif font-semibold text-white mt-0 mb-4">Introduction</h2>
                  <div className="prose prose-invert prose-lg max-w-none space-y-4 text-gray-300">
                    {props.sections.intro.map((p, i) => (
                      <InlineBoldParagraph key={i} text={p} />
                    ))}
                  </div>
                </section>

                <section
                  id="blog-main"
                  className="scroll-mt-24 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 mb-10"
                >
                  <h2 className="text-xl font-serif font-semibold text-white mt-0 mb-4">Main topics</h2>
                  <div className="prose prose-invert prose-lg max-w-none space-y-4 text-gray-300">
                    {props.sections.main.map((p, i) => (
                      <InlineBoldParagraph key={i} text={p} />
                    ))}
                  </div>
                </section>

                <section
                  id="blog-practical"
                  className="scroll-mt-24 rounded-xl border border-primary-500/25 bg-primary-500/[0.06] p-5 sm:p-6 mb-10"
                >
                  <h2 className="text-xl font-serif font-semibold text-white mt-0 mb-4">Practical advice</h2>
                  <ul className="list-none space-y-4 m-0 p-0 text-gray-300 text-base leading-relaxed">
                    {props.sections.practical.map((p, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="shrink-0 w-6 h-6 rounded-md bg-primary-500/30 border border-primary-400/40 text-primary-200 text-xs font-bold flex items-center justify-center mt-0.5"
                          aria-hidden
                        >
                          {i + 1}
                        </span>
                        <InlineBoldParagraph text={p} className="flex-1 m-0" />
                      </li>
                    ))}
                  </ul>
                </section>

                <section
                  id="blog-next"
                  className="scroll-mt-24 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 mb-10"
                >
                  <h2 className="text-xl font-serif font-semibold text-white mt-0 mb-4">Next steps</h2>
                  <p className="text-gray-300 leading-relaxed text-lg m-0">{props.sections.cta}</p>
                </section>
              </div>

              <aside className="hidden lg:block pt-2">
                <nav
                  className="sticky top-24 text-sm rounded-xl border border-white/10 bg-white/[0.02] p-4"
                  aria-label="On this page"
                >
                  <p className="text-primary-400 font-semibold mb-3 text-xs uppercase tracking-wide">
                    On this page
                  </p>
                  <ul className="space-y-2.5 list-none m-0 p-0">
                    {PROGRAMMATIC_TOC.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-gray-400 hover:text-primary-300 transition-colors underline-offset-2 hover:underline"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            </article>
          )}

          <section id="blog-explore" className={props.variant === 'programmatic' ? 'scroll-mt-24' : undefined}>
            <BlogExplorePlatformSection bundle={props.links} />
          </section>
        </div>
      </section>
    </div>
  )
}

/** Turn `**text**` into bold for programmatic paragraphs (content is authored by us). */
function formatInlineBold(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

function InlineBoldParagraph({ text, className = '' }: { text: string; className?: string }) {
  // eslint-disable-next-line react/no-danger -- trusted programmatic copy only
  return (
    <p
      className={className}
      dangerouslySetInnerHTML={{ __html: formatInlineBold(text) }}
    />
  )
}
