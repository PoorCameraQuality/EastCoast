import { NextResponse } from 'next/server'
import { requireOrgSession } from '@/lib/eckeOrgAuth'

export async function GET() {
  const session = await requireOrgSession()
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({
    ok: true,
    organizationId: session.organization.id,
    organizationName: session.organization.name,
    organizationSlug: session.organization.slug,
    username: session.organization.username,
    email: session.organization.email,
  })
}
