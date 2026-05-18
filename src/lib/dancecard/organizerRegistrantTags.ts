import type { SupabaseClient } from '@supabase/supabase-js'

export async function replaceRegistrantTagsForEvent(
  admin: SupabaseClient,
  eventId: string,
  registrantId: string,
  tagIds: string[],
): Promise<void> {
  if (!tagIds.length) {
    const { error } = await admin.from('dancecard_registrant_tags').delete().eq('registrant_id', registrantId)
    if (error) throw error
    return
  }
  const { data: tags, error: tagErr } = await admin
    .from('dancecard_tags')
    .select('id, scope')
    .eq('event_id', eventId)
    .in('id', tagIds)
  if (tagErr) throw tagErr
  const ok = new Set((tags ?? []).filter((t) => t.scope === 'registrant').map((t) => t.id as string))
  for (const id of tagIds) {
    if (!ok.has(id)) throw new Error('BAD_REQUEST: tag must exist for this event with scope registrant')
  }
  const { error: delErr } = await admin.from('dancecard_registrant_tags').delete().eq('registrant_id', registrantId)
  if (delErr) throw delErr
  const rows = tagIds.map((tag_id) => ({ registrant_id: registrantId, tag_id }))
  const { error: insErr } = await admin.from('dancecard_registrant_tags').insert(rows)
  if (insErr) throw insErr
}
