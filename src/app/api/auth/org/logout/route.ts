import { NextResponse } from 'next/server'
import { createSupabaseServerClientForOrganizer } from '@/lib/dancecard/organizerAuth'
import { clearOrgSessionStart } from '@/lib/eckeOrgAuth'

export async function POST() {
  const supabase = createSupabaseServerClientForOrganizer()
  const { error } = await supabase.auth.signOut()
  clearOrgSessionStart()
  if (error) {
    console.error('ORG LOGOUT: signOut failed', error)
    return NextResponse.json({ error: 'Could not sign out' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
