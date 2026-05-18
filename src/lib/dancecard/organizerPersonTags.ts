import type { SupabaseClient } from '@supabase/supabase-js'

/** Replace person tags; each tag must belong to event and have scope `person`. */
export async function replacePersonTagsForEvent(
  admin: SupabaseClient,
  eventId: string,
  personId: string,
  tagIds: string[],
): Promise<void> {
  if (!tagIds.length) {
    const { error } = await admin.from('dancecard_person_tags').delete().eq('person_id', personId)
    if (error) throw error
    return
  }
  const { data: tags, error: tagErr } = await admin
    .from('dancecard_tags')
    .select('id, scope')
    .eq('event_id', eventId)
    .in('id', tagIds)
  if (tagErr) throw tagErr
  const ok = new Set((tags ?? []).filter((t) => t.scope === 'person').map((t) => t.id as string))
  for (const id of tagIds) {
    if (!ok.has(id)) throw new Error('BAD_REQUEST: tag must exist for this event with scope person')
  }
  const { error: delErr } = await admin.from('dancecard_person_tags').delete().eq('person_id', personId)
  if (delErr) throw delErr
  const rows = tagIds.map((tag_id) => ({ person_id: personId, tag_id }))
  const { error: insErr } = await admin.from('dancecard_person_tags').insert(rows)
  if (insErr) throw insErr
}
