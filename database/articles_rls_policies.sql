-- ============================================================
-- articles table — Row Level Security (run in Supabase SQL Editor)
-- ============================================================
-- Verifies/implements: anonymous (anon key, no session) can SELECT
-- only published rows — required for Next.js server components and sitemap.
-- Authenticated users with profiles.role IN ('admin','moderator') get full access
-- for the admin dashboard (client uses user JWT).
--
-- Before running: list existing policies with:
--   SELECT * FROM pg_policies WHERE tablename = 'articles';
-- Drop conflicting policies if your project already defined custom rules.
-- ============================================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "articles_anon_select_published" ON articles;
CREATE POLICY "articles_anon_select_published"
  ON articles
  FOR SELECT
  TO anon
  USING (status = 'published');

DROP POLICY IF EXISTS "articles_authenticated_staff_all" ON articles;
CREATE POLICY "articles_authenticated_staff_all"
  ON articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'moderator')
    )
  );

COMMENT ON POLICY "articles_anon_select_published" ON articles IS
  'Public SSR, sitemap, and unauthenticated reads: published articles only.';
COMMENT ON POLICY "articles_authenticated_staff_all" ON articles IS
  'Admin/moderator dashboard: full CRUD on articles.';
