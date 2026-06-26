import { NextRequest, NextResponse } from 'next/server'
import { searchEckeCatalog } from '@/lib/eckeSearch'
import type { EckeSearchEntityType, EckeSearchResponse } from '@/types/eckeSearchResult'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const VALID_TYPES: EckeSearchEntityType[] = [
  'event',
  'convention',
  'place',
  'vendor',
  'education',
  'state',
]

export async function GET(request: NextRequest) {
  const started = Date.now()
  const { searchParams } = request.nextUrl

  const query = searchParams.get('q')?.trim() ?? ''
  const limitRaw = Number.parseInt(searchParams.get('limit') ?? '10', 10)
  const limit = Number.isFinite(limitRaw) ? limitRaw : 10
  const state = searchParams.get('state')?.trim() ?? undefined
  const typeRaw = searchParams.get('type')?.trim() as EckeSearchEntityType | undefined
  const entityType =
    typeRaw && VALID_TYPES.includes(typeRaw) ? typeRaw : undefined

  if (query.length < 2) {
    return NextResponse.json(
      { query, results: [], total: 0, tookMs: Date.now() - started } satisfies EckeSearchResponse,
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  try {
    const { results, total } = await searchEckeCatalog({
      query,
      limit,
      entityType,
      state,
    })

    const body: EckeSearchResponse = {
      query,
      results,
      total,
      tookMs: Date.now() - started,
    }

    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'private, max-age=30',
      },
    })
  } catch (error) {
    console.error('[api/search]', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
