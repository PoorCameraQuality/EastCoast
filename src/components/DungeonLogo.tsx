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
      container: 'h-24 bg-transparent rounded-xl p-2',
      image: 'max-h-20 max-w-14 md:max-w-24' // More generous desktop width
    },
    medium: {
      container: 'h-40 bg-transparent rounded-xl p-3',
      image: 'max-h-36 max-w-18 md:max-w-32' // More generous desktop width
    },
    large: {
      container: 'h-48 bg-transparent rounded-xl p-4',
      image: 'max-h-44 max-w-22 md:max-w-36' // More generous desktop width
    }
  }

  const { container, image } = sizeClasses[size]

  return (
    <div className={`flex justify-center items-center ${container} ${className}`}>
      <Image 
        src={src} 
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className={`object-contain rounded-xl ${image}`}
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  )
}
