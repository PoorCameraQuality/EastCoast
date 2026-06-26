import EckeLink from '@/components/EckeLink'
import KinkSocialAlphaSponsorCard from '@/components/KinkSocialAlphaSponsorCard'
import VendorImage from '@/components/vendors/VendorImage'
import { getSiteSponsorPromo } from '@/data/siteSponsor'
import { getSiteSponsorVendor } from '@/data/vendors'

export default function CalendarSponsorCard() {
  const sponsorPromo = getSiteSponsorPromo()
  const sponsorVendor = sponsorPromo ? null : getSiteSponsorVendor()

  if (sponsorPromo) {
    return (
      <aside className="cal-sponsor-card" aria-label="Sponsor spotlight">
        <KinkSocialAlphaSponsorCard promo={sponsorPromo} variant="compact" />
      </aside>
    )
  }

  if (!sponsorVendor) return null

  return (
    <aside className="cal-sponsor-card" aria-label="Sponsor spotlight">
      <p className="cal-sponsor-kicker">Sponsor spotlight</p>
      <div className="cal-sponsor-inner">
        <VendorImage
          src={sponsorVendor.logo125Url}
          alt={`${sponsorVendor.name} logo`}
          size={40}
          className="cal-sponsor-logo flex-shrink-0"
        />
        <div className="min-w-0">
          <EckeLink href={`/vendors/${sponsorVendor.slug}`} className="cal-sponsor-name">
            {sponsorVendor.name}
          </EckeLink>
          {sponsorVendor.description ? (
            <p className="cal-sponsor-tagline line-clamp-2">{sponsorVendor.description}</p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
