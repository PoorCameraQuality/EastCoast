'use client'

import { useState } from 'react'
import type { IsoCommentNode } from '@/lib/dancecard/isoComments'
import { cn } from '@/lib/cn'

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function CommentNode({
  node,
  depth,
  onReply,
  replyBusy,
}: {
  node: IsoCommentNode
  depth: number
  onReply: (parentId: string, body: string) => Promise<void>
  replyBusy: boolean
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyBody, setReplyBody] = useState('')

  return (
    <li className={cn(depth > 0 && 'ml-3 border-l-2 border-dc-border/60 pl-3 sm:ml-4')}>
      <article className="rounded-xl border border-dc-border bg-dc-surface-muted/90 p-3 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <p className="text-xs font-semibold text-dc-text">{node.authorSceneName}</p>
          <time className="text-[10px] text-dc-muted">{formatWhen(node.createdAt)}</time>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-dc-subtle">{node.body}</p>
        {depth < 4 ? (
          <button
            type="button"
            className="mt-2 text-[11px] font-semibold text-dc-accent"
            onClick={() => setReplyOpen((v) => !v)}
          >
            {replyOpen ? 'Cancel' : 'Reply'}
          </button>
        ) : null}
        {replyOpen ? (
          <div className="mt-2 space-y-2">
            <textarea
              className="w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm"
              rows={2}
              placeholder="Your reply…"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
            />
            <button
              type="button"
              disabled={replyBusy || !replyBody.trim()}
              className="rounded-lg bg-dc-accent px-3 py-1 text-xs font-semibold text-dc-accent-foreground disabled:opacity-50"
              onClick={() => {
                void onReply(node.id, replyBody).then(() => {
                  setReplyBody('')
                  setReplyOpen(false)
                })
              }}
            >
              Post reply
            </button>
          </div>
        ) : null}
      </article>
      {node.replies.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {node.replies.map((child) => (
            <CommentNode key={child.id} node={child} depth={depth + 1} onReply={onReply} replyBusy={replyBusy} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function IsoCommentThread({
  comments,
  onReply,
  onNewTopLevel,
  replyBusy,
  signedIn,
}: {
  comments: IsoCommentNode[]
  onReply: (parentId: string | null, body: string) => Promise<void>
  onNewTopLevel: (body: string) => Promise<void>
  replyBusy: boolean
  signedIn: boolean
}) {
  const [topBody, setTopBody] = useState('')

  return (
    <section className="space-y-3" aria-label="Discussion thread">
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Discussion</p>
      {signedIn ? (
        <div className="space-y-2 rounded-xl border border-dc-border bg-dc-surface-muted/60 p-3">
          <textarea
            className="w-full rounded-xl border border-dc-border bg-dc-surface px-3 py-2 text-sm outline-none focus:border-dc-accent focus:ring-1 focus:ring-dc-accent/30"
            rows={2}
            placeholder="Add a comment…"
            value={topBody}
            onChange={(e) => setTopBody(e.target.value)}
          />
          <button
            type="button"
            disabled={replyBusy || !topBody.trim()}
            className="rounded-lg bg-dc-accent px-3 py-1.5 text-xs font-semibold text-dc-accent-foreground disabled:opacity-50"
            onClick={() => {
              void onNewTopLevel(topBody).then(() => setTopBody(''))
            }}
          >
            Comment
          </button>
        </div>
      ) : (
        <p className="text-xs text-dc-muted">Sign in to join the discussion.</p>
      )}
      {comments.length === 0 ? (
        <p className="text-xs text-dc-muted">No comments yet. Be the first to respond.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <CommentNode key={c.id} node={c} depth={0} onReply={(id, body) => onReply(id, body)} replyBusy={replyBusy} />
          ))}
        </ul>
      )}
    </section>
  )
}
