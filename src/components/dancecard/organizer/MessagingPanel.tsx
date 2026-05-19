'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchAllOrganizerRegistrants, organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { useConfirmDialog, useOrganizerToast } from '@/components/dancecard/organizer/ui'
import { copy } from '@/lib/dancecard/productCopy'

type Template = { id: string; name: string; subject: string; bodyText: string; updatedAt: string }
type Campaign = {
  id: string
  templateId: string
  templateName: string
  status: string
  createdAt: string
  sentAt: string | null
  deliveryTotal: number
  deliverySent: number
}

const TEMPLATE_PRESETS = [
  {
    id: 'welcome',
    label: 'Welcome',
    name: 'Welcome',
    subject: 'Welcome to the event',
    bodyText:
      'Hi there,\n\nWe are glad you are joining us. Your dancecard has your schedule, room info, and updates.\n\nSee you soon!',
  },
  {
    id: 'schedule',
    label: 'Schedule update',
    name: 'Schedule update',
    subject: 'Schedule update',
    bodyText:
      'Hi there,\n\nWe updated the program. Open your dancecard for the latest class times and rooms.\n\nThanks for your flexibility.',
  },
  {
    id: 'room',
    label: 'Room change',
    name: 'Room change',
    subject: 'Room change for upcoming classes',
    bodyText:
      'Hi there,\n\nOne or more classes moved to a new room. Check your dancecard for the latest location details.\n\nSorry for any confusion.',
  },
  {
    id: 'thanks',
    label: 'Thank you / post-event',
    name: 'Thank you',
    subject: 'Thank you for joining us',
    bodyText:
      'Hi there,\n\nThank you for being part of the event. We hope you had a great time.\n\nStay tuned for photos and next-year news.',
  },
] as const

export function MessagingPanel({ eventSlug, readOnly }: { eventSlug: string; readOnly: boolean }) {
  const slug = eventSlug.toLowerCase()
  const [templates, setTemplates] = useState<Template[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [needsMigration, setNeedsMigration] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [name, setName] = useState('Announcement')
  const [subject, setSubject] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [presetId, setPresetId] = useState('')
  const [busy, setBusy] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [segment, setSegment] = useState<'all' | 'confirmed' | 'checked_in'>('all')
  const [composeTemplate, setComposeTemplate] = useState<Template | null>(null)
  const [composeAudience, setComposeAudience] = useState<{
    dancecardReach: number
    emailReach: number
  } | null>(null)
  const [composeAudienceErr, setComposeAudienceErr] = useState<string | null>(null)
  const { ask, dialog } = useConfirmDialog()
  const toast = useOrganizerToast()

  const load = useCallback(async () => {
    setErr(null)
    try {
      const [t, c] = await Promise.all([
        organizerDancecardFetch<{ templates: Template[]; needsMigration?: boolean }>(slug, '/message-templates'),
        organizerDancecardFetch<{ campaigns: Campaign[]; needsMigration?: boolean }>(slug, '/message-campaigns'),
      ])
      setTemplates(t.templates ?? [])
      setCampaigns(c.campaigns ?? [])
      setNeedsMigration(Boolean(t.needsMigration || c.needsMigration))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load messaging')
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!composeTemplate) {
      setComposeAudience(null)
      setComposeAudienceErr(null)
      return
    }
    let cancelled = false
    setComposeAudience(null)
    setComposeAudienceErr(null)
    ;(async () => {
      try {
        const regs = await fetchAllOrganizerRegistrants<{ status: string; email: string | null }>(slug)
        const eligible = regs.filter((r) => r.status !== 'cancelled')
        const emails = new Set(
          eligible
            .map((r) => String(r.email ?? '').trim().toLowerCase())
            .filter((e) => e.includes('@')),
        )
        if (!cancelled) setComposeAudience({ dancecardReach: eligible.length, emailReach: emails.size })
      } catch (e) {
        if (!cancelled) setComposeAudienceErr(e instanceof Error ? e.message : 'Could not estimate recipients')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [composeTemplate, slug])

  function applyPreset(id: string) {
    setPresetId(id)
    if (!id) return
    const preset = TEMPLATE_PRESETS.find((p) => p.id === id)
    if (!preset) return
    setName(preset.name)
    setSubject(preset.subject)
    setBodyText(preset.bodyText)
  }

  async function saveTemplate() {
    if (readOnly) return
    setBusy(true)
    try {
      await organizerDancecardFetch(slug, '/message-templates', {
        method: 'POST',
        body: JSON.stringify({ name, subject, bodyText }),
      })
      setSubject('')
      setBodyText('')
      setPresetId('')
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function createCampaign(templateId: string) {
    if (readOnly) return
    setBusy(true)
    try {
      await organizerDancecardFetch(slug, '/message-campaigns', {
        method: 'POST',
        body: JSON.stringify({ templateId }),
      })
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create campaign')
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    if (readOnly || !testEmail.trim() || !subject.trim() || !bodyText.trim()) return
    setBusy(true)
    try {
      await organizerDancecardFetch(slug, '/message-templates/test-send', {
        method: 'POST',
        body: JSON.stringify({ toEmail: testEmail.trim(), subject, bodyText }),
      })
      toast.push(`Test sent to ${testEmail.trim()}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Test send failed')
    } finally {
      setBusy(false)
    }
  }

  async function sendCampaign(id: string) {
    if (readOnly) return
    const campaign = campaigns.find((c) => c.id === id)
    const template = campaign ? templates.find((t) => t.id === campaign.templateId) : null
    const subjectLine = template?.subject ?? campaign?.templateName ?? 'Announcement'
    const ok = await ask({
      title: 'Publish to dancecard?',
      message: `Subject: "${subjectLine}"\n\nThis posts immediately on every attendee dancecard (Announcements feed).\n\nEmail to registrants is attempted only if Resend is configured; the feed works without email.\n\nContinue?`,
    })
    if (!ok) return
    setBusy(true)
    try {
      const res = await organizerDancecardFetch<{
        feedPublished?: boolean
        sent?: number
        failed?: number
        emailsSkipped?: boolean
        emailSkipReason?: string | null
      }>(slug, `/message-campaigns/${id}/send`, { method: 'POST' })
      await load()
      if (res.emailsSkipped) {
        toast.push(
          `Published to dancecard.${res.emailSkipReason ? ` Email skipped: ${res.emailSkipReason}` : ' Email not sent.'}`,
        )
      } else {
        toast.push(`Published to dancecard. Email: ${res.sent ?? 0} sent, ${res.failed ?? 0} failed.`)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 text-sm text-dc-muted">
      {dialog}
      <div>
        <h2 className="font-serif text-lg text-dc-text">Announcements</h2>
        <p className="mt-1 text-dc-muted">
          Publish a draft to post on every attendee dancecard immediately (Announcements feed). Email is optional and requires
          Resend — you can use the feed without email working yet.
        </p>
        <p className="mt-2 text-xs text-dc-muted">
          Email delivery uses Resend. Your host needs a Resend API key and sender domain configured in the server
          environment before live sends work (see first-run docs).
        </p>
      </div>
      {needsMigration ? (
        <p className="text-xs text-amber-800">
          Database update required to enable messaging. Apply the latest Dancecard migration in Supabase.
        </p>
      ) : null}
      {err ? <p className="text-sm text-red-700">{err}</p> : null}

      <div className="rounded-xl border border-dc-border bg-dc-surface-muted p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">New template</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-dc-muted sm:col-span-2">
            Start from preset
            <select
              className="mt-1 w-full rounded border border-dc-border bg-dc-surface-muted px-2 py-1 text-sm text-dc-text"
              value={presetId}
              disabled={readOnly || busy}
              onChange={(e) => applyPreset(e.target.value)}
            >
              <option value="">Choose a template type…</option>
              {TEMPLATE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-dc-muted">
            Name
            <input
              className="mt-1 w-full rounded border border-dc-border bg-dc-surface-muted px-2 py-1 text-sm text-dc-text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={readOnly || busy}
            />
          </label>
          <label className="text-xs text-dc-muted sm:col-span-2">
            Subject
            <input
              className="mt-1 w-full rounded border border-dc-border bg-dc-surface-muted px-2 py-1 text-sm text-dc-text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={readOnly || busy}
            />
          </label>
          <label className="text-xs text-dc-muted sm:col-span-2">
            Body (plain text)
            <textarea
              className="mt-1 min-h-[120px] w-full rounded border border-dc-border bg-dc-surface-muted px-2 py-1 text-sm text-dc-text"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              disabled={readOnly || busy}
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <button
            type="button"
            disabled={readOnly || busy || !subject.trim() || !bodyText.trim()}
            className="rounded-full bg-dc-accent-muted px-4 py-2 text-xs font-semibold text-dc-accent-foreground ring-1 ring-dc-accent-border hover:bg-dc-accent/30 disabled:opacity-40"
            onClick={() => void saveTemplate()}
          >
            Save template
          </button>
          <label className="text-xs text-dc-muted">
            Test to
            <input
              type="email"
              className="mt-1 block rounded border border-dc-border bg-dc-surface-muted px-2 py-1 text-sm text-dc-text"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={readOnly || busy}
              placeholder="you@example.com"
            />
          </label>
          <button
            type="button"
            disabled={readOnly || busy || !testEmail.trim()}
            className="rounded-full border border-dc-border px-3 py-2 text-xs hover:bg-dc-accent-muted disabled:opacity-40"
            onClick={() => void sendTest()}
          >
            Send test
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-dc-border bg-dc-surface-muted p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Templates</p>
        <ul className="mt-3 space-y-3">
          {templates.map((t) => (
            <li key={t.id} className="rounded-lg border border-dc-border bg-dc-elevated-muted p-3">
              <div className="font-medium text-dc-text">{t.name}</div>
              <div className="text-xs text-dc-muted">{t.subject}</div>
              <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap text-[11px] text-dc-muted">{t.bodyText}</pre>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={readOnly || busy}
                  className="text-xs text-dc-accent hover:underline disabled:opacity-40"
                  onClick={() => setComposeTemplate(t)}
                >
                  Create announcement…
                </button>
              </div>
            </li>
          ))}
        </ul>
        {!templates.length ? <p className="mt-2 text-xs text-dc-muted">No templates yet.</p> : null}
      </div>

      <div className="rounded-xl border border-dc-border bg-dc-surface-muted p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Campaigns &amp; delivery</p>
        <label className="mt-2 flex items-center gap-2 text-xs text-dc-muted">
          Segment (chart)
          <select
            className="rounded border border-dc-border bg-dc-surface-muted px-2 py-1 text-dc-text"
            value={segment}
            onChange={(e) => setSegment(e.target.value as typeof segment)}
          >
            <option value="all">All campaigns</option>
            <option value="confirmed">Confirmed registrants target</option>
            <option value="checked_in">Checked-in target</option>
          </select>
        </label>
        {campaigns.length ? (
          <div className="mt-3 flex h-24 items-end gap-1">
            {campaigns.slice(0, 12).map((c) => {
              const pct = c.deliveryTotal ? Math.round((c.deliverySent / c.deliveryTotal) * 100) : 0
              return (
                <div
                  key={c.id}
                  title={`${c.templateName}: ${pct}%`}
                  className="min-w-[8px] flex-1 rounded-t bg-dc-accent/60"
                  style={{ height: `${Math.max(8, pct)}%` }}
                />
              )
            })}
          </div>
        ) : null}
        <ul className="mt-3 space-y-2">
          {campaigns.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-dc-border pt-2 text-xs">
              <div>
                <span className="text-dc-text">{c.templateName}</span>
                <span className="text-dc-muted"> · {c.status}</span>
                {c.status === 'sent' ? <span className="text-emerald-400/90"> · on dancecard</span> : null}
                {c.deliveryTotal ? (
                  <span className="text-dc-muted">
                    {' '}
                    · email {c.deliverySent}/{c.deliveryTotal}
                  </span>
                ) : c.status === 'sent' ? (
                  <span className="text-dc-muted"> · no email log</span>
                ) : null}
              </div>
              {c.status === 'draft' ? (
                <button
                  type="button"
                  disabled={readOnly || busy}
                  className="text-dc-accent hover:underline disabled:opacity-40"
                  onClick={() => void sendCampaign(c.id)}
                >
                  Publish to dancecard
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {!campaigns.length ? <p className="mt-2 text-xs text-dc-muted">No campaigns yet.</p> : null}
      </div>

      {composeTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dc-surface/80 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-dc-border bg-dc-elevated-solid p-5 shadow-2xl">
            <h3 className="font-serif text-lg text-dc-text">Create announcement</h3>
            <p className="mt-2 text-sm text-dc-muted">
              Saves a <strong className="font-medium text-dc-text">draft</strong> only. Review in Campaigns below,
              then click <strong className="font-medium text-dc-text">Publish to dancecard</strong> when ready (email optional).
            </p>
            <dl className="mt-4 space-y-3 rounded-xl border border-dc-border bg-dc-surface-muted p-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-dc-muted">Template</dt>
                <dd className="text-dc-text">{composeTemplate.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-dc-muted">Email subject</dt>
                <dd className="text-dc-text">{composeTemplate.subject}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-dc-muted">Message preview</dt>
                <dd className="mt-1 whitespace-pre-wrap text-dc-muted">{composeTemplate.bodyText}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-dc-muted">Delivery estimate</dt>
                <dd className="mt-1 text-dc-muted">
                  {composeAudienceErr ? (
                    <span className="text-amber-800">{composeAudienceErr}</span>
                  ) : composeAudience ? (
                    <>
                      <span className="block">
                        In-app (non-cancelled {copy.signups.toLowerCase()}):{' '}
                        <strong className="text-dc-text">{composeAudience.dancecardReach}</strong>
                      </span>
                      <span className="mt-1 block text-xs text-dc-muted">
                        Unique emails on file (matches send):{' '}
                        <strong className="text-dc-text">{composeAudience.emailReach}</strong>
                      </span>
                    </>
                  ) : (
                    <span className="text-dc-muted">Calculating…</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={readOnly || busy}
                className="rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40"
                onClick={() => {
                  void createCampaign(composeTemplate.id).then(() => setComposeTemplate(null))
                }}
              >
                Save as draft
              </button>
              <button
                type="button"
                className="rounded-full border border-dc-border px-4 py-2 text-sm text-dc-muted hover:bg-white/5"
                onClick={() => setComposeTemplate(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
