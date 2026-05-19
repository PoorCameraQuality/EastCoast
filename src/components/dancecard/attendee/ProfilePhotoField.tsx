'use client'

import { useRef, useState } from 'react'
import { dancecardUpload, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { isProfilePhotoStorageRef } from '@/lib/dancecard/profilePhotoConstants'
type Props = {
  eventSlug: string
  displayName: string
  photoUrl: string
  previewUrl: string | null
  onPhotoChange: (photoUrl: string, previewUrl: string | null) => void
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfilePhotoField({ eventSlug, displayName, photoUrl, previewUrl, onPhotoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [useLink, setUseLink] = useState(() => Boolean(photoUrl && !isProfilePhotoStorageRef(photoUrl)))

  const shownUrl = previewUrl || (photoUrl && !isProfilePhotoStorageRef(photoUrl) ? photoUrl : null)

  async function onFile(file: File | null) {
    if (!file) return
    setUploading(true)
    setErr(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const j = await dancecardUpload<{ photoUrl?: string; previewUrl?: string | null }>(
        eventSlug,
        '/me/profile-photo/upload',
        form,
      )
      if (!j.photoUrl) throw new Error('Upload failed')
      onPhotoChange(j.photoUrl, j.previewUrl ?? null)
      setUseLink(false)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">Profile photo</label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dc-accent-border/50 bg-dc-elevated-muted shadow-inner">
          {shownUrl ? (
            <img src={shownUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-bold text-dc-accent">
              {initials(displayName || '?')}
            </span>
          )}
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-dc-surface/80 text-[10px] font-semibold text-dc-muted">
              …
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              className="rounded-xl bg-dc-accent px-3 py-2 text-xs font-semibold text-dc-accent-foreground disabled:opacity-50"
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? 'Uploading…' : shownUrl ? 'Change photo' : 'Upload photo'}
            </button>
            {shownUrl ? (
              <button
                type="button"
                disabled={uploading}
                className="rounded-xl border border-dc-border px-3 py-2 text-xs font-semibold text-dc-muted"
                onClick={() => onPhotoChange('', null)}
              >
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-[10px] text-dc-subtle">PNG, JPEG, or WebP · max 5 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <button
        type="button"
        className="text-[11px] font-semibold text-dc-accent underline decoration-dc-accent-border/60"
        onClick={() => setUseLink((v) => !v)}
      >
        {useLink ? 'Hide link field' : 'Use an image link instead'}
      </button>
      {useLink ? (
        <input
          className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2 text-sm text-dc-text outline-none focus:border-dc-accent focus:ring-1 focus:ring-dc-accent/30"
          value={isProfilePhotoStorageRef(photoUrl) ? '' : photoUrl}
          onChange={(e) => onPhotoChange(e.target.value, e.target.value.trim() || null)}
          placeholder="https://…"
        />
      ) : null}
    </div>
  )
}
