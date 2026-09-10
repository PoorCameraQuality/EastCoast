import { NextResponse } from 'next/server'
import { createSupabaseServerClientForOrganizer } from '@/lib/dancecard/organizerAuth'
import { getOwnedOrganization, stampOrgSessionStart } from '@/lib/eckeOrgAuth'
import { orgSignupSchema } from '@/lib/eckeOrgValidation'
import { normalizeUsername, slugifyOrgName } from '@/lib/authUtils'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

async function readSignupBody(request: Request): Promise<{ wantsJson: boolean; body: unknown }> {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return { wantsJson: true, body: await request.json() }
  }
  const form = await request.formData()
  return {
    wantsJson: false,
    body: {
      organizationName: String(form.get('organizationName') || ''),
      email: String(form.get('email') || ''),
      website: String(form.get('website') || ''),
      username: String(form.get('username') || ''),
      password: String(form.get('password') || ''),
    },
  }
}

function signupError(request: Request, wantsJson: boolean, error: string, status: number, issues?: unknown) {
  if (!wantsJson) {
    const url = new URL('/auth/org/signup', request.url)
    url.searchParams.set('error', error)
    return NextResponse.redirect(url, 303)
  }
  return NextResponse.json(issues ? { error, issues } : { error }, { status })
}

export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.auth)
  if (limited) return limited

  let wantsJson = true
  let json: unknown
  try {
    const parsedBody = await readSignupBody(request)
    wantsJson = parsedBody.wantsJson
    json = parsedBody.body
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = orgSignupSchema.safeParse(json)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || 'Validation failed'
    return signupError(request, wantsJson, first, 400, parsed.error.issues)
  }

  const admin = getSupabaseAdminClient()
  if (!admin) {
    return signupError(request, wantsJson, 'Database not configured', 500)
  }

  const organizationName = parsed.data.organizationName.trim()
  const email = parsed.data.email.trim().toLowerCase()
  const website = parsed.data.website?.trim() || null
  const username = normalizeUsername(parsed.data.username)
  let slug = slugifyOrgName(organizationName)
  if (!slug) {
    return signupError(request, wantsJson, 'Organization name must include letters or numbers', 400)
  }

  const { data: existingUsername } = await admin.from('organizations').select('id').eq('username', username).maybeSingle()
  if (existingUsername) {
    return signupError(request, wantsJson, 'Username is already taken', 409)
  }
  const { data: existingEmail } = await admin.from('organizations').select('id').eq('email', email).maybeSingle()
  if (existingEmail) {
    return signupError(request, wantsJson, 'Email is already registered', 409)
  }

  for (let i = 0; i < 6; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`
    const { data: slugHit } = await admin.from('organizations').select('id').eq('slug', candidate).maybeSingle()
    if (!slugHit) {
      slug = candidate
      break
    }
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: organizationName },
  })

  if (createError || !created.user) {
    const message = createError?.message || ''
    if (/already|registered|exists/i.test(message)) {
      return signupError(request, wantsJson, 'Email is already registered', 409)
    }
    console.error('ORG SIGNUP: createUser failed', createError)
    return signupError(request, wantsJson, 'Could not create organization', 500)
  }

  const userId = created.user.id

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: organizationName,
      slug,
      email,
      website,
      username,
      owner_user_id: userId,
    })
    .select('id, name, slug, username, email')
    .single()

  if (orgError || !org) {
    console.error('ORG SIGNUP: org insert failed', orgError)
    await admin.auth.admin.deleteUser(userId)
    if (orgError?.code === '23505') {
      return signupError(request, wantsJson, 'Organization name or email already exists', 409)
    }
    return signupError(request, wantsJson, 'Could not create organization', 500)
  }

  const { error: metaError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...(created.user.app_metadata ?? {}),
      ecke_role: 'org',
      organization_id: org.id,
    },
  })
  if (metaError) {
    console.error('ORG SIGNUP: app_metadata update failed', metaError)
  }

  const supabase = createSupabaseServerClientForOrganizer()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  })
  if (signInError) {
    console.error('ORG SIGNUP: sign-in after create failed', signInError)
    return signupError(request, wantsJson, 'Organization created. Sign in to continue.', 201)
  }

  const owned = await getOwnedOrganization(userId)
  stampOrgSessionStart()
  if (!wantsJson) {
    return NextResponse.redirect(new URL('/dashboard', request.url), 303)
  }
  return NextResponse.json({
    ok: true,
    organizationId: owned?.id ?? org.id,
    organizationName: owned?.name ?? org.name,
    organizationSlug: owned?.slug ?? org.slug,
    username: owned?.username ?? username,
  })
}
