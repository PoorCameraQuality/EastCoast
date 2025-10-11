// Type definitions for promotional news feature

export interface PromotionalNews {
  id: string
  title: string
  description: string
  link_url?: string | null
  link_text?: string | null
  image_url?: string | null
  event_slug?: string | null
  start_date: string // ISO 8601 timestamp
  end_date: string // ISO 8601 timestamp
  priority: number
  created_at: string
  updated_at: string
}

export interface ActivePromotionalNews extends PromotionalNews {
  isActive: boolean
  isDismissed: boolean
}

export type PromotionalNewsFilter = {
  includeExpired?: boolean
  minPriority?: number
  limit?: number
}

