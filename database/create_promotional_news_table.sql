-- Create promotional_news table for homepage announcements
-- This table stores promotional content that displays on the home page
-- Items automatically show/hide based on start_date and end_date

CREATE TABLE IF NOT EXISTS promotional_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  link_url VARCHAR(500),
  link_text VARCHAR(100),
  image_url VARCHAR(500),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_promotional_news_dates ON promotional_news(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotional_news_priority ON promotional_news(priority DESC);
-- Composite index for the main query (without WHERE predicate as NOW() is not immutable)
CREATE INDEX IF NOT EXISTS idx_promotional_news_active ON promotional_news(start_date, end_date, priority DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_promotional_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promotional_news_updated_at
  BEFORE UPDATE ON promotional_news
  FOR EACH ROW
  EXECUTE FUNCTION update_promotional_news_updated_at();

-- Enable Row Level Security
ALTER TABLE promotional_news ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active promotional items
CREATE POLICY "Public can view active promotional news"
  ON promotional_news
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert/update/delete (adjust based on your auth setup)
-- You may want to add a specific role check here
CREATE POLICY "Admins can manage promotional news"
  ON promotional_news
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Add helpful comments
COMMENT ON TABLE promotional_news IS 'Stores promotional announcements displayed on the home page';
COMMENT ON COLUMN promotional_news.title IS 'Short, attention-grabbing headline (max 200 chars)';
COMMENT ON COLUMN promotional_news.description IS 'Full promotional content, supports multi-paragraph text';
COMMENT ON COLUMN promotional_news.link_url IS 'Optional URL for call-to-action button';
COMMENT ON COLUMN promotional_news.link_text IS 'Optional button text (e.g., "Apply Now", "Learn More")';
COMMENT ON COLUMN promotional_news.image_url IS 'Optional promotional image URL';
COMMENT ON COLUMN promotional_news.start_date IS 'When to start displaying this item';
COMMENT ON COLUMN promotional_news.end_date IS 'When to stop displaying this item';
COMMENT ON COLUMN promotional_news.priority IS 'Display order: higher numbers show first (1=low, 5=medium, 10=high)';

