'use client'

import { useState } from 'react'
import type { ManagedShopProduct, OrgShopProductInput } from '@/lib/eckeOrgVendorShared'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

const emptyProduct = (): OrgShopProductInput => ({
  title: '',
  description: '',
  priceLabel: '',
  category: '',
  externalUrl: '',
  status: 'published',
})

export default function OrgShopProducts({ initial }: { initial: ManagedShopProduct[] }) {
  const [products, setProducts] = useState(initial)
  const [draft, setDraft] = useState<OrgShopProductInput>(emptyProduct())
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function reload() {
    const response = await fetch('/api/org/shop/products')
    const data = (await response.json()) as { products?: ManagedShopProduct[]; error?: string }
    if (!response.ok) throw new Error(data.error || 'Could not load products')
    setProducts(data.products || [])
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

  async function uploadPhoto(id: string, file: File) {
    setError(null)
    const form = new FormData()
    form.set('kind', 'product')
    form.set('productId', id)
    form.set('file', file)
    const response = await fetch('/api/org/shop/assets', { method: 'POST', body: form })
    const data = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(data.error || 'Could not upload photo')
      return
    }
    await reload()
  }

  return (
    <section className="space-y-6 rounded-xl border border-white/10 bg-sf-card/40 p-5">
      <div>
        <h2 className="text-lg font-semibold text-sf-strong">Products</h2>
        <p className="mt-1 text-sm text-sf-muted">
          Each Buy button goes to your offsite checkout URL. Stripe checkout is not in this first version.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-4">
        {products.map((product) => (
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
              <div className="flex flex-col gap-3 sm:flex-row">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-white/5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sf-strong">{product.title}</p>
                  <p className="text-sm text-sf-muted">
                    {product.price_label || 'No price label'} · {product.status}
                  </p>
                  {product.external_url ? (
                    <p className="truncate text-xs text-sf-muted">{product.external_url}</p>
                  ) : (
                    <p className="text-xs text-amber-200">Add a Buy URL so shoppers can check out offsite.</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className="sf-btn-ghost min-h-9 px-3 text-sm" onClick={() => setEditingId(product.id)}>
                      Edit
                    </button>
                    <label className="sf-btn-ghost min-h-9 cursor-pointer px-3 text-sm">
                      Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) void uploadPhoto(product.id, file)
                        }}
                      />
                    </label>
                    <button type="button" className="text-sm text-rose-200" onClick={() => void deleteProduct(product.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={createProduct} className="space-y-3 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-sf-strong">Add a product</h3>
        <ProductInputs values={draft} onChange={setDraft} />
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
        <textarea className={fieldClass} rows={2} value={values.description || ''} onChange={(e) => setField('description', e.target.value)} />
      </label>
      <label className="block text-sm text-sf-body">
        Price label
        <input className={fieldClass} value={values.priceLabel || ''} onChange={(e) => setField('priceLabel', e.target.value)} placeholder="$45" />
      </label>
      <label className="block text-sm text-sf-body">
        Category
        <input className={fieldClass} value={values.category || ''} onChange={(e) => setField('category', e.target.value)} placeholder="Collar" />
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
