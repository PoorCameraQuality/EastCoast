'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { AttendeePolicySignFlow } from '@/components/dancecard/attendee/AttendeePolicySignFlow'
import { AttendeeSubpageLoader } from '@/components/dancecard/attendee/AttendeeSubpageLoader'
import { DancecardEventNav } from '@/components/dancecard/attendee/DancecardEventNav'
import { Panel } from '@/components/dancecard/ui/Panel'

type PolicyRow = {
  id: string
  kind: string
  version: number
  title: string
  publishedAt: string
  bodyMarkdown: string
}

type SignStatus = {
  loggedIn: boolean
  displayName: string | null
  registrantMatched: boolean
  agreementsMode: string
  requiredPolicyDocumentIds: string[]
  acceptedPolicyDocumentIds: string[]
  agreementsComplete: boolean
}

type PoliciesPagePayload = {
  eventTitle?: string
  summaryModuleEnabled?: boolean
  policies?: PolicyRow[]
  signStatus?: SignStatus
  error?: string
}

export default function DancecardPoliciesPage() {
  const params = useParams()
  const slug = String(params?.eventSlug ?? '').toLowerCase()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState<string | null>(null)
  const [policies, setPolicies] = useState<PolicyRow[]>([])
  const [signStatus, setSignStatus] = useState<SignStatus | null>(null)
  const [summaryModuleOff, setSummaryModuleOff] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/policies-page`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const j = (await res.json()) as PoliciesPagePayload
      if (!res.ok) {
        setErr(j.error ?? 'Could not load policies')
        return
      }
      setTitle(j.eventTitle ?? null)
      setPolicies(j.policies ?? [])
      setSignStatus(j.signStatus ?? null)
      setSummaryModuleOff(!j.summaryModuleEnabled)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return <AttendeeSubpageLoader eventSlug={slug} label="Loading policies…" maxWidth="2xl" />
  }

  const signPolicies = policies.map((p) => ({
    id: p.id,
    title: p.title,
    kind: p.kind,
    version: p.version,
  }))

  return (
    <>
      <DancecardEventNav eventSlug={slug} eventTitle={title} />
      <div className="mx-auto max-w-2xl px-4 py-8 text-dc-text">
        <p className="text-dc-micro uppercase tracking-[0.25em] text-dc-muted">Published policies</p>
        <h1 className="mt-2 font-serif text-3xl text-dc-text">{title ?? 'Event'}</h1>
        <p className="mt-3 text-sm leading-relaxed text-dc-muted">
          These are the policies published for this event. Photo rules, consent, and conduct expectations for classes and
          activities may also appear on individual program cards.
        </p>
        <Link href={`/dancecard/${slug}`} className="mt-3 inline-block text-sm text-dc-accent hover:underline">
          ← Back to dancecard
        </Link>
        {summaryModuleOff ? (
          <p className="mt-3 text-dc-micro text-dc-muted">
            Showing published documents without the optional public policy summary module.
          </p>
        ) : null}
        <AttendeePolicySignFlow
          eventSlug={slug}
          prefetched={signStatus ? { signStatus, policies: signPolicies } : undefined}
          onSigned={() => void load()}
        />
        {err ? <p className="mt-4 text-sm text-dc-danger">{err}</p> : null}
        {!err && !policies.length ? (
          <Panel variant="muted" className="mt-6 text-sm text-dc-muted">
            No published policy documents yet.
          </Panel>
        ) : null}
        <ul className="mt-6 space-y-4">
          {policies.map((p) => (
            <li key={p.id}>
              <Panel>
                <p className="text-sm font-semibold text-dc-text">{p.title}</p>
                <p className="mt-1 text-dc-micro text-dc-muted">
                  {p.kind} · v{p.version} · published {new Date(p.publishedAt).toLocaleString()}
                </p>
                {p.bodyMarkdown?.trim() ? (
                  <article className="prose prose-invert prose-sm mt-4 max-w-none text-dc-muted">
                    <ReactMarkdown>{p.bodyMarkdown}</ReactMarkdown>
                  </article>
                ) : (
                  <p className="mt-3 text-dc-micro text-dc-muted">No body text published for this document.</p>
                )}
              </Panel>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
