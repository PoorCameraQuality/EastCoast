'use client'

import { useEffect, useMemo, useState } from 'react'
import { EVENT_ASSET_GUIDES, type EventAssetKind } from '@/lib/eckeOrgEventAssets'

export type PendingPlaceMedia = {
  hero: File | null
  logo: File | null
  gallery: File[]
}

export const EMPTY_PENDING_PLACE_MEDIA: PendingPlaceMedia = {
  hero: null,
  logo: null,
  gallery: [],
}

const GALLERY_MAX = 12
type PlaceAssetKind = 'hero' | 'logo' | 'gallery'

function previewForFile(file: File | null): string | null {
  if (!file) return null
  return URL.createObjectURL(file)
}

function validateFile(kind: PlaceAssetKind, file: File): string | null {
  const guide = EVENT_ASSET_GUIDES[kind]
  if (file.size > guide.maxBytes) return `File is too large. ${guide.hint}`
  return null
}

async function uploadAsset(kind: PlaceAssetKind, file: File) {
  const body = new FormData()
  body.set('kind', kind)
  body.set('file', file)
  const response = await fetch('/api/org/place/assets', {
    method: 'POST',
    body,
    credentials: 'include',
  })
  const data = (await response.json()) as { error?: string }
  if (!response.ok) throw new Error(data.error || `Could not upload ${EVENT_ASSET_GUIDES[kind].title}`)
}

export async function uploadPendingPlaceMedia(pending: PendingPlaceMedia) {
  const failed: string[] = []
  const jobs: Array<{ kind: PlaceAssetKind; file: File }> = []
  if (pending.hero) jobs.push({ kind: 'hero', file: pending.hero })
  if (pending.logo) jobs.push({ kind: 'logo', file: pending.logo })
  for (const file of pending.gallery) jobs.push({ kind: 'gallery', file })

  for (const job of jobs) {
    try {
      await uploadAsset(job.kind, job.file)
    } catch (error) {
      failed.push(error instanceof Error ? error.message : EVENT_ASSET_GUIDES[job.kind].title)
    }
  }
  return failed
}

function FileSlot({
  kind,
  file,
  onPick,
  onClear,
}: {
  kind: Exclude<EventAssetKind, 'gallery' | 'program' | 'map'>
  file: File | null
  onPick: (file: File) => void
  onClear: () => void
}) {
  const guide = EVENT_ASSET_GUIDES[kind]
  const [error, setError] = useState<string | null>(null)
  const preview = useMemo(() => previewForFile(file), [file])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  return (
    <div className="rounded-lg border border-white/10 p-3">
      <p className="text-sm font-medium text-sf-strong">{guide.title}</p>
      <p className="mt-1 text-xs text-sf-muted">{guide.hint}</p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="mt-2 max-h-36 w-full rounded-md object-cover" />
      ) : null}
      {error ? <p className="mt-2 text-sm text-rose-200">{error}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="sf-btn-ghost min-h-11 cursor-pointer px-4 text-sm">
          <input
            type="file"
            accept={guide.accept}
            className="sr-only"
            onChange={(e) => {
              const next = e.target.files?.[0]
              e.target.value = ''
              if (!next) return
              const problem = validateFile(kind, next)
              if (problem) {
                setError(problem)
                return
              }
              setError(null)
              onPick(next)
            }}
          />
          {file ? 'Replace' : 'Choose file'}
        </label>
        {file ? (
          <button type="button" className="min-h-11 px-3 text-sm underline" onClick={onClear}>
            Remove
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default function OrgPlacePendingMedia({
  value,
  onChange,
}: {
  value: PendingPlaceMedia
  onChange: (next: PendingPlaceMedia) => void
}) {
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const galleryPreviews = useMemo(
    () => value.gallery.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [value.gallery],
  )

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [galleryPreviews])

  return (
    <div className="space-y-3">
      <p className="text-sm text-sf-muted">
        Optional. Choose files now and they upload when you create the listing. You can add or replace them later.
      </p>
      <FileSlot
        kind="hero"
        file={value.hero}
        onPick={(file) => onChange({ ...value, hero: file })}
        onClear={() => onChange({ ...value, hero: null })}
      />
      <FileSlot
        kind="logo"
        file={value.logo}
        onPick={(file) => onChange({ ...value, logo: file })}
        onClear={() => onChange({ ...value, logo: null })}
      />

      <div className="rounded-lg border border-white/10 p-3">
        <p className="text-sm font-medium text-sf-strong">Gallery</p>
        <p className="mt-1 text-xs text-sf-muted">{EVENT_ASSET_GUIDES.gallery.hint}</p>
        {galleryError ? <p className="mt-2 text-sm text-rose-200">{galleryError}</p> : null}
        {galleryPreviews.length ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryPreviews.map((item, index) => (
              <div key={`${item.file.name}-${index}`} className="overflow-hidden rounded-lg border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="h-28 w-full object-cover" />
                <button
                  type="button"
                  className="w-full py-2 text-xs underline"
                  onClick={() =>
                    onChange({ ...value, gallery: value.gallery.filter((_, current) => current !== index) })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <label className="sf-btn-ghost mt-3 inline-flex min-h-11 cursor-pointer px-4 text-sm">
          <input
            type="file"
            accept={EVENT_ASSET_GUIDES.gallery.accept}
            multiple
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              e.target.value = ''
              const room = GALLERY_MAX - value.gallery.length
              if (room <= 0) {
                setGalleryError(`You can add up to ${GALLERY_MAX} photos.`)
                return
              }
              const accepted: File[] = []
              for (const file of files.slice(0, room)) {
                const problem = validateFile('gallery', file)
                if (problem) {
                  setGalleryError(problem)
                  return
                }
                accepted.push(file)
              }
              setGalleryError(null)
              onChange({ ...value, gallery: [...value.gallery, ...accepted] })
            }}
          />
          Add photos
        </label>
      </div>
    </div>
  )
}
