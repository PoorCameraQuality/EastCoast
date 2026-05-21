type Social = Record<string, string | undefined>

const LABELS: Record<string, string> = {
  fetlife: 'FetLife',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  youtube: 'YouTube',
}

export default function VenueSocialLinks({
  name,
  socialMedia,
}: {
  name: string
  socialMedia?: Social
}) {
  if (!socialMedia) return null
  const entries = Object.entries(socialMedia).filter(([, url]) => Boolean(url))
  if (entries.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-white">Follow</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {entries.map(([key, url]) => (
          <a
            key={key}
            href={url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-touch items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-gray-300 transition hover:border-primary-400/30 hover:text-white"
            aria-label={`${name} on ${LABELS[key] || key}`}
          >
            {LABELS[key] || key}
          </a>
        ))}
      </div>
    </div>
  )
}
