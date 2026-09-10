'use client'

import { useState } from 'react'
import { EVENT_ASSET_GUIDES, type EventAssetKind } from '@/lib/eckeOrgEventAssets'

type Props = {
  slug: string
  heroImage?: string | null
  logo?: string | null
  gallery?: string[] | null
  programUrl?: string | null
  mapUrl?: string | null
}

function Preview({ url }: { url: string }) {
  const isPdf = /\.pdf($|\?)/i.test(url)
  if (isPdf) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline">
        View current file
      </a>
    )
  }
  return <img src={url} alt="" className="mt-2 max-h-40 w-full rounded-lg object-cover" />
}

function AssetSlot({
  slug,
  kind,
  current,
  onChange,
}: {
  slug: string
  kind: Exclude<EventAssetKind, 'gallery'>
  current?: string | null
  onChange: (url: string | null) => void
}) {
  const guide = EVENT_ASSET_GUIDES[kind]
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setBusy(true)
    setError(null)
    const body = new FormData()
    body.set('kind', kind)
    body.set('file', file)
    const response = await fetch(`/api/org/events/${slug}/assets`, { method: 'POST', body })
    const data = (await response.json()) as { error?: string; url?: string }
    if (!response.ok || !data.url) {
      setError(data.error || 'Could not upload')
      setBusy(false)
      return
    }
    onChange(data.url)
    setBusy(false)
  }

  async function remove() {
    setBusy(true)
    const response = await fetch(`/api/org/events/${slug}/assets`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind }),
    })
    if (response.ok) onChange(null)
    setBusy(false)
  }

  return (
    <section className="rounded-xl border border-white/10 bg-sf-card/40 p-5">
      <h2 className="text-lg font-semibold text-sf-strong">{guide.title}</h2>
      <p className="mt-1 text-sm text-sf-muted">{guide.hint}</p>
      {current ? <Preview url={current} /> : null}
      {error ? <p className="mt-2 text-sm text-rose-200">{error}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="sf-btn-ghost min-h-11 cursor-pointer px-4 text-sm">
          <input
            type="file"
            accept={guide.accept}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void upload(file)
              e.target.value = ''
            }}
          />
          {busy ? 'Uploading…' : current ? 'Replace' : 'Upload'}
        </label>
        {current ? (
          <button type="button" className="min-h-11 px-3 text-sm underline" disabled={busy} onClick={() => void remove()}>
            Remove
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default function OrgEventMediaManager({ slug, heroImage, logo, gallery, programUrl, mapUrl }: Props) {
  const [hero, setHero] = useState(heroImage || '')
  const [mark, setMark] = useState(logo || '')
  const [photos, setPhotos] = useState(gallery || [])
  const [program, setProgram] = useState(programUrl || '')
  const [map, setMap] = useState(mapUrl || '')
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [galleryBusy, setGalleryBusy] = useState(false)

  async function addGallery(file: File) {
    setGalleryBusy(true)
    setGalleryError(null)
    const body = new FormData()
    body.set('kind', 'gallery')
    body.set('file', file)
    const response = await fetch(`/api/org/events/${slug}/assets`, { method: 'POST', body })
    const data = (await response.json()) as { error?: string; images?: string[] }
    if (!response.ok) setGalleryError(data.error || 'Could not upload')
    else if (data.images) setPhotos(data.images)
    setGalleryBusy(false)
  }

  async function removeGallery(url: string) {
    const response = await fetch(`/api/org/events/${slug}/assets`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'gallery', url }),
    })
    const data = (await response.json()) as { images?: string[] }
    if (response.ok && data.images) setPhotos(data.images)
  }

  return (
    <div className="space-y-5">
      <AssetSlot slug={slug} kind="hero" current={hero || null} onChange={(url) => setHero(url || '')} />
      <AssetSlot slug={slug} kind="logo" current={mark || null} onChange={(url) => setMark(url || '')} />

      <section className="rounded-xl border border-white/10 bg-sf-card/40 p-5">
        <h2 className="text-lg font-semibold text-sf-strong">Gallery</h2>
        <p className="mt-1 text-sm text-sf-muted">{EVENT_ASSET_GUIDES.gallery.hint}</p>
        {galleryError ? <p className="mt-2 text-sm text-rose-200">{galleryError}</p> : null}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((url) => (
            <div key={url} className="overflow-hidden rounded-lg border border-white/10">
              <img src={url} alt="" className="h-28 w-full object-cover" />
              <button type="button" className="w-full py-2 text-xs underline" onClick={() => void removeGallery(url)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <label className="sf-btn-ghost mt-3 inline-flex min-h-11 cursor-pointer px-4 text-sm">
          <input
            type="file"
            accept={EVENT_ASSET_GUIDES.gallery.accept}
            className="sr-only"
            disabled={galleryBusy}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void addGallery(file)
              e.target.value = ''
            }}
          />
          {galleryBusy ? 'Uploading…' : 'Add photo'}
        </label>
      </section>

      <AssetSlot slug={slug} kind="program" current={program || null} onChange={(url) => setProgram(url || '')} />
      <AssetSlot slug={slug} kind="map" current={map || null} onChange={(url) => setMap(url || '')} />
    </div>
  )
}
