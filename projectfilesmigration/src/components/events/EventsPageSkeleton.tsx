/**
 * Skeleton layout for the events page. Mirrors EventsPageClient structure
 * to minimize layout shift when real content loads (CLS optimization).
 */
export default function EventsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
      {/* Subtle background elements - same as EventsPageClient */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-1/4 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      <div className="container-custom py-16 relative z-10">
        {/* Breadcrumb placeholder */}
        <nav aria-label="Breadcrumb" className="text-sm text-gray-300 flex gap-2 mb-4">
          <span className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          <span className="h-4 w-2 bg-white/10 rounded" />
          <span className="h-4 w-14 bg-white/10 rounded animate-pulse" />
        </nav>

        {/* Support CTA inline placeholder */}
        <div className="h-6 w-48 bg-white/5 rounded mb-6 animate-pulse" />

        {/* Header section */}
        <div className="text-center mb-16">
          <div className="h-12 md:h-14 w-48 mx-auto mb-6 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-5 w-72 max-w-full mx-auto mb-8 bg-white/5 rounded animate-pulse" />

          {/* Search box placeholder */}
          <div className="max-w-md mx-auto mb-8">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Contact link placeholder */}
          <div className="h-12 w-40 mx-auto mb-8 bg-primary-600/20 rounded-full animate-pulse" />
        </div>

        {/* Filter section */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-28 bg-white/10 rounded-full animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        </div>

        {/* Upcoming Events section */}
        <div className="mb-12">
          <div className="text-center">
            <div className="h-9 md:h-10 w-56 mx-auto mb-4 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-5 w-80 max-w-full mx-auto bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        {/* Mobile: card placeholders */}
        <div className="md:hidden space-y-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6"
              aria-hidden
            >
              <div className="flex justify-center mb-6">
                <div className="h-32 w-32 bg-white/5 rounded-2xl animate-pulse" />
              </div>
              <div className="h-6 w-20 mx-auto mb-4 bg-white/5 rounded-full animate-pulse" />
              <div className="h-6 w-3/4 mx-auto mb-3 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-24 mx-auto mb-3 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-32 mx-auto mb-4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Desktop: grid placeholders */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 h-[480px] p-6 flex flex-col"
              aria-hidden
            >
              <div className="mb-6 flex-shrink-0">
                <div className="h-24 w-24 bg-white/5 rounded-2xl animate-pulse" />
              </div>
              <div className="mb-4 h-6 w-20 bg-white/5 rounded-full animate-pulse flex-shrink-0" />
              <div className="mb-3 h-6 w-full bg-white/10 rounded animate-pulse flex-shrink-0" />
              <div className="mb-3 h-4 w-24 bg-white/5 rounded animate-pulse flex-shrink-0" />
              <div className="mb-4 h-4 w-32 bg-white/5 rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 min-h-0">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Past Events section */}
        <div className="mb-12">
          <div className="text-center">
            <div className="h-9 md:h-10 w-40 mx-auto mb-4 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-5 w-80 max-w-full mx-auto bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        {/* Mobile: past events cards */}
        <div className="md:hidden space-y-6 mb-12">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 opacity-80"
              aria-hidden
            >
              <div className="flex justify-center mb-6">
                <div className="h-32 w-32 bg-white/5 rounded-2xl animate-pulse" />
              </div>
              <div className="h-6 w-20 mx-auto mb-4 bg-white/5 rounded-full animate-pulse" />
              <div className="h-6 w-3/4 mx-auto mb-3 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Desktop: past events grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 h-[480px] p-6 flex flex-col opacity-80"
              aria-hidden
            >
              <div className="mb-6 flex-shrink-0">
                <div className="h-24 w-24 bg-white/5 rounded-2xl animate-pulse" />
              </div>
              <div className="mb-4 h-6 w-20 bg-white/5 rounded-full animate-pulse flex-shrink-0" />
              <div className="mb-3 h-6 w-full bg-white/5 rounded animate-pulse flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
