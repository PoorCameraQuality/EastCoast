-- =====================================================
-- COMPREHENSIVE ARTICLE DATA EXTRACTION QUERIES
-- =====================================================

-- 1. BASIC ARTICLE INFORMATION
-- Get all articles with essential fields
SELECT 
    id,
    title,
    slug,
    excerpt,
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
ORDER BY publish_date DESC;

-- 2. DETAILED ARTICLE ANALYSIS
-- Get articles with content analysis and formatting info
SELECT 
    id,
    title,
    slug,
    excerpt,
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
        WHEN content LIKE '%<table%' THEN 'HAS_HTML_TABLES'
        ELSE 'NO_HTML_TAGS'
    END as content_format,
    CASE 
        WHEN content LIKE '%## %' THEN 'HAS_MARKDOWN_HEADINGS'
        WHEN content LIKE '%**%' THEN 'HAS_MARKDOWN_BOLD'
        WHEN content LIKE '%*%' THEN 'HAS_MARKDOWN_ITALIC'
        WHEN content LIKE '%- %' THEN 'HAS_MARKDOWN_LISTS'
        WHEN content LIKE '%[%' THEN 'HAS_MARKDOWN_LINKS'
        WHEN content LIKE '%|%' THEN 'HAS_MARKDOWN_TABLES'
        ELSE 'NO_MARKDOWN_SYNTAX'
    END as markdown_format,
    author_name,
    category,
    status,
    publish_date
FROM articles 
ORDER BY publish_date DESC;

-- 3. CONTENT WITH TABLES ANALYSIS
-- Find articles that contain tables (both HTML and Markdown)
SELECT 
    id,
    title,
    slug,
    author_name,
    category,
    publish_date,
    CASE 
        WHEN content LIKE '%<table%' THEN 'HTML_TABLE'
        WHEN content LIKE '%|%' THEN 'MARKDOWN_TABLE'
        ELSE 'NO_TABLE'
    END as table_type,
    LENGTH(content) as content_length
FROM articles 
WHERE content LIKE '%<table%' OR content LIKE '%|%'
ORDER BY publish_date DESC;

-- 4. PUBLISHED ARTICLES ONLY
-- Get only published articles for public display
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
    read_time,
    featured,
    seo_title,
    meta_description,
    focus_keywords
FROM articles 
WHERE status = 'published'
ORDER BY publish_date DESC;

-- 5. ARTICLES BY CATEGORY
-- Group articles by category with counts
SELECT 
    category,
    COUNT(*) as article_count,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_count,
    MIN(publish_date) as earliest_article,
    MAX(publish_date) as latest_article
FROM articles 
WHERE status = 'published'
GROUP BY category
ORDER BY article_count DESC;

-- 6. AUTHOR STATISTICS
-- Get author information and their article counts
SELECT 
    author_name,
    author_credentials,
    COUNT(*) as total_articles,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_articles,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_articles,
    MIN(publish_date) as first_article,
    MAX(publish_date) as latest_article
FROM articles 
GROUP BY author_name, author_credentials
ORDER BY total_articles DESC;

-- 7. CONTENT FORMAT ANALYSIS
-- Analyze what type of content formatting is used
SELECT 
    'HTML Content' as format_type,
    COUNT(*) as count
FROM articles 
WHERE content LIKE '%<p>%' OR content LIKE '%<h1>%' OR content LIKE '%<div>%'

UNION ALL

SELECT 
    'Markdown Content' as format_type,
    COUNT(*) as count
FROM articles 
WHERE content LIKE '%## %' OR content LIKE '%**%' OR content LIKE '%*%'

UNION ALL

SELECT 
    'Plain Text' as format_type,
    COUNT(*) as count
FROM articles 
WHERE content NOT LIKE '%<p>%' 
  AND content NOT LIKE '%<h1>%' 
  AND content NOT LIKE '%## %' 
  AND content NOT LIKE '%**%';

-- 8. RECENT ARTICLES (LAST 30 DAYS)
-- Get articles published in the last 30 days
SELECT 
    id,
    title,
    slug,
    excerpt,
    author_name,
    category,
    publish_date,
    featured
FROM articles 
WHERE status = 'published' 
  AND publish_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY publish_date DESC;

-- 9. ARTICLES WITH TABLES (DETAILED)
-- Get detailed information about articles containing tables
SELECT 
    id,
    title,
    slug,
    author_name,
    category,
    publish_date,
    CASE 
        WHEN content LIKE '%<table%' THEN 'HTML_TABLE'
        WHEN content LIKE '%|%' THEN 'MARKDOWN_TABLE'
        ELSE 'NO_TABLE'
    END as table_type,
    LENGTH(content) as content_length,
    -- Extract first 500 characters of content for preview
    LEFT(content, 500) as content_preview
FROM articles 
WHERE content LIKE '%<table%' OR content LIKE '%|%'
ORDER BY publish_date DESC;

-- 10. COMPLETE ARTICLE EXPORT
-- Get all article data for backup/export purposes
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
ORDER BY publish_date DESC;
