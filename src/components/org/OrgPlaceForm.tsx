'use client'

import { useRef, useState } from 'react'
import OrgPlaceMediaManager from '@/components/org/OrgPlaceMediaManager'
import OrgPlacePendingMedia, {
  EMPTY_PENDING_PLACE_MEDIA,
  uploadPendingPlaceMedia,
  type PendingPlaceMedia,
} from '@/components/org/OrgPlacePendingMedia'
import OrgRichTextField from '@/components/org/OrgRichTextField'
import {
  CANADA_STATE_ABBR_OPTIONS,
  ORG_PLACE_KIND_LABELS,
  ORG_PLACE_KINDS,
  PLACE_HUB_TAG_OPTIONS,
  US_STATE_ABBR_OPTIONS,
  slugifyPlaceSlug,
  type OrgPlaceInput,
} from '@/lib/eckeOrgDungeonShared'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

const sectionClass = 'rounded-xl border border-white/10 bg-sf-card/40 p-5 space-y-4'

type Props = {
  mode: 'create' | 'edit'
  initial?: Partial<OrgPlaceInput>
  media?: {
    heroImage?: string | null
    logo?: string | null
    gallery?: string[] | null
  }
}

export default function OrgPlaceForm({ mode, initial, media }: Props) {
  const slugEdited = useRef(mode === 'edit')
  const [pendingMedia, setPendingMedia] = useState<PendingPlaceMedia>(EMPTY_PENDING_PLACE_MEDIA)
  const [values, setValues] = useState<OrgPlaceInput>({
    name: initial?.name || '',
    slug: initial?.slug || '',
    kind: initial?.kind || 'dungeon',
    shortDescription: initial?.shortDescription || '',
    longDescription: initial?.longDescription || '',
    website: initial?.website || '',
    contactEmail: initial?.contactEmail || '',
    contactPhone: initial?.contactPhone || '',
    city: initial?.city || '',
    state: initial?.state || '',
    address: initial?.address || '',
    showAddressPublicly: initial?.showAddressPublicly || false,
    hours: initial?.hours || '',
    hubTags: initial?.hubTags || [],
    ageRestriction: initial?.ageRestriction || '',
    accessibility: initial?.accessibility || '',
    dressCode: initial?.dressCode || '',
    photographyPolicy: initial?.photographyPolicy || '',
    parking: initial?.parking || '',
    houseRules: initial?.houseRules || '',
    alcoholPolicy: initial?.alcoholPolicy || '',
    membershipInfo: initial?.membershipInfo || '',
    firstTimerInfo: initial?.firstTimerInfo || '',
    status: initial?.status || 'published',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function setField<K extends keyof OrgPlaceInput>(key: K, value: OrgPlaceInput[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function toggleHub(slug: string) {
    setValues((current) => {
      const tags = current.hubTags || []
      return {
        ...current,
        hubTags: tags.includes(slug) ? tags.filter((item) => item !== slug) : [...tags, slug],
      }
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch('/api/org/place', {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await response.json()) as { error?: string; slug?: string }
      if (!response.ok) throw new Error(data.error || 'Could not save location')
      if (mode === 'create') {
        const failed = await uploadPendingPlaceMedia(pendingMedia)
        if (failed.length) {
          window.location.assign('/dungeons/my-place')
          return
        }
      }
      window.location.assign('/dungeons/my-place')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save location')
      setLoading(false)
    }
  }

  const previewSlug = slugifyPlaceSlug(values.slug || values.name || '')

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">Basic information</h2>
        <label className="block text-sm text-sf-body">
          Name
          <input
            className={fieldClass}
            value={values.name}
            onChange={(e) => {
              const name = e.target.value
              setValues((current) => ({
                ...current,
                name,
                slug: slugEdited.current ? current.slug : slugifyPlaceSlug(name),
              }))
            }}
            required
          />
        </label>
        <div>
          <label className="block text-sm text-sf-body">
            Your ECKE slug
            <input
              className={fieldClass}
              value={values.slug || ''}
              onChange={(e) => {
                slugEdited.current = true
                setField('slug', e.target.value)
              }}
              placeholder="harbor-dungeon"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <p className="mt-1.5 text-xs text-sf-muted">
            This is the public page people will open. Example:{' '}
            <span className="text-sf-body">eastcoastkinkevents.com/dungeons/harbor-dungeon</span>
          </p>
          {previewSlug ? (
            <p className="mt-1 text-sm text-sf-strong">eastcoastkinkevents.com/dungeons/{previewSlug}</p>
          ) : null}
        </div>
        <label className="block text-sm text-sf-body">
          Short description
          <textarea
            className={fieldClass}
            rows={3}
            value={values.shortDescription}
            onChange={(e) => setField('shortDescription', e.target.value)}
            required
            maxLength={280}
          />
        </label>
        <label className="block text-sm text-sf-body">
          Location type
          <select
            className={fieldClass}
            value={values.kind}
            onChange={(e) => setField('kind', e.target.value as OrgPlaceInput['kind'])}
          >
            {ORG_PLACE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {ORG_PLACE_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-sf-body">
          Website
          <input
            className={fieldClass}
            value={values.website || ''}
            onChange={(e) => setField('website', e.target.value)}
            placeholder="https://yourvenue.example"
          />
        </label>
        <label className="block text-sm text-sf-body">
          Contact email
          <input
            className={fieldClass}
            type="email"
            value={values.contactEmail || ''}
            onChange={(e) => setField('contactEmail', e.target.value)}
            placeholder="venue@example.com"
            required
            autoComplete="email"
          />
        </label>
        <label className="block text-sm text-sf-body">
          Phone <span className="text-sf-muted">(optional)</span>
          <input
            className={fieldClass}
            value={values.contactPhone || ''}
            onChange={(e) => setField('contactPhone', e.target.value)}
          />
        </label>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">Where</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-sf-body">
            City
            <input className={fieldClass} value={values.city || ''} onChange={(e) => setField('city', e.target.value)} required />
          </label>
          <label className="block text-sm text-sf-body">
            State / province
            <select className={fieldClass} value={values.state || ''} onChange={(e) => setField('state', e.target.value)} required>
              <option value="">Select</option>
              <optgroup label="United States">
                {US_STATE_ABBR_OPTIONS.map((state) => (
                  <option key={state.abbr} value={state.abbr}>
                    {state.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Canada">
                {CANADA_STATE_ABBR_OPTIONS.map((state) => (
                  <option key={state.abbr} value={state.abbr}>
                    {state.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>
        <label className="block text-sm text-sf-body">
          Address
          <input className={fieldClass} value={values.address || ''} onChange={(e) => setField('address', e.target.value)} />
        </label>
        <fieldset className="text-sm text-sf-body">
          <legend>Show exact address publicly</legend>
          <label className="mt-2 mr-4 inline-flex items-center gap-2">
            <input
              type="radio"
              checked={values.showAddressPublicly === true}
              onChange={() => setField('showAddressPublicly', true)}
            />
            Yes
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={!values.showAddressPublicly}
              onChange={() => setField('showAddressPublicly', false)}
            />
            No — city only until people contact you
          </label>
        </fieldset>
        <label className="block text-sm text-sf-body">
          Hours <span className="text-sf-muted">(optional)</span>
          <textarea
            className={fieldClass}
            rows={3}
            value={values.hours || ''}
            onChange={(e) => setField('hours', e.target.value)}
            placeholder="Fri–Sat 8pm–2am, or by event"
          />
        </label>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">
          <label htmlFor="place-description">About this space</label>
        </h2>
        <OrgRichTextField
          id="place-description"
          value={values.longDescription}
          onChange={(html) => setField('longDescription', html)}
          placeholder="Tell people what this space is like and how to visit."
        />
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">What people will find</h2>
        <div className="flex flex-wrap gap-2">
          {PLACE_HUB_TAG_OPTIONS.map((tag) => {
            const on = (values.hubTags || []).includes(tag.slug)
            return (
              <button
                key={tag.slug}
                type="button"
                onClick={() => toggleHub(tag.slug)}
                className={
                  on
                    ? 'rounded-full bg-sf-violet/30 px-3 py-1.5 text-sm text-sf-strong'
                    : 'rounded-full border border-white/15 px-3 py-1.5 text-sm text-sf-body'
                }
              >
                {tag.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className={sectionClass} id="media">
        <h2 className="text-lg font-semibold text-sf-strong">Photos</h2>
        {mode === 'edit' ? (
          <OrgPlaceMediaManager
            heroImage={media?.heroImage}
            logo={media?.logo}
            gallery={media?.gallery}
          />
        ) : (
          <OrgPlacePendingMedia value={pendingMedia} onChange={setPendingMedia} />
        )}
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">Access and house rules</h2>
        <label className="block text-sm text-sf-body">
          Age
          <select
            className={fieldClass}
            value={values.ageRestriction || ''}
            onChange={(e) => setField('ageRestriction', e.target.value)}
          >
            <option value="">Not specified</option>
            <option value="18+">18+</option>
            <option value="19+">19+</option>
            <option value="21+">21+</option>
          </select>
        </label>
        {(
          [
            ['membershipInfo', 'Membership / access'],
            ['firstTimerInfo', 'First-timer information'],
            ['houseRules', 'House rules / consent'],
            ['alcoholPolicy', 'Alcohol policy'],
            ['accessibility', 'Accessibility information'],
            ['dressCode', 'Dress code'],
            ['photographyPolicy', 'Photography policy'],
            ['parking', 'Parking'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm text-sf-body">
            {label}
            <textarea
              className={fieldClass}
              rows={2}
              value={String(values[key] || '')}
              onChange={(e) => setField(key, e.target.value)}
            />
          </label>
        ))}
      </section>

      <section className={sectionClass} id="visibility">
        <h2 className="text-lg font-semibold text-sf-strong">Visibility</h2>
        <label className="mr-4 inline-flex items-center gap-2 text-sm text-sf-body">
          <input type="radio" checked={values.status === 'published'} onChange={() => setField('status', 'published')} />
          Published
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-sf-body">
          <input type="radio" checked={values.status === 'draft'} onChange={() => setField('status', 'draft')} />
          Save as draft
        </label>
        <p className="text-xs text-sf-muted">Drafts stay off the public catalog, sitemap, and search.</p>
      </section>

      <button type="submit" className="sf-btn-primary min-h-11 px-6" disabled={loading}>
        {loading ? 'Saving…' : mode === 'create' ? 'Create location' : 'Save changes'}
      </button>
    </form>
  )
}
