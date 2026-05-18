import crypto from 'crypto'

const consumedHandoffCodes = new Map<string, number>()

function timingSafeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

/** Mark a handoff code as used (in-memory; single consume per process lifetime). */
export function consumeC2kHandoffCode(code: string): boolean {
  const now = Date.now()
  for (const [k, exp] of Array.from(consumedHandoffCodes.entries())) {
    if (exp < now) consumedHandoffCodes.delete(k)
  }
  if (consumedHandoffCodes.has(code)) return false
  consumedHandoffCodes.set(code, now + 120_000)
  return true
}

export type C2kHandoffPayload = {
  dancecardSlug: string
  c2kConventionSlug: string
  email?: string
  exp: number
}

function secret() {
  const s = process.env.DANCECARD_C2K_HANDOFF_SECRET
  if (!s || s.length < 16) return null
  return s
}

export function mintC2kHandoffCode(input: {
  dancecardSlug: string
  c2kConventionSlug: string
  email?: string
}): string | null {
  const key = secret()
  if (!key) return null
  const payload: C2kHandoffPayload = {
    dancecardSlug: input.dancecardSlug.toLowerCase(),
    c2kConventionSlug: input.c2kConventionSlug,
    email: input.email?.trim().toLowerCase(),
    exp: Date.now() + 60_000,
  }
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', key).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyC2kHandoffCode(code: string): C2kHandoffPayload | null {
  const key = secret()
  if (!key) return null
  const [body, sig] = code.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', key).update(body).digest('base64url')
  if (!timingSafeEqualString(sig, expected)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as C2kHandoffPayload
    if (!payload.dancecardSlug || !payload.c2kConventionSlug) return null
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function c2kReturnUrl(c2kConventionSlug: string): string {
  const base = process.env.C2K_WEB_ORIGIN?.replace(/\/$/, '') ?? ''
  if (!base) return ''
  return `${base}/conventions/${encodeURIComponent(c2kConventionSlug)}?tab=Manage`
}
