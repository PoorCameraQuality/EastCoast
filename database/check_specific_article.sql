-- Check specific article content for truncation issues
-- Run this in your Supabase SQL Editor to investigate the article

-- 1. Get the full article content for the "understanding-drop" article
SELECT 
    id,
    title,
    slug,
    LENGTH(content) as content_length,
    LENGTH(excerpt) as excerpt_length,
    LEFT(content, 500) as content_start,
    RIGHT(content, 500) as content_end
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';

-- 2. Check if content is being truncated in the database
SELECT 
    id,
    title,
    slug,
    CASE 
        WHEN LENGTH(content) < 1000 THEN 'SHORT_CONTENT'
        WHEN LENGTH(content) < 5000 THEN 'MEDIUM_CONTENT'
        WHEN LENGTH(content) < 10000 THEN 'LONG_CONTENT'
        ELSE 'VERY_LONG_CONTENT'
    END as content_size,
    LENGTH(content) as actual_length,
    status
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';

-- 3. Check for any HTML issues in the content
SELECT 
    id,
    title,
    slug,
    CASE 
        WHEN content LIKE '%</p>%' THEN 'HAS_HTML_TAGS'
        WHEN content LIKE '%<p>%' THEN 'HAS_OPENING_TAGS'
        WHEN content LIKE '%<br%' THEN 'HAS_BREAKS'
        ELSE 'NO_HTML_TAGS'
    END as html_status,
    LENGTH(content) as content_length
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';

-- 4. Get a sample of the middle content to check for truncation
SELECT 
    id,
    title,
    slug,
    SUBSTRING(content, 2000, 1000) as middle_content_sample
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';
