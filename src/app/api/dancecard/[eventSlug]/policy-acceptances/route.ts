import { NextRequest, NextResponse } from 'next/server'

import { ZodError, z } from 'zod'

import { parseAgreementsConfig } from '@/lib/dancecard/agreementsConfig'

import { resolveRegistrantForDancecardAccount } from '@/lib/dancecard/ensureSelfServiceRegistrant'

import {getDancecardAdmin,

  loadEventBySlug,

  normalizeEventSlug,

  resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'



export const dynamic = 'force-dynamic'



const bodySchema = z.object({

  policyDocumentIds: z.array(z.string().uuid()).min(1).max(50),

  legalName: z.string().min(1).max(200).trim(),

  registrationName: z.string().min(1).max(200).trim().optional(),

})



export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {

  try {

    const admin = getDancecardAdmin()

    const slug = normalizeEventSlug(context.params.eventSlug)

    const event = await loadEventBySlug(admin, slug)

    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })



    const session = await resolveAccountFromSession(admin, request, slug)

    if (!session) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })



    const row = event as Record<string, unknown>

    const agreements = parseAgreementsConfig(row.agreements_config)

    const mode = agreements.mode ?? 'ecke'

    if (mode === 'rabbitsign') {

      return NextResponse.json(

        { error: 'This event collects signatures through RabbitSign, not in-app ECKE signing.' },

        { status: 400 },

      )

    }



    const body = bodySchema.parse(await request.json())

    const sceneName = body.registrationName?.trim() || session.displayName



    const resolved = await resolveRegistrantForDancecardAccount(

      admin,

      event.id,

      session.accountId,

      session.displayName,

      { ensure: true, sceneName, legalName: body.legalName },

    )

    if (!resolved) {

      return NextResponse.json(

        {

          error:

            'Could not create a registration record for signing. The event may be missing registration categories — ask the organizer.',

        },

        { status: 503 },

      )

    }



    const registrantId = resolved.id

    const now = new Date().toISOString()



    const acceptedPolicyDocumentIds: string[] = []
    const failedPolicyDocumentIds: string[] = []

    for (const policyDocumentId of body.policyDocumentIds) {

      const { data: pol, error: pErr } = await admin

        .from('dancecard_policy_documents')

        .select('id')

        .eq('id', policyDocumentId)

        .eq('event_id', event.id)

        .not('published_at', 'is', null)

        .maybeSingle()

      if (pErr) throw pErr

      if (!pol) {
        failedPolicyDocumentIds.push(policyDocumentId)
        continue
      }



      const { error: insErr } = await admin.from('dancecard_registrant_policy_acceptances').insert({

        registrant_id: registrantId,

        policy_document_id: policyDocumentId,

        accepted_at: now,

        signer_name: body.legalName,

        signature_method: 'ecke',

      })

      const code = (insErr as { code?: string } | null)?.code

      if (insErr && code !== '23505') throw insErr

      acceptedPolicyDocumentIds.push(policyDocumentId)

    }



    const ok = failedPolicyDocumentIds.length === 0

    return NextResponse.json(
      { ok, acceptedPolicyDocumentIds, failedPolicyDocumentIds },
      { status: ok ? 200 : 400 },
    )

  } catch (e) {

    if (e instanceof ZodError) {

      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })

    }

    const msg = e instanceof Error ? e.message : 'Error'

    return jsonFromRouteError(e, 'dancecard-[eventSlug]-policy-acceptances')

  }

}


