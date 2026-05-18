import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    const { data, error } = await ctx.admin
      .from('dancecard_shift_swap_requests')
      .select('id, from_shift_id, to_shift_id, requester_account_id, status, note, created_at, updated_at')
      .eq('event_id', ctx.eventId)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) {
      if (/dancecard_shift_swap_requests|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ swaps: [], needsMigration: true })
      }
      throw error
    }
    return NextResponse.json({ swaps: data ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
