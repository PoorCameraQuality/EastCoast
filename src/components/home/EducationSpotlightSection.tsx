import Link from 'next/link'
import { getAllArticles, getFeaturedArticles } from '@/data/education'

export default function EducationSpotlightSection() {
  const featured = getFeaturedArticles()
  const articles = (featured.length > 0 ? featured : getAllArticles()).slice(0, 3)

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black relative overflow-hidden" aria-labelledby="education-spotlight-title">
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">Read</p>
            <h2 id="education-spotlight-title" className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">
              Education picks
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
              Featured articles when set; otherwise a small starter set. The hub has categories and shareable filter
              links.
            </p>
          </div>
          <Link href="/education" className="btn-outline text-sm px-5 py-2 whitespace-nowrap min-h-touch inline-flex items-center justify-center w-full sm:w-auto md:w-auto" aria-label="Browse education resources">
            Browse Education
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/education/${article.slug}`}
              className="group"
              aria-label={`Read article: ${article.title}`}
            >
              <article className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 transition-colors duration-500 md:hover:scale-[1.02] motion-reduce:md:hover:scale-100 hover:border-primary-400/25 hover:shadow-elegant-lg min-h-touch flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-primary-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-xl font-serif font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-300 transition-colors duration-300">
                    {article.title}
                  </h3>
                  <div className="text-sm text-gray-400 mb-4">
                    <span className="text-gray-300">{article.author?.name}</span>
                    {article.readTime ? <span className="text-gray-500"> • {article.readTime}</span> : null}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
                    {article.excerpt || article.seo?.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-primary-300 font-semibold">
                    <span>Read More</span>
                    <svg className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

