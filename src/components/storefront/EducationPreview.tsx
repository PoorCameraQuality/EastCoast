import Link from 'next/link'
import type { StorefrontEducationGuide } from '@/lib/homepageStorefrontData'

type Props = {
  guides: StorefrontEducationGuide[]
}

export default function EducationPreview({ guides }: Props) {
  return (
    <section className="sf-section bg-sf-surface/50" aria-labelledby="education-preview-title">
      <div className="container-custom">
        <div className="mb-ecke-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sf-eyebrow">Before you go</p>
            <h2 id="education-preview-title" className="font-serif sf-title">
              Guides for showing up prepared.
            </h2>
          </div>
          <Link href="/education" className="sf-btn-ghost">
            All education
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.title}>
              <Link
                href={guide.href}
                className="sf-card-lift group flex h-full flex-col rounded-2xl border border-sf-border bg-sf-raised/50 p-5 md:p-6"
              >
                <span className="inline-flex w-fit rounded-full border border-sf-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sf-muted">
                  {guide.topic}
                </span>
                <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-sf-strong group-hover:text-sf-gold">
                  {guide.title}
                </h3>
                <span className="mt-auto pt-4 text-sm text-sf-gold">Read guide →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
