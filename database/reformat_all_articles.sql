-- Reformat all articles using the same logic as the normalizer
-- This permanently fixes the content in the database

-- Backup first (safety measure)
CREATE TABLE IF NOT EXISTS articles_backup_reformat AS 
SELECT * FROM articles;

-- Show current state
SELECT 
  COUNT(*) as total_articles,
  COUNT(CASE WHEN content LIKE '%<br%' THEN 1 END) as has_br_tags,
  COUNT(CASE WHEN content LIKE '%&nbsp;%' THEN 1 END) as has_nbsp,
  COUNT(CASE WHEN content LIKE '%\\n%' THEN 1 END) as has_escaped_n,
  AVG(LENGTH(content)) as avg_content_length
FROM articles;

-- Apply comprehensive reformatting
BEGIN;

-- Step 1: Clean HTML entities and escaped content
UPDATE articles
SET content = regexp_replace(
  regexp_replace(
    regexp_replace(
      regexp_replace(content, E'\\\\r\\\\n|\\\\n|\\\\r', E'\n', 'g'),
      '<br\s*/?>', E'\n', 'gi'
    ),
    '&nbsp;', ' ', 'gi'
  ),
  E'\\u00A0', ' ', 'g'  -- Unicode NBSP
)
WHERE content LIKE '%\\n%' OR content LIKE '%\\r%' OR content LIKE '%<br%' OR content LIKE '%&nbsp;%';

-- Step 2: Replace em/en dashes with spaced hyphens
UPDATE articles
SET content = regexp_replace(content, E'[\\u2014\\u2013]', ' - ', 'g')
WHERE content ~ E'[\\u2014\\u2013]';

-- Step 3: Ensure blank lines before headings (basic version)
UPDATE articles
SET content = regexp_replace(content, E'([^\\n])\\s+(#{1,6}\\s)', E'\\1\\n\\n\\2', 'g')
WHERE content ~ E'([^\\n])\\s+(#{1,6}\\s)';

-- Step 4: Ensure blank lines before lists (basic version)
UPDATE articles
SET content = regexp_replace(content, E'([^\\n])\\s+(\\* |\\d+\\. |- )', E'\\1\\n\\n\\2', 'g')
WHERE content ~ E'([^\\n])\\s+(\\* |\\d+\\. |- )';

-- Step 5: Clean up excessive blank lines
UPDATE articles
SET content = regexp_replace(content, E'\\n{3,}', E'\\n\\n', 'g')
WHERE content ~ E'\\n{3,}';

-- Step 6: Trim trailing spaces from lines
UPDATE articles
SET content = regexp_replace(content, E'[ \\t]+$', '', 'gm')
WHERE content ~ E'[ \\t]+$';

-- Show results
SELECT 
  'Reformatting completed' as status,
  COUNT(*) as total_articles,
  COUNT(CASE WHEN content LIKE '%<br%' THEN 1 END) as still_has_br,
  COUNT(CASE WHEN content LIKE '%&nbsp;%' THEN 1 END) as still_has_nbsp,
  COUNT(CASE WHEN content LIKE '%\\n%' THEN 1 END) as still_has_escaped_n,
  AVG(LENGTH(content)) as new_avg_length
FROM articles;

COMMIT;

-- Final verification
SELECT 
  id,
  title,
  slug,
  LENGTH(content) as content_length,
  CASE 
    WHEN content LIKE '%## %' THEN 'Has headings'
    WHEN content LIKE '%| %' THEN 'Has tables'
    WHEN content LIKE '%* %' THEN 'Has lists'
    ELSE 'Plain text'
  END as content_type
FROM articles
ORDER BY content_length DESC
LIMIT 10;
