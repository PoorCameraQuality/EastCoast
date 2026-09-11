-- Editable public storefront surfaces for org shops.
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS appearance_event_slugs text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS commission_info text;

COMMENT ON COLUMN public.vendors.appearance_event_slugs IS
  'Published event slugs this vendor lists as upcoming vending appearances (in addition to org-owned events).';
COMMENT ON COLUMN public.vendors.commission_info IS
  'Optional public copy for the Custom commissions section.';
