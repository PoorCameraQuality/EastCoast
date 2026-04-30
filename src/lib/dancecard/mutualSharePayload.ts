import type { SupabaseClient } from '@supabase/supabase-js'
import {
  loadAvailabilityRange,
  loadPrefs,
  loadReservationsForAccount,
  loadSelections,
  selectionsToBusyInput,
} from '@/lib/dancecard/data'
import {
  computeBusyForAccount,
  computeFreeGapsForAccount,
  computeMutualFree,
  eventWindowFromRow,
} from '@/lib/dancecard/busy'

type EventRow = {
  id: string
  product_title: string
  event_title: string
  subtitle: string | null
  timezone: string
  window_starts_at: string
  window_ends_at: string
  shared_by_label: string
  shared_by_detail: string | null
  logo_url: string | null
}

type ViewerSession = {
  accountId: string
  displayName: string
}

export async function buildMutualSharePayload(
  admin: SupabaseClient,
  event: EventRow,
  host: { id: string; display_name: string },
  viewer: ViewerSession | null
) {
  const { data: slots } = await admin
    .from('dancecard_program_slots')
    .select('id, starts_at, ends_at, title, track, room, description, sort_order')
    .eq('event_id', event.id)
    .order('starts_at', { ascending: true })
    .order('sort_order', { ascending: true })

  const eventWindow = eventWindowFromRow({
    window_starts_at: event.window_starts_at,
    window_ends_at: event.window_ends_at,
  })
  const hostAvailability = await loadAvailabilityRange(admin, host.id)
  const window = hostAvailability
    ? {
        start: new Date(hostAvailability.startsAt),
        end: new Date(hostAvailability.endsAt),
      }
    : eventWindow

  const hostPrefs = await loadPrefs(admin, host.id)
  const hostSel = await loadSelections(admin, host.id)
  const hostRes = await loadReservationsForAccount(admin, event.id, host.id)
  const hostBusy = computeBusyForAccount(
    window,
    hostPrefs.bufferMinutes,
    selectionsToBusyInput(hostSel),
    hostRes,
    host.id
  )
  const hostFree = computeFreeGapsForAccount(
    window,
    hostPrefs.bufferMinutes,
    selectionsToBusyInput(hostSel),
    hostRes,
    host.id
  )

  let mutualFree: { start: string; end: string }[] | null = null
  let viewerYou: string | null = null
  if (viewer && viewer.accountId !== host.id) {
    viewerYou = viewer.displayName
    const vb = await loadPrefs(admin, viewer.accountId)
    const vs = await loadSelections(admin, viewer.accountId)
    const vr = await loadReservationsForAccount(admin, event.id, viewer.accountId)
    const m = computeMutualFree(
      window,
      hostPrefs.bufferMinutes,
      selectionsToBusyInput(hostSel),
      hostRes,
      host.id,
      vb.bufferMinutes,
      selectionsToBusyInput(vs),
      vr,
      viewer.accountId
    )
    mutualFree = m.map((g) => ({ start: g.start.toISOString(), end: g.end.toISOString() }))
  }

  return {
    meta: {
      productTitle: event.product_title,
      eventTitle: event.event_title,
      subtitle: event.subtitle,
      timezone: event.timezone,
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      sharedByLabel: event.shared_by_label,
      sharedByDetail: event.shared_by_detail,
      logoUrl: event.logo_url,
    },
    host: { id: host.id, displayName: host.display_name as string },
    viewerYou,
    hostFreeGaps: hostFree.map((g) => ({ start: g.start.toISOString(), end: g.end.toISOString() })),
    hostBusy: hostBusy.map((g) => ({ start: g.start.toISOString(), end: g.end.toISOString() })),
    mutualFreeGaps: mutualFree,
    slots: (slots ?? []).map((s) => ({
      id: s.id,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      title: s.title,
      track: s.track,
      room: s.room,
      description: s.description,
      sortOrder: s.sort_order,
    })),
  }
}
