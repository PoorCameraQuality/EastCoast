export type ClientErrorPayload = {
  status: number
  body: { error: string; code?: string }
}

const KNOWN_STATUSES: Record<string, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
}

/**
 * Maps thrown errors to safe client responses. Logs unknown errors server-side.
 */
export function toClientError(e: unknown, logPrefix = 'API'): ClientErrorPayload {
  if (e instanceof Error) {
    const status = KNOWN_STATUSES[e.message] ?? (e.message.startsWith('BAD_REQUEST:') ? 400 : null)
    if (status === 401) return { status: 401, body: { error: 'Unauthorized' } }
    if (status === 403) return { status: 403, body: { error: 'Forbidden' } }
    if (status === 404) return { status: 404, body: { error: 'Not found' } }
    if (status === 400) {
      const msg = e.message.startsWith('BAD_REQUEST:')
        ? e.message.replace(/^BAD_REQUEST:\s*/, '')
        : 'Bad request'
      return { status: 400, body: { error: msg } }
    }
    if (e.message === 'EARLY_CHECK_IN') {
      const ex = e as Error & { eligibility?: string; validFrom?: string | null }
      return {
        status: 409,
        body: {
          error: 'This attendee is early for their ticket check-in window.',
          code: 'EARLY_CHECK_IN',
        },
      }
    }
  }
  console.error(`[${logPrefix}]`, e)
  return { status: 500, body: { error: 'Internal error' } }
}
