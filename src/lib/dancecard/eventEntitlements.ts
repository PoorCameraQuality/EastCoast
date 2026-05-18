import type { SupabaseClient } from '@supabase/supabase-js'

export type DancecardModules = {
  schedule_embed?: boolean
  map_embed?: boolean
  shift_swaps?: boolean
  vetting_applications?: boolean
  policy_public_summary?: boolean
  ecke_sign?: boolean
  rabbitsign_sync?: boolean
}

const DEFAULT_MODULES: Required<DancecardModules> = {
  schedule_embed: true,
  map_embed: true,
  shift_swaps: false,
  vetting_applications: false,
  policy_public_summary: true,
  ecke_sign: true,
  rabbitsign_sync: false,
}

export async function getEventEntitlements(
  admin: SupabaseClient,
  eventId: string,
): Promise<Required<DancecardModules>> {
  const { data, error } = await admin
    .from('dancecard_event_entitlements')
    .select('modules')
    .eq('event_id', eventId)
    .maybeSingle()
  if (error && error.code !== 'PGRST116') {
    console.error('[dancecard entitlements]', error.message)
  }
  const m = (data?.modules as DancecardModules | undefined) ?? {}
  return { ...DEFAULT_MODULES, ...m }
}

export function assertModuleEnabled(modules: Required<DancecardModules>, key: keyof Required<DancecardModules>) {
  if (!modules[key]) {
    const err = new Error('FORBIDDEN')
    ;(err as Error & { status: number }).status = 403
    throw err
  }
}
