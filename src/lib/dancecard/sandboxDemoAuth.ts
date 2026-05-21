import bcrypt from 'bcryptjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveRegistrantForDancecardAccount } from '@/lib/dancecard/ensureSelfServiceRegistrant'
import { getSandboxDemoPersona, type SandboxDemoPersonaId } from '@/lib/dancecard/sandboxDemoPersonas'
import { allowPublicAttendeeDemoAccess } from '@/lib/dancecard/publicDemo'
import {
  DANCECARD_COOKIE_PATH,
  DANCECARD_SESSION_COOKIE,
  hashToken,
  newSessionToken,
  revokeAllSessionsForAccount,
  SESSION_DAYS,
} from '@/lib/dancecard/session'
import { getDancecardAdmin, loadEventBySlug } from '@/lib/dancecard/routeCommon'
import { NextResponse } from 'next/server'

/** Local demo passwords only — must match `dancecard-seed-sandbox-profiles.mjs`. */
const DEMO_PASSWORDS: Record<SandboxDemoPersonaId, string> = {
  alex: 'SandboxCompare1!',
  brax: 'SandboxBrax1!',
  casey: 'SandboxCasey1!',
}

export async function createSandboxDemoSessionResponse(
  eventSlug: string,
  personaId: string,
): Promise<NextResponse> {
  if (!allowPublicAttendeeDemoAccess(eventSlug)) {
    return NextResponse.json({ error: 'Demo login is only available for the public sandbox event.' }, { status: 403 })
  }

  const persona = getSandboxDemoPersona(personaId)
  if (!persona) {
    return NextResponse.json({ error: 'Unknown demo persona.' }, { status: 400 })
  }

  const admin = getDancecardAdmin()
  const event = await loadEventBySlug(admin, eventSlug)
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const password = DEMO_PASSWORDS[persona.id as SandboxDemoPersonaId]
  const account = await findAccount(admin, event.id, persona.username)
  if (!account) {
    return NextResponse.json(
      {
        error: 'Demo account missing. Run npm run dancecard:seed-sandbox -- --reset on this database.',
      },
      { status: 503 },
    )
  }

  if (!(await bcrypt.compare(password, account.password_hash))) {
    return NextResponse.json(
      { error: 'Demo password mismatch. Re-run the sandbox seed script to refresh demo accounts.' },
      { status: 503 },
    )
  }

  await resolveRegistrantForDancecardAccount(admin, event.id, account.id, account.display_name, {
    ensure: true,
  })

  await revokeAllSessionsForAccount(admin, account.id)

  const token = newSessionToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString()
  const { error: sessErr } = await admin.from('dancecard_sessions').insert({
    account_id: account.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })
  if (sessErr) throw sessErr

  const res = NextResponse.json({
    account: { id: account.id, username: account.username, displayName: account.display_name },
    persona: persona.id,
  })
  res.cookies.set(DANCECARD_SESSION_COOKIE, token, {
    httpOnly: true,
    path: DANCECARD_COOKIE_PATH,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 86400,
  })
  return res
}

async function findAccount(admin: SupabaseClient, eventId: string, username: string) {
  const { data, error } = await admin
    .from('dancecard_accounts')
    .select('id, username, display_name, password_hash')
    .eq('event_id', eventId)
    .eq('username', username.toLowerCase())
    .maybeSingle()
  if (error) throw error
  return data as { id: string; username: string; display_name: string; password_hash: string } | null
}
