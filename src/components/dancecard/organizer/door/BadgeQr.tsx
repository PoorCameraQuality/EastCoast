'use client'

export function BadgeQr({
  eventSlug,
  registrantId,
  size = 72,
}: {
  eventSlug: string
  registrantId: string
  size?: number
}) {
  const src = `/api/organizer/dancecard/${encodeURIComponent(eventSlug)}/registrants/${encodeURIComponent(registrantId)}/qr`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className="rounded bg-white p-0.5" />
  )
}
