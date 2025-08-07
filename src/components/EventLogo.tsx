'use client'

import React, { useState } from 'react'
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
      image: 'max-h-12 max-w-16 md:max-w-none' // Added max-width for mobile
    },
    medium: {
      container: 'h-24 bg-transparent rounded p-3',
      image: 'max-h-20 max-w-20 md:max-w-none' // Added max-width for mobile
    },
    large: {
      container: 'h-32 bg-transparent rounded p-4',
      image: 'max-h-28 max-w-24 md:max-w-none' // Added max-width for mobile
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
          <img 
            src="/images/placeholder-logo.svg" 
            alt="Event placeholder"
            className="max-w-full object-contain"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-center items-center ${container} ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className={`object-contain rounded-xl ${image}`}
        style={{
          width: 'auto',
          height: 'auto'
        }}
        onError={handleImageError}
      />
    </div>
  )
}

