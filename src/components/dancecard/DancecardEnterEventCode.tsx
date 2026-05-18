'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { normalizeEventSlug } from '@/lib/dancecard/slug'

type Props = {
  id?: string
  label?: string
  className?: string
}

export function DancecardEnterEventCode({
  id = 'dancecard-event-code',
  label = 'Enter event code',
  className = '',
}: Props) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const slug = normalizeEventSlug(code)
    if (!slug || !/^[a-z0-9][a-z0-9-]{0,62}$/.test(slug)) {
      setErr('Use letters, numbers, and hyphens only (e.g. paf26).')
      return
    }
    setErr(null)
    router.push(`/dancecard/${encodeURIComponent(slug)}`)
  }

  return (
    <form onSubmit={submit} className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-dc-text">
        {label}
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          name="eventCode"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. paf26"
          className="min-h-touch flex-1 rounded-lg border border-dc-border bg-dc-elevated-muted px-3 py-2 text-sm text-dc-text placeholder:text-dc-muted focus:border-dc-accent focus:outline-none focus:ring-1 focus:ring-dc-accent"
        />
        <button
          type="submit"
          className="min-h-touch shrink-0 dc-btn-primary rounded-lg bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
        >
          Go
        </button>
      </div>
      {err ? (
        <p className="mt-2 text-sm text-dc-danger" role="alert">
          {err}
        </p>
      ) : null}
    </form>
  )
}
