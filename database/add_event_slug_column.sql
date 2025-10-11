-- Migration: Add event_slug column to promotional_news table
-- This enables automatic event logo detection
-- Run this if you already created the promotional_news table

-- Add the event_slug column
ALTER TABLE promotional_news 
ADD COLUMN IF NOT EXISTS event_slug VARCHAR(200);

-- Add helpful comment
COMMENT ON COLUMN promotional_news.event_slug IS 'Optional event slug to auto-display event logo (e.g., "primal-arts", "dark-odyssey", "frolicon")';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'promotional_news' 
AND column_name = 'event_slug';

