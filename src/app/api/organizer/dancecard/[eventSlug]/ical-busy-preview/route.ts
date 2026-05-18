import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { parseIcsBusyBlocks } from '@/lib/dancecard/parseIcsBusyBlocks'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  icsText: z.string().min(10).max(500_000),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    await requireOrganizerForSlug(context.params.eventSlug)
    const body = bodySchema.parse(await request.json())
    const blocks = parseIcsBusyBlocks(body.icsText)
    return NextResponse.json({ blocks, count: blocks.length })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
