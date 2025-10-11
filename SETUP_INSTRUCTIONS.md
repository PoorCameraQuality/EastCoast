# Promotional News Feature - Setup Instructions

## ✅ Implementation Complete!

The promotional news system has been successfully implemented and tested. Follow these steps to get it running.

---

## 📋 Step 1: Set Up Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of:
-- database/create_promotional_news_table.sql
```

This creates:
- ✅ `promotional_news` table with all required columns
- ✅ Indexes for efficient querying
- ✅ Auto-update trigger for `updated_at`
- ✅ Row Level Security (RLS) policies
- ✅ Helpful column comments

**Verify it worked:**
```sql
SELECT * FROM promotional_news LIMIT 1;
-- Should return empty result set (no errors)
```

---

## 📋 Step 2: Add Your First Promotional Item

### Option A: Use the Interactive Script (Recommended)

```bash
node scripts/create-promo-news.js
```

Then follow the prompts:
1. Enter title: `Primal Arts Vendor Applications Open`
2. Paste your description (the content you provided earlier)
3. Type `END` when done
4. Provide link URL: `https://primalartsfest.com/vendor-application`
5. Link button text: `Apply Now`
6. Start date: `2025-10-11`
7. End date: `2026-05-01`
8. Priority: `8` (high priority)
9. Choose option 1 to execute immediately

### Option B: Use the Sample SQL

```sql
-- Copy and paste from:
-- database/insert_promotional_news_sample.sql

-- This includes the Primal Arts example you provided!
```

### Option C: Extract from Webpage

```bash
node scripts/create-promo-from-url.js https://primalartsfest.com/vendor "vendor application"
```

---

## 📋 Step 3: Verify It's Working

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:** `http://localhost:3000`

3. **Check for the promotional banner:**
   - **Desktop:** Look for a sidebar on the right with gradient banners
   - **Mobile:** Look for banners below the header

4. **Test functionality:**
   - ✅ Banner displays with your content
   - ✅ "Apply Now" button links to correct URL
   - ✅ Dismiss button (X) hides the banner
   - ✅ Refresh page - dismissed banner stays hidden
   - ✅ Responsive design works on different screen sizes

---

## 🎨 What It Looks Like

### Desktop (Large Screens)
```
┌─────────────────────────────────┐
│  🔔 Primal Arts Vendor App Open │
│                                  │
│  We're looking for artisans...   │
│                                  │
│  [Apply Now →]                   │
└─────────────────────────────────┘
  ↑ Fixed sidebar on the right
```

### Mobile (Small Screens)
```
═══════════════════════════════════
🔔 Primal Arts Vendor App Open

We're looking for artisans...

[Apply Now →]                    [X]
═══════════════════════════════════
↑ Banner below header, full width
```

---

## 📝 Adding More Promotional Items

### Quick Add (Interactive)
```bash
node scripts/create-promo-news.js
```

### From Webpage
```bash
node scripts/create-promo-from-url.js <url> <type>
```

### Manual SQL
```sql
INSERT INTO promotional_news (
  title,
  description,
  link_url,
  link_text,
  start_date,
  end_date,
  priority
) VALUES (
  'Your Title Here',
  'Your description here...',
  'https://example.com',
  'Learn More',
  '2025-10-11 00:00:00-04',
  '2025-12-31 23:59:59-04',
  5
);
```

---

## 🎯 Priority Guidelines

| Priority | When to Use | Example |
|----------|-------------|---------|
| **10** | Critical deadlines | "Applications close in 24 hours!" |
| **8-9** | Important announcements | "Vendor applications open" |
| **5-7** | General promotions | "Early bird pricing available" |
| **1-4** | Low priority updates | "50 new events added" |

**Note:** Only the top 3 items (by priority) are shown at once.

---

## ⚙️ Configuration

### Display Limits
- Maximum 3 items shown simultaneously
- Automatically shows highest priority items first
- Users can dismiss items individually

### Date-Based Auto-Expiration
- Items automatically appear on `start_date`
- Items automatically disappear after `end_date`
- No manual intervention needed

### User Dismissal
- Tracked in browser sessionStorage
- Per-item dismissal during current session
- Reappears on next visit (when user reopens browser)

---

## 🔧 Troubleshooting

### "Item not showing up"

1. **Check dates:**
   ```sql
   SELECT title, start_date, end_date 
   FROM promotional_news 
   WHERE id = 'your-item-id';
   ```
   Ensure current date is between start and end dates.

2. **Check priority:**
   Only top 3 items show. Higher numbers = higher priority.

3. **Clear dismissal:**
   ```javascript
   // In browser console:
   sessionStorage.removeItem('dismissed-promos')
   // Or simply close and reopen browser
   ```

### "Build warnings about Supabase"

These are expected during build time and can be ignored:
```
Missing Supabase environment variables
```

The component gracefully handles missing credentials during static generation.

### "Images not loading"

External images require configuration in `next.config.js`:
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'yourdomain.com' }
  ]
}
```

Or use `unoptimized: true` (already configured).

---

## 📊 Viewing Active Promotions

### SQL Query
```sql
SELECT 
  id,
  title,
  priority,
  start_date,
  end_date,
  link_url
FROM promotional_news
WHERE start_date <= NOW() 
  AND end_date >= NOW()
ORDER BY priority DESC, created_at DESC
LIMIT 3;
```

### Update an Item
```sql
UPDATE promotional_news
SET 
  title = 'Updated Title',
  end_date = '2026-01-01 23:59:59-04'
WHERE id = 'uuid-here';
```

### Delete an Item
```sql
DELETE FROM promotional_news
WHERE id = 'uuid-here';
```

### Hide Without Deleting
```sql
UPDATE promotional_news
SET end_date = NOW()
WHERE id = 'uuid-here';
```

---

## 📚 Documentation Reference

- **User Guide:** `docs/promotional-news-guide.md`
- **Database Schema:** `database/create_promotional_news_table.sql`
- **Sample Data:** `database/insert_promotional_news_sample.sql`
- **Implementation Summary:** `PROMOTIONAL_NEWS_IMPLEMENTATION.md`

---

## 🎉 You're All Set!

The promotional news feature is ready to use. To add your first item:

```bash
node scripts/create-promo-news.js
```

**Questions?** Check the detailed guide at `docs/promotional-news-guide.md`

---

## 🚀 Next Steps

1. Run the database setup SQL
2. Add your Primal Arts vendor application promotion
3. Test on localhost
4. Deploy to production
5. Add more promotional items as needed

**Happy promoting! 🎊**

