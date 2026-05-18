import { NextResponse } from 'next/server'
import {
  createSupabaseServerClientForOrganizer,
  isUserSiteAdmin,
} from '@/lib/dancecard/organizerAuth'

export type SiteAdminContext = {
  userId: string
}

/** Throws Error with message UNAUTHORIZED or FORBIDDEN. */
export async function requireSiteAdmin(): Promise<SiteAdminContext> {
  const supabase = createSupabaseServerClientForOrganizer()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user?.id) {
    const err = new Error('UNAUTHORIZED')
    throw err
  }
  const admin = await isUserSiteAdmin(user.id)
  if (!admin) {
    const err = new Error('FORBIDDEN')
    throw err
  }
  return { userId: user.id }
}

/** Fail closed if organizer dev bypass is configured outside development. */
export function siteAdminAuthErrorResponse(e: unknown): NextResponse | null {
  if (e instanceof Error) {
    if (e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (e.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  return null
}

export function assertProductionNoOrganizerBypass(): void {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.DANCECARD_ORGANIZER_DEV_BYPASS === '1'
  ) {
    throw new Error(
      'DANCECARD_ORGANIZER_DEV_BYPASS must not be set when NODE_ENV is not development',
    )
  }
}
