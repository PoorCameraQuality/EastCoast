-- kink.social public ingest — shared attribution columns on discovery tables
-- Pass 2: proposed only. Do NOT apply to production without operator sign-off.
-- Prerequisite: database/c2k_ingest_external_ids.sql

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS kink_social_canonical_url text,
  ADD COLUMN IF NOT EXISTS source_attribution text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS kink_social_canonical_url text,
  ADD COLUMN IF NOT EXISTS source_attribution text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

ALTER TABLE public.dungeon_venues
  ADD COLUMN IF NOT EXISTS kink_social_canonical_url text,
  ADD COLUMN IF NOT EXISTS source_attribution text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

COMMENT ON COLUMN public.events.kink_social_canonical_url IS
  'Public kink.social deep link for CTA; not ECKE canonical.';
COMMENT ON COLUMN public.events.source_attribution IS
  'e.g. kink.social member — user-created listing synced for public SEO.';
COMMENT ON COLUMN public.events.last_synced_at IS
  'Last successful ingest from kink.social.';

-- Default attribution for new C2K rows (application sets on upsert)
UPDATE public.events
SET source_attribution = 'kink.social member'
WHERE c2k_source_id IS NOT NULL AND source_attribution IS NULL;

CREATE INDEX IF NOT EXISTS events_c2k_last_synced_idx
  ON public.events (last_synced_at DESC NULLS LAST)
  WHERE c2k_source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS vendors_c2k_last_synced_idx
  ON public.vendors (last_synced_at DESC NULLS LAST)
  WHERE c2k_source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS dungeon_venues_c2k_last_synced_idx
  ON public.dungeon_venues (last_synced_at DESC NULLS LAST)
  WHERE c2k_source_id IS NOT NULL;

-- Rollback (manual):
-- DROP INDEX IF EXISTS dungeon_venues_c2k_last_synced_idx;
-- DROP INDEX IF EXISTS vendors_c2k_last_synced_idx;
-- DROP INDEX IF EXISTS events_c2k_last_synced_idx;
-- ALTER TABLE public.dungeon_venues DROP COLUMN IF EXISTS last_synced_at, DROP COLUMN IF EXISTS source_attribution, DROP COLUMN IF EXISTS kink_social_canonical_url;
-- ALTER TABLE public.vendors DROP COLUMN IF EXISTS last_synced_at, DROP COLUMN IF EXISTS source_attribution, DROP COLUMN IF EXISTS kink_social_canonical_url;
-- ALTER TABLE public.events DROP COLUMN IF EXISTS last_synced_at, DROP COLUMN IF EXISTS source_attribution, DROP COLUMN IF EXISTS kink_social_canonical_url;
