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
      container: 'h-16 bg-transparent rounded p-2',
      image: 'max-h-12 max-w-10 md:max-w-20' // More generous desktop width
    },
    medium: {
      container: 'h-24 bg-transparent rounded p-3',
      image: 'max-h-20 max-w-14 md:max-w-28' // More generous desktop width
    },
    large: {
      container: 'h-32 bg-transparent rounded p-4',
      image: 'max-h-28 max-w-18 md:max-w-32' // More generous desktop width
    }
  }

  const { container, image } = sizeClasses[size]

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
            alt="Event placeholder"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-center items-center ${container} ${className}`}>
      <Image 
        src={src} 
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className={`object-contain rounded-xl ${image}`}
        onError={handleImageError}
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  )
}

