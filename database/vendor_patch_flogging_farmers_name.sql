-- One-off: correct display name + description for Flogging Farmers (slug unchanged for URLs).
-- Run in Supabase SQL Editor if this vendor was migrated from static data.

UPDATE public.vendors
SET
  name = 'Flogging Farmers',
  description = 'We’re Flogging Farmers—making handcrafted birch wood floggers and impact implements with an eye for balance, finish, and durability. We love building pieces that feel great in hand and hold up to real play. Custom options are available, and we’re happy to work with you on style, color, and handle preferences.',
  meta_title = 'Flogging Farmers',
  updated_at = now()
WHERE slug = 'floggin-farmers';

-- Optional: refresh SEO meta snippet to match short blurb on the site
-- UPDATE public.vendors
-- SET meta_description = 'Handcrafted birch wood floggers and other impact implements. Custom options available.'
-- WHERE slug = 'floggin-farmers';
