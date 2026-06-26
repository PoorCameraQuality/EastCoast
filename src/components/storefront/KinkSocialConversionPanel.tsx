import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import {
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
  KINK_SOCIAL_LABELS,
} from '@/lib/kinkSocialMarketing'

const MINI_CARDS = [
  { label: 'Saved event', detail: 'Keep what matters on your Dancecard' },
  { label: 'Organizer profile', detail: 'Follow updates in one place' },
  { label: 'Vendor discovery', detail: 'Gear, art, and makers you trust' },
  { label: 'Community layer', detail: 'Profiles, orgs, and real connection' },
] as const

export default function KinkSocialConversionPanel() {
  return (
    <section className="sf-section" aria-labelledby="ks-conversion-title">
      <div className="container-custom">
        <div className="sf-conversion-panel relative overflow-hidden p-6 md:p-10">
          <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-sf-violet/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-sf-rose/10 blur-3xl" aria-hidden />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 id="ks-conversion-title" className="sf-title">
                ECKE helps you find the listing. kink.social helps you join the life around it.
              </h2>
              <p className="sf-subhead">
                Save events, follow organizers, build a profile, use Dancecard, create organizations, and connect
                with the people behind the scene.
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <KinkSocialCtaLink
                  href={getKinkSocialJoinUrl('home_platform')}
                  label={KINK_SOCIAL_LABELS.joinFree}
                  variant="home"
                  surface="home_conversion_panel"
                  className="sf-btn-rose"
                  external
                />
                <KinkSocialCtaLink
                  href={getKinkSocialOrgUrl('organizer')}
                  label={KINK_SOCIAL_LABELS.createOrg}
                  variant="organizer"
                  surface="home_conversion_panel"
                  className="sf-btn-primary"
                  external
                />
                <EckeLink href="/dancecard" className="sf-btn-ghost">
                  {KINK_SOCIAL_LABELS.exploreDancecard}
                </EckeLink>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-2" aria-label="kink.social preview">
              {MINI_CARDS.map((card) => (
                <li key={card.label} className="rounded-lg border border-white/10 bg-sf-bg/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-sf-rose">{card.label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-sf-muted">{card.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
