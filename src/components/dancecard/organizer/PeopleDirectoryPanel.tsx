'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { useConfirmDialog } from '@/components/dancecard/organizer/ui'
import type { PeopleRoleBucket } from '@/lib/dancecard/peopleDirectoryRoleBuckets'
import { formatServiceHours, type PersonCompPackage } from '@/lib/dancecard/peopleCompPackages'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'

type PersonRow = {
  id: string
  sceneName: string
  legalName: string | null
  email: string | null
  phone: string | null
  publicBio: string | null
  internalNotes: string | null
  pronouns: string | null
  photoUrl: string | null
  showLegalNameOnPublic: boolean
}

type RoleFilter = 'all' | PeopleRoleBucket

const ROLE_FILTERS: { key: RoleFilter; label: string; hint?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'presenter', label: 'Presenters' },
  { key: 'staff', label: 'Staff & volunteers' },
  { key: 'photographer', label: 'Photographers' },
  { key: 'attendee', label: 'Attendees' },
  { key: 'registered', label: 'Registered', hint: 'Signed up via registration' },
]

function filterPillClass(active: boolean, accent?: boolean) {
  if (!active) {
    return 'rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.04]'
  }
  if (accent) {
    return 'rounded-full border border-emerald-400/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-100'
  }
  return 'rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1.5 text-xs font-semibold text-dc-text'
}

export function PeopleDirectoryPanel({
  eventSlug,
  readOnly,
  organizerRole,
}: {
  eventSlug: string
  readOnly: boolean
  organizerRole: OrganizerRoleForClient | null
}) {
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [people, setPeople] = useState<PersonRow[]>([])
  const [roleBuckets, setRoleBuckets] = useState<Record<string, PeopleRoleBucket[]>>({})
  const [compPackages, setCompPackages] = useState<Record<string, PersonCompPackage>>({})
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sceneName, setSceneName] = useState('')
  const [email, setEmail] = useState('')
  const { ask, dialog } = useConfirmDialog()

  const load = useCallback(async () => {
    setLoadErr(null)
    try {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
      const res = await organizerDancecardFetch<{
        people: PersonRow[]
        roleBuckets?: Record<string, PeopleRoleBucket[]>
        compPackages?: Record<string, PersonCompPackage>
      }>(eventSlug, `/people${qs}`)
      setPeople(res.people ?? [])
      setRoleBuckets(res.roleBuckets ?? {})
      setCompPackages(res.compPackages ?? {})
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Failed to load people')
    }
  }, [eventSlug, q])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 200)
    return () => window.clearTimeout(t)
  }, [load])

  const filteredPeople = useMemo(() => {
    if (roleFilter === 'all') return people
    return people.filter((p) => (roleBuckets[p.id] ?? []).includes(roleFilter))
  }, [people, roleBuckets, roleFilter])

  const roleCounts = useMemo(() => {
    const counts: Partial<Record<RoleFilter, number>> = { all: people.length }
    for (const p of people) {
      for (const b of roleBuckets[p.id] ?? []) {
        counts[b] = (counts[b] ?? 0) + 1
      }
    }
    return counts
  }, [people, roleBuckets])

  async function addPerson() {
    if (readOnly || !sceneName.trim()) return
    setBusy(true)
    try {
      await organizerDancecardFetch(eventSlug, '/people', {
        method: 'POST',
        body: JSON.stringify({
          sceneName: sceneName.trim(),
          email: email.trim() || null,
        }),
      })
      setSceneName('')
      setEmail('')
      await load()
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Could not add person')
    } finally {
      setBusy(false)
    }
  }

  async function removePerson(id: string) {
    if (readOnly) return
    if (
      !(await ask({
        title: 'Remove person?',
        message: 'Remove this person from the event directory?',
        destructive: true,
      }))
    )
      return
    setBusy(true)
    try {
      await organizerDancecardFetch(eventSlug, `/people/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Could not delete')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {dialog}
      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <p className="text-sm leading-relaxed text-slate-300">
          This is the master list of everyone at your event: presenters, staff, volunteers, photographers, and anyone
          else you add. Comp type, package, code, and service hours come from the linked signup&apos;s registration
          category (Settings → Registration). Link people to sessions from the program grid.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Looking for signup records? See{' '}
          <Link
            href={`/organizer/dancecard/${encodeURIComponent(eventSlug)}?tab=people&peopleTab=signups`}
            className="text-dc-accent hover:underline"
          >
            Signups
          </Link>
          .
        </p>
      </div>
      {organizerRole === 'viewer' ? (
        <p className="rounded-xl border border-amber-200/20 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          Read-only: you can browse people but not add or remove.
        </p>
      ) : null}
      {loadErr ? <p className="text-sm text-rose-300">{loadErr}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          className="min-w-[12rem] flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="Search by scene name or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Filter by role</p>
        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map(({ key, label, hint }) => {
            const active = roleFilter === key
            const count = roleCounts[key]
            const isRegistered = key === 'registered'
            return (
              <button
                key={key}
                type="button"
                title={hint}
                className={filterPillClass(active, isRegistered && active)}
                onClick={() => setRoleFilter(key)}
              >
                {label}
                {count !== undefined ? ` (${count})` : ''}
              </button>
            )
          })}
        </div>
        {roleFilter === 'registered' ? (
          <p className="mt-2 text-xs text-emerald-200/80">
            People linked to a registrant record (by profile or matching email). Import or sync registrants to populate
            this list.
          </p>
        ) : null}
        {roleFilter === 'attendee' ? (
          <p className="mt-2 text-xs text-slate-500">
            Registered guests without a presenter, staff, or photographer assignment on the program or shift board.
          </p>
        ) : null}
      </div>
      {!readOnly ? (
        <div className="grid gap-2 rounded-xl border border-white/10 bg-black/25 p-4 sm:grid-cols-2">
          <label className="text-xs uppercase text-slate-500">
            New scene name
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
            />
          </label>
          <label className="text-xs uppercase text-slate-500">
            Email (optional)
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="button"
              disabled={busy || !sceneName.trim()}
              className="rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40"
              onClick={() => void addPerson()}
            >
              Add person
            </button>
          </div>
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="border-b border-white/10 bg-black/30 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Scene</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Pronouns</th>
              <th className="px-3 py-2">Roles</th>
              <th className="px-3 py-2">Comp type</th>
              <th className="px-3 py-2">Package</th>
              <th className="px-3 py-2">Comp code</th>
              <th className="px-3 py-2">Service hours</th>
              {!readOnly ? <th className="px-3 py-2 w-24"> </th> : null}
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="px-3 py-2 font-medium text-white">{p.sceneName}</td>
                <td className="px-3 py-2 text-slate-400">{p.email ?? '-'}</td>
                <td className="px-3 py-2 text-slate-400">{p.pronouns ?? '-'}</td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {(roleBuckets[p.id] ?? []).length
                    ? (roleBuckets[p.id] ?? [])
                        .map((b) => ROLE_FILTERS.find((f) => f.key === b)?.label ?? b)
                        .join(', ')
                    : '-'}
                </td>
                <td className="px-3 py-2 text-slate-300">
                  {compPackages[p.id]?.roleKindLabel ?? (
                    <span className="text-slate-600" title="No linked signup or category">
                      —
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-400">
                  {compPackages[p.id]?.categoryName ?? (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-300">
                  {compPackages[p.id]?.accessCode ?? (
                    <span className="font-sans text-slate-600" title="No code on this package">
                      —
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-300">
                  {compPackages[p.id] ? (
                    formatServiceHours(compPackages[p.id].expectedHours)
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                {!readOnly ? (
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-xs text-rose-300 hover:underline"
                      disabled={busy}
                      onClick={() => void removePerson(p.id)}
                    >
                      Remove
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
            {!filteredPeople.length ? (
              <tr>
                <td colSpan={readOnly ? 8 : 9} className="px-3 py-6 text-center text-slate-500">
                  {people.length && roleFilter !== 'all'
                    ? 'No people match this filter. Try All or add assignments on the program or staff tabs.'
                    : 'No people yet. Add presenters and staff here, then attach them to sessions from the program grid.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
