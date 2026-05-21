import { getCategoryColorClass } from '@/lib/educationCategoryColors'

export type ExternalResource = {
  id: string
  title: string
  url: string
  source: string
  teaser: string
  category: string
}

interface ExternalResourceCardProps {
  resource: ExternalResource
}

export default function ExternalResourceCard({ resource }: ExternalResourceCardProps) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
      aria-label={`${resource.title} — read on ${resource.source} (opens in new tab)`}
    >
      <div className="card-elegant group/card relative h-full overflow-hidden border border-dark-600 transition-all duration-300 hover:border-violet-500/50 hover:shadow-xl motion-safe:md:hover:scale-[1.02] motion-reduce:hover:scale-100">
        <div className="relative p-6 pb-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium text-white shadow-lg ${getCategoryColorClass(resource.category)}`}
            >
              {resource.category}
            </span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
              External
            </span>
          </div>

          <h3 className="mb-3 line-clamp-2 font-serif text-xl font-bold text-white transition-colors group-hover:text-violet-300">
            {resource.title}
          </h3>

          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-subtle">{resource.teaser}</p>
        </div>

        <div className="mt-auto px-6 pb-6">
          <div className="flex items-center justify-between border-t border-dark-600 pt-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-800">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-white">{resource.source}</div>
                <div className="text-xs text-gray-400">Opens in new tab</div>
              </div>
            </div>
            <span className="text-xs font-medium text-violet-300 transition-colors group-hover:text-violet-200">
              Read →
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-violet-900/0 to-violet-900/0 transition-all duration-300 group-hover:from-violet-900/10 group-hover:to-violet-900/5" />
      </div>
    </a>
  )
}
