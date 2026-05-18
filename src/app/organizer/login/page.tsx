import { Suspense } from 'react'
import { OrganizerLoginClient } from './OrganizerLoginClient'

export default function OrganizerLoginPage() {
  return (
    <Suspense
      fallback={
        <p className="relative mx-auto max-w-md px-4 py-16 text-center text-sm text-dc-muted">Loading…</p>
      }
    >
      <OrganizerLoginClient />
    </Suspense>
  )
}
