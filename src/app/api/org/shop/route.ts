import { NextResponse } from 'next/server'
import {
  listShopProducts,
  notifyShopIndex,
  orgShopSchema,
  requireOwnedShop,
  shopWritePayload,
  takeRequestedVendorSlug,
  uniqueVendorSlug,
} from '@/lib/eckeOrgVendors'
import { slugifyShopSlug } from '@/lib/eckeOrgVendorShared'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export async function GET() {
  const gated = await requireOwnedShop()
  if (gated.error || !gated.session) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }
  if (!gated.shop) return NextResponse.json({ ok: true, shop: null, products: [] })
  const products = await listShopProducts(gated.shop.id)
  return NextResponse.json({ ok: true, shop: gated.shop, products })
}

export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.forms)
  if (limited) return limited

  const gated = await requireOwnedShop()
  if (gated.error || !gated.session || !gated.admin) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }
  if (gated.shop) {
    return NextResponse.json({ error: 'This organization already has a shop' }, { status: 409 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = orgShopSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 })
  }

  const requestedSlug = parsed.data.slug?.trim()
  const resolved = requestedSlug
    ? await takeRequestedVendorSlug(requestedSlug)
    : { slug: await uniqueVendorSlug(parsed.data.name) }
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 409 })
  }

  const payload = shopWritePayload(parsed.data, gated.session.organization.id, resolved.slug)
  const { data, error } = await gated.admin
    .from('vendors')
    .insert({ ...payload, listings: [] })
    .select('id, slug, status')
    .single()
  if (error || !data) {
    console.error('ORG SHOP CREATE', error)
    return NextResponse.json({ error: 'Could not create shop' }, { status: 500 })
  }

  if (data.status === 'published') notifyShopIndex({ ...payload, slug: data.slug }, 'publish')
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug, status: data.status })
}

export async function PATCH(request: Request) {
  const gated = await requireOwnedShop()
  if (gated.error || !gated.session || !gated.admin || !gated.shop) {
    return NextResponse.json({ error: gated.error || 'Create a shop first' }, { status: gated.shop ? gated.status : 404 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = orgShopSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 })
  }

  const requestedSlug = parsed.data.slug?.trim()
  let slug = gated.shop.slug
  if (requestedSlug && slugifyShopSlug(requestedSlug) !== gated.shop.slug) {
    const resolved = await takeRequestedVendorSlug(requestedSlug, gated.shop.id)
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 409 })
    }
    slug = resolved.slug
  }

  const payload = shopWritePayload(parsed.data, gated.session.organization.id, slug)
  const { error } = await gated.admin.from('vendors').update(payload).eq('id', gated.shop.id)
  if (error) {
    console.error('ORG SHOP UPDATE', error)
    return NextResponse.json({ error: 'Could not update shop' }, { status: 500 })
  }

  const wasPublic = gated.shop.status === 'published'
  const isPublic = payload.status === 'published'
  if (isPublic) {
    if (slug !== gated.shop.slug) notifyShopIndex(gated.shop, 'delete')
    notifyShopIndex({ ...payload, slug }, wasPublic ? 'update' : 'publish')
  } else if (wasPublic) {
    notifyShopIndex(gated.shop, 'unpublish')
  }

  return NextResponse.json({ ok: true, slug, status: payload.status })
}

export async function DELETE() {
  const gated = await requireOwnedShop()
  if (gated.error || !gated.session || !gated.admin || !gated.shop) {
    return NextResponse.json({ error: gated.error || 'Shop not found' }, { status: gated.shop ? gated.status : 404 })
  }
  const { error } = await gated.admin.from('vendors').delete().eq('id', gated.shop.id)
  if (error) {
    return NextResponse.json({ error: 'Could not delete shop' }, { status: 500 })
  }
  if (gated.shop.status === 'published') notifyShopIndex(gated.shop, 'delete')
  return NextResponse.json({ ok: true })
}
