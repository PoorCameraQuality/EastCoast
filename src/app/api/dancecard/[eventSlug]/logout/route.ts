import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin } from '@/lib/dancecard/routeCommon'
import {
  DANCECARD_SESSION_COOKIE,
  DANCECARD_COOKIE_PATH,
  revokeSessionFromRequest,
} from '@/lib/dancecard/session'

export async function POST(request: NextRequest) {
  const admin = getDancecardAdmin()
  await revokeSessionFromRequest(admin, request)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(DANCECARD_SESSION_COOKIE, '', {
    httpOnly: true,
    path: DANCECARD_COOKIE_PATH,
    maxAge: 0,
  })
  return res
}
