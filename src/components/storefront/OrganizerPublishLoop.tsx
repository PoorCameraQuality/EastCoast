import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { getKinkSocialJoinUrl, getKinkSocialOrgUrl, KINK_SOCIAL_LABELS } from '@/lib/kinkSocialMarketing'

export default function OrganizerPublishLoop() {
  return (
    <section className="sf-section-tight" aria-labelledby="organizer-publish-title">
      <div className="container-custom">
        <div className="sf-publish-flow">
          <div className="sf-publish-flow-copy">
            <h2 id="organizer-publish-title" className="sf-title">
              Publish once. Be discoverable everywhere.
            </h2>
            <p className="sf-subhead max-w-xl">
              Manage your community on kink.social. Publish public listings to ECKE when you want them searchable.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <KinkSocialCtaLink
                href={getKinkSocialOrgUrl('organizer')}
                label={KINK_SOCIAL_LABELS.createOrg}
                variant="organizer"
                surface="home_organizer_loop"
                className="sf-btn-primary"
                external
              />
              <KinkSocialCtaLink
                href={getKinkSocialJoinUrl('home_platform')}
                label={KINK_SOCIAL_LABELS.joinFree}
                variant="home"
                surface="home_organizer_loop"
                className="sf-btn-rose"
                external
              />
            </div>
          </div>

          <div className="sf-publish-pipeline" aria-label="Publishing workflow">
            <div className="sf-publish-step">
              <div className="sf-publish-mock sf-publish-mock-editor">
                <span className="sf-publish-mock-label">kink.social</span>
                <div className="sf-publish-mock-bar" />
                <div className="sf-publish-mock-field sf-publish-mock-field-wide" />
                <div className="sf-publish-mock-field" />
                <div className="sf-publish-mock-chip-row">
                  <span className="sf-publish-mock-chip">Organization</span>
                  <span className="sf-publish-mock-chip">Event</span>
                </div>
              </div>
              <p className="sf-publish-step-caption">Create on kink.social</p>
            </div>

            <span className="sf-publish-arrow" aria-hidden>
              →
            </span>

            <div className="sf-publish-step">
              <div className="sf-publish-mock sf-publish-mock-preview">
                <span className="sf-publish-mock-label">Public listing</span>
                <div className="sf-publish-mock-media" />
                <div className="sf-publish-mock-field sf-publish-mock-field-wide" />
                <div className="sf-publish-mock-field sf-publish-mock-field-short" />
              </div>
              <p className="sf-publish-step-caption">Publish public details</p>
            </div>

            <span className="sf-publish-arrow" aria-hidden>
              →
            </span>

            <div className="sf-publish-step">
              <div className="sf-publish-mock sf-publish-mock-ecke">
                <span className="sf-publish-mock-label">ECKE</span>
                <div className="sf-publish-mock-ecke-card">
                  <div className="sf-publish-mock-media sf-publish-mock-media-sm" />
                  <div className="sf-publish-mock-field sf-publish-mock-field-wide" />
                </div>
              </div>
              <p className="sf-publish-step-caption">Appear in discovery</p>
            </div>

            <span className="sf-publish-arrow" aria-hidden>
              →
            </span>

            <div className="sf-publish-step">
              <div className="sf-publish-mock sf-publish-mock-save">
                <span className="sf-publish-mock-label">kink.social</span>
                <div className="sf-publish-mock-save-btn">Save · Follow</div>
                <div className="sf-publish-mock-avatars">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <p className="sf-publish-step-caption">Visitors save &amp; follow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
