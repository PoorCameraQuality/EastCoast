-- Check the specific article content to understand the issue
-- Run this in your Supabase SQL Editor

-- 1. Get the full article content
SELECT 
    id,
    title,
    slug,
    LENGTH(content) as content_length,
    LEFT(content, 1000) as content_start,
    RIGHT(content, 1000) as content_end
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';

-- 2. Check if the content is actually complete in the database
SELECT 
    id,
    title,
    slug,
    LENGTH(content) as total_length,
    CASE 
        WHEN LENGTH(content) > 10000 THEN 'VERY_LONG'
        WHEN LENGTH(content) > 5000 THEN 'LONG'
        WHEN LENGTH(content) > 2000 THEN 'MEDIUM'
        ELSE 'SHORT'
    END as content_size
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';
