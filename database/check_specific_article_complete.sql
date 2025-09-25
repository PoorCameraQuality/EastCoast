-- Complete data extraction for specific article
-- Run this in your Supabase SQL Editor to get all data for cross-checking

-- 1. Get the complete article record
SELECT 
    id,
    title,
    slug,
    excerpt,
    content,
    author_name,
    author_credentials,
    author_bio,
    category,
    tags,
    publish_date,
    last_updated,
    status,
    read_time,
    featured,
    seo_title,
    meta_description,
    focus_keywords
FROM articles 
WHERE slug = 'sex-positive-kink-inclusive-websites-resources';

-- 2. Get content length and format analysis
SELECT 
    id,
    title,
    slug,
    LENGTH(content) as content_length,
    LENGTH(excerpt) as excerpt_length,
    CASE 
        WHEN content LIKE '%<p>%' THEN 'HAS_HTML_PARAGRAPHS'
        WHEN content LIKE '%<h1>%' OR content LIKE '%<h2>%' THEN 'HAS_HTML_HEADINGS'
        WHEN content LIKE '%<br%' THEN 'HAS_HTML_BREAKS'
        WHEN content LIKE '%<strong>%' OR content LIKE '%<b>%' THEN 'HAS_HTML_BOLD'
        WHEN content LIKE '%<em>%' OR content LIKE '%<i>%' THEN 'HAS_HTML_ITALIC'
        WHEN content LIKE '%<ul>%' OR content LIKE '%<ol>%' THEN 'HAS_HTML_LISTS'
        WHEN content LIKE '%<a %' THEN 'HAS_HTML_LINKS'
        ELSE 'NO_HTML_TAGS'
    END as content_format,
    CASE 
        WHEN content LIKE '%## %' THEN 'HAS_MARKDOWN_HEADINGS'
        WHEN content LIKE '%**%' THEN 'HAS_MARKDOWN_BOLD'
        WHEN content LIKE '%*%' THEN 'HAS_MARKDOWN_ITALIC'
        WHEN content LIKE '%- %' THEN 'HAS_MARKDOWN_LISTS'
        WHEN content LIKE '%[%' THEN 'HAS_MARKDOWN_LINKS'
        ELSE 'NO_MARKDOWN_SYNTAX'
    END as markdown_format
FROM articles 
WHERE slug = 'sex-positive-kink-inclusive-websites-resources';

-- 3. Get content in chunks to see the full structure
SELECT 
    id,
    title,
    slug,
    'First 1000 chars' as chunk_name,
    LEFT(content, 1000) as content_chunk
FROM articles 
WHERE slug = 'sex-positive-kink-inclusive-websites-resources'

UNION ALL

SELECT 
    id,
    title,
    slug,
    'Middle 1000 chars' as chunk_name,
    SUBSTRING(content, 1000, 1000) as content_chunk
FROM articles 
WHERE slug = 'sex-positive-kink-inclusive-websites-resources'

UNION ALL

SELECT 
    id,
    title,
    slug,
    'Last 1000 chars' as chunk_name,
    RIGHT(content, 1000) as content_chunk
FROM articles 
WHERE slug = 'sex-positive-kink-inclusive-websites-resources';

-- 4. Check for any special characters or potential issues
SELECT 
    id,
    title,
    slug,
    content LIKE '%<script%' as has_scripts,
    content LIKE '%<iframe%' as has_iframes,
    content LIKE '%<object%' as has_objects,
    content LIKE '%<embed%' as has_embeds,
    content LIKE '%javascript%' as has_javascript,
    content LIKE '%onclick%' as has_onclick,
    content LIKE '%<img%' as has_images,
    content LIKE '%<table%' as has_tables
FROM articles 
WHERE slug = 'sex-positive-kink-inclusive-websites-resources';

-- 5. Get the complete content as a single field (for copy-paste comparison)
SELECT 
    id,
    title,
    slug,
    content as full_content
FROM articles 
WHERE slug = 'sex-positive-kink-inclusive-websites-resources';
