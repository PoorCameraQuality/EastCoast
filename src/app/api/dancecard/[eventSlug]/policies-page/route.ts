import { NextRequest, NextResponse } from 'next/server'
import {
  isAgreementsComplete,
  parseAgreementsConfig,
  type PublishedPolicyDoc,
  requiredPolicyDocumentIds,
} from '@/lib/dancecard/agreementsConfig'
import { getEventEntitlements } from '@/lib/dancecard/eventEntitlements'
import { resolveRegistrantForDancecardAccount } from '@/lib/dancecard/ensureSelfServiceRegistrant'
import {getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

/** Single request for /dancecard/[slug]/policies (documents + ECKE sign status). */
export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const modules = await getEventEntitlements(admin, event.id)
    const summaryModuleEnabled = Boolean(modules.policy_public_summary)

    const { data: rows, error } = await admin
      .from('dancecard_policy_documents')
      .select('id, kind, version, title, published_at, body_markdown')
      .eq('event_id', event.id)
      .not('published_at', 'is', null)
      .order('kind', { ascending: true })
      .order('version', { ascending: false })
    if (error) throw error

    const policies = (rows ?? []).map((r) => ({
      id: r.id as string,
      kind: r.kind as string,
      version: Number(r.version),
      title: r.title as string,
      publishedAt: r.published_at as string,
      bodyMarkdown: String((r as { body_markdown?: string }).body_markdown ?? ''),
    }))

    const row = event as Record<string, unknown>
    const agreementsConfig = parseAgreementsConfig(row.agreements_config)
    const session = await resolveAccountFromSession(admin, request, slug)

    const docs: PublishedPolicyDoc[] = policies.map((p) => ({
      id: p.id,
      kind: p.kind as PublishedPolicyDoc['kind'],
      version: p.version,
      title: p.title,
    }))
    const requiredIds = requiredPolicyDocumentIds(agreementsConfig, docs)

    let registrantMatched = false
    let acceptedIds: string[] = []
    let agreementsComplete = false

    if (session) {
      const resolved = await resolveRegistrantForDancecardAccount(
        admin,
        event.id,
        session.accountId,
        session.displayName,
        { ensure: true },
      )
      if (resolved) {
        registrantMatched = true
        const { data: reg, error: regErr } = await admin
          .from('dancecard_registrants')
          .select('rabbitsign_status')
          .eq('id', resolved.id)
          .maybeSingle()
        if (regErr) throw regErr
        const { data: acc, error: aErr } = await admin
          .from('dancecard_registrant_policy_acceptances')
          .select('policy_document_id')
          .eq('registrant_id', resolved.id)
        if (aErr) throw aErr
        acceptedIds = (acc ?? []).map((a) => a.policy_document_id as string)
        agreementsComplete = isAgreementsComplete(
          agreementsConfig,
          {
            registrantId: resolved.id,
            acceptedPolicyDocumentIds: acceptedIds,
            rabbitsignStatus: (reg?.rabbitsign_status as string | null) ?? null,
          },
          docs,
        )
      }
    }

    return NextResponse.json({
      eventTitle: event.event_title,
      summaryModuleEnabled,
      policies,
      signStatus: {
        loggedIn: Boolean(session),
        displayName: session?.displayName ?? null,
        registrantMatched,
        agreementsMode: agreementsConfig.mode ?? 'ecke',
        requiredPolicyDocumentIds: requiredIds,
        acceptedPolicyDocumentIds: acceptedIds,
        agreementsComplete,
      },
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-policies-page')
  }
}
