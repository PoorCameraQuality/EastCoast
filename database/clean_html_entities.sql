-- Clean HTML entities and escaped content in articles
-- This handles <br>, &nbsp;, and other HTML remnants from imports

-- Backup first (safety measure)
CREATE TABLE IF NOT EXISTS articles_backup_html_cleanup AS 
SELECT * FROM articles;

-- Show what we're about to change
SELECT 
  id,
  title,
  slug,
  CASE 
    WHEN content LIKE '%<br%' THEN 'Has <br> tags'
    WHEN content LIKE '%&nbsp;%' THEN 'Has &nbsp;'
    WHEN content LIKE '%\\n%' THEN 'Has \\n'
    ELSE 'Clean'
  END as content_status,
  LENGTH(content) as content_length
FROM articles 
WHERE content LIKE '%<br%' OR content LIKE '%&nbsp;%' OR content LIKE '%\\n%'
ORDER BY content_length DESC;

-- Clean HTML entities and escaped content
BEGIN;

-- Convert <br> tags to newlines
UPDATE articles
SET content = regexp_replace(content, '<br\s*/?>', E'\n', 'gi')
WHERE content LIKE '%<br%';

-- Convert &nbsp; to regular spaces
UPDATE articles
SET content = regexp_replace(content, '&nbsp;', ' ', 'gi')
WHERE content LIKE '%&nbsp;%';

-- Convert any remaining literal \n, \r sequences
UPDATE articles
SET content = regexp_replace(content, E'\\\\r\\\\n|\\\\n|\\\\r', E'\n', 'g')
WHERE content LIKE '%\\n%' OR content LIKE '%\\r%';

-- Show the results
SELECT 
  COUNT(*) as total_articles,
  COUNT(CASE WHEN content LIKE '%<br%' THEN 1 END) as still_has_br,
  COUNT(CASE WHEN content LIKE '%&nbsp;%' THEN 1 END) as still_has_nbsp,
  COUNT(CASE WHEN content LIKE '%\\n%' THEN 1 END) as still_has_escaped_n
FROM articles;

COMMIT;

-- Final verification
SELECT 
  'Cleanup completed' as status,
  COUNT(*) as total_articles
FROM articles;
