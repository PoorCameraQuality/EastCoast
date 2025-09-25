-- Debug the specific article content to see what's happening
-- Run this in your Supabase SQL Editor

-- 1. Get the full content length and check for truncation
SELECT 
    id,
    title,
    slug,
    LENGTH(content) as total_length,
    LENGTH(LEFT(content, 10000)) as first_10k_length,
    LENGTH(RIGHT(content, 10000)) as last_10k_length,
    CASE 
        WHEN LENGTH(content) > 10000 THEN 'LONG_CONTENT'
        WHEN LENGTH(content) > 5000 THEN 'MEDIUM_CONTENT'
        ELSE 'SHORT_CONTENT'
    END as content_size
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';

-- 2. Check for any special characters or formatting that might cause issues
SELECT 
    id,
    title,
    slug,
    content LIKE '%<script%' as has_scripts,
    content LIKE '%<iframe%' as has_iframes,
    content LIKE '%<object%' as has_objects,
    content LIKE '%<embed%' as has_embeds,
    content LIKE '%javascript%' as has_javascript,
    content LIKE '%onclick%' as has_onclick
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';

-- 3. Get the content in chunks to see where it might be getting cut off
SELECT 
    id,
    title,
    slug,
    'First 2000 chars' as chunk,
    LEFT(content, 2000) as content_chunk
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event'

UNION ALL

SELECT 
    id,
    title,
    slug,
    'Middle 2000 chars' as chunk,
    SUBSTRING(content, 2000, 2000) as content_chunk
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event'

UNION ALL

SELECT 
    id,
    title,
    slug,
    'Last 2000 chars' as chunk,
    RIGHT(content, 2000) as content_chunk
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';

-- 4. Check if there are any HTML tags that might be causing issues
SELECT 
    id,
    title,
    slug,
    REGEXP_COUNT(content, '<[^>]+>') as html_tag_count,
    REGEXP_COUNT(content, '<p>') as paragraph_count,
    REGEXP_COUNT(content, '<h[1-6]>') as heading_count,
    REGEXP_COUNT(content, '<br') as break_count
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';
