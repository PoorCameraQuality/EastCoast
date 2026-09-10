import { NextResponse } from 'next/server'
import {
  ECKE_EVENT_ASSETS_BUCKET,
  EVENT_ASSET_GUIDES,
  extensionForMime,
  sanitizeAssetFileName,
} from '@/lib/eckeOrgEventAssets'
import { notifyPlaceIndex, requireOwnedPlace } from '@/lib/eckeOrgDungeons'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export const runtime = 'nodejs'

const PLACE_ASSET_KINDS = ['hero', 'logo', 'gallery'] as const
type PlaceAssetKind = (typeof PLACE_ASSET_KINDS)[number]

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function sniffImageMime(buf: Buffer): string | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png'
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  return null
}

export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.orgMedia)
  if (limited) return limited

  const gated = await requireOwnedPlace()
  if (gated.error || !gated.session || !gated.admin || !gated.place) {
    return NextResponse.json(
      { error: gated.error || 'Create a dungeon or club first' },
      { status: gated.place ? gated.status : 404 },
    )
  }

  const form = await request.formData()
  const kindRaw = String(form.get('kind') || '')
  if (!(PLACE_ASSET_KINDS as readonly string[]).includes(kindRaw)) {
    return NextResponse.json({ error: 'Unknown media type' }, { status: 400 })
  }
  const kind = kindRaw as PlaceAssetKind
  const guide = EVENT_ASSET_GUIDES[kind]
  const file = form.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  if (buf.length > guide.maxBytes) {
    return NextResponse.json({ error: `File is too large. ${guide.hint}` }, { status: 400 })
  }

  const mime = sniffImageMime(buf)
  if (!mime || !IMAGE_MIMES.has(mime)) {
    return NextResponse.json({ error: `Unsupported file. ${guide.hint}` }, { status: 400 })
  }

  const orgId = gated.session.organization.id
  const rawName = (file as File).name || `${kind}.${extensionForMime(mime)}`
  const path = `${orgId}/places/${gated.place.id}/${kind}/${crypto.randomUUID()}-${sanitizeAssetFileName(rawName)}`

  const { error: uploadError } = await gated.admin.storage.from(ECKE_EVENT_ASSETS_BUCKET).upload(path, buf, {
    contentType: mime,
    upsert: false,
    cacheControl: '31536000',
  })
  if (uploadError) {
    console.error('ORG PLACE ASSET UPLOAD', uploadError)
    return NextResponse.json({ error: 'Could not upload that file to storage' }, { status: 503 })
  }

  const { data: publicUrl } = gated.admin.storage.from(ECKE_EVENT_ASSETS_BUCKET).getPublicUrl(path)
  const url = publicUrl.publicUrl

  if (kind === 'logo') {
    const { error } = await gated.admin.from('dungeon_venues').update({ logo_url: url }).eq('id', gated.place.id)
    if (error) return NextResponse.json({ error: 'Uploaded, but could not save the logo' }, { status: 500 })
  } else if (kind === 'hero') {
    const { error } = await gated.admin.from('dungeon_venues').update({ cover_url: url }).eq('id', gated.place.id)
    if (error) return NextResponse.json({ error: 'Uploaded, but could not save the cover' }, { status: 500 })
  } else {
    const current = Array.isArray(gated.place.gallery_urls) ? gated.place.gallery_urls.filter(Boolean) : []
    if (current.length >= 12) {
      return NextResponse.json({ error: 'Gallery is limited to 12 photos' }, { status: 400 })
    }
    const gallery_urls = [...current, url]
    const { error } = await gated.admin.from('dungeon_venues').update({ gallery_urls }).eq('id', gated.place.id)
    if (error) return NextResponse.json({ error: 'Uploaded, but could not save the gallery' }, { status: 500 })
    if (gated.place.status === 'published') notifyPlaceIndex(gated.place, 'update')
    return NextResponse.json({ ok: true, url, kind, images: gallery_urls })
  }

  if (gated.place.status === 'published') notifyPlaceIndex(gated.place, 'update')
  return NextResponse.json({ ok: true, url, kind })
}

export async function DELETE(request: Request) {
  const gated = await requireOwnedPlace()
  if (gated.error || !gated.session || !gated.admin || !gated.place) {
    return NextResponse.json({ error: gated.error || 'Location not found' }, { status: gated.place ? gated.status : 404 })
  }

  let json: { kind?: string; url?: string } = {}
  try {
    json = (await request.json()) as { kind?: string; url?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const kindRaw = String(json.kind || '')
  if (!(PLACE_ASSET_KINDS as readonly string[]).includes(kindRaw)) {
    return NextResponse.json({ error: 'Unknown media type' }, { status: 400 })
  }
  const kind = kindRaw as PlaceAssetKind

  if (kind === 'gallery') {
    const remove = String(json.url || '').trim()
    const gallery_urls = (gated.place.gallery_urls || []).filter((item) => item !== remove)
    const { error } = await gated.admin.from('dungeon_venues').update({ gallery_urls }).eq('id', gated.place.id)
    if (error) return NextResponse.json({ error: 'Could not remove that photo' }, { status: 500 })
    return NextResponse.json({ ok: true, images: gallery_urls })
  }

  const column = kind === 'logo' ? 'logo_url' : 'cover_url'
  const { error } = await gated.admin.from('dungeon_venues').update({ [column]: null }).eq('id', gated.place.id)
  if (error) return NextResponse.json({ error: 'Could not remove that file' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
