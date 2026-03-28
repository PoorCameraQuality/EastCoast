'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface EventLogoProps {
  src: string
  alt: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function EventLogo({ src, alt, size = 'medium', className = '' }: EventLogoProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    small: {
      container: 'h-16 lg:h-24 bg-transparent rounded p-2',
      image: 'max-h-12 lg:max-h-20 max-w-10 lg:max-w-32 xl:max-w-40' // Much bigger on desktop
    },
    medium: {
      container: 'h-24 lg:h-32 bg-transparent rounded p-3',
      image: 'max-h-20 lg:max-h-28 max-w-14 lg:max-w-40 xl:max-w-48' // Much bigger on desktop
    },
    large: {
      container: 'h-32 lg:h-40 bg-transparent rounded p-4',
      image: 'max-h-28 lg:max-h-36 max-w-18 lg:max-w-48 xl:max-w-56' // Much bigger on desktop
    }
  }

  const { container, image } = sizeClasses[size]
  const imageAlt = alt.trim() || 'Kink event listing logo'

  // Handle image load error
  const handleImageError = () => {
    setImageError(true)
  }

  // If image failed to load, show a placeholder
  if (imageError) {
    return (
      <div className={`flex justify-center items-center ${container} ${className}`}>
        <div className={`flex items-center justify-center bg-gray-700 rounded-xl ${image} w-full`}>
          <Image 
            src="/images/placeholder-logo.svg" 
            role="img"
            alt="Placeholder event logo - image could not be loaded"
            width={48}
            height={48}
            className="object-contain"
            loading="lazy"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-center items-center ${container} ${className}`}>
      <Image 
        src={src} 
        alt={imageAlt}
        width={200}
        height={200}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-contain rounded-xl ${image}`}
        onError={handleImageError}
        loading={size === 'large' ? 'eager' : 'lazy'}
        priority={size === 'large'} // Only prioritize large images
      />
    </div>
  )
}

