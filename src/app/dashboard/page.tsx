import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import OrgDashboard from '@/components/org/dashboard/OrgDashboard'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { requireOwnedPlace } from '@/lib/eckeOrgDungeons'
import { listManagedEvents } from '@/lib/eckeOrgEvents'
import { listShopProducts, requireOwnedShop } from '@/lib/eckeOrgVendors'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function OrgDashboardPage() {
  const session = await requireOrgSession()
  if (!session) {
    redirect('/auth/org/login')
  }

  const { organization } = session
  const [shopGate, placeGate, events] = await Promise.all([
    requireOwnedShop(),
    requireOwnedPlace(),
    listManagedEvents(organization.id),
  ])
  const shop = shopGate.shop
  const place = placeGate.place
  const products = shop ? await listShopProducts(shop.id) : []
  const publicProductCount = products.filter((item) => item.status === 'published').length

  return (
    <OrgDashboard
      organizationName={organization.name}
      signedInAs={organization.username || organization.email}
      events={events}
      place={place}
      shop={shop}
      productCount={publicProductCount}
    />
  )
}