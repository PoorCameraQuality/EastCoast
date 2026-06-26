import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { getKinkSocialJoinUrl, getKinkSocialOrgUrl, KINK_SOCIAL_LABELS } from '@/lib/kinkSocialMarketing'

const FLOW = [
  { label: 'Build on kink.social', detail: 'Orgs, profiles, Dancecard, community tools' },
  { label: 'Publish public listing', detail: 'Safe, searchable details when you are ready' },
  { label: 'Discover on ECKE', detail: 'Events, places, vendors, education' },
  { label: 'Save · follow · connect', detail: 'Join the life around the listing' },
] as const

export default function PublicPrivateBridge() {
  return (
    <section className="sf-section-tight" aria-labelledby="public-private-title">
      <div className="container-custom">
        <div className="rounded-xl border border-white/10 bg-sf-card p-6 md:p-8">
          <div className="max-w-2xl">
            <h2 id="public-private-title" className="sf-title">
              Public discovery. Private participation.
            </h2>
            <p className="sf-subhead">
              ECKE is where people find the listing. kink.social is where the community around it lives.
            </p>
          </div>

          <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="ECKE and kink.social flow">
            {FLOW.map((step, i) => (
              <li
                key={step.label}
                className="relative rounded-lg border border-white/10 bg-sf-elevated/80 p-4"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sf-violet/20 text-xs font-bold text-sf-violet">
                  {i + 1}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-sf-strong">{step.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-sf-muted">{step.detail}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <KinkSocialCtaLink
              href={getKinkSocialJoinUrl('home_platform')}
              label={KINK_SOCIAL_LABELS.joinFree}
              variant="home"
              surface="home_public_private"
              className="sf-btn-rose"
              external
            />
            <KinkSocialCtaLink
              href={getKinkSocialOrgUrl('organizer')}
              label={KINK_SOCIAL_LABELS.createOrg}
              variant="organizer"
              surface="home_public_private"
              className="sf-btn-ghost"
              external
            />
          </div>
        </div>
      </div>
    </section>
  )
}
