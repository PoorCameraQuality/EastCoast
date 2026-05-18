import type { SupabaseClient } from '@supabase/supabase-js'
import type { OrganizerRegistrantImportRow } from '@/lib/dancecard/organizerSchemas'

async function countActiveInCategory(
  admin: SupabaseClient,
  categoryId: string,
  excludeRegistrantId?: string,
): Promise<number> {
  let q = admin
    .from('dancecard_registrants')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .neq('status', 'cancelled')
  if (excludeRegistrantId) q = q.neq('id', excludeRegistrantId)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

/**
 * Shared registrant import / upsert logic (organizer session, inbound webhook, external API).
 */
export async function runRegistrantImportBatch(
  admin: SupabaseClient,
  eventId: string,
  rows: OrganizerRegistrantImportRow[],
): Promise<{ created: number; updated: number; errors: string[] }> {
  const { data: cats, error: cErr } = await admin
    .from('dancecard_registration_categories')
    .select('id, name, capacity')
    .eq('event_id', eventId)
  if (cErr) throw cErr
  const byLowerName = new Map<string, { id: string; capacity: number | null }>()
  for (const c of cats ?? []) {
    byLowerName.set(String(c.name).toLowerCase().trim(), {
      id: c.id as string,
      capacity: c.capacity === null || c.capacity === undefined ? null : Number(c.capacity),
    })
  }

  let created = 0
  let updated = 0
  const errors: string[] = []
  const now = new Date().toISOString()
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      let categoryId = row.categoryId
      if (!categoryId && row.categoryName) {
        const hit = byLowerName.get(row.categoryName.toLowerCase().trim())
        if (!hit) {
          errors.push(`Row ${i + 1}: unknown category "${row.categoryName}"`)
          continue
        }
        categoryId = hit.id
      }
      if (!categoryId) {
        errors.push(`Row ${i + 1}: missing category`)
        continue
      }
      const catMeta = (cats ?? []).find((c) => c.id === categoryId) as { capacity?: number | null } | undefined
      const cap = catMeta?.capacity === null || catMeta?.capacity === undefined ? null : Number(catMeta.capacity)
      let status = row.status ?? 'imported'
      const email = row.email === '' || row.email === undefined ? null : row.email ?? null
      const extSrc = row.externalSource?.trim()
      const extId = row.externalId?.trim()

      if (extSrc && extId) {
        const { data: existing, error: exErr } = await admin
          .from('dancecard_registrants')
          .select('id')
          .eq('event_id', eventId)
          .eq('external_source', extSrc)
          .eq('external_id', extId)
          .maybeSingle()
        if (exErr) throw exErr
        if (existing) {
          const rid = (existing as { id: string }).id
          if (cap != null && cap >= 0 && status !== 'cancelled' && status !== 'waitlisted') {
            const n = await countActiveInCategory(admin, categoryId, rid)
            if (n >= cap) status = 'waitlisted'
          }
          const { error: upErr } = await admin
            .from('dancecard_registrants')
            .update({
              category_id: categoryId,
              status,
              scene_display_name: row.sceneDisplayName.trim(),
              legal_name: row.legalName ?? null,
              email,
              last_synced_at: now,
              updated_at: now,
            })
            .eq('id', rid)
          if (upErr) throw upErr
          updated++
        } else {
          if (cap != null && cap >= 0 && status !== 'cancelled' && status !== 'waitlisted') {
            const n = await countActiveInCategory(admin, categoryId)
            if (n >= cap) status = 'waitlisted'
          }
          const { error: insErr } = await admin.from('dancecard_registrants').insert({
            event_id: eventId,
            category_id: categoryId,
            status,
            scene_display_name: row.sceneDisplayName.trim(),
            legal_name: row.legalName ?? null,
            email,
            external_source: extSrc,
            external_id: extId,
            last_synced_at: now,
          })
          if (insErr) throw insErr
          created++
        }
      } else {
        if (cap != null && cap >= 0 && status !== 'cancelled' && status !== 'waitlisted') {
          const n = await countActiveInCategory(admin, categoryId)
          if (n >= cap) status = 'waitlisted'
        }
        const { error: insErr } = await admin.from('dancecard_registrants').insert({
          event_id: eventId,
          category_id: categoryId,
          status,
          scene_display_name: row.sceneDisplayName.trim(),
          legal_name: row.legalName ?? null,
          email,
        })
        if (insErr) throw insErr
        created++
      }
    } catch (e) {
      errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'error'}`)
    }
  }

  return { created, updated, errors }
}
