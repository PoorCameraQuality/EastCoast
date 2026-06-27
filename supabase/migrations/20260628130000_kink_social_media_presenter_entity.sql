-- Allow presenter listing rows in kink_social_media_assets (additive enum extension).

ALTER TABLE public.kink_social_media_assets
  DROP CONSTRAINT IF EXISTS kink_social_media_assets_entity_type_check;

ALTER TABLE public.kink_social_media_assets
  ADD CONSTRAINT kink_social_media_assets_entity_type_check
  CHECK (entity_type IN (
    'education_article', 'convention', 'event', 'dungeon', 'vendor', 'group', 'organization', 'place', 'presenter'
  ));
