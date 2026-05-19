'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { Panel } from '@/components/dancecard/ui/Panel'

type IsoPost = {
  id: string
  title: string
  body: string
  tags: string[]
  contactReveal: string
  curatedPin: boolean
  authorSceneName: string
  isMine?: boolean
}

type Props = {
  eventSlug: string
  enabled: boolean
}

export function IsoBoardPanel({ eventSlug, enabled }: Props) {
  const [posts, setPosts] = useState<IsoPost[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    try {
      const d = await dancecardFetch<{ posts: IsoPost[] }>(eventSlug, '/iso')
      setPosts(d.posts ?? [])
      setErr(null)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug, enabled])

  useEffect(() => {
    void load()
  }, [load])

  if (!enabled) return null

  async function createPost() {
    if (!title.trim()) return
    setBusy(true)
    try {
      await dancecardFetch(eventSlug, '/iso', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      })
      setTitle('')
      setBody('')
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(false)
    }
  }

  async function expressInterest(postId: string) {
    try {
      await dancecardFetch(eventSlug, `/iso/${postId}/interest`, { method: 'POST' })
      setErr(null)
      alert('Interest sent. The poster can accept to share their contact card.')
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }

  return (
    <Panel className="space-y-3">
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Practice partners (ISO)</p>
      <p className="text-xs text-dc-subtle">Scene names only. No DMs — contact is shared if the poster accepts your interest.</p>
      {err ? <p className="text-xs text-red-400">{err}</p> : null}
      <div className="space-y-2 rounded-xl border border-dc-border/60 p-2">
        <input
          className="w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm"
          placeholder="What are you looking for?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm"
          rows={2}
          placeholder="Details (optional)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="button"
          disabled={busy}
          className="rounded-lg bg-dc-accent px-3 py-1.5 text-xs font-semibold text-dc-accent-foreground disabled:opacity-50"
          onClick={() => void createPost()}
        >
          Post ISO
        </button>
      </div>
      <ul className="max-h-64 space-y-2 overflow-y-auto">
        {posts.map((p) => (
          <li key={p.id} className="rounded-xl border border-dc-border bg-dc-elevated-muted/80 p-2.5 text-sm">
            {p.curatedPin ? (
              <span className="text-[10px] font-semibold uppercase text-dc-accent">Pinned</span>
            ) : null}
            <p className="font-semibold text-dc-text">{p.title}</p>
            <p className="text-xs text-dc-muted">{p.authorSceneName}</p>
            {p.body ? <p className="mt-1 text-xs text-dc-subtle">{p.body}</p> : null}
            {!p.isMine ? (
              <button
                type="button"
                className="mt-2 rounded-lg border border-dc-border px-2 py-1 text-[11px] text-dc-accent"
                onClick={() => void expressInterest(p.id)}
              >
                I&apos;m interested
              </button>
            ) : (
              <p className="mt-1 text-[10px] text-dc-subtle">Your post</p>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
