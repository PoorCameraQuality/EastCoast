'use client'

import { useState } from 'react'
import EckeLink from '@/components/EckeLink'

export default function OrgManageQuickActions({
  slug,
  status,
}: {
  slug: string
  status: string
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(label: string, request: () => Promise<Response>, next?: string) {
    setBusy(label)
    setError(null)
    const response = await request()
    const data = (await response.json()) as { error?: string; slug?: string }
    if (!response.ok) {
      setError(data.error || 'Could not complete that action')
      setBusy(null)
      return
    }
    window.location.assign(next || (data.slug ? `/events/${data.slug}/manage` : `/events/${slug}/manage`))
  }

  return (
    <div className="mt-6">
      {error ? (
        <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100">{error}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <EckeLink href={`/events/${slug}/edit`} className="sf-btn-primary min-h-11 px-4">
          Edit event
        </EckeLink>
        <EckeLink href={`/events/${slug}/posts`} className="sf-btn-ghost min-h-11 px-4">
          Create post
        </EckeLink>
        <EckeLink href={`/events/${slug}/media`} className="sf-btn-ghost min-h-11 px-4">
          Add photo
        </EckeLink>
        <button
          type="button"
          className="sf-btn-ghost min-h-11 px-4"
          disabled={Boolean(busy)}
          onClick={() =>
            run('duplicate', () => fetch(`/api/org/events/${slug}/duplicate`, { method: 'POST' }))
          }
        >
          {busy === 'duplicate' ? 'Duplicating…' : 'Duplicate event'}
        </button>
        {status === 'published' ? (
          <button
            type="button"
            className="sf-btn-ghost min-h-11 px-4"
            disabled={Boolean(busy)}
            onClick={() =>
              run(
                'unpublish',
                () =>
                  fetch(`/api/org/events/${slug}/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'unpublish' }),
                  }),
                `/events/${slug}/manage`,
              )
            }
          >
            {busy === 'unpublish' ? 'Updating…' : 'Unpublish'}
          </button>
        ) : (
          <button
            type="button"
            className="sf-btn-ghost min-h-11 px-4"
            disabled={Boolean(busy)}
            onClick={() =>
              run(
                'publish',
                () =>
                  fetch(`/api/org/events/${slug}/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'publish' }),
                  }),
                `/events/${slug}/manage`,
              )
            }
          >
            {busy === 'publish' ? 'Updating…' : 'Publish'}
          </button>
        )}
      </div>
    </div>
  )
}
