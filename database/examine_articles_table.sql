-- Database Structure and Content Examination Script
-- Run this in your Supabase SQL Editor to examine the articles table

-- 1. Check if the articles table exists and get its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY ordinal_position;

-- 2. Get the total count of articles
SELECT COUNT(*) as total_articles FROM articles;

-- 3. Get count by status (if status column exists)
SELECT 
    status,
    COUNT(*) as count
FROM articles 
GROUP BY status;

-- 4. Get count by category (if category column exists)
SELECT 
    category,
    COUNT(*) as count
FROM articles 
GROUP BY category;

-- 5. Show all available columns and sample data
SELECT * FROM articles LIMIT 3;

-- 6. Check for any articles with missing or incomplete content
SELECT 
    id,
    title,
    slug,
    CASE 
        WHEN content IS NULL OR content = '' THEN 'MISSING_CONTENT'
        WHEN excerpt IS NULL OR excerpt = '' THEN 'MISSING_EXCERPT'
        WHEN author_name IS NULL OR author_name = '' THEN 'MISSING_AUTHOR'
        ELSE 'COMPLETE'
    END as content_status,
    LENGTH(content) as content_length,
    LENGTH(excerpt) as excerpt_length
FROM articles 
WHERE status = 'published'
ORDER BY content_status, title;

-- 7. Get detailed structure of one complete article (if any exist)
SELECT 
    id,
    title,
    slug,
    excerpt,
    LEFT(content, 200) as content_preview,
    author_name,
    author_credentials,
    author_bio,
    category,
    tags,
    featured,
    status,
    read_time,
    seo_title,
    meta_description,
    focus_keywords
FROM articles 
WHERE status = 'published' 
AND content IS NOT NULL 
AND content != ''
LIMIT 1;

-- 8. Check for any foreign key relationships or constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'articles';

-- 9. Get table indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'articles';

-- 10. Check for any RLS (Row Level Security) policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'articles';