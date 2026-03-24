-- Optional per-article Open Graph / Twitter image (absolute URL or site-relative path)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image TEXT;

COMMENT ON COLUMN articles.og_image IS
  'Optional image URL for social sharing; https URL or path starting with /';
