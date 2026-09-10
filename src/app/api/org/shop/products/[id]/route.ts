import { NextResponse } from 'next/server'
import {
  notifyShopIndex,
  orgShopProductSchema,
  productWritePayload,
  requireOwnedShop,
  syncVendorListingsMirror,
} from '@/lib/eckeOrgVendors'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  const { data: existing } = await gated.admin
    .from('vendor_products')
    .select('id, sort_order')
    .eq('id', params.id)
    .eq('vendor_id', gated.shop.id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const payload = productWritePayload(
    parsed.data,
    gated.shop.id,
    gated.session.organization.id,
    Number(existing.sort_order) || 0,
  )
  const { error } = await gated.admin.from('vendor_products').update(payload).eq('id', params.id)
  if (error) {
    console.error('ORG SHOP PRODUCT UPDATE', error)
    return NextResponse.json({ error: 'Could not update product' }, { status: 500 })
  }

  await syncVendorListingsMirror(gated.shop.id)
  if (gated.shop.status === 'published') notifyShopIndex(gated.shop, 'update')
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const gated = await requireOwnedShop()
  if (gated.error || !gated.session || !gated.admin || !gated.shop) {
    return NextResponse.json({ error: gated.error || 'Create a shop first' }, { status: gated.shop ? gated.status : 404 })
  }

  const { data: existing } = await gated.admin
    .from('vendor_products')
    .select('id')
    .eq('id', params.id)
    .eq('vendor_id', gated.shop.id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { error } = await gated.admin.from('vendor_products').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: 'Could not delete product' }, { status: 500 })

  await syncVendorListingsMirror(gated.shop.id)
  if (gated.shop.status === 'published') notifyShopIndex(gated.shop, 'update')
  return NextResponse.json({ ok: true })
}
