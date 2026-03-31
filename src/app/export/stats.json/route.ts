import { NextResponse } from 'next/server'
import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { buildDirectoryStats } from '@/lib/directoryExport'

export const runtime = 'nodejs'
export const revalidate = 900

export async function GET() {
  const dungeons = getAllDungeons() as Array<Record<string, unknown>>
  const events = getAllEvents() as Array<Record<string, unknown>>
  const stats = buildDirectoryStats(dungeons, events)
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}
