-- Clean up article content: remove multiple spaces and em dashes
-- Run this in your Supabase SQL Editor to clean up article content

-- 1. Update content field - remove multiple spaces and em dashes
UPDATE articles 
SET content = REGEXP_REPLACE(
    REGEXP_REPLACE(
        REGEXP_REPLACE(content, '\s+', ' ', 'g'),  -- Replace multiple spaces with single space
        '—', '-', 'g'                              -- Replace em dashes with regular dashes
    ),
    '  ', ' ', 'g'                                 -- Replace any remaining double spaces
)
WHERE content IS NOT NULL;

-- 2. Update excerpt field - remove multiple spaces and em dashes
UPDATE articles 
SET excerpt = REGEXP_REPLACE(
    REGEXP_REPLACE(
        REGEXP_REPLACE(excerpt, '\s+', ' ', 'g'),  -- Replace multiple spaces with single space
        '—', '-', 'g'                              -- Replace em dashes with regular dashes
    ),
    '  ', ' ', 'g'                                 -- Replace any remaining double spaces
)
WHERE excerpt IS NOT NULL;

-- 3. Update title field - remove multiple spaces and em dashes
UPDATE articles 
SET title = REGEXP_REPLACE(
    REGEXP_REPLACE(
        REGEXP_REPLACE(title, '\s+', ' ', 'g'),    -- Replace multiple spaces with single space
        '—', '-', 'g'                              -- Replace em dashes with regular dashes
    ),
    '  ', ' ', 'g'                                 -- Replace any remaining double spaces
)
WHERE title IS NOT NULL;

-- 4. Update author_bio field - remove multiple spaces and em dashes
UPDATE articles 
SET author_bio = REGEXP_REPLACE(
    REGEXP_REPLACE(
        REGEXP_REPLACE(author_bio, '\s+', ' ', 'g'), -- Replace multiple spaces with single space
        '—', '-', 'g'                                -- Replace em dashes with regular dashes
    ),
    '  ', ' ', 'g'                                   -- Replace any remaining double spaces
)
WHERE author_bio IS NOT NULL;

-- 5. Update seo_title field - remove multiple spaces and em dashes
UPDATE articles 
SET seo_title = REGEXP_REPLACE(
    REGEXP_REPLACE(
        REGEXP_REPLACE(seo_title, '\s+', ' ', 'g'), -- Replace multiple spaces with single space
        '—', '-', 'g'                               -- Replace em dashes with regular dashes
    ),
    '  ', ' ', 'g'                                  -- Replace any remaining double spaces
)
WHERE seo_title IS NOT NULL;

-- 6. Update meta_description field - remove multiple spaces and em dashes
UPDATE articles 
SET meta_description = REGEXP_REPLACE(
    REGEXP_REPLACE(
        REGEXP_REPLACE(meta_description, '\s+', ' ', 'g'), -- Replace multiple spaces with single space
        '—', '-', 'g'                                      -- Replace em dashes with regular dashes
    ),
    '  ', ' ', 'g'                                         -- Replace any remaining double spaces
)
WHERE meta_description IS NOT NULL;

-- 7. Show summary of changes made
SELECT 
    'Content cleaned' as field,
    COUNT(*) as articles_updated
FROM articles 
WHERE content IS NOT NULL

UNION ALL

SELECT 
    'Excerpt cleaned' as field,
    COUNT(*) as articles_updated
FROM articles 
WHERE excerpt IS NOT NULL

UNION ALL

SELECT 
    'Title cleaned' as field,
    COUNT(*) as articles_updated
FROM articles 
WHERE title IS NOT NULL

UNION ALL

SELECT 
    'Author bio cleaned' as field,
    COUNT(*) as articles_updated
FROM articles 
WHERE author_bio IS NOT NULL

UNION ALL

SELECT 
    'SEO title cleaned' as field,
    COUNT(*) as articles_updated
FROM articles 
WHERE seo_title IS NOT NULL

UNION ALL

SELECT 
    'Meta description cleaned' as field,
    COUNT(*) as articles_updated
FROM articles 
WHERE meta_description IS NOT NULL;

-- 8. Show sample of cleaned content (first 3 articles)
SELECT 
    id,
    title,
    LEFT(content, 200) as content_preview,
    LEFT(excerpt, 100) as excerpt_preview
FROM articles 
ORDER BY publish_date DESC 
LIMIT 3;
