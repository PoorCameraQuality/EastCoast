-- High-resolution logo for printed badges (storage path in dancecard-maps bucket).
ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS badge_logo_path text;

COMMENT ON COLUMN dancecard_events.badge_logo_path IS 'Supabase storage path for print-quality badge logo; signed URL served to badge printer.';
