import { NextRequest, NextResponse } from 'next/server'
import { requireOrganizerForSlug, organizerErrorResponse } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

/** Kitchen rollup: signups grouped by meal period and choice. */
export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const { data: signups, error } = await admin
      .from('dancecard_meal_signups')
      .select('meal_period_id, meal_choice, dietary_notes, dancecard_accounts(display_name)')
      .eq('event_id', eventId)
      .eq('status', 'confirmed')
    if (error?.code === '42P01') {
      return NextResponse.json({ rollup: [], needsMigration: 'dancecard_058_meal_signups.sql' })
    }
    if (error) throw error

    const byPeriod = new Map<
      string,
      { mealPeriodId: string; choices: Map<string, number>; dietary: { name: string; notes: string | null }[] }
    >()
    for (const s of signups ?? []) {
      const periodId = s.meal_period_id as string
      const entry = byPeriod.get(periodId) ?? {
        mealPeriodId: periodId,
        choices: new Map<string, number>(),
        dietary: [],
      }
      const choice = String(s.meal_choice ?? 'standard')
      entry.choices.set(choice, (entry.choices.get(choice) ?? 0) + 1)
      const acct = s.dancecard_accounts as { display_name?: string } | null
      if (s.dietary_notes) {
        entry.dietary.push({
          name: String(acct?.display_name ?? 'Attendee'),
          notes: s.dietary_notes as string,
        })
      }
      byPeriod.set(periodId, entry)
    }

    const rollup = Array.from(byPeriod.values()).map((r) => ({
      mealPeriodId: r.mealPeriodId,
      byChoice: Array.from(r.choices.entries()).map(([choice, count]) => ({ choice, count })),
      dietary: r.dietary,
    }))

    return NextResponse.json({ rollup })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
