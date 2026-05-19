import type { SupabaseClient } from '@supabase/supabase-js'
import { findRegistrantByNames } from '@/lib/dancecard/registrantNameMatch'
import { resolveRegistrationCategoryFromCompCode } from '@/lib/dancecard/resolveRegistrationCategoryFromCompCode'

/** Links dancecard_accounts to dancecard_registrants for ECKE Sign and organizer roster. */
export const DANCECARD_ACCOUNT_REGISTRANT_SOURCE = 'dancecard_account'

async function countActiveInCategory(admin: SupabaseClient, categoryId: string): Promise<number> {
  const { count, error } = await admin
    .from('dancecard_registrants')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .neq('status', 'cancelled')
  if (error) throw error
  return count ?? 0
}

async function registrantStatusForCategory(
  admin: SupabaseClient,
  categoryId: string,
): Promise<'confirmed' | 'waitlisted'> {
  const { data: cat, error } = await admin
    .from('dancecard_registration_categories')
    .select('capacity')
    .eq('id', categoryId)
    .maybeSingle()
  if (error) throw error
  const cap = cat?.capacity as number | null | undefined
  if (cap == null || cap < 0) return 'confirmed'
  const n = await countActiveInCategory(admin, categoryId)
  return n >= cap ? 'waitlisted' : 'confirmed'
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
  options?: {
    ensure?: boolean
    sceneName?: string
    legalName?: string
    categoryId?: string
    updateCategoryOnLink?: boolean
  },
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
    if (options?.categoryId && options.updateCategoryOnLink === true) {
      const status = await registrantStatusForCategory(admin, options.categoryId)
      await admin
        .from('dancecard_registrants')
        .update({
          category_id: options.categoryId,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', linked.id)
    }
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
    if (extId && extSrc === DANCECARD_ACCOUNT_REGISTRANT_SOURCE && extId !== accountId) {
      throw new Error(
        'BAD_REQUEST: This display name is already linked to another dancecard account. Use a different name or contact the organizers.',
      )
    }
    if (extId && extSrc !== DANCECARD_ACCOUNT_REGISTRANT_SOURCE) {
      throw new Error(
        'BAD_REQUEST: This display name matches an existing registrant from another registration source. Contact the organizers to link your dancecard account.',
      )
    }
    const linkPatch: Record<string, unknown> = {
      external_source: DANCECARD_ACCOUNT_REGISTRANT_SOURCE,
      external_id: accountId,
      updated_at: new Date().toISOString(),
    }
    if (options?.categoryId && options.updateCategoryOnLink === true) {
      linkPatch.category_id = options.categoryId
      linkPatch.status = await registrantStatusForCategory(admin, options.categoryId)
    }
    await admin.from('dancecard_registrants').update(linkPatch).eq('id', nameMatch.id)
    return { id: nameMatch.id, sceneDisplayName: String(row.scene_display_name ?? sceneName) }
  }

  if (!ensure) return null

  let categoryId = options?.categoryId ?? null
  if (!categoryId) {
    const resolved = await resolveRegistrationCategoryFromCompCode(admin, eventId, null)
    categoryId = resolved.categoryId
  }
  if (!categoryId) return null

  const status = await registrantStatusForCategory(admin, categoryId)

  const { data: created, error: insErr } = await admin
    .from('dancecard_registrants')
    .insert({
      event_id: eventId,
      category_id: categoryId,
      status,
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
