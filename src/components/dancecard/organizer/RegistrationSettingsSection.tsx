'use client'

import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { RegistrationAttendeePreview } from '@/components/dancecard/organizer/registrants/RegistrationAttendeePreview'
import {
  RegistrationCategoryList,
  type RegistrationCategory,
} from '@/components/dancecard/organizer/registrants/RegistrationCategoryList'
import {
  SETTINGS_FIELD_CLASS,
  SETTINGS_LABEL_CLASS,
} from '@/components/dancecard/organizer/settings/eventSettingsConfig'
import { Panel } from '@/components/dancecard/ui/Panel'
import { Button } from '@/components/dancecard/ui/Button'

type Question = {
  id?: string
  type: string
  label: string
  required: boolean
  sortOrder: number
  optionsJson: unknown
  visibilityRulesJson: Record<string, unknown>
}

type FormState = {
  id: string | null
  status: string
  introText: string
  confirmationText: string
  questions: Question[]
}

const QUESTION_TYPES = [
  'text',
  'long_text',
  'email',
  'phone',
  'single_choice',
  'multi_choice',
  'dropdown',
  'date',
  'pronouns',
  'consent_matrix',
] as const

export function RegistrationSettingsSection({
  eventSlug,
  canEdit,
}: {
  eventSlug: string
  canEdit: boolean
}) {
  const [categories, setCategories] = useState<RegistrationCategory[]>([])
  const [form, setForm] = useState<FormState>({
    id: null,
    status: 'draft',
    introText: '',
    confirmationText: '',
    questions: [],
  })
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const loadCategories = useCallback(async () => {
    const res = await organizerDancecardFetch<{ categories: RegistrationCategory[] }>(
      eventSlug,
      '/registration-categories',
    )
    setCategories(
      (res.categories ?? []).map((c) => ({
        ...c,
        roleKind: c.roleKind ?? 'attendee',
        expectedHours: c.expectedHours ?? null,
        grantsStaffAccess: Boolean(c.grantsStaffAccess),
      })),
    )
  }, [eventSlug])

  const loadForm = useCallback(async () => {
    const res = await organizerDancecardFetch<{
      form: null | {
        id: string
        status: string
        introText: string
        confirmationText: string
        questions: Question[]
      }
    }>(eventSlug, '/registration-form')
    if (!res.form) {
      setForm({ id: null, status: 'draft', introText: '', confirmationText: '', questions: [] })
    } else {
      setForm({
        id: res.form.id,
        status: res.form.status,
        introText: res.form.introText,
        confirmationText: res.form.confirmationText,
        questions: (res.form.questions ?? []).map((q) => ({
          id: q.id,
          type: q.type,
          label: q.label,
          required: q.required,
          sortOrder: q.sortOrder,
          optionsJson: q.optionsJson ?? [],
          visibilityRulesJson: (q.visibilityRulesJson as Record<string, unknown>) ?? {},
        })),
      })
    }
  }, [eventSlug])

  useEffect(() => {
    void loadCategories().catch(() => setCategories([]))
    void loadForm().catch(() => null)
  }, [loadCategories, loadForm])

  async function saveForm() {
    if (!canEdit) return
    setBusy(true)
    setErr(null)
    try {
      await organizerDancecardFetch(eventSlug, '/registration-form', {
        method: 'PUT',
        body: JSON.stringify({
          status: form.status,
          introText: form.introText,
          confirmationText: form.confirmationText,
          questions: form.questions.map((q, i) => ({
            id: q.id,
            type: q.type,
            label: q.label,
            required: q.required,
            sortOrder: q.sortOrder ?? i,
            optionsJson: q.optionsJson,
            visibilityRulesJson: q.visibilityRulesJson,
          })),
        }),
      })
      await loadForm()
      setMsg('Registration form saved.')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  function addQuestion() {
    setForm((f) => ({
      ...f,
      questions: [
        ...f.questions,
        {
          type: 'text',
          label: 'New question',
          required: false,
          sortOrder: f.questions.length,
          optionsJson: [],
          visibilityRulesJson: {},
        },
      ],
    }))
  }

  return (
    <div className="space-y-6">
      {(msg || err) && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            err ? 'border-dc-danger-border bg-dc-danger-muted text-dc-danger' : 'border-dc-accent-border bg-dc-accent-muted text-dc-text'
          }`}
          role="status"
        >
          {err ?? msg}
        </div>
      )}

      <Panel variant="muted">
        <h3 className="text-sm font-semibold text-dc-text">How this works</h3>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-xs text-dc-muted">
          <li>
            <strong className="font-medium text-dc-text">Registration type</strong> — every category you add (Attendee,
            Staff, Presenter, Photographer, Vendor, etc.) appears in the attendee form dropdown.
          </li>
          <li>
            <strong className="font-medium text-dc-text">Hours of service</strong> — optional per type (e.g. 4 hr
            volunteer, 8 hr staff). Shown on the form when set; use for comp packages and shift planning.
          </li>
          <li>
            <strong className="font-medium text-dc-text">Comp codes</strong> — generate per category and share manually.
            Gates who can pick that registration type.
          </li>
          <li>
            <strong className="font-medium text-dc-text">Staff tools</strong> — enable on Staff/Volunteer categories, or
            use Settings → Advanced for one event-wide code. To upgrade an existing login, use People (coming soon) or
            have them enter the code on the dancecard.
          </li>
          <li>
            <strong className="font-medium text-dc-text">Program roles</strong> — presenters on the schedule are still
            assigned under Program → activity, even if you have a Presenter registration category.
          </li>
        </ul>
      </Panel>

      <RegistrationCategoryList
        eventSlug={eventSlug}
        canEdit={canEdit}
        categories={categories}
        onCategoriesChange={loadCategories}
        onMessage={setMsg}
        onError={setErr}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <h3 className="text-sm font-semibold text-dc-text">Registration form builder</h3>
          <p className="mt-1 text-xs text-dc-muted">Intro, confirmation, and custom questions. Live preview →</p>
          <div className="mt-4 grid gap-3">
            <label className={SETTINGS_LABEL_CLASS}>
              Status
              <select
                className={SETTINGS_FIELD_CLASS}
                disabled={!canEdit}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>
            <label className={SETTINGS_LABEL_CLASS}>
              Intro
              <textarea
                className={`${SETTINGS_FIELD_CLASS} min-h-[80px]`}
                disabled={!canEdit}
                value={form.introText}
                onChange={(e) => setForm((f) => ({ ...f, introText: e.target.value }))}
              />
            </label>
            <label className={SETTINGS_LABEL_CLASS}>
              Confirmation
              <textarea
                className={`${SETTINGS_FIELD_CLASS} min-h-[80px]`}
                disabled={!canEdit}
                value={form.confirmationText}
                onChange={(e) => setForm((f) => ({ ...f, confirmationText: e.target.value }))}
              />
            </label>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className={SETTINGS_LABEL_CLASS}>Questions</p>
              {canEdit ? (
                <button type="button" className="text-xs text-dc-accent hover:underline" onClick={addQuestion}>
                  + Add question
                </button>
              ) : null}
            </div>
            {form.questions.map((q, idx) => (
              <div key={q.id ?? `new-${idx}`} className="space-y-2 rounded-lg border border-dc-border bg-dc-surface-muted p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className={SETTINGS_LABEL_CLASS}>
                    Type
                    <select
                      className={SETTINGS_FIELD_CLASS}
                      disabled={!canEdit}
                      value={q.type}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          questions: f.questions.map((x, i) => (i === idx ? { ...x, type: e.target.value } : x)),
                        }))
                      }
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={SETTINGS_LABEL_CLASS}>
                    Sort order
                    <input
                      type="number"
                      className={SETTINGS_FIELD_CLASS}
                      disabled={!canEdit}
                      value={q.sortOrder}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          questions: f.questions.map((x, i) =>
                            i === idx ? { ...x, sortOrder: Number(e.target.value) || 0 } : x,
                          ),
                        }))
                      }
                    />
                  </label>
                </div>
                <label className={SETTINGS_LABEL_CLASS}>
                  Label
                  <input
                    className={SETTINGS_FIELD_CLASS}
                    disabled={!canEdit}
                    value={q.label}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        questions: f.questions.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                      }))
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-dc-text">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={q.required}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        questions: f.questions.map((x, i) => (i === idx ? { ...x, required: e.target.checked } : x)),
                      }))
                    }
                  />
                  Required
                </label>
                {canEdit ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-xs text-dc-muted hover:underline"
                      disabled={idx === 0}
                      onClick={() =>
                        setForm((f) => {
                          const qs = [...f.questions]
                          ;[qs[idx - 1], qs[idx]] = [qs[idx], qs[idx - 1]]
                          return { ...f, questions: qs.map((x, i) => ({ ...x, sortOrder: i })) }
                        })
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="text-xs text-dc-muted hover:underline"
                      disabled={idx >= form.questions.length - 1}
                      onClick={() =>
                        setForm((f) => {
                          const qs = [...f.questions]
                          ;[qs[idx], qs[idx + 1]] = [qs[idx + 1], qs[idx]]
                          return { ...f, questions: qs.map((x, i) => ({ ...x, sortOrder: i })) }
                        })
                      }
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="text-xs text-dc-danger hover:underline"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          questions: f.questions.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {canEdit ? (
            <Button type="button" className="mt-4" disabled={busy} onClick={() => void saveForm()}>
              Save registration form
            </Button>
          ) : null}
        </Panel>
        <RegistrationAttendeePreview
          introText={form.introText}
          confirmationText={form.confirmationText}
          questions={form.questions}
          categories={categories}
        />
      </div>
    </div>
  )
}
