import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerPersonPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { replacePersonTagsForEvent } from '@/lib/dancecard/organizerPersonTags'
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

async function loadPersonTagIds(admin: SupabaseClient, personId: string): Promise<string[]> {
  const { data, error } = await admin.from('dancecard_person_tags').select('tag_id').eq('person_id', personId)
  if (error) throw error
  return (data ?? []).map((r) => r.tag_id as string)
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string; personId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const personId = context.params.personId
    const { data: row, error } = await admin
      .from('dancecard_persons')
      .select(
        'id, scene_name, legal_name, pronouns, email, phone, public_bio, internal_notes, photo_url, show_legal_name_on_public, created_at, updated_at',
      )
      .eq('id', personId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (error) throw error
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const tagIds = await loadPersonTagIds(admin, personId)
    return NextResponse.json({ person: { ...mapPersonRow(row as Record<string, unknown>), tagIds } })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string; personId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const personId = context.params.personId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_persons')
      .select('id')
      .eq('id', personId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = organizerPersonPatchSchema.parse(await request.json())
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.sceneName !== undefined) patch.scene_name = body.sceneName.trim()
    if (body.legalName !== undefined) patch.legal_name = body.legalName
    if (body.pronouns !== undefined) patch.pronouns = body.pronouns
    if (body.email !== undefined) patch.email = body.email === '' ? null : body.email
    if (body.phone !== undefined) patch.phone = body.phone
    if (body.publicBio !== undefined) patch.public_bio = body.publicBio
    if (body.internalNotes !== undefined) patch.internal_notes = body.internalNotes
    if (body.photoUrl !== undefined) patch.photo_url = body.photoUrl
    if (body.showLegalNameOnPublic !== undefined) patch.show_legal_name_on_public = body.showLegalNameOnPublic

    const { data: row, error } = await admin
      .from('dancecard_persons')
      .update(patch)
      .eq('id', personId)
      .eq('event_id', eventId)
      .select(
        'id, scene_name, legal_name, pronouns, email, phone, public_bio, internal_notes, photo_url, show_legal_name_on_public, created_at, updated_at',
      )
      .single()
    if (error) throw error
    if (body.tagIds !== undefined) {
      await replacePersonTagsForEvent(admin, eventId, personId, body.tagIds)
    }
    const tagIds = await loadPersonTagIds(admin, personId)
    return NextResponse.json({ person: { ...mapPersonRow(row as Record<string, unknown>), tagIds } })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; personId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const personId = context.params.personId
    const { error } = await admin.from('dancecard_persons').delete().eq('id', personId).eq('event_id', eventId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
