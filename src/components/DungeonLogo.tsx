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
      container: 'h-24 lg:h-32 bg-transparent rounded-xl p-2',
      image: 'max-h-20 lg:max-h-28 max-w-14 lg:max-w-32 xl:max-w-40' // Much bigger on desktop
    },
    medium: {
      container: 'h-40 lg:h-48 bg-transparent rounded-xl p-3',
      image: 'max-h-36 lg:max-h-44 max-w-18 lg:max-w-40 xl:max-w-48' // Much bigger on desktop
    },
    large: {
      container: 'h-48 lg:h-56 bg-transparent rounded-xl p-4',
      image: 'max-h-44 lg:max-h-52 max-w-22 lg:max-w-48 xl:max-w-56' // Much bigger on desktop
    }
  }

  const { container, image } = sizeClasses[size]
  const imageAlt = alt.trim() || 'BDSM dungeon listing logo'

  return (
    <div className={`flex justify-center items-center ${container} ${className}`}>
      <Image 
        src={src} 
        alt={imageAlt}
        width={200}
        height={200}
        sizes="100vw"
        className={`object-contain rounded-xl ${image}`}
        loading={size === 'large' ? 'eager' : 'lazy'}
        priority={size === 'large'} // Only prioritize large images
      />
    </div>
  )
}
