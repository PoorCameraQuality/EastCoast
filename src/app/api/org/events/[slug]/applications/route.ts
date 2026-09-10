import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireEventCapability, writeEventAudit } from '@/lib/eckeOrgEvents'

const schema = z.object({
  staffApplicationUrl: z.string().max(500).optional().or(z.literal('')),
  vendorApplicationUrl: z.string().max(500).optional().or(z.literal('')),
  presenterApplicationUrl: z.string().max(500).optional().or(z.literal('')),
  photographerApplicationUrl: z.string().max(500).optional().or(z.literal('')),
  staffApplicationsOpen: z.boolean().optional(),
  vendorApplicationsOpen: z.boolean().optional(),
  presenterApplicationsOpen: z.boolean().optional(),
  photographerApplicationsOpen: z.boolean().optional(),
})

function asUrl(value?: string) {
  const raw = (value || '').trim()
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const gated = await requireEventCapability(params.slug, 'settings')
  if (gated.error || !gated.session || !gated.admin || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Check those application links' }, { status: 400 })

  const { error } = await gated.admin
    .from('events')
    .update({
      staff_application_url: asUrl(parsed.data.staffApplicationUrl),
      vendor_application_url: asUrl(parsed.data.vendorApplicationUrl),
      presenter_application_url: asUrl(parsed.data.presenterApplicationUrl),
      photographer_application_url: asUrl(parsed.data.photographerApplicationUrl),
      staff_applications_open: Boolean(parsed.data.staffApplicationsOpen && asUrl(parsed.data.staffApplicationUrl)),
      vendor_applications_open: Boolean(parsed.data.vendorApplicationsOpen && asUrl(parsed.data.vendorApplicationUrl)),
      presenter_applications_open: Boolean(parsed.data.presenterApplicationsOpen && asUrl(parsed.data.presenterApplicationUrl)),
      photographer_applications_open: Boolean(
        parsed.data.photographerApplicationsOpen && asUrl(parsed.data.photographerApplicationUrl),
      ),
    })
    .eq('id', gated.event.id)
  if (error) return NextResponse.json({ error: 'Could not save applications' }, { status: 500 })

  await writeEventAudit(
    gated.event.id,
    gated.session.organization.id,
    gated.session.user.id,
    'settings',
    'Updated application links',
  )
  return NextResponse.json({ ok: true })
}
