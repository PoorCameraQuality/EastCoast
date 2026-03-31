import { NextResponse } from 'next/server'
import { getAllEvents } from '@/data/events'
import { eventToConventionExport } from '@/lib/directoryExport'

export const runtime = 'nodejs'
export const revalidate = 900

export async function GET() {
  const events = getAllEvents() as Array<Record<string, unknown>>
  const conventions = events.map(eventToConventionExport)
  const today = new Date().toISOString().slice(0, 10)
  return NextResponse.json(
    {
      directory: 'East Coast Kink Events',
      last_updated: today,
      conventions,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=86400',
      },
    }
  )
}
