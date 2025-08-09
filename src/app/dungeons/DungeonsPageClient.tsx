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
    <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
      {/* Subtle background elements with blue spectrum */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-1/4 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      <div className="container-custom py-16 relative z-10">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 relative">
            <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
              BDSM Dungeons
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full"></div>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover BDSM dungeons and kink spaces across the East Coast. Find private sessions, workshops, and community events in safe, inclusive environments.
          </p>

          {/* Enhanced Search Component */}
          <div className="max-w-md mx-auto mb-8">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <Search
                events={allEvents}
                dungeons={allDungeons}
                placeholder="Search dungeons..."
              />
            </div>
          </div>

          {/* Enhanced Submit Dungeon Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="group inline-block bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 text-white font-bold py-4 px-8 rounded-full hover:from-primary-700 hover:via-blue-700 hover:to-primary-800 transition-all duration-300 shadow-xl hover:shadow-primary-500/25 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                {showSubmitForm ? 'Cancel Submission' : 'Submit Your Dungeon'}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Submit Dungeon Form */}
        {showSubmitForm && (
          <div className="mb-16 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <DungeonSubmissionForm />
          </div>
        )}

        {/* Enhanced Mobile: Vertical card layout */}
        <div className="md:hidden space-y-6 mb-8">
          {allDungeons.map((dungeon) => (
            <Link key={dungeon.slug} href={`/dungeons/${dungeon.slug}`}>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-primary-500/25 group cursor-pointer">
                {/* Dungeon Logo - Large and centered on top */}
                {dungeon.logo && (
                  <div className="flex justify-center mb-4">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <DungeonLogo 
                        src={dungeon.logo} 
                        alt={`${dungeon.name} logo`}
                        size="large"
                        className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl"
                      />
                    </div>
                  </div>
                )}
                
                {/* Dungeon Details - Below logo */}
                <div className="text-center">
                  <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2">
                    {dungeon.name}
                  </h3>
                  
                  <p className="text-sm text-gray-300 mb-4 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {dungeon.location.city}, {dungeon.location.state}
                  </p>
                  
                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 mb-4">
                    {dungeon.excerpt}
                  </p>
                  
                  <div className="flex justify-center gap-3">
                    <a
                      href={dungeon.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-primary-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Enhanced Desktop: Grid layout with consistent columns and proper height management */}
        <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {allDungeons.map((dungeon) => (
            <Link key={dungeon.slug} href={`/dungeons/${dungeon.slug}`} className="block">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 h-96 flex flex-col hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-primary-500/25 group cursor-pointer">
                {/* Dungeon Logo */}
                {dungeon.logo && (
                  <div className="mb-4 flex-shrink-0">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <DungeonLogo 
                        src={dungeon.logo} 
                        alt={`${dungeon.name} logo`}
                        size="medium"
                        className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex-1 flex flex-col min-h-0">
                  <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2 flex-shrink-0">
                    {dungeon.name}
                  </h3>
                  
                  <p className="text-sm text-gray-300 mb-4 flex items-center gap-2 flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {dungeon.location.city}, {dungeon.location.state}
                  </p>
                  
                  <div className="flex-1 min-h-0 overflow-hidden mb-4">
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                      {dungeon.excerpt}
                    </p>
                  </div>
                  
                  <div className="flex gap-3 flex-shrink-0">
                    <a 
                      href={dungeon.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-primary-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
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
