-- One-time DB cleanup to convert literal \n/\r to real newlines
-- This makes future edits sane and improves the normalizer's effectiveness

-- Backup first (safety measure)
CREATE TABLE IF NOT EXISTS articles_backup_pretty AS 
SELECT * FROM articles;

-- Show what we're about to change
SELECT 
  'Before cleanup' as status,
  COUNT(*) as total_articles,
  COUNT(CASE WHEN content LIKE '%\\n%' THEN 1 END) as has_escaped_n,
  COUNT(CASE WHEN content LIKE '%\\r%' THEN 1 END) as has_escaped_r,
  AVG(LENGTH(content)) as avg_content_length
FROM articles;

-- Convert literal escaped newlines to real newlines
BEGIN;

UPDATE articles
SET content = regexp_replace(content, E'\\\\r\\\\n|\\\\n|\\\\r', E'\n', 'g')
WHERE content LIKE '%\\n%' OR content LIKE '%\\r%';

-- Show the results
SELECT 
  'After cleanup' as status,
  COUNT(*) as total_articles,
  COUNT(CASE WHEN content LIKE '%\\n%' THEN 1 END) as still_has_escaped_n,
  COUNT(CASE WHEN content LIKE '%\\r%' THEN 1 END) as still_has_escaped_r,
  AVG(LENGTH(content)) as new_avg_content_length
FROM articles;

COMMIT;

-- Final verification - show a sample of cleaned content
SELECT 
  id,
  title,
  slug,
  LENGTH(content) as content_length,
  LEFT(content, 200) as content_preview
FROM articles
WHERE id IN (
  SELECT id FROM articles_backup_pretty 
  WHERE content LIKE '%\\n%' OR content LIKE '%\\r%'
)
ORDER BY content_length DESC
LIMIT 5;
