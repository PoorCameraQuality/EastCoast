import { NextResponse } from 'next/server'
import {
  ECKE_EVENT_ASSETS_BUCKET,
  extensionForMime,
  sanitizeAssetFileName,
} from '@/lib/eckeOrgEventAssets'
import { notifyShopIndex, requireOwnedShop, syncVendorListingsMirror } from '@/lib/eckeOrgVendors'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export const runtime = 'nodejs'

const SHOP_ASSET_KINDS = ['logo', 'cover', 'product'] as const
type ShopAssetKind = (typeof SHOP_ASSET_KINDS)[number]

const MAX_BYTES: Record<ShopAssetKind, number> = {
  logo: 512 * 1024,
  cover: 2 * 1024 * 1024,
  product: 2 * 1024 * 1024,
}

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

  const gated = await requireOwnedShop()
  if (gated.error || !gated.session || !gated.admin || !gated.shop) {
    return NextResponse.json({ error: gated.error || 'Create a shop first' }, { status: gated.shop ? gated.status : 404 })
  }

  const form = await request.formData()
  const kindRaw = String(form.get('kind') || '')
  if (!(SHOP_ASSET_KINDS as readonly string[]).includes(kindRaw)) {
    return NextResponse.json({ error: 'Unknown media type' }, { status: 400 })
  }
  const kind = kindRaw as ShopAssetKind
  const file = form.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  if (buf.length > MAX_BYTES[kind]) {
    return NextResponse.json({ error: 'File is too large. Use JPG, PNG, or WebP under the size limit.' }, { status: 400 })
  }

  const mime = sniffImageMime(buf)
  if (!mime) return NextResponse.json({ error: 'Unsupported file. Use JPG, PNG, or WebP.' }, { status: 400 })

  const orgId = gated.session.organization.id
  const rawName = (file as File).name || `${kind}.${extensionForMime(mime)}`
  const productId = String(form.get('productId') || '').trim()
  if (kind === 'product' && !productId) {
    return NextResponse.json({ error: 'Save the product first, then add a photo' }, { status: 400 })
  }

  const folder = kind === 'product' ? `products/${productId}` : kind
  const path = `${orgId}/vendors/${gated.shop.id}/${folder}/${crypto.randomUUID()}-${sanitizeAssetFileName(rawName)}`

  const { error: uploadError } = await gated.admin.storage.from(ECKE_EVENT_ASSETS_BUCKET).upload(path, buf, {
    contentType: mime,
    upsert: false,
    cacheControl: '31536000',
  })
  if (uploadError) {
    console.error('ORG SHOP ASSET UPLOAD', uploadError)
    return NextResponse.json({ error: 'Could not upload that file to storage' }, { status: 503 })
  }

  const { data: publicUrl } = gated.admin.storage.from(ECKE_EVENT_ASSETS_BUCKET).getPublicUrl(path)
  const url = publicUrl.publicUrl

  if (kind === 'logo') {
    const { error } = await gated.admin.from('vendors').update({ logo_url: url }).eq('id', gated.shop.id)
    if (error) return NextResponse.json({ error: 'Uploaded, but could not save the logo' }, { status: 500 })
  } else if (kind === 'cover') {
    const { error } = await gated.admin.from('vendors').update({ cover_url: url }).eq('id', gated.shop.id)
    if (error) return NextResponse.json({ error: 'Uploaded, but could not save the cover' }, { status: 500 })
  } else {
    const { error } = await gated.admin
      .from('vendor_products')
      .update({ image_url: url, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .eq('vendor_id', gated.shop.id)
    if (error) return NextResponse.json({ error: 'Uploaded, but could not save the product photo' }, { status: 500 })
    await syncVendorListingsMirror(gated.shop.id)
  }

  if (gated.shop.status === 'published') notifyShopIndex(gated.shop, 'update')
  return NextResponse.json({ ok: true, url, kind })
}
