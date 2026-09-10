'use client'

import { useState } from 'react'
import EckeLink from '@/components/EckeLink'

export default function OrgDashboardEventMore({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false)

  async function duplicate() {
    setBusy(true)
    const response = await fetch(`/api/org/events/${slug}/duplicate`, { method: 'POST' })
    const data = (await response.json()) as { slug?: string; error?: string }
    if (response.ok && data.slug) {
      window.location.assign(`/events/${data.slug}/manage`)
      return
    }
    setBusy(false)
  }

  return (
    <details className="org-dashboard-more">
      <summary>More</summary>
      <div className="org-dashboard-more-menu" role="menu">
        <button type="button" disabled={busy} onClick={() => void duplicate()}>
          {busy ? 'Duplicating…' : 'Duplicate'}
        </button>
        <EckeLink href={`/events/${slug}/posts`}>Posts</EckeLink>
        <EckeLink href={`/events/${slug}/settings`}>Settings</EckeLink>
        <EckeLink href={`/events/${slug}/manage`}>Manage</EckeLink>
      </div>
    </details>
  )
}
