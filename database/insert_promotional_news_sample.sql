-- Sample promotional news insert: Primal Arts Vendor Application
-- This demonstrates how to add promotional content to the home page

INSERT INTO promotional_news (
  title,
  description,
  link_url,
  link_text,
  start_date,
  end_date,
  priority
) VALUES (
  'Primal Arts Vendor Applications Open',
  'We''re looking for artisans, craftspeople, and those with thoughtfully curated collections—folks who bring handmade work, unique creations, or special finds or services to share with the attendees of Primal Arts Fest.

At PAF26, the Vendor Market is more than a place to sell, it's where you can connect with people who truly value creativity and craft. Vendors here have the chance to showcase what they do best while being part of the larger Primal Arts experience.

We have both indoor and outdoor spaces to suit your setup. Indoor sites are limited to one per vendor and are reserved when you register. If you need more room or prefer being outside, there''s plenty of space for multiple outdoor sites so you can spread out and show off your display.',
  'https://primalartsfest.com/vendor-application',
  'Apply Now',
  '2025-10-11 00:00:00-04',  -- Start date (EDT timezone)
  '2026-05-01 23:59:59-04',  -- End date
  8  -- High priority (1-10 scale)
);

-- Example: Workshop Announcement
INSERT INTO promotional_news (
  title,
  description,
  link_url,
  link_text,
  start_date,
  end_date,
  priority
) VALUES (
  'Early Bird Registration - Dark Odyssey Winter Fire',
  'Save $50 on your registration! Dark Odyssey Winter Fire early bird pricing ends November 1st. Join us for four days of workshops, performances, and community connection.',
  'https://darcodyssey.com/winter-fire/register',
  'Register Now',
  '2025-10-11 00:00:00-04',
  '2025-11-01 23:59:59-04',
  7
);

-- Example: General Announcement (no link)
INSERT INTO promotional_news (
  title,
  description,
  start_date,
  end_date,
  priority
) VALUES (
  'Community Updates',
  'New events added this week! Check out our expanded calendar featuring workshops, munches, and conferences across the East Coast. Over 50 new listings added.',
  '2025-10-11 00:00:00-04',
  '2025-10-18 23:59:59-04',
  5
);

-- Query to view active promotional items (what users will see)
SELECT 
  id,
  title,
  description,
  link_url,
  link_text,
  priority,
  start_date,
  end_date
FROM promotional_news
WHERE start_date <= NOW() 
  AND end_date >= NOW()
ORDER BY priority DESC, created_at DESC
LIMIT 3;

