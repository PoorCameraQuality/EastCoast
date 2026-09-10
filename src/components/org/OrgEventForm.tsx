'use client'

import { useRef, useState } from 'react'
import OrgEventMediaManager from '@/components/org/OrgEventMediaManager'
import OrgEventPendingMedia, {
  EMPTY_PENDING_MEDIA,
  uploadPendingEventMedia,
  type PendingEventMedia,
} from '@/components/org/OrgEventPendingMedia'
import OrgRichTextField from '@/components/org/OrgRichTextField'
import {
  ORG_EVENT_KIND_LABELS,
  ORG_EVENT_KINDS,
  CANADA_STATE_ABBR_OPTIONS,
  US_STATE_ABBR_OPTIONS,
  emptyTicketTier,
  slugifyEventSlug,
  type EventTicketTier,
  type OrgEventHostPlace,
  type OrgEventInput,
} from '@/lib/eckeOrgEventShared'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

const sectionClass = 'rounded-xl border border-white/10 bg-sf-card/40 p-5 space-y-4'

type Props = {
  mode: 'create' | 'edit'
  slug?: string
  initial?: Partial<OrgEventInput>
  hostPlace?: OrgEventHostPlace | null
  focus?: 'all' | 'media'
  media?: {
    heroImage?: string | null
    logo?: string | null
    gallery?: string[] | null
    programUrl?: string | null
    mapUrl?: string | null
  }
}

export default function OrgEventForm({ mode, slug, initial, hostPlace, focus = 'all', media }: Props) {
  const slugEdited = useRef(mode === 'edit')
  const [pendingMedia, setPendingMedia] = useState<PendingEventMedia>(EMPTY_PENDING_MEDIA)
  const [values, setValues] = useState<OrgEventInput>({
    title: initial?.title || '',
    slug: initial?.slug || '',
    shortDescription: initial?.shortDescription || '',
    kind: initial?.kind || 'party',
    organizer: initial?.organizer || '',
    website: initial?.website || '',
    startDate: initial?.startDate || '',
    startTime: initial?.startTime || '',
    endDate: initial?.endDate || '',
    endTime: initial?.endTime || '',
    doorsOpen: initial?.doorsOpen || '',
    isOnline: initial?.isOnline || false,
    venue: initial?.venue || '',
    city: initial?.city || '',
    state: initial?.state || '',
    address: initial?.address || '',
    showAddressPublicly: initial?.showAddressPublicly || false,
    longDescription: initial?.longDescription || '',
    coverImage: initial?.coverImage || '',
    gallery: initial?.gallery || '',
    ticketUrl: initial?.ticketUrl || '',
    registrationRequired: initial?.registrationRequired || false,
    ticketPrice: initial?.ticketPrice || '',
    priceRange: initial?.priceRange || '',
    registrationDeadline: initial?.registrationDeadline || '',
    ticketTiers: initial?.ticketTiers?.length ? initial.ticketTiers : [emptyTicketTier()],
    ageRestriction: initial?.ageRestriction || '',
    accessibility: initial?.accessibility || '',
    dressCode: initial?.dressCode || '',
    photographyPolicy: initial?.photographyPolicy || '',
    parking: initial?.parking || '',
    hotelInformation: initial?.hotelInformation || '',
    foodDrink: initial?.foodDrink || '',
    vendorArea: initial?.vendorArea || '',
    features: initial?.features || '',
    whyGo: initial?.whyGo || '',
    status: initial?.status || 'published',
    hostAtPlace: initial?.hostAtPlace ?? Boolean(hostPlace),
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function setField<K extends keyof OrgEventInput>(key: K, value: OrgEventInput[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function updateTier(index: number, patch: Partial<EventTicketTier>) {
    setValues((current) => ({
      ...current,
      ticketTiers: (current.ticketTiers || []).map((tier, i) => (i === index ? { ...tier, ...patch } : tier)),
    }))
  }

  function removeTier(index: number) {
    setValues((current) => ({
      ...current,
      ticketTiers: (current.ticketTiers || []).filter((_, i) => i !== index),
    }))
  }

  function applyHostPlace(enabled: boolean) {
    setValues((current) => {
      if (!enabled || !hostPlace) return { ...current, hostAtPlace: false }
      return {
        ...current,
        hostAtPlace: true,
        isOnline: false,
        venue: current.venue || hostPlace.name,
        city: current.city || hostPlace.city,
        state: current.state || hostPlace.state,
        address: current.address || (hostPlace.showAddressPublicly ? hostPlace.address || '' : ''),
        showAddressPublicly: current.showAddressPublicly || Boolean(hostPlace.showAddressPublicly),
      }
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const url = mode === 'create' ? '/api/org/events' : `/api/org/events/${slug}`
      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await response.json()) as { error?: string; slug?: string }
      if (!response.ok) throw new Error(data.error || 'Could not save event')
      const nextSlug = data.slug || slug
      if (mode === 'create' && nextSlug) {
        const failed = await uploadPendingEventMedia(nextSlug, pendingMedia)
        if (failed.length) {
          window.location.assign(`/events/${nextSlug}/media`)
          return
        }
      }
      window.location.assign(`/events/${nextSlug}/manage`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save event')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}

      {focus === 'all' ? (
      <>
      <section className={sectionClass} id="basic">
        <h2 className="text-lg font-semibold text-sf-strong">Basic information</h2>
        <label className="block text-sm text-sf-body">
          Event name
          <input
            className={fieldClass}
            value={values.title}
            onChange={(e) => {
              const title = e.target.value
              setValues((current) => ({
                ...current,
                title,
                slug: slugEdited.current ? current.slug : slugifyEventSlug(title),
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
              placeholder="myevent2027"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <p className="mt-1.5 text-xs text-sf-muted">
            This is the public page people will open. Example:{' '}
            <span className="text-sf-body">eastcoastkinkevents.com/events/myevent2027</span>
          </p>
          {slugifyEventSlug(values.slug || values.title || '') ? (
            <p className="mt-1 text-sm text-sf-strong">
              eastcoastkinkevents.com/events/{slugifyEventSlug(values.slug || values.title)}
            </p>
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
          />
        </label>
        <label className="block text-sm text-sf-body">
          Event type
          <select className={fieldClass} value={values.kind} onChange={(e) => setField('kind', e.target.value as OrgEventInput['kind'])}>
            {ORG_EVENT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {ORG_EVENT_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-sf-body">
          Organizer
          <input className={fieldClass} value={values.organizer} onChange={(e) => setField('organizer', e.target.value)} />
        </label>
        <label className="block text-sm text-sf-body">
          Website / ticket link
          <input className={fieldClass} value={values.website} onChange={(e) => setField('website', e.target.value)} />
        </label>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">When</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-sf-body">
            Start date
            <input className={fieldClass} type="date" value={values.startDate} onChange={(e) => setField('startDate', e.target.value)} required />
          </label>
          <label className="block text-sm text-sf-body">
            Start time
            <input className={fieldClass} type="time" value={values.startTime} onChange={(e) => setField('startTime', e.target.value)} />
          </label>
          <label className="block text-sm text-sf-body">
            End date
            <input className={fieldClass} type="date" value={values.endDate} onChange={(e) => setField('endDate', e.target.value)} required />
          </label>
          <label className="block text-sm text-sf-body">
            End time
            <input className={fieldClass} type="time" value={values.endTime} onChange={(e) => setField('endTime', e.target.value)} />
          </label>
        </div>
        <label className="block text-sm text-sf-body">
          Doors open <span className="text-sf-muted">(optional)</span>
          <input className={fieldClass} type="time" value={values.doorsOpen} onChange={(e) => setField('doorsOpen', e.target.value)} />
        </label>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">Where</h2>
        <label className="flex items-center gap-2 text-sm text-sf-body">
          <input
            type="checkbox"
            checked={values.isOnline}
            onChange={(e) => {
              const online = e.target.checked
              setValues((current) => ({ ...current, isOnline: online, hostAtPlace: online ? false : current.hostAtPlace }))
            }}
          />
          This is a virtual / online event
        </label>
        {hostPlace && !values.isOnline ? (
          <label className="flex items-start gap-2 text-sm text-sf-body">
            <input
              type="checkbox"
              className="mt-1"
              checked={Boolean(values.hostAtPlace)}
              onChange={(e) => applyHostPlace(e.target.checked)}
            />
            <span>
              Happens at {hostPlace.name}
              <span className="mt-1 block text-xs text-sf-muted">
                Puts this night on the location calendar at /dungeons/{hostPlace.slug} and in local search.
              </span>
            </span>
          </label>
        ) : null}
        {!values.isOnline ? (
          <>
            <label className="block text-sm text-sf-body">
              Venue
              <input className={fieldClass} value={values.venue} onChange={(e) => setField('venue', e.target.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-sf-body">
                City
                <input className={fieldClass} value={values.city} onChange={(e) => setField('city', e.target.value)} required={!values.isOnline} />
              </label>
              <label className="block text-sm text-sf-body">
                State
                <select className={fieldClass} value={values.state} onChange={(e) => setField('state', e.target.value)} required={!values.isOnline}>
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
              <input className={fieldClass} value={values.address} onChange={(e) => setField('address', e.target.value)} />
            </label>
            <fieldset className="text-sm text-sf-body">
              <legend>Show exact address publicly</legend>
              <label className="mt-2 mr-4 inline-flex items-center gap-2">
                <input type="radio" checked={values.showAddressPublicly === true} onChange={() => setField('showAddressPublicly', true)} />
                Yes
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" checked={!values.showAddressPublicly} onChange={() => setField('showAddressPublicly', false)} />
                No
              </label>
            </fieldset>
          </>
        ) : (
          <label className="block text-sm text-sf-body">
            Online venue / platform
            <input className={fieldClass} value={values.venue} onChange={(e) => setField('venue', e.target.value)} placeholder="Zoom, Discord, FetLife..." />
          </label>
        )}
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">
          <label htmlFor="event-description">Overview</label>
        </h2>
        <p className="text-xs text-sf-muted">
          This is the Overview section on your public event page.
        </p>
        <OrgRichTextField
          id="event-description"
          value={values.longDescription}
          onChange={(html) => setField('longDescription', html)}
          placeholder="Tell people what this gathering is, who it is for, and how to take part."
        />
      </section>

      <section className={sectionClass} id="page-surfaces">
        <h2 className="text-lg font-semibold text-sf-strong">Public page cards</h2>
        <p className="text-xs text-sf-muted">
          These become Why go and Highlights on /events/{'{slug}'}. One item per line.
        </p>
        <label className="block text-sm text-sf-body">
          Why go
          <textarea
            className={fieldClass}
            rows={4}
            value={values.whyGo || ''}
            onChange={(e) => setField('whyGo', e.target.value)}
            placeholder={'Darlington, Maryland campground\nFire, ritual, art, and education\n21+ clothing-optional gathering'}
          />
          <span className="mt-1 block text-xs text-sf-muted">Up to 4 short reasons. Shown at the top of the listing.</span>
        </label>
        <label className="block text-sm text-sf-body">
          Highlights
          <textarea
            className={fieldClass}
            rows={6}
            value={values.features || ''}
            onChange={(e) => setField('features', e.target.value)}
            placeholder={'Workshops and performances\nSacred sexuality and kink\nArtisanal vendor market'}
          />
          <span className="mt-1 block text-xs text-sf-muted">
            Up to 12 tiles. Optional detail after a dash: <span className="text-sf-body">Vendor hall - 40 makers</span>
          </span>
        </label>
      </section>
      </>
      ) : null}

      <section className={sectionClass} id="media">
        <h2 className="text-lg font-semibold text-sf-strong">Event media</h2>
        {mode === 'edit' && slug ? (
          <OrgEventMediaManager
            slug={slug}
            heroImage={media?.heroImage}
            logo={media?.logo}
            gallery={media?.gallery}
            programUrl={media?.programUrl}
            mapUrl={media?.mapUrl}
          />
        ) : (
          <OrgEventPendingMedia value={pendingMedia} onChange={setPendingMedia} />
        )}
      </section>

      {focus === 'all' ? (
      <>
      <section className={sectionClass} id="tickets">
        <h2 className="text-lg font-semibold text-sf-strong">Tickets / registration</h2>
        <label className="block text-sm text-sf-body">
          Ticket URL
          <input className={fieldClass} value={values.ticketUrl} onChange={(e) => setField('ticketUrl', e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm text-sf-body">
          <input
            type="checkbox"
            checked={values.registrationRequired}
            onChange={(e) => setField('registrationRequired', e.target.checked)}
          />
          Registration required
        </label>
        <label className="block text-sm text-sf-body">
          Ticket sales close
          <input
            className={fieldClass}
            type="date"
            value={values.registrationDeadline}
            onChange={(e) => setField('registrationDeadline', e.target.value)}
          />
          <span className="mt-1 block text-xs text-sf-muted">Last day people can buy tickets or register.</span>
        </label>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-sf-strong">Price tiers</h3>
            <p className="mt-1 text-xs text-sf-muted">
              Example: early bird April–May, regular May–June. Leave blank if tickets are free or priced only on your
              site.
            </p>
          </div>
          {(values.ticketTiers || []).map((tier, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-white/10 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-sf-body">
                  Label
                  <input
                    className={fieldClass}
                    value={tier.label || ''}
                    placeholder="Early bird"
                    onChange={(e) => updateTier(index, { label: e.target.value })}
                  />
                </label>
                <label className="block text-sm text-sf-body">
                  Price
                  <input
                    className={fieldClass}
                    value={tier.price}
                    placeholder="$85"
                    onChange={(e) => updateTier(index, { price: e.target.value })}
                  />
                </label>
                <label className="block text-sm text-sf-body">
                  From
                  <input
                    className={fieldClass}
                    type="date"
                    value={tier.startsOn}
                    onChange={(e) => updateTier(index, { startsOn: e.target.value })}
                  />
                </label>
                <label className="block text-sm text-sf-body">
                  Through
                  <input
                    className={fieldClass}
                    type="date"
                    value={tier.endsOn}
                    onChange={(e) => updateTier(index, { endsOn: e.target.value })}
                  />
                </label>
              </div>
              {(values.ticketTiers || []).length > 1 ? (
                <button type="button" className="text-sm underline" onClick={() => removeTier(index)}>
                  Remove tier
                </button>
              ) : null}
            </div>
          ))}
          {(values.ticketTiers || []).length < 8 ? (
            <button
              type="button"
              className="sf-btn-ghost min-h-11 px-4 text-sm"
              onClick={() => setField('ticketTiers', [...(values.ticketTiers || []), emptyTicketTier()])}
            >
              Add price tier
            </button>
          ) : null}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">Venue &amp; travel details</h2>
        <p className="text-xs text-sf-muted">
          Hotel, parking, and food copy appear under Venue &amp; travel on the public event page.
        </p>
        <label className="block text-sm text-sf-body">
          Age
          <select className={fieldClass} value={values.ageRestriction} onChange={(e) => setField('ageRestriction', e.target.value)}>
            <option value="">Not specified</option>
            <option value="18+">18+</option>
            <option value="21+">21+</option>
          </select>
        </label>
        {[
          ['accessibility', 'Accessibility information', 'accessibility'],
          ['dressCode', 'Dress code', 'dressCode'],
          ['photographyPolicy', 'Photography policy', 'photographyPolicy'],
          ['parking', 'Parking', 'parking'],
          ['hotelInformation', 'Hotel information', 'hotelInformation'],
          ['foodDrink', 'Food / drink', 'foodDrink'],
          ['vendorArea', 'Vendor area', 'vendorArea'],
        ].map(([key, label]) => (
          <label key={key} className="block text-sm text-sf-body">
            {label}
            <textarea
              className={fieldClass}
              rows={2}
              value={String(values[key as keyof OrgEventInput] || '')}
              onChange={(e) => setField(key as keyof OrgEventInput, e.target.value)}
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
      </section>
      </>
      ) : null}

      <button type="submit" className="sf-btn-primary min-h-11 px-6" disabled={loading}>
        {loading ? 'Saving…' : mode === 'create' ? 'Create event' : 'Save changes'}
      </button>
    </form>
  )
}
