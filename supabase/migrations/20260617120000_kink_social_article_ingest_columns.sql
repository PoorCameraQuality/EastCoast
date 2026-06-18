-- kink.social education article ingest — additive columns on public.articles
-- Pass 1: proposed only. Do NOT apply to production without operator sign-off.
-- Prerequisite: database/c2k_ingest_external_ids.sql (c2k_source_type, c2k_source_id)

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS content_warnings text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS author_username text,
  ADD COLUMN IF NOT EXISTS author_profile_url text,
  ADD COLUMN IF NOT EXISTS presenter_profile_url text,
  ADD COLUMN IF NOT EXISTS kink_social_canonical_url text,
  ADD COLUMN IF NOT EXISTS source_attribution text NOT NULL DEFAULT 'kink.social member',
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

COMMENT ON COLUMN public.articles.content_warnings IS
  'User-provided content warnings from kink.social; required for C2K-sourced education articles.';
COMMENT ON COLUMN public.articles.kink_social_canonical_url IS
  'Public kink.social article URL for optional attribution link-out; not used as ECKE canonical.';
COMMENT ON COLUMN public.articles.source_attribution IS
  'Display hint: user-created content synced from kink.social; never implies ECKE authorship.';
COMMENT ON COLUMN public.articles.last_synced_at IS
  'Last successful ingest from kink.social (API or bridge).';

-- Fast lookup for ingest upsert (partial index matches c2k_ingest_external_ids pattern)
CREATE UNIQUE INDEX IF NOT EXISTS articles_c2k_education_source_uq
  ON public.articles (c2k_source_type, c2k_source_id)
  WHERE c2k_source_type = 'education_article' AND c2k_source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS articles_last_synced_at_idx
  ON public.articles (last_synced_at DESC NULLS LAST)
  WHERE c2k_source_type = 'education_article';

-- Rollback (manual):
-- DROP INDEX IF EXISTS articles_last_synced_at_idx;
-- DROP INDEX IF EXISTS articles_c2k_education_source_uq;
-- ALTER TABLE public.articles
--   DROP COLUMN IF EXISTS last_synced_at,
--   DROP COLUMN IF EXISTS source_attribution,
--   DROP COLUMN IF EXISTS kink_social_canonical_url,
--   DROP COLUMN IF EXISTS presenter_profile_url,
--   DROP COLUMN IF EXISTS author_profile_url,
--   DROP COLUMN IF EXISTS author_username,
--   DROP COLUMN IF EXISTS difficulty,
--   DROP COLUMN IF EXISTS content_warnings;
