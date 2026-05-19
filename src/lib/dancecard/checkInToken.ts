import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const TOKEN_PREFIX = 'dc1'

function secret(): string {
  const explicit = process.env.DANCECARD_CHECKIN_SECRET?.trim()
  if (process.env.NODE_ENV === 'production') {
    if (!explicit) {
      throw new Error('DANCECARD_CHECKIN_SECRET is required in production')
    }
    return explicit
  }
  return (
    explicit ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    'dev-checkin-secret-change-me'
  )
}

export function generateCheckInTokenValue(): string {
  return randomBytes(12).toString('base64url')
}

/** Signed payload: dc1.<token> — token stored on registrant row. */
export function encodeCheckInQrPayload(registrantId: string, token: string): string {
  const sig = createHmac('sha256', secret()).update(`${registrantId}:${token}`).digest('base64url').slice(0, 16)
  return `${TOKEN_PREFIX}.${registrantId}.${token}.${sig}`
}

export function verifyCheckInQrPayload(payload: string): { registrantId: string; token: string } | null {
  const parts = payload.trim().split('.')
  if (parts.length !== 4 || parts[0] !== TOKEN_PREFIX) return null
  const registrantId = parts[1]!
  const token = parts[2]!
  const sig = parts[3]!
  const expected = createHmac('sha256', secret()).update(`${registrantId}:${token}`).digest('base64url').slice(0, 16)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  return { registrantId, token }
}
