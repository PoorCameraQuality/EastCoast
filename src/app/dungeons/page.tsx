'use client'

import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import Link from 'next/link'
import DungeonLogo from '@/components/DungeonLogo'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'

export default function DungeonsPage() {
  const allDungeons = getAllDungeons()
  const allEvents = getAllEvents()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            BDSM Dungeons
          </h1>
          <p className="text-lg text-subtle max-w-3xl mx-auto mb-8">
            Discover BDSM dungeons and kink spaces across the East Coast. Find private sessions, workshops, and community events.
          </p>
          
          {/* Search Component */}
          <div className="max-w-md mx-auto mb-8">
            <Search 
              events={allEvents}
              dungeons={allDungeons}
              placeholder="Search dungeons..."
            />
          </div>
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory mb-8">
          {allDungeons.map((dungeon) => (
            <Link key={dungeon.id} href={`/dungeons/${dungeon.slug}`} className="block">
              <div className="card-elegant hover-lift group flex-shrink-0 w-80 snap-start cursor-pointer">
                {/* Dungeon Logo */}
                {dungeon.logo && (
                  <div className="mb-6">
                    <DungeonLogo 
                      src={dungeon.logo} 
                      alt={`${dungeon.name} logo`}
                      size="medium"
                    />
                  </div>
                )}
                
                <h3 className="text-xl font-serif font-semibold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                  {dungeon.name}
                </h3>
                
                <p className="text-sm text-subtle mb-4">
                  📍 {dungeon.location.city}, {dungeon.location.state}
                </p>
                
                <p className="text-sm text-subtle mb-6 leading-relaxed">
                  {dungeon.excerpt}
                </p>
                
                <div className="flex gap-3">
                  <a 
                    href={dungeon.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 font-medium text-sm border-b border-primary-600 hover:border-primary-500 transition-all duration-300 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Desktop: Grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allDungeons.map((dungeon) => (
            <Link key={dungeon.id} href={`/dungeons/${dungeon.slug}`} className="block">
              <div className="card-elegant hover-lift group cursor-pointer">
                {/* Dungeon Logo */}
                {dungeon.logo && (
                  <div className="mb-6">
                    <DungeonLogo 
                      src={dungeon.logo} 
                      alt={`${dungeon.name} logo`}
                      size="medium"
                    />
                  </div>
                )}
                
                <h3 className="text-xl font-serif font-semibold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                  {dungeon.name}
                </h3>
                
                <p className="text-sm text-subtle mb-4">
                  📍 {dungeon.location.city}, {dungeon.location.state}
                </p>
                
                <p className="text-sm text-subtle mb-6 leading-relaxed">
                  {dungeon.excerpt}
                </p>
                
                <div className="flex gap-3">
                  <a 
                    href={dungeon.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 font-medium text-sm border-b border-primary-600 hover:border-primary-500 transition-all duration-300 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}