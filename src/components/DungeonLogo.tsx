import React from 'react'
import Link from 'next/link'

interface DungeonLogoProps {
  src: string
  alt: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function DungeonLogo({ src, alt, size = 'medium', className = '' }: DungeonLogoProps) {
  const sizeClasses = {
    small: {
      container: 'h-24 bg-transparent rounded-xl p-2',
      image: 'max-h-20'
    },
    medium: {
      container: 'h-40 bg-transparent rounded-xl p-3',
      image: 'max-h-36'
    },
    large: {
      container: 'h-48 bg-transparent rounded-xl p-4',
      image: 'max-h-44'
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
