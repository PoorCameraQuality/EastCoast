# Promotional News Database Setup

This directory contains SQL files for setting up and managing the promotional news feature.

## Initial Setup

1. **Create the table** (run once):
   ```sql
   -- Run the contents of create_promotional_news_table.sql
   ```

2. **Insert sample data** (optional, for testing):
   ```sql
   -- Run the contents of insert_promotional_news_sample.sql
   ```

## Files

- `create_promotional_news_table.sql` - Creates the table, indexes, triggers, and RLS policies
- `insert_promotional_news_sample.sql` - Example inserts demonstrating different use cases

## Helper Scripts

For easier content management, use the helper scripts in the `scripts/` directory:

- `node scripts/create-promo-news.js` - Interactive CLI tool
- `node scripts/create-promo-from-url.js <url> <type>` - Extract from webpage

See `docs/promotional-news-guide.md` for complete documentation.

