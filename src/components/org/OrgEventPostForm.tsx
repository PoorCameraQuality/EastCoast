'use client'

import { useState } from 'react'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

export default function OrgEventPostForm({ slug }: { slug: string }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now')
  const [publishAt, setPublishAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`/api/org/events/${slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, imageUrl, publishMode, publishAt }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Could not publish update')
      window.location.assign(`/events/${slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish update')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 p-5">
      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100">{error}</p>
      ) : null}
      <label className="block text-sm text-sf-body">
        Title
        <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="block text-sm text-sf-body">
        Body
        <textarea className={fieldClass} rows={5} value={body} onChange={(e) => setBody(e.target.value)} required />
      </label>
      <label className="block text-sm text-sf-body">
        Image URL <span className="text-sf-muted">(optional)</span>
        <input className={fieldClass} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </label>
      <fieldset className="text-sm text-sf-body">
        <legend>Publish date</legend>
        <label className="mt-2 mr-4 inline-flex items-center gap-2">
          <input type="radio" checked={publishMode === 'now'} onChange={() => setPublishMode('now')} />
          Publish now
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="radio" checked={publishMode === 'schedule'} onChange={() => setPublishMode('schedule')} />
          Schedule
        </label>
      </fieldset>
      {publishMode === 'schedule' ? (
        <input className={fieldClass} type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
      ) : null}
      <button type="submit" className="sf-btn-primary min-h-11 px-4" disabled={loading}>
        {loading ? 'Publishing…' : 'Publish update'}
      </button>
    </form>
  )
}
