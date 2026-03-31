import { NextResponse } from 'next/server'
import { getAllDungeons } from '@/data/dungeons'
import { dungeonToVenueExport } from '@/lib/directoryExport'

export const runtime = 'nodejs'
export const revalidate = 900

export async function GET() {
  const dungeons = getAllDungeons() as Array<Record<string, unknown>>
  const venues = dungeons.map(dungeonToVenueExport)
  const today = new Date().toISOString().slice(0, 10)
  return NextResponse.json(
    {
      directory: 'East Coast Kink Events',
      last_updated: today,
      total_venues: venues.length,
      venues,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=86400',
      },
    }
  )
}
