'use client'

import EckeLink from '@/components/EckeLink'
import VendorImage from '@/components/vendors/VendorImage'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { getVendorCardPreviewText, type VendorRecord } from '@/lib/vendorFiltering'
import type { StorefrontDungeon, StorefrontEducationGuide } from '@/lib/homepageStorefrontData'

import type { ReactNode } from 'react'

type Props = {
  vendors: VendorRecord[]
  dungeons: StorefrontDungeon[]
  guides: StorefrontEducationGuide[]
}

function Shelf({
  title,
  href,
  cta,
  accentClass,
  children,
}: {
  title: string
  href: string
  cta: string
  accentClass: string
  children: ReactNode
}) {
  return (
    <div className="sf-shelf">
      <div className="sf-shelf-header">
        <h3 className={`sf-shelf-title ${accentClass}`}>{title}</h3>
        <EckeLink href={href} className="sf-shelf-cta">
          {cta} →
        </EckeLink>
      </div>
      <ul className="sf-shelf-grid">{children}</ul>
    </div>
  )
}

const GUIDE_GRADIENTS = [
  'from-violet-900/80 via-indigo-950/90 to-sf-bg',
  'from-sky-900/70 via-slate-900/90 to-sf-bg',
  'from-emerald-900/60 via-slate-950/90 to-sf-bg',
] as const

export default function ExploreEcosystemSection({ vendors, dungeons, guides }: Props) {
  return (
    <section className="sf-section-tight bg-sf-surface/40" aria-labelledby="explore-ecosystem-title">
      <div className="container-custom">
        <h2 id="explore-ecosystem-title" className="sf-title">
          Explore the ecosystem
        </h2>
        <p className="sf-subhead">Makers, spaces, and guides — three lanes into the scene.</p>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <Shelf title="Maker market" href="/vendors" cta="All vendors" accentClass="text-sf-warm">
            {vendors.slice(0, 3).map((v) => (
              <li key={v.slug}>
                <EckeLink
                  href={`/vendors/${v.slug}`}
                  className="sf-vendor-shelf-card sf-card-lift"
                  onClick={() =>
                    trackSelectItemEntity({
                      entityType: 'vendor',
                      slug: v.slug,
                      name: v.name,
                      itemListName: 'home_ecosystem_vendors',
                    })
                  }
                >
                  <div className="sf-vendor-shelf-media">
                    <VendorImage src={v.logo125Url} alt={v.name} size={125} className="sf-vendor-shelf-logo" />
                  </div>
                  <div className="sf-vendor-shelf-body">
                    <p className="sf-vendor-shelf-name">{v.name}</p>
                    <p className="sf-vendor-shelf-detail">
                      {getVendorCardPreviewText({ vendor: v, maxSentences: 1 })}
                    </p>
                  </div>
                </EckeLink>
              </li>
            ))}
          </Shelf>

          <Shelf title="Spaces worth knowing" href="/dungeons" cta="All spaces" accentClass="text-sf-blue">
            {dungeons.slice(0, 3).map((d, i) => (
              <li key={d.slug}>
                <EckeLink
                  href={`/dungeons/${d.slug}`}
                  className="sf-space-shelf-card sf-card-lift"
                  onClick={() =>
                    trackSelectItemEntity({
                      entityType: 'dungeon',
                      slug: d.slug,
                      name: d.name,
                      itemListName: 'home_ecosystem_spaces',
                    })
                  }
                >
                  <div className={`sf-space-shelf-visual sf-space-shelf-visual-${(i % 3) + 1}`}>
                    <span className="sf-space-pin" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path
                          d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="12" cy="11" r="2" fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                  <div className="sf-space-shelf-body">
                    <p className="sf-space-shelf-name">{d.name}</p>
                    <p className="sf-space-shelf-location">
                      {d.location.city}, {d.location.state}
                    </p>
                  </div>
                </EckeLink>
              </li>
            ))}
          </Shelf>

          <Shelf title="Before you go" href="/education" cta="All guides" accentClass="text-sf-fresh">
            {guides.slice(0, 3).map((g, i) => (
              <li key={g.title}>
                <EckeLink href={g.href} className="sf-guide-shelf-card sf-card-lift">
                  <div className={`sf-guide-cover bg-gradient-to-br ${GUIDE_GRADIENTS[i % 3]}`}>
                    <span className="sf-guide-spine" aria-hidden />
                    <span className="sf-guide-topic">{g.topic}</span>
                  </div>
                  <p className="sf-guide-title">{g.title}</p>
                </EckeLink>
              </li>
            ))}
          </Shelf>
        </div>
      </div>
    </section>
  )
}
