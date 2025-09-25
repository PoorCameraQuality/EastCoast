-- Fix escaped newlines in article content
-- This converts literal "\n", "\r\n", "\r" sequences to real newlines

-- Backup first (safety measure)
CREATE TABLE IF NOT EXISTS articles_backup_unescape AS 
SELECT * FROM articles;

-- Show what we're about to change
SELECT 
  id,
  title,
  slug,
  CASE 
    WHEN content LIKE '%\\n%' THEN 'Has \\n'
    WHEN content LIKE '%\\r%' THEN 'Has \\r'
    ELSE 'Clean'
  END as content_status,
  LENGTH(content) as content_length
FROM articles 
WHERE content LIKE '%\\n%' OR content LIKE '%\\r%'
ORDER BY content_length DESC;

-- Convert literal backslash-escaped newlines to real newlines
BEGIN;

UPDATE articles
SET content = regexp_replace(content, E'\\\\r\\\\n|\\\\n|\\\\r', E'\n', 'g')
WHERE content LIKE '%\\n%' OR content LIKE '%\\r%';

-- Show the results
SELECT 
  id,
  title,
  slug,
  'Fixed' as status,
  LENGTH(content) as new_content_length
FROM articles 
WHERE id IN (
  SELECT id FROM articles_backup_unescape 
  WHERE content LIKE '%\\n%' OR content LIKE '%\\r%'
);

COMMIT;

-- Verification query
SELECT 
  COUNT(*) as total_articles,
  COUNT(CASE WHEN content LIKE '%\\n%' THEN 1 END) as still_has_escaped_n,
  COUNT(CASE WHEN content LIKE '%\\r%' THEN 1 END) as still_has_escaped_r
FROM articles;
