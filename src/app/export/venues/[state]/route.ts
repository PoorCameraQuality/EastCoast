import { NextResponse } from 'next/server'
import { getAllDungeons } from '@/data/dungeons'
import { dungeonToVenueExport } from '@/lib/directoryExport'

export const runtime = 'nodejs'
export const revalidate = 900

interface Props {
  params: { state: string }
}

export async function GET(_req: Request, { params }: Props) {
  const abbr = params.state?.trim().toUpperCase()
  if (!abbr || !/^[A-Z]{2}$/.test(abbr)) {
    return NextResponse.json({ error: 'Expected two-letter state code in path' }, { status: 400 })
  }
  const dungeons = getAllDungeons() as Array<Record<string, unknown>>
  const filtered = dungeons.filter((d) => {
    const st = (d.location as { state?: string } | undefined)?.state
    return st?.toUpperCase() === abbr
  })
  const venues = filtered.map(dungeonToVenueExport)
  const today = new Date().toISOString().slice(0, 10)
  return NextResponse.json(
    {
      directory: 'East Coast Kink Events',
      last_updated: today,
      state: abbr,
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
