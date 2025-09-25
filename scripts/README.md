# Article Normalization Scripts

These scripts will clean up all articles in your Supabase database by:

- Replacing em/en dashes with spaced hyphens (—/– → -)
- Ensuring proper spacing before tables, headings, and lists
- Adding missing table separator rows
- Collapsing excessive blank lines to single spacing
- Preserving code blocks and other formatting

## Prerequisites

1. Set up your environment variables:
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

2. Or create a `.env.local` file in your project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Usage Steps

### 1. Backup First (IMPORTANT!)
```bash
npx ts-node scripts/backup-articles.ts
```
This creates `backup.articles.json` with all your current article content.

### 2. Audit What Will Change
```bash
npx ts-node scripts/audit-articles.ts
```
This shows you which articles will be modified without making changes.

### 3. Apply Normalization
```bash
npx ts-node scripts/normalize-articles.ts
```
This applies the normalization to all articles in your database.

## What Gets Fixed

- **Em/En Dashes**: `—` and `–` become ` - `
- **Table Formatting**: Missing separators are added, proper spacing ensured
- **Headings & Lists**: Blank lines added before for better readability
- **Excessive Spacing**: Multiple blank lines collapsed to single spacing
- **Safe Processing**: Code blocks and other formatting preserved

## Safety Features

- Creates backup before making changes
- Processes in small batches to avoid rate limits
- Only updates articles that actually need changes
- Preserves all existing content structure

## Recovery

If something goes wrong, you can restore from the backup:
```bash
# The backup file contains all original content
# You can manually restore specific articles if needed
```
