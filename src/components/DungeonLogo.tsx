import React from 'react'
import Image from 'next/image'
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
      container: 'h-24 w-24 bg-transparent rounded-xl p-2',
      image: 'max-h-20 max-w-16 md:max-w-none' // More restrictive width for mobile
    },
    medium: {
      container: 'h-40 w-40 bg-transparent rounded-xl p-3',
      image: 'max-h-36 max-w-20 md:max-w-none' // More restrictive width for mobile
    },
    large: {
      container: 'h-48 w-48 bg-transparent rounded-xl p-4',
      image: 'max-h-44 max-w-24 md:max-w-none' // More restrictive width for mobile
    }
  }

  const { container, image } = sizeClasses[size]

  return (
    <div className={`flex justify-center items-center ${container} ${className}`}>
      <div className="relative w-full h-full">
        <Image 
          src={src} 
          alt={alt}
          fill
          className={`object-contain rounded-xl ${image}`}
        />
      </div>
    </div>
  )
}
