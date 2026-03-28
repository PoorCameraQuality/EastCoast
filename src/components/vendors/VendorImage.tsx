'use client'

import Image from 'next/image'
import React, { useState } from 'react'

type VendorImageProps = {
  src?: string | null
  alt: string
  size: 125 | 48
  className?: string
}

const FALLBACK_SRC = '/images/placeholder-logo.svg'

export default function VendorImage({ src, alt, size, className = '' }: VendorImageProps) {
  const [error, setError] = useState(false)
  const resolvedSrc = !src || error ? FALLBACK_SRC : src
  const imageAlt = alt.trim() || 'Vendor or maker listing logo'

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 ${className}`} style={{ width: size, height: size }}>
      <Image
        src={resolvedSrc}
        alt={imageAlt}
        width={size}
        height={size}
        className="h-full w-full object-contain"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  )
}

