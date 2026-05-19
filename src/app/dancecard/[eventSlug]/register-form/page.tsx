import { redirect } from 'next/navigation'

/** Event signup is unified on the main dancecard landing (Member access → Register). */
export default function RegisterFormPage({ params }: { params: { eventSlug: string } }) {
  redirect(`/dancecard/${encodeURIComponent(params.eventSlug.toLowerCase())}?auth=register#dc-sign-in`)
}
