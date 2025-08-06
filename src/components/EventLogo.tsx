import React from 'react'
import Link from 'next/link'

interface EventLogoProps {
  src: string
  alt: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function EventLogo({ src, alt, size = 'medium', className = '' }: EventLogoProps) {
  const sizeClasses = {
    small: {
      container: 'h-16 bg-transparent rounded p-2',
      image: 'max-h-12'
    },
    medium: {
      container: 'h-24 bg-transparent rounded p-3',
      image: 'max-h-20'
    },
    large: {
      container: 'h-32 bg-transparent rounded p-4',
      image: 'max-h-28'
    }
  }

  const { container, image } = sizeClasses[size]

  return (
    <div className={`flex justify-center items-center ${container} ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className={`max-w-full object-contain rounded-xl ${image}`}
        style={{
          width: 'auto',
          height: 'auto'
        }}
      />
    </div>
  )
}

