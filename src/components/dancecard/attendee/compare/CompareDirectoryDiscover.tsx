'use client'

import { useCallback, useEffect, useState } from 'react'

type DirectoryEntry = {
  accountId: string
  username: string
  sceneName: string
}

type Props = {
  eventSlug: string
  onPickUsername: (username: string) => void
  compact?: boolean
}

async function requestCompare(eventSlug: string, username: string) {
  const res = await fetch(
    `/api/dancecard/${encodeURIComponent(eventSlug)}/compare/requests`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    },
  )
  const text = await res.text()
  if (!res.ok) {
    let msg = 'Could not send compare request'
    try {
      const j = JSON.parse(text) as { error?: string }
      if (j.error) msg = j.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
}

export function CompareDirectoryDiscover({ eventSlug, onPickUsername, compact }: Props) {
  const [entries, setEntries] = useState<DirectoryEntry[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [requestBusy, setRequestBusy] = useState<string | null>(null)

  const loadPage = useCallback(
    async (cursor: string, append: boolean) => {
      const isMore = append && cursor !== '0'
      if (isMore) setLoadingMore(true)
      else setLoading(true)
      setErr(null)
      try {
        const res = await fetch(
          `/api/dancecard/${encodeURIComponent(eventSlug)}/compare/directory?cursor=${encodeURIComponent(cursor)}`,
          { credentials: 'include' },
        )
        const text = await res.text()
        if (!res.ok) {
          let msg = 'Could not load directory'
          try {
            const j = JSON.parse(text) as { error?: string }
            if (j.error) msg = j.error
          } catch {
            /* ignore */
          }
          throw new Error(msg)
        }
        const j = JSON.parse(text) as { entries?: DirectoryEntry[]; nextCursor?: string | null }
        const batch = j.entries ?? []
        setEntries((prev) => (append ? [...prev, ...batch] : batch))
        setNextCursor(j.nextCursor ?? null)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not load directory')
        if (!append) setEntries([])
        setNextCursor(null)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [eventSlug],
  )

  useEffect(() => {
    void loadPage('0', false)
  }, [loadPage])

  if (loading) {
    return (
      <p className={compact ? 'text-[11px] text-dc-muted' : 'text-sm text-dc-muted'}>Loading compare directory…</p>
    )
  }

  if (err) {
    return <p className="text-xs text-dc-danger">{err}</p>
  }

  if (!entries.length) {
    return (
      <p className={compact ? 'text-[11px] leading-snug text-dc-muted' : 'text-sm text-dc-muted'}>
        No one has opted into the compare directory yet. Attendees can enable{' '}
        <span className="font-medium text-dc-text">Show me in compare directory</span> on their Profile tab.
      </p>
    )
  }

  return (
    <div
      className={
        compact
          ? 'space-y-2 rounded-xl border border-dc-border bg-dc-elevated/95 p-3 shadow-[0_12px_32px_rgba(45,38,28,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]'
          : 'space-y-3 rounded-2xl border border-dc-border bg-dc-elevated/95 p-4 shadow-[0_18px_54px_rgba(45,38,28,0.12),inset_0_1px_0_rgba(255,255,255,0.045)]'
      }
    >
      <div className="space-y-1">
        <p
          className={
            compact
              ? 'text-[10px] font-semibold uppercase tracking-[0.18em] text-dc-muted'
              : 'text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted'
          }
        >
          Discover
        </p>
        <p className={compact ? 'text-[11px] leading-snug text-dc-muted' : 'text-sm text-dc-muted'}>
          These attendees allow compare-by-username. Tap a name to load their schedule below.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {entries.map((e) => (
          <li key={e.accountId} className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              className="rounded-full border border-dc-border bg-dc-surface-muted/80 px-3 py-1.5 text-left text-sm text-dc-text shadow-sm transition hover:border-dc-accent-border hover:bg-dc-accent-muted hover:text-dc-accent"
              onClick={() => onPickUsername(e.username)}
              title={`@${e.username}`}
            >
              <span className="font-semibold">{e.sceneName}</span>
              <span className="ml-1.5 text-dc-micro text-dc-muted">@{e.username}</span>
            </button>
            <button
              type="button"
              disabled={requestBusy === e.username}
              className="rounded-full border border-dc-accent-border/50 px-2.5 py-1 text-[10px] font-semibold text-dc-accent hover:bg-dc-accent-muted disabled:opacity-50"
              onClick={() => {
                setRequestBusy(e.username)
                void requestCompare(eventSlug, e.username)
                  .then(() => {
                    setErr(null)
                    alert(`Compare request sent to @${e.username}.`)
                  })
                  .catch((ex) => setErr(ex instanceof Error ? ex.message : 'Request failed'))
                  .finally(() => setRequestBusy(null))
              }}
            >
              {requestBusy === e.username ? '…' : 'Request'}
            </button>
          </li>
        ))}
      </ul>
      {nextCursor ? (
        <button
          type="button"
          disabled={loadingMore}
          className="text-xs font-semibold text-dc-accent underline decoration-dc-accent-border/60 disabled:opacity-50"
          onClick={() => void loadPage(nextCursor, true)}
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
    </div>
  )
}
