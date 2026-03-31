import { NextResponse } from 'next/server'
import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { BASE_URL } from '@/lib/seo'
import { buildLlmsFullText } from '@/lib/buildLlmsFullText'

export const runtime = 'nodejs'
export const revalidate = 900

export async function GET() {
  const dungeons = getAllDungeons() as Array<Record<string, unknown>>
  const events = getAllEvents() as Array<Record<string, unknown>>
  const body = buildLlmsFullText(dungeons, events, BASE_URL)
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=86400',
    },
  })
}
