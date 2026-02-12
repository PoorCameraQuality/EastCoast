# Education Articles Database Schema Rules

## Database Schema Reference

When working with education articles in the Supabase database, always use the correct column names from the articles table schema.

### Correct Column Names

| Database Column | Type | Description |
|----------------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `submission_id` | uuid | Optional; links to submissions table if article came from a submission |
| `slug` | text | URL-friendly article identifier |
| `title` | text | Article title |
| `excerpt` | text | Short description/summary |
| `content` | text | Full article content (HTML) |
| `author_name` | text | Author's display name |
| `author_credentials` | text | Author's professional credentials |
| `author_bio` | text | Author's biography |
| `category` | text | Article category (Safety, Techniques, Community, etc.) |
| `tags` | array | Array of tag strings |
| `publish_date` | timestamp | When article was published |
| `last_updated` | timestamp | When article was last modified |
| `status` | text | Article status (published, draft, etc.) |
| `read_time` | text | Estimated reading time |
| `featured` | boolean | Whether article is featured |
| `seo_title` | text | Custom SEO title |
| `meta_description` | text | Meta description for SEO |
| `focus_keywords` | array | SEO focus keywords |

### Common Mistakes to Avoid

❌ **DON'T USE:**
- `created_at` (doesn't exist)
- `updated_at` (doesn't exist)
- Ordering by `id` (use `publish_date`)

✅ **ALWAYS USE:**
- `publish_date` for publication dates
- `last_updated` for modification dates
- Order by `publish_date` for chronological sorting

### TypeScript Interface Template

```typescript
interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author_name: string
  author_credentials?: string
  author_bio?: string
  category: string
  tags?: string[]
  featured: boolean
  status: string
  publish_date: string
  last_updated?: string
  read_time?: string
  seo_title?: string
  meta_description?: string
  focus_keywords?: string[]
}
```

### Database Queries

**Correct query for fetching articles:**
```sql
SELECT * FROM articles 
WHERE status = 'published' 
ORDER BY publish_date DESC;
```

**Correct query for article by slug:**
```sql
SELECT * FROM articles 
WHERE slug = $1 
AND status = 'published';
```

### Code Updates Required

When adding new articles or updating existing ones:

1. **Always use `publish_date`** instead of `created_at`
2. **Always use `last_updated`** instead of `updated_at`
3. **Order by `publish_date`** for chronological sorting
4. **Update TypeScript interfaces** to match the database schema
5. **Test the queries** to ensure they work with the actual database structure

### File Locations to Update

- `src/app/education/EducationPageClient.tsx`
- `src/components/education/ArticleCard.tsx`
- `src/app/education/[slug]/page.tsx`
- Any new education-related components

### Verification Checklist

Before deploying education article changes:

- [ ] All date fields use `publish_date` and `last_updated`
- [ ] TypeScript interfaces match database schema
- [ ] Queries order by `publish_date` not `id`
- [ ] No references to `created_at` or `updated_at`
- [ ] Test with actual database data
- [ ] Verify articles display correctly on frontend

---

**Last Updated:** January 2025  
**Database:** Supabase articles table  
**Status:** Active and enforced
