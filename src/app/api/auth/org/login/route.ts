import { NextResponse } from 'next/server'
import { createSupabaseServerClientForOrganizer } from '@/lib/dancecard/organizerAuth'
import { getOwnedOrganization, resolveOrgLoginEmail, stampOrgSessionStart } from '@/lib/eckeOrgAuth'
import { orgLoginSchema } from '@/lib/eckeOrgValidation'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.auth)
  if (limited) return limited

  const contentType = request.headers.get('content-type') || ''
  const wantsJson = contentType.includes('application/json')
  let json: unknown
  try {
    if (wantsJson) {
      json = await request.json()
    } else {
      const form = await request.formData()
      json = {
        username: String(form.get('username') || ''),
        password: String(form.get('password') || ''),
      }
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = orgLoginSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }

  const email = await resolveOrgLoginEmail(parsed.data.username)
  if (!email) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const supabase = createSupabaseServerClientForOrganizer()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  })
  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const organization = await getOwnedOrganization(data.user.id)
  if (!organization) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: 'No organization is linked to this login' }, { status: 403 })
  }

  stampOrgSessionStart()

  if (!wantsJson) {
    return NextResponse.redirect(new URL('/dashboard', request.url), 303)
  }
  return NextResponse.json({
    ok: true,
    organizationId: organization.id,
    organizationName: organization.name,
    organizationSlug: organization.slug,
    username: organization.username,
  })
}
