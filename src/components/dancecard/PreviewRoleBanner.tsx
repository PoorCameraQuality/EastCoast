'use client'

import { useSearchParams } from 'next/navigation'

const LABELS: Record<string, string> = {
  attendee: 'Attendee',
  staff: 'Staff',
  safety: 'Safety',
  public: 'Public (unauthenticated)',
}

export function PreviewRoleBanner() {
  const searchParams = useSearchParams()
  const role = searchParams.get('previewRole')?.toLowerCase()
  if (!role || !LABELS[role]) return null

  return (
    <div className="border-b border-amber-500/40 bg-amber-950/90 px-4 py-2 text-center text-sm text-amber-100">
      Organizer preview as <strong>{LABELS[role]}</strong> — changes here do not affect live attendee data.
    </div>
  )
}
