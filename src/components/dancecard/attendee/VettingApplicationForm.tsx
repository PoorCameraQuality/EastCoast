'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { dancecardFetch } from '@/components/dancecard/api-client'
import { publicTrustedRoleApplyPath } from '@/lib/dancecard/trustedRoles'
import type { DancecardModules } from '@/lib/dancecard/eventEntitlements'

type PublishedRole = {
  id: string
  name: string
  applySlug: string
  description: string | null
}

export function VettingApplicationForm({ eventSlug, modules }: { eventSlug: string; modules: DancecardModules | null }) {
  const [roles, setRoles] = useState<PublishedRole[]>([])

  useEffect(() => {
    if (!modules?.vetting_applications) return
    void dancecardFetch<{ roles: PublishedRole[] }>(eventSlug, '/trusted-roles')
      .then((res) => setRoles(res.roles ?? []))
      .catch(() => setRoles([]))
  }, [eventSlug, modules?.vetting_applications])

  if (!modules?.vetting_applications) return null

  return (
    <section className="rounded-xl border border-dc-border bg-dc-surface-muted/60 p-4 text-sm text-dc-text">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-dc-accent">Trusted role applications</h3>
      <p className="mt-1 text-xs text-dc-muted">
        Apply for organizer-approved positions. Each role has its own questionnaire.
      </p>
      {roles.length === 0 ? (
        <p className="mt-3 text-xs text-dc-muted">No open positions right now. Check back later.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {roles.map((r) => (
            <li key={r.id}>
              <Link
                href={publicTrustedRoleApplyPath(eventSlug, r.applySlug)}
                className="block rounded-lg border border-dc-border bg-dc-surface px-3 py-2 hover:border-dc-accent-border"
              >
                <p className="font-medium text-dc-text">{r.name}</p>
                {r.description ? <p className="mt-0.5 text-xs text-dc-muted">{r.description}</p> : null}
                <p className="mt-1 text-[10px] text-dc-accent">Apply →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
