-- Check the actual structure of the articles table
-- This will show you all available columns

-- Method 1: Get column information
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY ordinal_position;

-- Method 2: Simple query to see what columns exist
-- (This will fail if columns don't exist, helping identify missing ones)
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
LIMIT 1;

-- Method 3: Count total articles
SELECT COUNT(*) as total_articles FROM articles;

-- Method 4: Get sample data to see structure
SELECT * FROM articles LIMIT 1;
