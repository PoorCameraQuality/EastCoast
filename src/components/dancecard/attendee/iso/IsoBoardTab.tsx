'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { AttendeeProfileCard } from '@/components/dancecard/attendee/AttendeeProfileCard'
import { IsoCommentThread } from '@/components/dancecard/attendee/iso/IsoCommentThread'
import type { AttendeePublicProfile } from '@/lib/dancecard/attendeeProfile'
import type { IsoCommentNode } from '@/lib/dancecard/isoComments'
import { cn } from '@/lib/cn'

const SHELL =
  'rounded-2xl border border-dc-border bg-dc-elevated/95 shadow-[0_18px_54px_rgba(45,38,28,0.42),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-sm'

type IsoListPost = {
  id: string
  title: string
  body: string
  tags: string[]
  contactLink: string | null
  curatedPin: boolean
  createdAt: string
  commentCount: number
  isMine?: boolean
  authorSceneName: string
}

type IsoDetailPost = IsoListPost & {
  contactReveal: string
  authorProfile: AttendeePublicProfile | null
}

type Props = {
  eventSlug: string
  signedIn: boolean
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IsoPostInterests({ eventSlug, postId }: { eventSlug: string; postId: string }) {
  const [interests, setInterests] = useState<
    { id: string; status: string; fromUsername: string; fromDisplayName: string }[]
  >([])
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const d = await dancecardFetch<{ interests: typeof interests }>(
          eventSlug,
          `/iso/${postId}/interests`,
        )
        setInterests(d.interests ?? [])
      } catch {
        setInterests([])
      }
    })()
  }, [eventSlug, postId])

  async function respond(interestId: string, action: 'accept' | 'decline') {
    setBusy(interestId)
    try {
      await dancecardFetch(eventSlug, `/iso/${postId}/interest`, {
        method: 'PATCH',
        body: JSON.stringify({ interestId, action }),
      })
      const d = await dancecardFetch<{ interests: typeof interests }>(
        eventSlug,
        `/iso/${postId}/interests`,
      )
      setInterests(d.interests ?? [])
    } finally {
      setBusy(null)
    }
  }

  const pending = interests.filter((i) => i.status === 'pending')
  if (!pending.length) {
    return <p className="text-xs text-dc-muted">This is your post — others can reply below.</p>
  }

  return (
    <div className="space-y-2 rounded-xl border border-dc-border bg-dc-surface-muted/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Interest requests</p>
      <ul className="space-y-2">
        {pending.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              {i.fromDisplayName}
              {i.fromUsername ? ` (@${i.fromUsername})` : ''}
            </span>
            <span className="flex gap-1">
              <button
                type="button"
                disabled={busy === i.id}
                className="rounded-lg bg-dc-accent px-2 py-1 text-xs font-semibold text-dc-accent-foreground disabled:opacity-50"
                onClick={() => void respond(i.id, 'accept')}
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busy === i.id}
                className="rounded-lg border border-dc-border px-2 py-1 text-xs disabled:opacity-50"
                onClick={() => void respond(i.id, 'decline')}
              >
                Decline
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function IsoPostListCard({ post, onOpen }: { post: IsoListPost; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'group flex w-full gap-3 rounded-2xl border p-3.5 text-left transition',
          'border-dc-border bg-dc-surface-muted/80 hover:border-dc-accent-border/60 hover:bg-dc-elevated-muted hover:shadow-[0_10px_28px_rgba(45,38,28,0.18)]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dc-accent',
          post.isMine && 'border-dc-accent-border/40 bg-dc-accent-muted/25',
        )}
      >
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            post.isMine ? 'bg-dc-accent text-dc-accent-foreground' : 'bg-dc-elevated text-dc-accent',
          )}
          aria-hidden
        >
          {initials(post.authorSceneName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="font-serif text-base font-semibold leading-snug text-dc-text group-hover:text-dc-accent">
              {post.title}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              {post.curatedPin ? (
                <span className="rounded-full bg-dc-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dc-accent">
                  Pinned
                </span>
              ) : null}
              <ChevronRight className="h-4 w-4 text-dc-muted transition group-hover:translate-x-0.5 group-hover:text-dc-accent" />
            </span>
          </span>
          <span className="mt-0.5 block text-xs font-medium text-dc-muted">{post.authorSceneName}</span>
          {post.body ? (
            <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-dc-subtle">{post.body}</span>
          ) : null}
          <span className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full border border-dc-border bg-dc-elevated/80 px-2 py-0.5 font-medium text-dc-muted">
              {post.commentCount === 0 ? 'No replies' : `${post.commentCount} repl${post.commentCount === 1 ? 'y' : 'ies'}`}
            </span>
            {post.isMine ? (
              <span className="rounded-full bg-dc-accent-muted px-2 py-0.5 font-semibold text-dc-accent">Your post</span>
            ) : (
              <span className="font-semibold text-dc-accent opacity-0 transition group-hover:opacity-100">
                Open thread →
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  )
}

export function IsoBoardTab({ eventSlug, signedIn }: Props) {
  const [posts, setPosts] = useState<IsoListPost[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<{ post: IsoDetailPost; comments: IsoCommentNode[] } | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [contactLink, setContactLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [commentBusy, setCommentBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)

  const loadList = useCallback(async () => {
    try {
      const d = await dancecardFetch<{ posts: IsoListPost[] }>(eventSlug, '/iso')
      setPosts(d.posts ?? [])
      setErr(null)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug])

  const loadDetail = useCallback(
    async (postId: string) => {
      try {
        const d = await dancecardFetch<{ post: IsoDetailPost; comments: IsoCommentNode[] }>(
          eventSlug,
          `/iso/${postId}`,
        )
        setDetail(d)
        setErr(null)
      } catch (e) {
        setErr(formatDancecardApiMessage(e))
      }
    },
    [eventSlug],
  )

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    void loadDetail(selectedId)
  }, [selectedId, loadDetail])

  async function createPost() {
    if (!title.trim() || !signedIn) return
    setBusy(true)
    try {
      await dancecardFetch(eventSlug, '/iso', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          contactLink: contactLink.trim() || null,
        }),
      })
      setTitle('')
      setBody('')
      setContactLink('')
      setComposeOpen(false)
      await loadList()
      setErr(null)
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

  async function postComment(parentId: string | null, commentBody: string) {
    if (!selectedId || !commentBody.trim()) return
    setCommentBusy(true)
    try {
      await dancecardFetch(eventSlug, `/iso/${selectedId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          body: commentBody.trim(),
          ...(parentId ? { parentCommentId: parentId } : {}),
        }),
      })
      await loadDetail(selectedId)
      await loadList()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setCommentBusy(false)
    }
  }

  if (selectedId && detail) {
    const p = detail.post
    return (
      <div className={cn(SHELL, 'space-y-4 p-4 sm:p-5')}>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-dc-border bg-dc-elevated-muted/80 px-3 py-1.5 text-xs font-semibold text-dc-accent transition hover:border-dc-accent-border hover:bg-dc-accent-muted"
          onClick={() => setSelectedId(null)}
        >
          ← Back to board
        </button>
        {err ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600">{err}</p> : null}
        <header className="space-y-2 border-b border-dc-border/60 pb-4">
          {p.curatedPin ? (
            <span className="inline-block rounded-full bg-dc-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dc-accent">
              Pinned
            </span>
          ) : null}
          <h2 className="font-serif text-2xl text-dc-text">{p.title}</h2>
          <p className="text-xs text-dc-muted">
            {p.authorSceneName} · {formatWhen(p.createdAt)}
          </p>
          {p.body ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-dc-subtle">{p.body}</p> : null}
          {p.tags.length > 0 ? <p className="text-[11px] text-dc-muted">{p.tags.join(' · ')}</p> : null}
        </header>
        {p.authorProfile ? (
          <AttendeeProfileCard profile={p.authorProfile} variant="host" compact />
        ) : (
          <p className="text-sm text-dc-muted">{p.authorSceneName}</p>
        )}
        {p.contactLink ? (
          <p className="rounded-xl border border-dc-border bg-dc-surface-muted/60 px-3 py-2 text-sm">
            <span className="text-dc-muted">Share link: </span>
            <a
              href={p.contactLink}
              className="break-all font-medium text-dc-accent underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open contact link
            </a>
          </p>
        ) : null}
        {!p.isMine ? (
          <button
            type="button"
            className="rounded-xl bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground shadow-[0_6px_20px_rgba(198,167,94,0.35)] transition hover:brightness-105"
            onClick={() => void expressInterest(p.id)}
          >
            I&apos;m interested
          </button>
        ) : (
          <IsoPostInterests eventSlug={eventSlug} postId={p.id} />
        )}
        <IsoCommentThread
          comments={detail.comments}
          signedIn={signedIn}
          replyBusy={commentBusy}
          onReply={(parentId, b) => postComment(parentId, b)}
          onNewTopLevel={(b) => postComment(null, b)}
        />
      </div>
    )
  }

  return (
    <div className={cn(SHELL, 'space-y-4 p-4 sm:p-5')}>
      <header className="border-b border-dc-border/50 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-dc-subtle">Practice partners</p>
        <h2 className="mt-1 font-serif text-xl text-dc-text sm:text-2xl">ISO board</h2>
        <p className="mt-2 text-sm leading-relaxed text-dc-muted">
          Post what you&apos;re looking for, open a thread to see someone&apos;s profile and replies. Add contacts on
          Profile or paste an optional share link when you post.
        </p>
      </header>
      {err ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600">{err}</p> : null}
      {signedIn ? (
        <div className="space-y-3">
          <button
            type="button"
            className={cn(
              'rounded-xl px-4 py-2.5 text-sm font-semibold transition',
              composeOpen
                ? 'border border-dc-border bg-dc-elevated-muted text-dc-text'
                : 'bg-dc-accent text-dc-accent-foreground shadow-[0_6px_20px_rgba(198,167,94,0.35)] hover:brightness-105',
            )}
            onClick={() => setComposeOpen((v) => !v)}
          >
            {composeOpen ? 'Cancel' : '+ New ISO post'}
          </button>
          {composeOpen ? (
            <div className="space-y-3 rounded-2xl border border-dc-accent-border/40 bg-dc-accent-muted/15 p-4">
              <input
                className="w-full rounded-xl border border-dc-border bg-dc-surface px-3 py-2.5 text-sm text-dc-text outline-none focus:border-dc-accent focus:ring-1 focus:ring-dc-accent/30"
                placeholder="Short title — what are you looking for?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full rounded-xl border border-dc-border bg-dc-surface px-3 py-2.5 text-sm text-dc-text outline-none focus:border-dc-accent focus:ring-1 focus:ring-dc-accent/30"
                rows={3}
                placeholder="Details (optional)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <input
                className="w-full rounded-xl border border-dc-border bg-dc-surface px-3 py-2.5 text-sm text-dc-text outline-none focus:border-dc-accent focus:ring-1 focus:ring-dc-accent/30"
                placeholder="Optional share link (https://…)"
                value={contactLink}
                onChange={(e) => setContactLink(e.target.value)}
              />
              <button
                type="button"
                disabled={busy || !title.trim()}
                className="rounded-xl bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground disabled:opacity-50"
                onClick={() => void createPost()}
              >
                Post to board
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl border border-dc-border bg-dc-surface-muted/60 px-3 py-2 text-sm text-dc-muted">
          Sign in to post or join a discussion.
        </p>
      )}
      <ul className="space-y-3">
        {posts.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-dc-border py-10 text-center text-sm text-dc-muted">
            No ISO posts yet. Be the first to post.
          </li>
        ) : (
          posts.map((p) => <IsoPostListCard key={p.id} post={p} onOpen={() => setSelectedId(p.id)} />)
        )}
      </ul>
    </div>
  )
}
