import { NextResponse } from 'next/server'
import {
  ECKE_EVENT_ASSETS_BUCKET,
  extensionForMime,
  sanitizeAssetFileName,
} from '@/lib/eckeOrgEventAssets'
import {
  MAX_PRODUCT_MEDIA,
  coverImageFromMedia,
  normalizeShopProductMedia,
  type ShopProductMediaItem,
} from '@/lib/eckeOrgVendorShared'
import { notifyShopIndex, requireOwnedShop, syncVendorListingsMirror } from '@/lib/eckeOrgVendors'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export const runtime = 'nodejs'

const SHOP_ASSET_KINDS = ['logo', 'cover', 'product'] as const
type ShopAssetKind = (typeof SHOP_ASSET_KINDS)[number]

const MAX_BYTES: Record<ShopAssetKind, number> = {
  logo: 512 * 1024,
  cover: 2 * 1024 * 1024,
  product: 25 * 1024 * 1024,
}

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_PRODUCT_VIDEO_BYTES = 25 * 1024 * 1024

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

function sniffVideoMime(buf: Buffer): string | null {
  if (buf.length >= 12 && buf.toString('ascii', 4, 8) === 'ftyp') return 'video/mp4'
  if (buf.length >= 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return 'video/webm'
  }
  return null
}

function collectFiles(form: FormData): Blob[] {
  const out: Blob[] = []
  const multi = form.getAll('files')
  for (const item of multi) {
    if (item instanceof Blob && item.size > 0) out.push(item)
  }
  const single = form.get('file')
  if (single instanceof Blob && single.size > 0) out.push(single)
  return out
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
  const files = collectFiles(form)
  if (!files.length) {
    return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 })
  }

  if (kind !== 'product' && files.length > 1) {
    return NextResponse.json({ error: 'Upload one logo or cover at a time' }, { status: 400 })
  }

  const orgId = gated.session.organization.id
  const productId = String(form.get('productId') || '').trim()
  if (kind === 'product' && !productId) {
    return NextResponse.json({ error: 'Save the product first, then add photos or video' }, { status: 400 })
  }

  if (kind !== 'product') {
    const file = files[0]
    const buf = Buffer.from(await file.arrayBuffer())
    if (buf.length > MAX_BYTES[kind]) {
      return NextResponse.json({ error: 'File is too large. Use JPG, PNG, or WebP under the size limit.' }, { status: 400 })
    }
    const mime = sniffImageMime(buf)
    if (!mime) return NextResponse.json({ error: 'Unsupported file. Use JPG, PNG, or WebP.' }, { status: 400 })

    const rawName = (file as File).name || `${kind}.${extensionForMime(mime)}`
    const path = `${orgId}/vendors/${gated.shop.id}/${kind}/${crypto.randomUUID()}-${sanitizeAssetFileName(rawName)}`
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
    } else {
      const { error } = await gated.admin.from('vendors').update({ cover_url: url }).eq('id', gated.shop.id)
      if (error) return NextResponse.json({ error: 'Uploaded, but could not save the cover' }, { status: 500 })
    }
    if (gated.shop.status === 'published') notifyShopIndex(gated.shop, 'update')
    return NextResponse.json({ ok: true, url, kind })
  }

  const { data: existing } = await gated.admin
    .from('vendor_products')
    .select('id, image_url, media')
    .eq('id', productId)
    .eq('vendor_id', gated.shop.id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const replace = String(form.get('replace') || '') === '1'
  let media: ShopProductMediaItem[] = replace
    ? []
    : normalizeShopProductMedia(existing.media, existing.image_url)

  if (media.length + files.length > MAX_PRODUCT_MEDIA) {
    return NextResponse.json(
      { error: `You can add up to ${MAX_PRODUCT_MEDIA} photos/videos per product` },
      { status: 400 },
    )
  }

  const uploaded: ShopProductMediaItem[] = []
  for (const file of files) {
    const buf = Buffer.from(await file.arrayBuffer())
    const imageMime = sniffImageMime(buf)
    const videoMime = imageMime ? null : sniffVideoMime(buf)
    const mime = imageMime || videoMime
    if (!mime) {
      return NextResponse.json(
        { error: 'Unsupported file. Use JPG, PNG, WebP, MP4, or WebM.' },
        { status: 400 },
      )
    }
    const mediaKind = imageMime ? 'image' : 'video'
    const maxBytes = mediaKind === 'image' ? MAX_PRODUCT_IMAGE_BYTES : MAX_PRODUCT_VIDEO_BYTES
    if (buf.length > maxBytes) {
      return NextResponse.json(
        {
          error:
            mediaKind === 'image'
              ? 'Photos must be under 5 MB (JPG, PNG, or WebP).'
              : 'Videos must be under 25 MB (MP4 or WebM).',
        },
        { status: 400 },
      )
    }

    const rawName = (file as File).name || `product.${extensionForMime(mime)}`
    const path = `${orgId}/vendors/${gated.shop.id}/products/${productId}/${crypto.randomUUID()}-${sanitizeAssetFileName(rawName)}`
    const { error: uploadError } = await gated.admin.storage.from(ECKE_EVENT_ASSETS_BUCKET).upload(path, buf, {
      contentType: mime,
      upsert: false,
      cacheControl: '31536000',
    })
    if (uploadError) {
      console.error('ORG SHOP PRODUCT MEDIA UPLOAD', uploadError)
      return NextResponse.json({ error: 'Could not upload that file to storage' }, { status: 503 })
    }
    const { data: publicUrl } = gated.admin.storage.from(ECKE_EVENT_ASSETS_BUCKET).getPublicUrl(path)
    uploaded.push({
      id: crypto.randomUUID(),
      url: publicUrl.publicUrl,
      kind: mediaKind,
      sortOrder: media.length + uploaded.length,
    })
  }

  media = [...media, ...uploaded].map((item, index) => ({ ...item, sortOrder: index }))
  const cover = coverImageFromMedia(media, null)
  const { error } = await gated.admin
    .from('vendor_products')
    .update({
      media,
      image_url: cover,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .eq('vendor_id', gated.shop.id)
  if (error) {
    console.error('ORG SHOP PRODUCT MEDIA SAVE', error)
    return NextResponse.json({ error: 'Uploaded, but could not save product media' }, { status: 500 })
  }

  await syncVendorListingsMirror(gated.shop.id)
  if (gated.shop.status === 'published') notifyShopIndex(gated.shop, 'update')
  return NextResponse.json({ ok: true, kind: 'product', media, urls: uploaded.map((item) => item.url) })
}
