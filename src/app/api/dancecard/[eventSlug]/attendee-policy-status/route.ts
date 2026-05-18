import { NextRequest, NextResponse } from 'next/server'

import {

  isAgreementsComplete,

  parseAgreementsConfig,

  type PublishedPolicyDoc,

  requiredPolicyDocumentIds,

} from '@/lib/dancecard/agreementsConfig'

import { resolveRegistrantForDancecardAccount } from '@/lib/dancecard/ensureSelfServiceRegistrant'

import {getDancecardAdmin,

  loadEventBySlug,

  normalizeEventSlug,

  resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'



export const dynamic = 'force-dynamic'



export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {

  try {

    const admin = getDancecardAdmin()

    const slug = normalizeEventSlug(context.params.eventSlug)

    const event = await loadEventBySlug(admin, slug)

    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })



    const row = event as Record<string, unknown>

    const agreementsConfig = parseAgreementsConfig(row.agreements_config)

    const session = await resolveAccountFromSession(admin, request, slug)



    const { data: docRows, error: dErr } = await admin

      .from('dancecard_policy_documents')

      .select('id, kind, version, title, published_at')

      .eq('event_id', event.id)

      .not('published_at', 'is', null)



    if (dErr) throw dErr



    const docs: PublishedPolicyDoc[] = (docRows ?? []).map((r) => ({

      id: r.id as string,

      kind: r.kind as PublishedPolicyDoc['kind'],

      version: Number(r.version),

      title: r.title as string,

    }))



    const requiredIds = requiredPolicyDocumentIds(agreementsConfig, docs)



    let registrantId: string | null = null

    let acceptedIds: string[] = []

    let rabbitsignStatus: string | null = null



    if (session) {

      const resolved = await resolveRegistrantForDancecardAccount(

        admin,

        event.id,

        session.accountId,

        session.displayName,

        { ensure: true },

      )

      if (resolved) {

        registrantId = resolved.id

        const { data: reg, error: regErr } = await admin

          .from('dancecard_registrants')

          .select('rabbitsign_status')

          .eq('id', resolved.id)

          .maybeSingle()

        if (regErr) throw regErr

        rabbitsignStatus = (reg?.rabbitsign_status as string | null) ?? null

        const { data: acc, error: aErr } = await admin

          .from('dancecard_registrant_policy_acceptances')

          .select('policy_document_id')

          .eq('registrant_id', registrantId)

        if (aErr) throw aErr

        acceptedIds = (acc ?? []).map((a) => a.policy_document_id as string)

      }

    }



    const state = {

      registrantId: registrantId ?? '',

      acceptedPolicyDocumentIds: acceptedIds,

      rabbitsignStatus,

    }



    const complete =

      registrantId != null && isAgreementsComplete(agreementsConfig, state, docs)



    return NextResponse.json({

      loggedIn: Boolean(session),

      displayName: session?.displayName ?? null,

      registrantMatched: registrantId != null,

      registrantId,

      agreementsMode: agreementsConfig.mode ?? 'ecke',

      requiredPolicyDocumentIds: requiredIds,

      acceptedPolicyDocumentIds: acceptedIds,

      agreementsComplete: complete,

    })

  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-attendee-policy-status')
  }

}


