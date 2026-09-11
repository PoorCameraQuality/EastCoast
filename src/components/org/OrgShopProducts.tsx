'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  MAX_PRODUCT_MEDIA,
  normalizeShopProductMedia,
  type ManagedShopProduct,
  type OrgShopProductInput,
  type ShopProductMediaItem,
} from '@/lib/eckeOrgVendorShared'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/webm'

const emptyProduct = (): OrgShopProductInput => ({
  title: '',
  description: '',
  priceLabel: '',
  category: '',
  externalUrl: '',
  status: 'published',
})

type PendingFile = {
  id: string
  file: File
  previewUrl: string
  kind: 'image' | 'video'
}

function filesToPending(list: FileList | File[]): PendingFile[] {
  return Array.from(list).map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    kind: file.type.startsWith('video/') ? 'video' : 'image',
  }))
}

function MediaDropZone({
  files,
  onAdd,
  onRemove,
  disabled,
  remaining,
}: {
  files: PendingFile[]
  onAdd: (files: PendingFile[]) => void
  onRemove: (id: string) => void
  disabled?: boolean
  remaining: number
}) {
  const [dragOver, setDragOver] = useState(false)

  function takeFiles(fileList: FileList | null) {
    if (!fileList?.length || remaining <= 0) return
    const next = filesToPending(fileList).slice(0, remaining)
    if (next.length) onAdd(next)
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <p className="text-sm text-sf-body">Photos &amp; video</p>
      <p className="text-xs text-sf-muted">
        Drag and drop or select multiple files. JPG/PNG/WebP up to 5&nbsp;MB, MP4/WebM up to 25&nbsp;MB. Up to{' '}
        {MAX_PRODUCT_MEDIA} total.
      </p>
      <label
        className={`flex min-h-[7rem] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center text-sm transition ${
          dragOver ? 'border-sf-violet/60 bg-sf-violet/10 text-sf-strong' : 'border-white/20 bg-black/20 text-sf-muted'
        } ${disabled || remaining <= 0 ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          takeFiles(e.dataTransfer.files)
        }}
      >
        <span>{remaining <= 0 ? 'Media limit reached' : 'Drop files here or click to select'}</span>
        <input
          type="file"
          accept={MEDIA_ACCEPT}
          multiple
          className="sr-only"
          disabled={disabled || remaining <= 0}
          onChange={(e) => {
            takeFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </label>
      {files.length ? (
        <ul className="flex flex-wrap gap-2">
          {files.map((item) => (
            <li key={item.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/10 bg-black/40">
              {item.kind === 'video' ? (
                <video src={item.previewUrl} className="h-full w-full object-cover" muted playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
              )}
              {item.kind === 'video' ? (
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">Video</span>
              ) : null}
              <button
                type="button"
                className="absolute right-1 top-1 rounded bg-black/70 px-1 text-xs text-rose-100"
                onClick={() => onRemove(item.id)}
                aria-label="Remove file"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function SavedMediaStrip({
  media,
  onAddFiles,
  onRemove,
  busy,
}: {
  media: ShopProductMediaItem[]
  onAddFiles: (files: FileList) => void
  onRemove: (id: string) => void
  busy?: boolean
}) {
  const remaining = MAX_PRODUCT_MEDIA - media.length
  return (
    <div className="mt-3 space-y-2">
      <ul className="flex flex-wrap gap-2">
        {media.map((item) => (
          <li key={item.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/10 bg-black/40">
            {item.kind === 'video' ? (
              <video src={item.url} className="h-full w-full object-cover" muted playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt="" className="h-full w-full object-cover" />
            )}
            {item.kind === 'video' ? (
              <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">Video</span>
            ) : null}
            <button
              type="button"
              disabled={busy}
              className="absolute right-1 top-1 rounded bg-black/70 px-1 text-xs text-rose-100 disabled:opacity-50"
              onClick={() => onRemove(item.id)}
              aria-label="Remove media"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <label className={`sf-btn-ghost inline-flex min-h-9 cursor-pointer items-center px-3 text-sm ${remaining <= 0 ? 'pointer-events-none opacity-50' : ''}`}>
        Add media
        <input
          type="file"
          accept={MEDIA_ACCEPT}
          multiple
          className="sr-only"
          disabled={busy || remaining <= 0}
          onChange={(e) => {
            if (e.target.files?.length) onAddFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

export default function OrgShopProducts({ initial }: { initial: ManagedShopProduct[] }) {
  const [products, setProducts] = useState(initial)
  const [draft, setDraft] = useState<OrgShopProductInput>(emptyProduct())
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [mediaBusyId, setMediaBusyId] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      for (const item of pendingFiles) URL.revokeObjectURL(item.previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount snapshot
  }, [])

  async function reload() {
    const response = await fetch('/api/org/shop/products')
    const data = (await response.json()) as { products?: ManagedShopProduct[]; error?: string }
    if (!response.ok) throw new Error(data.error || 'Could not load products')
    setProducts(data.products || [])
  }

  async function uploadProductFiles(productId: string, files: File[]) {
    if (!files.length) return
    const form = new FormData()
    form.set('kind', 'product')
    form.set('productId', productId)
    for (const file of files) form.append('files', file)
    const response = await fetch('/api/org/shop/assets', { method: 'POST', body: form })
    const data = (await response.json()) as { error?: string }
    if (!response.ok) throw new Error(data.error || 'Could not upload media')
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const response = await fetch('/api/org/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = (await response.json()) as { error?: string; id?: string }
      if (!response.ok) throw new Error(data.error || 'Could not add product')
      if (data.id && pendingFiles.length) {
        await uploadProductFiles(
          data.id,
          pendingFiles.map((item) => item.file),
        )
      }
      for (const item of pendingFiles) URL.revokeObjectURL(item.previewUrl)
      setPendingFiles([])
      setDraft(emptyProduct())
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add product')
    } finally {
      setSaving(false)
    }
  }

  async function saveProduct(id: string, input: OrgShopProductInput) {
    setError(null)
    const response = await fetch(`/api/org/shop/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const data = (await response.json()) as { error?: string }
    if (!response.ok) throw new Error(data.error || 'Could not update product')
    setEditingId(null)
    await reload()
  }

  async function deleteProduct(id: string) {
    if (!window.confirm('Remove this product from your shop?')) return
    setError(null)
    const response = await fetch(`/api/org/shop/products/${id}`, { method: 'DELETE' })
    const data = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(data.error || 'Could not delete product')
      return
    }
    await reload()
  }

  async function addMediaToProduct(id: string, fileList: FileList) {
    setError(null)
    setMediaBusyId(id)
    try {
      await uploadProductFiles(id, Array.from(fileList))
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload media')
    } finally {
      setMediaBusyId(null)
    }
  }

  async function removeMedia(productId: string, mediaId: string) {
    setError(null)
    setMediaBusyId(productId)
    try {
      const response = await fetch(`/api/org/shop/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeMediaId: mediaId }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Could not remove media')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove media')
    } finally {
      setMediaBusyId(null)
    }
  }

  const createRemaining = useMemo(() => MAX_PRODUCT_MEDIA - pendingFiles.length, [pendingFiles.length])

  return (
    <section className="space-y-6 rounded-xl border border-white/10 bg-sf-card/40 p-5">
      <div>
        <h2 className="text-lg font-semibold text-sf-strong">Products</h2>
        <p className="mt-1 text-sm text-sf-muted">
          Shoppers open a product gallery on your page, then Buy takes them to your offsite listing. ECKE does not take
          payment.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-4">
        {products.map((product) => {
          const media = normalizeShopProductMedia(product.media, product.image_url)
          return (
            <li key={product.id} className="rounded-lg border border-white/10 p-4">
              {editingId === product.id ? (
                <ProductFields
                  initial={{
                    title: product.title,
                    description: product.description || '',
                    priceLabel: product.price_label || '',
                    category: product.category || '',
                    externalUrl: product.external_url || '',
                    status: product.status,
                  }}
                  onCancel={() => setEditingId(null)}
                  onSave={(input) => saveProduct(product.id, input)}
                />
              ) : (
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {media[0] ? (
                      media[0].kind === 'video' ? (
                        <video src={media[0].url} className="h-20 w-20 rounded-lg object-cover" muted playsInline />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={media[0].url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                      )
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-white/5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sf-strong">{product.title}</p>
                      <p className="text-sm text-sf-muted">
                        {product.price_label || 'No price label'} · {product.status} · {media.length} media
                      </p>
                      {product.external_url ? (
                        <p className="truncate text-xs text-sf-muted">{product.external_url}</p>
                      ) : (
                        <p className="text-xs text-amber-200">Add a Buy URL so shoppers can check out offsite.</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="sf-btn-ghost min-h-9 px-3 text-sm"
                          onClick={() => setEditingId(product.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-sm text-rose-200"
                          onClick={() => void deleteProduct(product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <SavedMediaStrip
                    media={media}
                    busy={mediaBusyId === product.id}
                    onAddFiles={(files) => void addMediaToProduct(product.id, files)}
                    onRemove={(mediaId) => void removeMedia(product.id, mediaId)}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <form onSubmit={createProduct} className="space-y-3 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-sf-strong">Add a product</h3>
        <ProductInputs values={draft} onChange={setDraft} />
        <MediaDropZone
          files={pendingFiles}
          remaining={createRemaining}
          disabled={saving}
          onAdd={(next) => setPendingFiles((current) => [...current, ...next])}
          onRemove={(id) => {
            setPendingFiles((current) => {
              const target = current.find((item) => item.id === id)
              if (target) URL.revokeObjectURL(target.previewUrl)
              return current.filter((item) => item.id !== id)
            })
          }}
        />
        <button type="submit" disabled={saving} className="sf-btn-primary min-h-11 px-4">
          {saving ? 'Adding…' : 'Add product'}
        </button>
      </form>
    </section>
  )
}

function ProductInputs({
  values,
  onChange,
}: {
  values: OrgShopProductInput
  onChange: (next: OrgShopProductInput) => void
}) {
  function setField<K extends keyof OrgShopProductInput>(key: K, value: OrgShopProductInput[K]) {
    onChange({ ...values, [key]: value })
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm text-sf-body sm:col-span-2">
        Title
        <input className={fieldClass} value={values.title} onChange={(e) => setField('title', e.target.value)} required />
      </label>
      <label className="block text-sm text-sf-body sm:col-span-2">
        Short description
        <textarea
          className={fieldClass}
          rows={2}
          value={values.description || ''}
          onChange={(e) => setField('description', e.target.value)}
        />
      </label>
      <label className="block text-sm text-sf-body">
        Price label
        <input
          className={fieldClass}
          value={values.priceLabel || ''}
          onChange={(e) => setField('priceLabel', e.target.value)}
          placeholder="$45"
        />
      </label>
      <label className="block text-sm text-sf-body">
        Category
        <input
          className={fieldClass}
          value={values.category || ''}
          onChange={(e) => setField('category', e.target.value)}
          placeholder="Collar"
        />
      </label>
      <label className="block text-sm text-sf-body sm:col-span-2">
        Buy URL (offsite checkout)
        <input
          className={fieldClass}
          value={values.externalUrl || ''}
          onChange={(e) => setField('externalUrl', e.target.value)}
          placeholder="https://yourshop.example/item"
        />
      </label>
      <label className="block text-sm text-sf-body">
        Visibility
        <select
          className={fieldClass}
          value={values.status || 'published'}
          onChange={(e) => setField('status', e.target.value as OrgShopProductInput['status'])}
        >
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
      </label>
    </div>
  )
}

function ProductFields({
  initial,
  onSave,
  onCancel,
}: {
  initial: OrgShopProductInput
  onSave: (input: OrgShopProductInput) => Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
          await onSave(values)
        } finally {
          setSaving(false)
        }
      }}
    >
      <ProductInputs values={values} onChange={setValues} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="sf-btn-primary min-h-9 px-3 text-sm">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="sf-btn-ghost min-h-9 px-3 text-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
