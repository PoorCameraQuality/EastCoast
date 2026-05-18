import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    const { data, error } = await ctx.admin
      .from('dancecard_vetting_applications')
      .select(
        'id, scene_display_name, email, status, organizer_notes, payload, trusted_role_id, created_at, updated_at, dancecard_trusted_roles ( id, name, apply_slug )',
      )
      .eq('event_id', ctx.eventId)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) {
      if (/dancecard_vetting_applications|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ applications: [], needsMigration: true })
      }
      if (/trusted_role|relationship/i.test(error.message)) {
        const { data: fallback, error: fbErr } = await ctx.admin
          .from('dancecard_vetting_applications')
          .select('id, scene_display_name, email, status, organizer_notes, payload, created_at, updated_at')
          .eq('event_id', ctx.eventId)
          .order('created_at', { ascending: false })
          .limit(200)
        if (fbErr) throw fbErr
        return NextResponse.json({
          applications: (fallback ?? []).map((row) => ({
            ...row,
            trusted_role_id: null,
            trusted_role: null,
          })),
          needsMigration: true,
        })
      }
      throw error
    }

    return NextResponse.json({
      applications: (data ?? []).map((row) => {
        const r = row as Record<string, unknown>
        const role = r.dancecard_trusted_roles as Record<string, unknown> | null
        return {
          id: r.id,
          scene_display_name: r.scene_display_name,
          email: r.email,
          status: r.status,
          organizer_notes: r.organizer_notes,
          payload: r.payload,
          trusted_role_id: r.trusted_role_id ?? null,
          trusted_role: role
            ? { id: role.id, name: role.name, apply_slug: role.apply_slug }
            : null,
          created_at: r.created_at,
          updated_at: r.updated_at,
        }
      }),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
