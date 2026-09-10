import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import EckeLink from '@/components/EckeLink'
import OrgShopForm from '@/components/org/OrgShopForm'
import OrgShopProducts from '@/components/org/OrgShopProducts'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { listShopProducts, requireOwnedShop } from '@/lib/eckeOrgVendors'
import { managedShopToFormValues } from '@/lib/eckeOrgVendorShared'

export const metadata: Metadata = {
  title: 'My shop',
  robots: { index: false, follow: false },
}

export default async function MyShopPage() {
  const session = await requireOrgSession()
  if (!session) redirect('/auth/org/login')

  const gated = await requireOwnedShop()
  const shop = gated.shop
  const products = shop ? await listShopProducts(shop.id) : []

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <EckeLink href="/dashboard" className="text-sm text-sf-muted underline">
          ← Dashboard
        </EckeLink>
        <h1 className="mt-4 text-3xl font-semibold text-sf-strong">
          {shop ? 'My shop' : 'Create your shop'}
        </h1>
        <p className="mt-2 text-sm text-sf-muted">
          One public storefront on ECKE. Checkout stays on your site, Etsy, or other offsite cart.
        </p>
        {shop ? (
          <p className="mt-3 text-sm text-sf-body">
            Public page:{' '}
            <EckeLink href={`/vendors/${shop.slug}`} className="underline">
              eastcoastkinkevents.com/vendors/{shop.slug}
            </EckeLink>
            {shop.status === 'draft' ? ' · Draft' : ' · Published'}
          </p>
        ) : null}

        <div className="mt-8">
          <OrgShopForm
            mode={shop ? 'edit' : 'create'}
            initial={
              shop
                ? managedShopToFormValues(shop)
                : { status: 'published', contactEmail: session.organization.email }
            }
            logoUrl={shop?.logo_url}
            coverUrl={shop?.cover_url}
          />
        </div>

        {shop ? (
          <div className="mt-10">
            <OrgShopProducts initial={products} />
          </div>
        ) : null}
      </div>
    </main>
  )
}
