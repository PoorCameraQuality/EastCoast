import { NextRequest, NextResponse } from 'next/server'
import {
  countIncompleteRegistrants,
  latestPoliciesByKind,
  parseAgreementsConfig,
  type PublishedPolicyDoc,
  type RegistrantAgreementState,
} from '@/lib/dancecard/agreementsConfig'
import { computeDancecardConflicts, type ConflictScannerPersonLink, type ConflictScannerSlot } from '@/lib/dancecard/conflictScanner'
import { computeDmCoverageGaps, isDmStaffRole, type DmRequirementRow, type StaffShiftForDm } from '@/lib/dancecard/dmCoverageScanner'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import {
  conflictToReadinessCheck,
  formatEventWindow,
  READINESS_ACTION,
} from '@/lib/dancecard/readinessHumanCopy'
import { buildReadinessSummaryChecks } from '@/lib/dancecard/readinessSummary'
import type { ReadinessCheck } from '@/lib/dancecard/readinessTypes'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import { isMissingColumn, isMissingTable } from '@/lib/dancecard/supabaseColumnFallback'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const timezone = String(event.timezone ?? 'America/New_York')
    const { checks, data } = await buildReadinessSummaryChecks(admin, event)
    const { slotRows, staffRows: summaryStaffRows, staffLoadFailed, locationNames } = data

    const nLoc = Object.keys(locationNames).length
    if (nLoc > 0) {
      const missingLoc = slotRows.filter((s) => !s.location_id && String(s.room ?? '').trim()).length
      if (missingLoc > 0) {
        checks.push({
          id: 'rooms-not-linked',
          severity: 'warning',
          title: `${missingLoc} class${missingLoc === 1 ? '' : 'es'} use a room name that is not linked to your room list`,
          detail: 'Linking rooms keeps imports, maps, and monitor coverage aligned.',
          action: READINESS_ACTION.venues,
        })
      }
    }

    const scannerSlots: ConflictScannerSlot[] = slotRows.map((s) => ({
      id: s.id as string,
      startsAt: String(s.starts_at),
      endsAt: String(s.ends_at),
      locationId: (s.location_id as string | null) ?? null,
      room: (s.room as string | null) ?? null,
      isPublished: Boolean((s as { is_published?: boolean }).is_published),
      visibility: ((s as { visibility?: string }).visibility as string | null) ?? 'public',
      photoPolicy: ((s as { photo_policy?: string }).photo_policy as ConflictScannerSlot['photoPolicy']) ?? 'allowed',
    }))

    let slotPeople: ConflictScannerPersonLink[] = []
    if (slotRows.length) {
      const ids = slotRows.map((s) => s.id as string)
      const { data: spRows, error: spErr } = await admin
        .from('dancecard_program_slot_persons')
        .select('slot_id, person_id, role')
        .in('slot_id', ids)
      if (spErr && !isMissingTable(spErr, 'dancecard_program_slot_persons')) throw spErr
      if (!spErr && spRows) {
        slotPeople = spRows.map((r) => ({
          slotId: r.slot_id as string,
          personId: r.person_id as string,
          role: String(r.role ?? ''),
        }))
      }
    }

    const conflicts = computeDancecardConflicts({
      slots: scannerSlots,
      slotPeople,
    })
    for (const c of conflicts) {
      checks.push(conflictToReadinessCheck(c))
    }

    const staffRows = staffLoadFailed ? [] : summaryStaffRows

    const nSh = staffRows.length
    if (nSh > 0) {
      const winStart = String((event as { window_starts_at?: string }).window_starts_at ?? '')
      const winEnd = String((event as { window_ends_at?: string }).window_ends_at ?? '')
      const winOk =
        Boolean(winStart && winEnd) &&
        Number.isFinite(Date.parse(winStart)) &&
        Number.isFinite(Date.parse(winEnd))
      if (winOk) {
        let overlappingWindow = 0
        for (const r of staffRows) {
          const s = String(r.starts_at ?? '')
          const e = String(r.ends_at ?? '')
          if (!s || !e) continue
          if (Date.parse(s) < Date.parse(winEnd) && Date.parse(winStart) < Date.parse(e)) overlappingWindow += 1
        }
        if (overlappingWindow > 0) {
          checks.push({
            id: 'staff-loaded-window',
            severity: 'ok',
            title: `${overlappingWindow} staff or volunteer shift${overlappingWindow === 1 ? '' : 's'} overlap the event window`,
          })
        } else {
          checks.push({
            id: 'staff-window-no-overlap',
            severity: 'warning',
            title: 'No staff shifts overlap the event date window',
            detail: 'Confirm event dates under Settings match when shifts were scheduled.',
            action: READINESS_ACTION.settings,
          })
        }
      }

      const openN = staffRows.filter((r) => String(r.shift_status ?? 'assigned') === 'open').length
      if (openN > 0) {
        checks.push({
          id: 'staff-open-shifts',
          severity: 'info',
          title: `${openN} shift${openN === 1 ? ' is' : 's are'} open for volunteers to claim`,
          detail: 'Attendees with a dancecard account can pick these up from the staff schedule.',
          action: READINESS_ACTION.peopleStaff,
        })
      }
      const dmNoLoc = staffRows.filter(
        (r) => isDmStaffRole(String(r.role ?? '')) && !(r.location_id as string | null),
      ).length
      if (dmNoLoc > 0) {
        checks.push({
          id: 'dm-missing-location',
          severity: 'warning',
          title: `${dmNoLoc} dungeon monitor shift${dmNoLoc === 1 ? '' : 's'} missing a play space`,
          detail: 'Each monitor shift should be tied to a room so coverage checks know where you need people.',
          action: READINESS_ACTION.peopleCoverage,
        })
      }

      const dmReqs: DmRequirementRow[] = []
      const { data: reqRows, error: reqErr } = await admin
        .from('dancecard_event_dm_requirements')
        .select('id, location_id, starts_at, ends_at, min_lead, min_float')
        .eq('event_id', eventId)
      if (!reqErr && reqRows?.length) {
        for (const r of reqRows) {
          dmReqs.push({
            id: r.id as string,
            locationId: r.location_id as string,
            startsAt: String(r.starts_at),
            endsAt: String(r.ends_at),
            minLead: Number(r.min_lead ?? 1),
            minFloat: Number(r.min_float ?? 0),
          })
        }
        const staffForDm: StaffShiftForDm[] = staffRows.map((r) => ({
          id: r.id as string,
          locationId: (r.location_id as string | null) ?? null,
          role: String(r.role ?? ''),
          startsAt: String(r.starts_at),
          endsAt: String(r.ends_at),
          shiftStatus: String(r.shift_status ?? 'assigned'),
        }))
        const formatWindow = (startsAt: string, endsAt: string) => formatEventWindow(startsAt, endsAt, timezone)
        for (const g of computeDmCoverageGaps(dmReqs, staffForDm, { locationNames, formatWindow })) {
          checks.push(conflictToReadinessCheck(g))
        }
      }
    }

    const pubSlots = slotRows.filter(
      (s) =>
        Boolean((s as { is_published?: boolean }).is_published) &&
        ((s as { visibility?: string }).visibility || 'public') === 'public',
    )
    if (pubSlots.length > 0) {
      const pubIds = pubSlots.map((s) => s.id as string)
      const { data: asp, error: aspErr } = await admin
        .from('dancecard_program_slot_persons')
        .select('slot_id')
        .in('slot_id', pubIds)
      if (aspErr && !isMissingTable(aspErr, 'dancecard_program_slot_persons')) throw aspErr
      const withAssign = new Set((asp ?? []).map((a) => a.slot_id as string))
      const missingPresenterSlots = pubIds.filter((id) => !withAssign.has(id)).length
      if (missingPresenterSlots > 0) {
        checks.push({
          id: 'presenters-missing',
          severity: 'warning',
          title: `${missingPresenterSlots} public class${missingPresenterSlots === 1 ? '' : 'es'} have no presenter listed`,
          detail: 'Attendees see empty credits on the schedule. Open a class and add presenters under People.',
          action: READINESS_ACTION.assignments,
        })
      } else {
        checks.push({
          id: 'presenters-ok',
          severity: 'ok',
          title: 'Public classes have presenters or staff listed',
        })
      }
    }

    const cutoffIso = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentProgramBatch, error: recentImpErr } = await admin
      .from('dancecard_import_batches')
      .select('published_at')
      .eq('event_id', eventId)
      .eq('kind', 'program')
      .eq('status', 'published')
      .gte('published_at', cutoffIso)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (recentImpErr && !isMissingTable(recentImpErr, 'dancecard_import_batches')) throw recentImpErr
    if (!recentImpErr) {
      if (recentProgramBatch?.published_at) {
        checks.push({
          id: 'import-recent-program',
          severity: 'ok',
          title: 'Program import published within the last 14 days',
        })
      } else {
        checks.push({
          id: 'import-recent-program',
          severity: 'info',
          title: 'No program import published in the last 14 days',
          detail: 'If you maintain the schedule via spreadsheets, publish a fresh program batch under Import.',
          action: READINESS_ACTION.import,
        })
      }
    }

    try {
      const agreementsConfig = parseAgreementsConfig((event as { agreements_config?: unknown }).agreements_config)
      const { data: policyRows, error: polErr } = await admin
        .from('dancecard_policy_documents')
        .select('id, kind, version, title, published_at')
        .eq('event_id', eventId)
        .not('published_at', 'is', null)
      if (polErr && !isMissingTable(polErr, 'dancecard_policy_documents')) throw polErr

      if (polErr && isMissingTable(polErr, 'dancecard_policy_documents')) {
        checks.push({
          id: 'agreements-gap',
          severity: 'info',
          title: 'Agreement readiness skipped',
          detail: 'Policy documents are unavailable until migrations add dancecard_policy_documents.',
          action: READINESS_ACTION.settings,
        })
      } else {
        const POLICY_KINDS = new Set(['coc', 'waiver', 'photo', 'marketing'])
        const docs: PublishedPolicyDoc[] = (policyRows ?? [])
          .filter((row) => POLICY_KINDS.has(String(row.kind)))
          .map((row) => ({
            id: row.id as string,
            kind: row.kind as PublishedPolicyDoc['kind'],
            version: Number(row.version ?? 0),
            title: String(row.title ?? ''),
          }))

        const regExtended = await admin
          .from('dancecard_registrants')
          .select('id, status, rabbitsign_status')
          .eq('event_id', eventId)

        let regError = regExtended.error
        let regData: Array<{ id: string; status?: string; rabbitsign_status?: string | null }> | null =
          regExtended.data as Array<{ id: string; status?: string; rabbitsign_status?: string | null }> | null

        if (regError && isMissingColumn(regError, 'rabbitsign_status')) {
          const regFallback = await admin.from('dancecard_registrants').select('id, status').eq('event_id', eventId)
          regError = regFallback.error
          regData =
            regFallback.data?.map((r) => ({ ...r, rabbitsign_status: null as string | null })) ?? null
        }

        if (regError && !isMissingTable(regError, 'dancecard_registrants')) throw regError

        if (regError && isMissingTable(regError, 'dancecard_registrants')) {
          checks.push({
            id: 'agreements-gap',
            severity: 'info',
            title: 'Agreement readiness skipped',
            detail: 'Registrants table unavailable.',
            action: READINESS_ACTION.settings,
          })
        } else {
          const regs = regData ?? []
          const activeRegs = regs.filter((r) => String(r.status ?? '') !== 'cancelled')
          const mode = agreementsConfig.mode ?? 'ecke'
          const kindsNeeded = agreementsConfig.requiredPolicyKinds ?? []
          const byKind = latestPoliciesByKind(docs)
          const missingKinds =
            mode === 'ecke' || mode === 'hybrid' ? kindsNeeded.filter((k) => !byKind.has(k)) : []

          if (missingKinds.length) {
            checks.push({
              id: 'agreements-gap',
              severity: 'warning',
              title: `Publish policies for required kinds: ${missingKinds.join(', ')}`,
              detail: 'Until each kind has a published document, acceptance checks may be incomplete.',
              action: READINESS_ACTION.settings,
            })
          } else if (!activeRegs.length) {
            checks.push({
              id: 'agreements-gap',
              severity: 'ok',
              title: 'No active registrants to check for agreements',
            })
          } else {
            const ids = activeRegs.map((r) => r.id)
            const { data: accRows, error: accErr } = await admin
              .from('dancecard_registrant_policy_acceptances')
              .select('registrant_id, policy_document_id')
              .in('registrant_id', ids)

            if (accErr && !isMissingTable(accErr, 'dancecard_registrant_policy_acceptances')) throw accErr

            let incomplete: number | null = null
            if (!accErr) {
              const rows = accRows ?? []
              const acceptedMap = new Map<string, string[]>()
              for (const row of rows) {
                const rid = row.registrant_id as string
                const pid = row.policy_document_id as string
                const prev = acceptedMap.get(rid) ?? []
                prev.push(pid)
                acceptedMap.set(rid, prev)
              }
              const states: RegistrantAgreementState[] = activeRegs.map((r) => ({
                registrantId: r.id,
                acceptedPolicyDocumentIds: acceptedMap.get(r.id) ?? [],
                rabbitsignStatus: r.rabbitsign_status ?? null,
              }))
              incomplete = countIncompleteRegistrants(states, agreementsConfig, docs)
            }

            if (accErr && isMissingTable(accErr, 'dancecard_registrant_policy_acceptances')) {
              checks.push({
                id: 'agreements-gap',
                severity: 'info',
                title: 'Agreement acceptances could not be counted',
                detail: 'Apply migration dancecard_031 or newer when ready for acceptance auditing.',
                action: READINESS_ACTION.settings,
              })
            } else if (incomplete !== null && incomplete > 0) {
              checks.push({
                id: 'agreements-gap',
                severity: 'warning',
                title: `${incomplete} registrant${incomplete === 1 ? '' : 's'} still need required agreements`,
                detail: 'Review Policies & agreements under Settings and registrant records under People → Sign-ups.',
                action: READINESS_ACTION.settings,
              })
            } else if (incomplete !== null) {
              checks.push({
                id: 'agreements-gap',
                severity: 'ok',
                title: 'Required agreements look satisfied for registrants on file',
              })
            }
          }
        }
      }
    } catch {
      checks.push({
        id: 'agreements-gap',
        severity: 'info',
        title: 'Agreement readiness could not be evaluated',
        detail: 'Confirm policies and registrant acceptance columns manually.',
        action: READINESS_ACTION.settings,
      })
    }

    return NextResponse.json({ checks, scope: 'full' as const })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
