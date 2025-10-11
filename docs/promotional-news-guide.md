# Promotional News System - User Guide

This guide explains how to add promotional announcements that automatically display on the home page.

## 🚀 Quick Start (Recommended Methods)

### Method 1: Interactive Content Entry

The easiest way to add promotional news is using the interactive CLI tool:

```bash
node scripts/create-promo-news.js
```

**Workflow:**
1. Run the command
2. Enter a catchy title (e.g., "Primal Arts Vendor Applications Open")
3. Paste your full promotional content (multiple paragraphs supported)
4. Type `END` on a new line when finished
5. Provide a link URL and button text (optional)
6. Enter start and end dates
7. Set priority (1-10, where 10 is highest)
8. Choose to execute immediately or save to file

**Example Session:**
```
📝 Title: Primal Arts Vendor Applications Open

📄 Description (paste content, type END when done):
We're looking for artisans, craftspeople, and those with thoughtfully 
curated collections—folks who bring handmade work, unique creations, 
or special finds or services to share with attendees.

At PAF26, the Vendor Market is more than a place to sell...
END

🔗 Link URL: https://primalartsfest.com/vendor-application
🔘 Link button text: Apply Now
📅 Start date: 2025-10-11
📅 End date: 2026-05-01
⭐ Priority: 8

✅ Successfully inserted to Supabase!
```

---

### Method 2: Extract from Webpage URL

If the promotional content exists on a webpage, extract it automatically:

```bash
node scripts/create-promo-from-url.js <url> <type>
```

**Example:**
```bash
node scripts/create-promo-from-url.js https://primalartsfest.com/vendor "vendor application"
```

**Workflow:**
1. Script fetches the webpage and extracts meta tags
2. Shows extracted title, description, and image
3. Prompts you to confirm or edit each field
4. Suggests appropriate button text based on type
5. You provide dates and priority
6. Choose to execute or save SQL

**Supported Types:**
- `"vendor application"` → Button: "Apply Now"
- `"registration"` → Button: "Register Now"
- `"ticket"` → Button: "Get Tickets"
- Any other → Button: "Learn More"

---

## 📋 Field Reference

### Required Fields

| Field | Description | Format | Example |
|-------|-------------|--------|---------|
| **title** | Short, attention-grabbing headline | Max 200 chars | "Primal Arts Vendor Applications Open" |
| **description** | Full promotional content | Multi-paragraph text | "We're looking for artisans..." |
| **start_date** | When to start showing | YYYY-MM-DD or ISO 8601 | "2025-10-11" |
| **end_date** | When to stop showing | YYYY-MM-DD or ISO 8601 | "2026-05-01" |
| **priority** | Display order | 1-10 (higher = more prominent) | 8 |

### Optional Fields

| Field | Description | Example |
|-------|-------------|---------|
| **link_url** | Call-to-action URL | "https://event.com/apply" |
| **link_text** | Button text | "Apply Now", "Learn More" |
| **image_url** | Promotional image | "https://event.com/banner.jpg" |

---

## 🎨 Priority Levels

Choose the right priority for your announcement:

| Priority | Level | Use Case | Icon |
|----------|-------|----------|------|
| **10** | Critical | Time-sensitive deadlines, major announcements | 🔔 Bell |
| **8-9** | High | Applications, early bird registrations | 🔔 Bell |
| **5-7** | Medium | General announcements, workshops | ⭐ Star |
| **1-4** | Low | Minor updates, informational | ℹ️ Info |

---

## 📅 Date Format Tips

**Accepted formats:**
- Simple: `2025-10-11`
- ISO 8601: `2025-10-11T00:00:00-04:00`
- Full timestamp: `2025-10-11 00:00:00-04`

**Best practices:**
- Start date: Set to current date or slightly in the past
- End date: Set to when the opportunity closes or expires
- System automatically hides items outside the date range
- Use timezone-aware timestamps if accuracy matters

---

## 🖼️ Image Guidelines

**Recommended specifications:**
- Format: JPG, PNG, or WebP
- Dimensions: 320x180 (16:9 ratio) or similar
- File size: Under 200KB for fast loading
- Mobile-friendly: Images display at 320px width on mobile

**Where images appear:**
- Desktop: Full width within the sidebar card
- Mobile: Full width within stacked banners
- Fallback: Cards look great without images

---

## 🔧 Manual SQL Method (Fallback)

If you prefer writing SQL directly or the scripts aren't available:

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
  'Your Catchy Title Here',
  'Your full promotional content here.
  
  Multiple paragraphs are supported.
  
  Keep it clear and compelling.',
  'https://example.com/link',
  'Apply Now',
  '2025-10-11 00:00:00-04',
  '2026-05-01 23:59:59-04',
  8
);
```

**Important:**
- Escape single quotes by doubling them: `it's` → `it''s`
- Use proper timezone notation or UTC
- Test with a short date range first

---

## 🎯 Example Workflows

### Example 1: Vendor Application Announcement

**You have:** A webpage at `https://primalartsfest.com/vendor`

**Command:**
```bash
node scripts/create-promo-from-url.js https://primalartsfest.com/vendor "vendor application"
```

**Result:**
- Title extracted from page
- Description from meta tags
- Button text: "Apply Now"
- You provide dates and priority
- Inserted automatically

---

### Example 2: Workshop Registration

**You have:** Workshop details you want to paste

**Command:**
```bash
node scripts/create-promo-news.js
```

**Input:**
```
Title: Rope Bondage Workshop - Registration Open
Description: Join Master Rigger Jane Doe for an intensive weekend...
Link: https://workshop.com/register
Button: Register Now
Start: 2025-10-15
End: 2025-11-30
Priority: 7
```

---

### Example 3: General Community Update

**You have:** Simple announcement, no link needed

**Command:**
```bash
node scripts/create-promo-news.js
```

**Input:**
```
Title: 50+ New Events Added This Week
Description: We've expanded our calendar with workshops, munches, 
and conferences across the East Coast. Check out the Events page 
to see what's new in your area!
Link: [press Enter to skip]
Start: 2025-10-11
End: 2025-10-18
Priority: 5
```

---

## 🔍 Viewing Active Promotions

To see what's currently visible on the site:

```sql
SELECT 
  id,
  title,
  LEFT(description, 50) as description_preview,
  link_url,
  priority,
  start_date,
  end_date
FROM promotional_news
WHERE start_date <= NOW() 
  AND end_date >= NOW()
ORDER BY priority DESC, created_at DESC
LIMIT 3;
```

Only the top 3 items (by priority) are shown at any time.

---

## ✏️ Editing or Removing Items

### Update an existing item:
```sql
UPDATE promotional_news
SET 
  title = 'Updated Title',
  end_date = '2025-12-31 23:59:59-04'
WHERE id = 'your-item-uuid';
```

### Delete an item:
```sql
DELETE FROM promotional_news
WHERE id = 'your-item-uuid';
```

### Hide immediately without deleting:
```sql
UPDATE promotional_news
SET end_date = NOW()
WHERE id = 'your-item-uuid';
```

---

## 🎨 How It Looks

**Desktop (Large screens):**
- Fixed sidebar on the right side
- Eye-catching gradient banners
- Glassmorphic styling with backdrop blur
- Up to 3 items stacked vertically
- Users can dismiss individual items

**Mobile (Small screens):**
- Stacked banners below the header
- Full-width display
- Scrollable if multiple items
- Same dismiss functionality

**Visual Features:**
- Gradient backgrounds matching site theme
- Priority-based icons (bell, star, info)
- Optional images
- Clear CTA buttons
- Smooth animations

---

## 🛡️ User Privacy & Behavior

- **Dismissal:** Users can dismiss items; tracked in localStorage
- **No tracking:** No analytics on who sees what
- **Auto-expiration:** Items disappear automatically after end_date
- **Non-intrusive:** Fixed position doesn't block content
- **Responsive:** Adapts to all screen sizes

---

## 🚨 Troubleshooting

### "Supabase credentials not found"
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Use "Save to file" option and run SQL manually

### Item not appearing on site
- Check dates: `start_date <= NOW() AND end_date >= NOW()`
- Verify priority: Higher priority items show first
- Check if user dismissed it (clear localStorage)
- Confirm RLS policies allow public reads

### Description has weird characters
- The scripts automatically escape single quotes
- If writing SQL manually, double single quotes: `it's` → `it''s`

### Want to test without affecting production
- Set a very short date range (1 hour)
- Use low priority (1-2)
- Test on staging/dev environment first

---

## 📞 Need Help?

- **Database issues:** Check Supabase dashboard for logs
- **Script errors:** Run with `node --trace-warnings` for details
- **Display issues:** Check browser console for errors
- **RLS problems:** Verify policies in Supabase SQL editor

---

## 🎉 Tips for Great Promotional Content

✅ **Do:**
- Keep titles under 60 characters
- Write clear, benefit-focused descriptions
- Use strong call-to-action text
- Set realistic date ranges
- Test on mobile devices

❌ **Avoid:**
- ALL CAPS TITLES (use title case)
- Walls of text (break into paragraphs)
- Expired deadlines
- Broken links
- Overly salesy language

---

**Happy promoting! 🎊**

