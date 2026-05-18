'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function HandoffInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setErr('Missing handoff code.')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/organizer/dancecard/handoff/consume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        const j = (await r.json()) as {
          redirectTo?: string
          returnUrl?: string | null
          error?: string
        }
        if (!r.ok || !j.redirectTo) {
          if (!cancelled) setErr(j.error ?? 'Handoff failed')
          return
        }
        if (j.returnUrl && typeof window !== 'undefined') {
          window.sessionStorage.setItem('dc-c2k-return-url', j.returnUrl)
        }
        if (!cancelled) router.replace(j.redirectTo)
      } catch {
        if (!cancelled) setErr('Could not complete handoff.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchParams, router])

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center text-dc-text">
      {err ? (
        <>
          <p className="text-dc-danger">{err}</p>
          <Link href="/organizer/login" className="mt-4 inline-block text-dc-accent hover:underline">
            Sign in manually
          </Link>
        </>
      ) : (
        <p className="text-dc-muted">Opening Dancecard organizer…</p>
      )}
    </div>
  )
}

export default function OrganizerHandoffPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-dc-muted">Loading…</div>}>
      <HandoffInner />
    </Suspense>
  )
}
