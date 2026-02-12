-- ============================================================
-- Get the exact structure of your Supabase "articles" table
-- ============================================================
-- Run this in Supabase: SQL Editor → New query → Paste → Run
-- Copy the result (the table with column_name, data_type, etc.)
-- and share it if you need a custom INSERT script.
-- ============================================================

SELECT
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'articles'
ORDER BY ordinal_position;
