-- Org-owned shops reuse public.vendors. Do not invent a second shops table.
-- C2K rows stay published-by-default (unpublish still DELETEs the C2K row).

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS checkout_mode text NOT NULL DEFAULT 'offsite',
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS short_description text;

ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_status_check;
ALTER TABLE public.vendors ADD CONSTRAINT vendors_status_check CHECK (status IN ('draft', 'published'));

ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_checkout_mode_check;
ALTER TABLE public.vendors ADD CONSTRAINT vendors_checkout_mode_check CHECK (checkout_mode IN ('offsite', 'stripe'));

CREATE UNIQUE INDEX IF NOT EXISTS vendors_one_shop_per_org
  ON public.vendors (organization_id)
  WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS vendors_organization_id_idx
  ON public.vendors (organization_id)
  WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS vendors_status_idx
  ON public.vendors (status);

UPDATE public.vendors
SET published_at = COALESCE(published_at, last_synced_at, created_at)
WHERE status = 'published' AND published_at IS NULL;

CREATE TABLE IF NOT EXISTS public.vendor_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  image_url text,
  price_label text,
  category text,
  checkout_mode text NOT NULL DEFAULT 'offsite',
  external_url text,
  status text NOT NULL DEFAULT 'published',
  public_safe boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vendor_products_status_check CHECK (status IN ('published', 'hidden')),
  CONSTRAINT vendor_products_checkout_mode_check CHECK (checkout_mode IN ('offsite', 'stripe'))
);

CREATE INDEX IF NOT EXISTS vendor_products_vendor_id_idx ON public.vendor_products (vendor_id, sort_order);
CREATE INDEX IF NOT EXISTS vendor_products_org_id_idx ON public.vendor_products (organization_id);

ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendor_products_anon_select ON public.vendor_products;
CREATE POLICY vendor_products_anon_select ON public.vendor_products
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND public_safe = true
    AND EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = vendor_id AND v.status = 'published'
    )
  );

DROP POLICY IF EXISTS vendors_anon_select ON public.vendors;
CREATE POLICY vendors_anon_select ON public.vendors
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

GRANT SELECT ON TABLE public.vendor_products TO anon, authenticated;
GRANT ALL ON TABLE public.vendor_products TO service_role;

COMMENT ON COLUMN public.vendors.organization_id IS 'ECKE org-owned shop. Null for C2K ingest and legacy rows.';
COMMENT ON COLUMN public.vendors.checkout_mode IS 'v1 uses offsite. stripe reserved for Connect later.';
COMMENT ON TABLE public.vendor_products IS 'Products for ECKE-owned shops. C2K shops keep listings jsonb snapshots.';
