'use client'

import Image from 'next/image'
import { useState } from 'react'
import VendorImage from '@/components/vendors/VendorImage'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendor: PublicVendorListing
  size?: 'card' | 'masthead'
}

function VendorLogoStage({
  logoUrl,
  name,
  size,
}: {
  logoUrl?: string
  name: string
  size: 'card' | 'masthead'
}) {
  const [error, setError] = useState(false)
  const isMasthead = size === 'masthead'

  if (!logoUrl || error) {
    return (
      <span className={`vendor-logo-initial ${isMasthead ? 'vendor-logo-initial-masthead' : ''}`} aria-hidden>
        {name.slice(0, 1)}
      </span>
    )
  }

  return (
    <div className="vendor-logo-stage">
      <Image
        src={logoUrl}
        alt=""
        aria-hidden
        width={640}
        height={360}
        className="vendor-logo-ghost"
        sizes={isMasthead ? '640px' : '400px'}
        onError={() => setError(true)}
      />
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={640}
        height={360}
        className={isMasthead ? 'vendor-logo-hero' : 'vendor-logo-card'}
        sizes={isMasthead ? '640px' : '400px'}
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function VendorMediaStage({ vendor, size = 'card' }: Props) {
  const isMasthead = size === 'masthead'
  const cover = vendor.coverImageUrl
  const products = vendor.featuredProducts?.filter((p) => p.publicSafe && p.imageUrl) ?? []

  if (cover) {
    return (
      <div className={`vendor-media-stage ${isMasthead ? 'vendor-media-stage-masthead' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" className="vendor-media-cover" loading={isMasthead ? 'eager' : 'lazy'} />
        {products.length > 1 ? (
          <div className="vendor-media-stack">
            {products.slice(1, 3).map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.imageUrl} alt="" className="vendor-media-stack-thumb" loading="lazy" />
            ))}
          </div>
        ) : null}
        {vendor.logoUrl ? (
          <div className="vendor-media-logo-badge">
            <VendorImage src={vendor.logoUrl} alt="" size={48} />
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`vendor-logo-aura ${isMasthead ? 'vendor-logo-aura-masthead' : ''}`}>
      <VendorLogoStage logoUrl={vendor.logoUrl} name={vendor.name} size={size} />
    </div>
  )
}
