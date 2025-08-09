'use client'

import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import Link from 'next/link'
import DungeonLogo from '@/components/DungeonLogo'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import DungeonSubmissionForm from '@/components/dungeons/DungeonSubmissionForm'
import { useState } from 'react'

export default function DungeonsPageClient() {
  const allDungeons = getAllDungeons()
  const allEvents = getAllEvents()
  const [showSubmitForm, setShowSubmitForm] = useState(false)

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

          {/* Submit Dungeon Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="btn-primary"
            >
              {showSubmitForm ? 'Cancel Submission' : 'Submit Your Dungeon'}
            </button>
          </div>
        </div>

        {/* Submit Dungeon Form */}
        {showSubmitForm && (
          <div className="mb-16">
            <DungeonSubmissionForm />
          </div>
        )}

        {/* Mobile: Vertical card layout */}
        <div className="md:hidden space-y-6 mb-8">
          {allDungeons.map((dungeon) => (
            <Link key={dungeon.slug} href={`/dungeons/${dungeon.slug}`} className="block">
              <div className="card-elegant hover-lift group cursor-pointer p-6">
                {/* Dungeon Logo - Large and centered on top */}
                {dungeon.logo && (
                  <div className="flex justify-center mb-4">
                    <DungeonLogo 
                      src={dungeon.logo} 
                      alt={`${dungeon.name} logo`}
                      size="large"
                    />
                  </div>
                )}
                
                {/* Dungeon Details - Below logo */}
                <div className="text-center">
                  <h3 className="text-lg font-serif font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2">
                    {dungeon.name}
                  </h3>
                  
                  <p className="text-sm text-subtle mb-4">
                    📍 {dungeon.location.city}, {dungeon.location.state}
                  </p>
                  
                  <p className="text-sm text-subtle leading-relaxed line-clamp-3 mb-4">
                    {dungeon.excerpt}
                  </p>
                  
                  <div className="flex justify-center gap-3">
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
              </div>
            </Link>
          ))}
        </div>
        
        {/* Desktop: Grid layout with consistent columns and proper height management */}
        <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {allDungeons.map((dungeon) => (
            <Link key={dungeon.slug} href={`/dungeons/${dungeon.slug}`} className="block">
              <div className="card-elegant hover-lift group cursor-pointer p-6 h-96 flex flex-col">
                {/* Dungeon Logo */}
                {dungeon.logo && (
                  <div className="mb-4 flex-shrink-0">
                    <DungeonLogo 
                      src={dungeon.logo} 
                      alt={`${dungeon.name} logo`}
                      size="medium"
                    />
                  </div>
                )}
                
                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="text-lg font-serif font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2 flex-shrink-0">
                    {dungeon.name}
                  </h3>
                  
                  <p className="text-sm text-subtle mb-4 flex-shrink-0">
                    📍 {dungeon.location.city}, {dungeon.location.state}
                  </p>
                  
                  <div className="flex-1 min-h-0 overflow-hidden mb-4">
                    <p className="text-sm text-subtle leading-relaxed line-clamp-4">
                      {dungeon.excerpt}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 flex-shrink-0">
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
