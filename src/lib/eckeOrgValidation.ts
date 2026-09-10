import { z } from 'zod'

function normalizeWebsite(value: string | undefined): string | undefined {
  const raw = (value ?? '').trim()
  if (!raw) return undefined
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export const orgSignupSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required').max(255),
  email: z.string().email('Enter a valid contact email').max(255),
  website: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(''))
    .transform((value) => normalizeWebsite(typeof value === 'string' ? value : undefined))
    .refine((value) => value === undefined || z.string().url().safeParse(value).success, {
      message: 'Enter a valid website',
    }),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(40)
    .regex(/^[a-z0-9][a-z0-9_-]*$/i, 'Username may contain letters, numbers, underscores, and hyphens'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export const orgLoginSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(128),
})

export const orgRecoverSchema = z.object({
  email: z.string().email(),
})
