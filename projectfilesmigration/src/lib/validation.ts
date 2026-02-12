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
  seoKeywords: z.string().max(200, 'SEO keywords too long').optional()
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB limit
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, and WebP files are allowed'
  )
})

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message too short').max(1000, 'Message too long')
})

// Education article schema
export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  excerpt: z.string().min(10, 'Excerpt too short').max(200, 'Excerpt too long'),
  content: z.string().min(50, 'Content too short'),
  category: z.string().min(1, 'Category is required'),
  author: z.string().min(1, 'Author is required').max(100, 'Author name too long'),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
})

// Validation helper functions
export function validateEvent(data: unknown) {
  return eventSchema.safeParse(data)
}

export function validateFileUpload(file: File) {
  return fileUploadSchema.safeParse({ file })
}

export function validateContact(data: unknown) {
  return contactSchema.safeParse(data)
}

export function validateArticle(data: unknown) {
  return articleSchema.safeParse(data)
}

// Sanitization helper
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}
