-- ============================================================
-- Article INSERT for Supabase "articles" table
-- ============================================================
-- Structure matches the schema used by existing articles.
-- 1. Replace the placeholder values in VALUES (...).
-- 2. In content, escape single quotes by doubling: ' → ''
-- 3. Run in Supabase: SQL Editor → New query → Paste → Run
-- ============================================================

INSERT INTO articles (
    id,
    submission_id,
    slug,
    title,
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
) VALUES (
    gen_random_uuid(),
    NULL,
    'your-article-slug',
    'Your Article Title',
    'Short excerpt for listings and search.',
    '# Your content here

Use **Markdown** or HTML. Escape single quotes as two quotes: ''like this''.',
    'Author Name',
    'Credentials (optional)',
    'Author bio (optional).',
    'Safety',
    ARRAY['tag1', 'tag2'],
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'published',
    '8 min read',
    false,
    'Your Article Title | East Coast Kink Events',
    'Meta description for search.',
    ARRAY['keyword1', 'keyword2']
);
