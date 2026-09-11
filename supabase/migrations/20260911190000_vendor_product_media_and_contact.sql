-- Multi-media product gallery + flexible public contact for org shops
alter table public.vendor_products
  add column if not exists media jsonb not null default '[]'::jsonb;

alter table public.vendors
  add column if not exists public_contact_url text,
  add column if not exists public_contact_label text;
