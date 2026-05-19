'use client'

import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { Panel } from '@/components/dancecard/ui/Panel'

type IsoPost = {
  id: string
  title: string
  visibility: string
  status: string
  curatedPin: boolean
  authorSceneName: string
  authorUsername: string
}

export function IsoModerationPanel({ eventSlug, readOnly }: { eventSlug: string; readOnly: boolean }) {
  const [posts, setPosts] = useState<IsoPost[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [needsMigration, setNeedsMigration] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    setNeedsMigration(null)
    try {
      const res = await organizerDancecardFetch<{ posts: IsoPost[]; needsMigration?: string }>(
        eventSlug,
        '/iso',
      )
      setPosts(res.posts ?? [])
      if (res.needsMigration) setNeedsMigration(res.needsMigration)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load ISO posts'
      if (msg.includes('migration') || msg.includes('049')) {
        setNeedsMigration('dancecard_049_iso_board.sql')
      }
      setErr(msg)
      setPosts([])
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function patchPost(postId: string, patch: Record<string, unknown>) {
    if (readOnly) return
    setBusyId(postId)
    setErr(null)
    try {
      await organizerDancecardFetch(eventSlug, '/iso', {
        method: 'PATCH',
        body: JSON.stringify({ postId, ...patch }),
      })
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Panel>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg text-dc-text">ISO moderation</h3>
          <p className="text-xs text-dc-muted">Pin posts, hide from board, or mark filled / withdrawn.</p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-dc-border px-3 py-1.5 text-xs text-dc-muted hover:bg-dc-surface-muted"
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>
      {needsMigration ? (
        <p className="mb-3 text-sm text-amber-800">
          Apply migration <code className="text-xs">{needsMigration}</code> to enable ISO moderation.
        </p>
      ) : null}
      {err ? <p className="mb-3 text-sm text-red-700">{err}</p> : null}
      {!posts.length && !err ? <p className="text-sm text-dc-muted">No ISO posts yet.</p> : null}
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="rounded-xl border border-dc-border p-3 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-dc-text">{p.title}</p>
                <p className="text-xs text-dc-muted">
                  {p.authorSceneName}
                  {p.authorUsername ? ` (@${p.authorUsername})` : ''} · {p.visibility} · {p.status}
                  {p.curatedPin ? ' · pinned' : ''}
                </p>
              </div>
              {!readOnly ? (
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    className="rounded-lg border border-dc-border px-2 py-1 text-xs hover:bg-dc-surface-muted disabled:opacity-50"
                    onClick={() => void patchPost(p.id, { curatedPin: !p.curatedPin })}
                  >
                    {p.curatedPin ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    className="rounded-lg border border-dc-border px-2 py-1 text-xs hover:bg-dc-surface-muted disabled:opacity-50"
                    onClick={() =>
                      void patchPost(p.id, {
                        visibility: p.visibility === 'organizers_only' ? 'public' : 'organizers_only',
                      })
                    }
                  >
                    {p.visibility === 'organizers_only' ? 'Public' : 'Staff only'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    className="rounded-lg border border-dc-border px-2 py-1 text-xs hover:bg-dc-surface-muted disabled:opacity-50"
                    onClick={() => void patchPost(p.id, { status: 'filled' })}
                  >
                    Filled
                  </button>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    className="rounded-lg border border-dc-border px-2 py-1 text-xs hover:bg-dc-surface-muted disabled:opacity-50"
                    onClick={() => void patchPost(p.id, { status: 'withdrawn' })}
                  >
                    Withdraw
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
