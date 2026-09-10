-- Additive event media + application fields. Does not recreate public.events.

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS hero_image text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS program_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS map_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS staff_application_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS vendor_application_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS presenter_application_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photographer_application_url text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ecke-event-assets',
  'ecke-event-assets',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "ecke_event_assets_public_read" ON storage.objects;
CREATE POLICY "ecke_event_assets_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'ecke-event-assets');
