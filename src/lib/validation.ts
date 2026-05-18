import { z } from 'zod'

// Event submission schema
export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  shortTitle: z.string().max(50, 'Short title too long').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  displayDate: z.string().optional(),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  venue: z.string().min(1, 'Venue is required').max(100, 'Venue name too long'),
  shortDescription: z.string().min(10, 'Description too short').max(200, 'Description too long'),
  longDescription: z.string().min(10, 'Description too short').max(2000, 'Description too long'),
  seoDescription: z.string().max(160, 'SEO description too long').optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  logo: z.string().url('Invalid logo URL').optional(),
  images: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  organizer: z.string().min(1, 'Organizer is required').max(100, 'Organizer name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  organizerWebsite: z.string().url('Invalid organizer website URL').optional(),
  earlyBirdPrice: z.string().optional(),
  regularPrice: z.string().optional(),
  atDoorPrice: z.string().optional(),
  includes: z.string().optional(),
  features: z.string().optional(),
  seoTitle: z.string().max(60, 'SEO title too long').optional(),
  seoKeywords: z.string().max(200, 'SEO keywords too long').optional(),
  eventType: z.enum(['munch', 'play_party', 'class', 'convention', 'social']).optional(),
  venueId: z.string().uuid('Invalid venue id').optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(320).optional(),
  organizerName: z.string().max(120).optional(),
})

// Validation helper functions
export function validateEvent(data: unknown) {
  return eventSchema.safeParse(data)
}

// Sanitization helper
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}
