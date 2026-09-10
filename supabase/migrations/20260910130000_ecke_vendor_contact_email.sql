-- Public shop contact email for Contact vendor mailto.
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS contact_email text;

COMMENT ON COLUMN public.vendors.contact_email IS
  'Public shop contact. Contact vendor uses mailto. Separate from org login email.';
