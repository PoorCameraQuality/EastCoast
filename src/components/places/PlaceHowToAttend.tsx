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
        <li>Confirm hours, access, and house rules with the venue before you visit.</li>
      </ol>
      {place.firstTimerInfo ? (
        <p className="place-how-note">{place.firstTimerInfo}</p>
      ) : place.newFriendly ? (
        <p className="place-how-note">This space mentions newcomer-friendly programming — confirm details before you go.</p>
      ) : null}
    </section>
  )
}
