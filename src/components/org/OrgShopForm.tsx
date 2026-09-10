'use client'

import { useRef, useState } from 'react'
import {
  CANADA_STATE_ABBR_OPTIONS,
  SHOP_HUB_TAG_OPTIONS,
  US_STATE_ABBR_OPTIONS,
  slugifyShopSlug,
  type OrgShopInput,
} from '@/lib/eckeOrgVendorShared'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

const sectionClass = 'rounded-xl border border-white/10 bg-sf-card/40 p-5 space-y-4'

type Props = {
  mode: 'create' | 'edit'
  initial?: Partial<OrgShopInput>
  logoUrl?: string | null
  coverUrl?: string | null
}

export default function OrgShopForm({ mode, initial, logoUrl, coverUrl }: Props) {
  const slugEdited = useRef(mode === 'edit')
  const [values, setValues] = useState<OrgShopInput>({
    name: initial?.name || '',
    slug: initial?.slug || '',
    shortDescription: initial?.shortDescription || '',
    story: initial?.story || '',
    website: initial?.website || '',
    contactEmail: initial?.contactEmail || '',
    isOnline: initial?.isOnline || false,
    city: initial?.city || '',
    state: initial?.state || '',
    acceptsCommissions: initial?.acceptsCommissions || false,
    hubTags: initial?.hubTags || [],
    checkoutMode: 'offsite',
    status: initial?.status || 'published',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(logoUrl || '')
  const [coverPreview, setCoverPreview] = useState(coverUrl || '')
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null)

  function setField<K extends keyof OrgShopInput>(key: K, value: OrgShopInput[K]) {
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
      const response = await fetch('/api/org/shop', {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await response.json()) as { error?: string; slug?: string }
      if (!response.ok) throw new Error(data.error || 'Could not save shop')
      window.location.assign('/vendors/my-shop')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save shop')
      setLoading(false)
    }
  }

  async function uploadAsset(kind: 'logo' | 'cover', file: File) {
    setUploading(kind)
    setError(null)
    try {
      const form = new FormData()
      form.set('kind', kind)
      form.set('file', file)
      const response = await fetch('/api/org/shop/assets', { method: 'POST', body: form })
      const data = (await response.json()) as { error?: string; url?: string }
      if (!response.ok) throw new Error(data.error || 'Could not upload')
      if (data.url) {
        if (kind === 'logo') setLogoPreview(data.url)
        else setCoverPreview(data.url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload')
    } finally {
      setUploading(null)
    }
  }

  const previewSlug = slugifyShopSlug(values.slug || values.name || '')

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">Shop profile</h2>
        <label className="block text-sm text-sf-body">
          Shop name
          <input
            className={fieldClass}
            value={values.name}
            onChange={(e) => {
              const name = e.target.value
              setValues((current) => ({
                ...current,
                name,
                slug: slugEdited.current ? current.slug : slugifyShopSlug(name),
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
              placeholder="harbor-leather"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <p className="mt-1.5 text-xs text-sf-muted">
            Public page:{' '}
            <span className="text-sf-body">eastcoastkinkevents.com/vendors/{previewSlug || 'your-shop'}</span>
          </p>
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
          Story
          <textarea
            className={fieldClass}
            rows={8}
            value={values.story}
            onChange={(e) => setField('story', e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-sf-body">
          Offsite shop / website
          <input
            className={fieldClass}
            value={values.website || ''}
            onChange={(e) => setField('website', e.target.value)}
            placeholder="https://yourshop.example"
          />
        </label>
        <label className="block text-sm text-sf-body">
          Contact email
          <input
            className={fieldClass}
            type="email"
            value={values.contactEmail || ''}
            onChange={(e) => setField('contactEmail', e.target.value)}
            placeholder="shop@example.com"
            required
            autoComplete="email"
          />
        </label>
        <p className="text-xs text-sf-muted">
          Contact vendor on your public page opens this address. Buy buttons still go to your offsite checkout.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">Location</h2>
        <label className="flex items-center gap-2 text-sm text-sf-body">
          <input
            type="checkbox"
            checked={Boolean(values.isOnline)}
            onChange={(e) => setField('isOnline', e.target.checked)}
          />
          Ships everywhere / online only
        </label>
        {!values.isOnline ? (
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
        ) : null}
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">What you make</h2>
        <div className="flex flex-wrap gap-2">
          {SHOP_HUB_TAG_OPTIONS.map((tag) => {
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
        <label className="flex items-center gap-2 text-sm text-sf-body">
          <input
            type="checkbox"
            checked={Boolean(values.acceptsCommissions)}
            onChange={(e) => setField('acceptsCommissions', e.target.checked)}
          />
          Accepts custom commissions
        </label>
      </section>

      {mode === 'edit' ? (
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold text-sf-strong">Photos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-sf-body">
              Logo
              <input
                className={fieldClass}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void uploadAsset('logo', file)
                }}
              />
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="" className="mt-3 h-20 w-20 rounded-lg object-cover" />
              ) : null}
            </label>
            <label className="block text-sm text-sf-body">
              Cover
              <input
                className={fieldClass}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void uploadAsset('cover', file)
                }}
              />
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreview} alt="" className="mt-3 h-20 w-full rounded-lg object-cover" />
              ) : null}
            </label>
          </div>
        </section>
      ) : null}

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-sf-strong">Visibility</h2>
        <label className="block text-sm text-sf-body">
          Status
          <select
            className={fieldClass}
            value={values.status || 'published'}
            onChange={(e) => setField('status', e.target.value as OrgShopInput['status'])}
          >
            <option value="published">Published</option>
            <option value="draft">Draft (noindex, not in sitemap)</option>
          </select>
        </label>
      </section>

      <button type="submit" disabled={loading} className="sf-btn-primary min-h-11 px-5">
        {loading ? 'Saving…' : mode === 'create' ? 'Create shop' : 'Save shop'}
      </button>
    </form>
  )
}
