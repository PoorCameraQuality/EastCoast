import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
}

export default function PlaceHowToAttend({ place }: Props) {
  return (
    <section className="place-how-to" aria-labelledby="place-how-heading">
      <h2 id="place-how-heading" className="place-section-title">
        How to attend
      </h2>
      <ol className="place-how-steps">
        <li>Read the official rules on the venue website when available.</li>
        <li>
          Check upcoming events or membership requirements
          {place.membershipRequired ? ' — membership may be required' : ''}.
        </li>
        <li>
          {place.registrationUrl ? (
            <>Register through the venue&apos;s official channel.</>
          ) : place.contactEmail ? (
            <>Contact the venue at {place.contactEmail}.</>
          ) : (
            <>Register or contact the venue through their official site.</>
          )}
        </li>
        <li>
          Save and follow on{' '}
          <KinkSocialCtaLink
            href={
              place.followUrl ??
              buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'dungeon_page', {
                ref: 'ecke_place_howto',
                ecke_place: place.slug,
              })
            }
            label="kink.social"
            variant="dungeon"
            surface="place_how_to_attend"
            className="place-inline-cta"
            external
          />{' '}
          for updates.
        </li>
      </ol>
      {place.firstTimerInfo ? (
        <p className="place-how-note">{place.firstTimerInfo}</p>
      ) : place.newFriendly ? (
        <p className="place-how-note">This space mentions newcomer-friendly programming — confirm details before you go.</p>
      ) : null}
    </section>
  )
}
