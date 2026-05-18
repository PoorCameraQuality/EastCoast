'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { DANCECARD_DEFAULT_EVENT_PATH } from '@/lib/dancecard/nav'
import { normalizeEventSlug } from '@/lib/dancecard/slug'
import { isDancecardAttendeeShell } from '@/lib/dancecard/shellRoutes'
import type { PublicDancecardEvent } from '@/lib/dancecard/publicEvents'

/** Event picker + code entry for the main site header (Dancecard lives in primary nav). */
export function DancecardHeaderNav() {
  const pathname = usePathname()
  const router = useRouter()
  const onDancecardShell = isDancecardAttendeeShell(pathname)
  const [events, setEvents] = useState<PublicDancecardEvent[]>([])
  const [showCode, setShowCode] = useState(false)
  const [code, setCode] = useState('')
  const [codeErr, setCodeErr] = useState<string | null>(null)

  useEffect(() => {
    if (onDancecardShell) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/dancecard/public-events', { cache: 'no-store' })
        if (!res.ok) return
        const j = (await res.json()) as { events?: PublicDancecardEvent[] }
        if (!cancelled) setEvents(j.events ?? [])
      } catch {
        // ignore — fallback link still works
      }
    })()
    return () => {
      cancelled = true
    }
  }, [onDancecardShell])

  const submitCode = (e: FormEvent) => {
    e.preventDefault()
    const slug = normalizeEventSlug(code)
    if (!slug || !/^[a-z0-9][a-z0-9-]{0,62}$/.test(slug)) {
      setCodeErr('Invalid event code')
      return
    }
    setCodeErr(null)
    setShowCode(false)
    router.push(`/dancecard/${encodeURIComponent(slug)}`)
  }

  if (onDancecardShell) {
    return (
      <Link href="/dancecard" className="text-sm font-medium text-primary-300 hover:text-primary-200">
        Dancecard home
      </Link>
    )
  }

  return (
    <div className="relative flex items-center gap-2">
      {events.length > 0 ? (
        <>
          <label className="sr-only" htmlFor="header-dancecard-event">
            Open a published Dancecard event
          </label>
          <select
            id="header-dancecard-event"
            className="max-w-[11rem] rounded-lg border border-dark-600 bg-dark-900/80 px-2 py-1.5 text-xs text-gray-200"
            defaultValue=""
            onChange={(e) => {
              const slug = e.target.value
              if (slug) router.push(`/dancecard/${encodeURIComponent(slug)}`)
              e.target.value = ''
            }}
          >
            <option value="">Open event…</option>
            {events.map((ev) => (
              <option key={ev.slug} value={ev.slug}>
                {ev.eventTitle}
              </option>
            ))}
          </select>
        </>
      ) : (
        <Link
          href={DANCECARD_DEFAULT_EVENT_PATH}
          className="text-xs font-medium text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline min-h-touch inline-flex items-center px-1"
        >
          Try demo
        </Link>
      )}
      <button
        type="button"
        onClick={() => setShowCode((v) => !v)}
        className="text-xs text-gray-400 hover:text-white min-h-touch px-2 rounded-lg hover:bg-dark-800/50"
        aria-expanded={showCode}
      >
        Event code
      </button>
      {showCode ? (
        <form
          onSubmit={submitCode}
          className="absolute right-0 top-full z-50 mt-2 flex w-56 flex-col gap-2 rounded-lg border border-dark-600 bg-black p-3 shadow-xl"
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Event code"
            className="rounded border border-dark-600 bg-dark-900 px-2 py-1.5 text-sm text-white"
            autoFocus
          />
          <button type="submit" className="rounded bg-primary-600 py-1.5 text-xs font-semibold text-white">
            Go
          </button>
          {codeErr ? <p className="text-xs text-rose-400">{codeErr}</p> : null}
        </form>
      ) : null}
    </div>
  )
}
