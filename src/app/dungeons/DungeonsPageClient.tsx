'use client'

import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import DungeonSubmissionForm from '@/components/dungeons/DungeonSubmissionForm'
import DungeonCard from '@/components/dungeons/DungeonCard'
import { useState } from 'react'
import SupportCTAInline from '@/components/SupportCTAInline'

// Dedupe utility to prevent duplicate dungeons from rendering
function dedupeBySlug<T extends { slug: string; name: string }>(items: T[]): T[] {
  const map = new Map<string, T>()
  items.forEach(item => map.set(item.slug, item))
  // Return deduped items with stable sort by name
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export default function DungeonsPageClient() {
  // Dedupe and sort dungeons to prevent any duplication issues
  const allDungeons = dedupeBySlug(getAllDungeons())
  const allEvents = getAllEvents()
  const [showSubmitForm, setShowSubmitForm] = useState(false)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons', href: '/dungeons', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <section className="section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />
          <SupportCTAInline contextLabel="Dungeons" />

          <div className="text-center mt-6 mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-white">
              Dungeons & Clubs
            </h1>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
              Explore vetted kink-friendly spaces across the East Coast. Browse dungeon and club listings with clear location details and direct links.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="card-elegant p-6">
              <Search
                events={allEvents}
                dungeons={allDungeons}
                placeholder="Search dungeons and clubs..."
              />
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="btn-outline px-6 py-3"
              aria-expanded={showSubmitForm}
              aria-controls="dungeon-submission-form"
            >
              {showSubmitForm ? 'Cancel Submission' : 'Submit Your Dungeon'}
            </button>
          </div>

          {showSubmitForm && (
            <div id="dungeon-submission-form" className="mt-8">
              <div className="card-elegant p-8">
                <DungeonSubmissionForm />
              </div>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {allDungeons.map((dungeon) => (
              <DungeonCard key={dungeon.slug} dungeon={dungeon} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
