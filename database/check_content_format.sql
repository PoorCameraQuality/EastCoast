-- Check the actual format of the article content
-- Run this in your Supabase SQL Editor

-- 1. Check if content is HTML or markdown
SELECT 
    id,
    title,
    slug,
    LENGTH(content) as content_length,
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
    LEFT(content, 200) as content_sample
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';

-- 2. Check for markdown syntax
SELECT 
    id,
    title,
    slug,
    CASE 
        WHEN content LIKE '%## %' THEN 'HAS_MARKDOWN_HEADINGS'
        WHEN content LIKE '%**%' THEN 'HAS_MARKDOWN_BOLD'
        WHEN content LIKE '%*%' THEN 'HAS_MARKDOWN_ITALIC'
        WHEN content LIKE '%- %' THEN 'HAS_MARKDOWN_LISTS'
        WHEN content LIKE '%[%' THEN 'HAS_MARKDOWN_LINKS'
        ELSE 'NO_MARKDOWN_SYNTAX'
    END as markdown_format,
    LEFT(content, 200) as content_sample
FROM articles 
WHERE slug = 'understanding-drop-kink-sub-top-event';
