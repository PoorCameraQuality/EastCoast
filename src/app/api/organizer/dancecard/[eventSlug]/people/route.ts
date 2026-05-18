import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerPersonCreateSchema } from '@/lib/dancecard/organizerSchemas'
import { replacePersonTagsForEvent } from '@/lib/dancecard/organizerPersonTags'
import { loadPeopleCompPackages } from '@/lib/dancecard/peopleCompPackages'
import { loadPeopleRoleBuckets } from '@/lib/dancecard/peopleDirectoryRoleBuckets'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function mapPersonRow(r: Record<string, unknown>) {
  return {
    id: r.id as string,
    sceneName: r.scene_name as string,
    legalName: (r.legal_name as string | null) ?? null,
    pronouns: (r.pronouns as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    publicBio: (r.public_bio as string | null) ?? null,
    internalNotes: (r.internal_notes as string | null) ?? null,
    photoUrl: (r.photo_url as string | null) ?? null,
    showLegalNameOnPublic: Boolean(r.show_legal_name_on_public),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const q = request.nextUrl.searchParams.get('q')?.trim()
    let query = admin
      .from('dancecard_persons')
      .select(
        'id, scene_name, legal_name, pronouns, email, phone, public_bio, internal_notes, photo_url, show_legal_name_on_public, created_at, updated_at',
      )
      .eq('event_id', eventId)
      .order('scene_name', { ascending: true })
    if (q) {
      const safe = q.replace(/%/g, '').replace(/,/g, '')
      query = query.or(`scene_name.ilike.%${safe}%,email.ilike.%${safe}%`)
    }
    const { data: rows, error } = await query
    if (error) throw error
    const people = (rows ?? []).map((r) => mapPersonRow(r as Record<string, unknown>))
    const peopleKeys = people.map((p) => ({ id: p.id, sceneName: p.sceneName, email: p.email }))
    const [roleBuckets, compPackages] = await Promise.all([
      loadPeopleRoleBuckets(admin, eventId, peopleKeys),
      loadPeopleCompPackages(
        admin,
        eventId,
        people.map((p) => ({ id: p.id, email: p.email })),
      ),
    ])
    return NextResponse.json({ people, roleBuckets, compPackages })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = organizerPersonCreateSchema.parse(await request.json())
    const email = body.email === '' || body.email === undefined ? null : body.email ?? null
    const { data: row, error } = await admin
      .from('dancecard_persons')
      .insert({
        event_id: eventId,
        scene_name: body.sceneName.trim(),
        legal_name: body.legalName ?? null,
        pronouns: body.pronouns ?? null,
        email,
        phone: body.phone ?? null,
        public_bio: body.publicBio ?? null,
        internal_notes: body.internalNotes ?? null,
        photo_url: body.photoUrl ?? null,
        show_legal_name_on_public: body.showLegalNameOnPublic ?? false,
      })
      .select(
        'id, scene_name, legal_name, pronouns, email, phone, public_bio, internal_notes, photo_url, show_legal_name_on_public, created_at, updated_at',
      )
      .single()
    if (error) throw error
    if (body.tagIds?.length) {
      await replacePersonTagsForEvent(admin, eventId, row.id as string, body.tagIds)
    }
    return NextResponse.json({ person: mapPersonRow(row as Record<string, unknown>) })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
