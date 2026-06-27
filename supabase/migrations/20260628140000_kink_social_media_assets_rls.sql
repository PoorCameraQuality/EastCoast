-- RLS: public read for synced kink.social media rows; writes via service role only.

ALTER TABLE public.kink_social_media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kink_social_media_assets_public_read ON public.kink_social_media_assets;

CREATE POLICY kink_social_media_assets_public_read
  ON public.kink_social_media_assets
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON POLICY kink_social_media_assets_public_read ON public.kink_social_media_assets IS
  'Public ECKE pages may read synced photo URLs; ingest upserts use service role (bypasses RLS).';
