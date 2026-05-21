type Props = {
  h1: string
  paragraphs: string[]
  summaryLabel?: string
}

export default function SeoIntroCollapsible({
  h1,
  paragraphs,
  summaryLabel = 'About this region',
}: Props) {
  const [first, ...rest] = paragraphs

  return (
    <header className="mb-8 md:mb-10">
      <h1 className="mb-4 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
        <span className="bg-gradient-to-r from-white via-primary-100 to-cyan-200/90 bg-clip-text text-transparent">
          {h1}
        </span>
      </h1>
      {first ? (
        <p className="max-w-none text-base leading-relaxed text-gray-300 line-clamp-4 md:line-clamp-none">
          {first}
        </p>
      ) : null}
      {rest.length > 0 ? (
        <details className="group mt-4">
          <summary className="flex min-h-touch cursor-pointer list-none items-center text-sm font-medium text-primary-400 underline-offset-2 hover:text-primary-300 hover:underline [&::-webkit-details-marker]:hidden">
            <span className="mr-2 inline-block transition group-open:rotate-90" aria-hidden>
              ▶
            </span>
            {summaryLabel}
          </summary>
          <div className="mt-3 space-y-4 text-base leading-relaxed text-gray-400">
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </details>
      ) : null}
    </header>
  )
}
