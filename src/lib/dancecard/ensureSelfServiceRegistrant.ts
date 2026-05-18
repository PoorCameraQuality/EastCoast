import type { SupabaseClient } from '@supabase/supabase-js'
import { findRegistrantByNames } from '@/lib/dancecard/registrantNameMatch'

/** Links dancecard_accounts to dancecard_registrants for ECKE Sign and organizer roster. */
export const DANCECARD_ACCOUNT_REGISTRANT_SOURCE = 'dancecard_account'

async function defaultCategoryId(admin: SupabaseClient, eventId: string): Promise<string | null> {
  const { data: cats, error } = await admin
    .from('dancecard_registration_categories')
    .select('id, name, sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  if (!cats?.length) return null
  const weekend = cats.find((c) => String(c.name).toLowerCase().includes('weekend'))
  return (weekend?.id ?? cats[0]?.id) as string | null
}

export type ResolvedRegistrant = { id: string; sceneDisplayName: string }

/**
 * Finds or creates a registrant row for a self-serve dancecard account.
 * Ticket/checkout registrants stay separate unless names match exactly (then we link).
 */
export async function resolveRegistrantForDancecardAccount(
  admin: SupabaseClient,
  eventId: string,
  accountId: string,
  displayName: string,
  options?: { ensure?: boolean; sceneName?: string; legalName?: string },
): Promise<ResolvedRegistrant | null> {
  const ensure = options?.ensure !== false
  const sceneName = (options?.sceneName ?? displayName).trim()
  if (!sceneName) return null

  const { data: linked, error: linkErr } = await admin
    .from('dancecard_registrants')
    .select('id, scene_display_name, external_source, external_id')
    .eq('event_id', eventId)
    .eq('external_source', DANCECARD_ACCOUNT_REGISTRANT_SOURCE)
    .eq('external_id', accountId)
    .neq('status', 'cancelled')
    .maybeSingle()
  if (linkErr) throw linkErr
  if (linked?.id) {
    return { id: linked.id as string, sceneDisplayName: String(linked.scene_display_name ?? sceneName) }
  }

  const { data: roster, error: rErr } = await admin
    .from('dancecard_registrants')
    .select('id, scene_display_name, external_source, external_id')
    .eq('event_id', eventId)
    .neq('status', 'cancelled')
  if (rErr) throw rErr

  const nameMatch = findRegistrantByNames(roster ?? [], sceneName, displayName)
  if (nameMatch) {
    const row = (roster ?? []).find((r) => r.id === nameMatch.id)!
    const extId = row.external_id as string | null
    const extSrc = row.external_source as string | null
    if (!extId || (extSrc === DANCECARD_ACCOUNT_REGISTRANT_SOURCE && extId === accountId)) {
      if (!extId) {
        await admin
          .from('dancecard_registrants')
          .update({
            external_source: DANCECARD_ACCOUNT_REGISTRANT_SOURCE,
            external_id: accountId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', nameMatch.id)
      }
      return { id: nameMatch.id, sceneDisplayName: String(row.scene_display_name ?? sceneName) }
    }
  }

  if (!ensure) return null

  const categoryId = await defaultCategoryId(admin, eventId)
  if (!categoryId) return null

  const { data: created, error: insErr } = await admin
    .from('dancecard_registrants')
    .insert({
      event_id: eventId,
      category_id: categoryId,
      status: 'confirmed',
      scene_display_name: sceneName,
      legal_name: options?.legalName?.trim() || null,
      external_source: DANCECARD_ACCOUNT_REGISTRANT_SOURCE,
      external_id: accountId,
    })
    .select('id, scene_display_name')
    .single()
  if (insErr) throw insErr
  return { id: created.id as string, sceneDisplayName: String(created.scene_display_name ?? sceneName) }
}
