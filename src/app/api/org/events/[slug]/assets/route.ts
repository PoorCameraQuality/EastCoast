import { NextResponse } from 'next/server'
import {
  ECKE_EVENT_ASSETS_BUCKET,
  EVENT_ASSET_GUIDES,
  EVENT_ASSET_KINDS,
  extensionForMime,
  sanitizeAssetFileName,
  type EventAssetKind,
} from '@/lib/eckeOrgEventAssets'
import { requireEventCapability, writeEventAudit } from '@/lib/eckeOrgEvents'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export const runtime = 'nodejs'

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function sniffEventAssetMime(buf: Buffer): string | null {
  if (buf.length >= 5 && buf.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf'
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png'
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }
  return null
}

function columnForKind(kind: EventAssetKind): 'hero_image' | 'logo' | 'program_url' | 'map_url' | 'images' {
  if (kind === 'hero') return 'hero_image'
  if (kind === 'logo') return 'logo'
  if (kind === 'program') return 'program_url'
  if (kind === 'map') return 'map_url'
  return 'images'
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.orgMedia)
  if (limited) return limited

  const gated = await requireEventCapability(params.slug, 'media')
  if (gated.error || !gated.session || !gated.admin || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }

  const form = await request.formData()
  const kindRaw = String(form.get('kind') || '')
  if (!(EVENT_ASSET_KINDS as readonly string[]).includes(kindRaw)) {
    return NextResponse.json({ error: 'Unknown media type' }, { status: 400 })
  }
  const kind = kindRaw as EventAssetKind
  const guide = EVENT_ASSET_GUIDES[kind]
  const file = form.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  if (buf.length > guide.maxBytes) {
    return NextResponse.json({ error: `File is too large. ${guide.hint}` }, { status: 400 })
  }

  const mime = sniffEventAssetMime(buf)
  if (!mime) return NextResponse.json({ error: `Unsupported file. ${guide.hint}` }, { status: 400 })
  if (kind === 'program' ? !(IMAGE_MIMES.has(mime) || mime === 'application/pdf') : !IMAGE_MIMES.has(mime)) {
    return NextResponse.json({ error: `Unsupported file. ${guide.hint}` }, { status: 400 })
  }

  const orgId = gated.session.organization.id
  const rawName = (file as File).name || `${kind}.${extensionForMime(mime)}`
  const path = `${orgId}/${gated.event.id}/${kind}/${crypto.randomUUID()}-${sanitizeAssetFileName(rawName)}`

  const { error: uploadError } = await gated.admin.storage.from(ECKE_EVENT_ASSETS_BUCKET).upload(path, buf, {
    contentType: mime,
    upsert: false,
    cacheControl: '31536000',
  })
  if (uploadError) {
    console.error('ORG EVENT ASSET UPLOAD', uploadError)
    return NextResponse.json({ error: 'Could not upload that file to storage' }, { status: 503 })
  }

  const { data: publicUrl } = gated.admin.storage.from(ECKE_EVENT_ASSETS_BUCKET).getPublicUrl(path)
  const url = publicUrl.publicUrl
  const column = columnForKind(kind)

  if (column === 'images') {
    const current = Array.isArray(gated.event.images) ? gated.event.images.filter(Boolean) : []
    if (current.length >= 12) {
      return NextResponse.json({ error: 'Gallery is limited to 12 photos' }, { status: 400 })
    }
    const images = [...current, url]
    const { error } = await gated.admin.from('events').update({ images }).eq('id', gated.event.id)
    if (error) return NextResponse.json({ error: 'Uploaded, but could not save the gallery' }, { status: 500 })
    await writeEventAudit(gated.event.id, orgId, gated.session.user.id, 'media', 'Added a gallery photo')
    return NextResponse.json({ ok: true, url, kind, images })
  }

  const { error } = await gated.admin.from('events').update({ [column]: url }).eq('id', gated.event.id)
  if (error) return NextResponse.json({ error: 'Uploaded, but could not save the event' }, { status: 500 })
  await writeEventAudit(gated.event.id, orgId, gated.session.user.id, 'media', `Updated ${guide.title.toLowerCase()}`)
  return NextResponse.json({ ok: true, url, kind })
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const gated = await requireEventCapability(params.slug, 'media')
  if (gated.error || !gated.session || !gated.admin || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }

  let json: { kind?: string; url?: string } = {}
  try {
    json = (await request.json()) as { kind?: string; url?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const kindRaw = String(json.kind || '')
  if (!(EVENT_ASSET_KINDS as readonly string[]).includes(kindRaw)) {
    return NextResponse.json({ error: 'Unknown media type' }, { status: 400 })
  }
  const kind = kindRaw as EventAssetKind
  const column = columnForKind(kind)

  if (column === 'images') {
    const remove = String(json.url || '').trim()
    const images = (gated.event.images || []).filter((item) => item !== remove)
    const { error } = await gated.admin.from('events').update({ images }).eq('id', gated.event.id)
    if (error) return NextResponse.json({ error: 'Could not remove that photo' }, { status: 500 })
    return NextResponse.json({ ok: true, images })
  }

  const { error } = await gated.admin.from('events').update({ [column]: null }).eq('id', gated.event.id)
  if (error) return NextResponse.json({ error: 'Could not remove that file' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
