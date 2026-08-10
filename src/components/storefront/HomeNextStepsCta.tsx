import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import {
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
  KINK_SOCIAL_LABELS,
} from '@/lib/kinkSocialMarketing'

/** Compact optional bottom CTA — replaces the large conversion / feature blocks. */
export default function HomeNextStepsCta() {
  return (
    <section className="sf-section-tight" aria-labelledby="home-next-steps-title">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-sf-card/60 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3">
            <div>
              <h2 id="home-next-steps-title" className="text-base font-semibold text-sf-strong">
                Ready to organize?
              </h2>
              <p className="mt-1 text-sm text-sf-muted">
                Publish once on kink.social and show up in public discovery here.
              </p>
            </div>
            <KinkSocialCtaLink
              href={getKinkSocialOrgUrl('organizer')}
              label={KINK_SOCIAL_LABELS.createOrg}
              variant="organizer"
              surface="home_next_steps"
              className="sf-btn-ghost inline-flex min-h-11 w-full items-center justify-center text-sm sm:w-auto"
              external
            />
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div>
              <h3 className="text-base font-semibold text-sf-strong">Join kink.social</h3>
              <p className="mt-1 text-sm text-sf-muted">
                Save events, follow organizers, and connect when you are ready.
              </p>
            </div>
            <KinkSocialCtaLink
              href={getKinkSocialJoinUrl('home_platform')}
              label="Join kink.social"
              variant="home"
              surface="home_next_steps"
              className="sf-btn-rose inline-flex min-h-11 w-full items-center justify-center text-sm sm:w-auto"
              external
            />
          </div>
        </div>
      </div>
    </section>
  )
}