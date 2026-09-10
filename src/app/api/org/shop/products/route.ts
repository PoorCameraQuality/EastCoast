import { NextResponse } from 'next/server'
import {
  listShopProducts,
  notifyShopIndex,
  orgShopProductSchema,
  productWritePayload,
  requireOwnedShop,
  syncVendorListingsMirror,
} from '@/lib/eckeOrgVendors'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export async function GET() {
  const gated = await requireOwnedShop()
  if (gated.error || !gated.session) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }
  if (!gated.shop) return NextResponse.json({ error: 'Create a shop first' }, { status: 404 })
  const products = await listShopProducts(gated.shop.id)
  return NextResponse.json({ ok: true, products })
}

export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.api)
  if (limited) return limited

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
  const parsed = orgShopProductSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 })
  }

  const existing = await listShopProducts(gated.shop.id)
  if (existing.length >= 50) {
    return NextResponse.json({ error: 'Shops can list up to 50 products' }, { status: 400 })
  }

  const payload = productWritePayload(
    parsed.data,
    gated.shop.id,
    gated.session.organization.id,
    existing.length,
  )
  const { data, error } = await gated.admin
    .from('vendor_products')
    .insert(payload)
    .select('id')
    .single()
  if (error || !data) {
    console.error('ORG SHOP PRODUCT CREATE', error)
    return NextResponse.json({ error: 'Could not add product' }, { status: 500 })
  }

  await syncVendorListingsMirror(gated.shop.id)
  if (gated.shop.status === 'published' && payload.status === 'published') {
    notifyShopIndex(gated.shop, 'update')
  }
  return NextResponse.json({ ok: true, id: data.id })
}
