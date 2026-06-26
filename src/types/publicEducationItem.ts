import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'
import type { PublicVendorListing } from '@/types/publicVendorListing'

export type EducationContentType =
  | 'article'
  | 'guide'
  | 'resource_link'
  | 'learning_path'
  | 'class'
  | 'video'
  | 'series'
  | 'platform_update'

export type EducationTopic =
  | 'consent'
  | 'safety'
  | 'technique'
  | 'community'
  | 'resources'
  | 'identity'
  | 'aftercare'
  | 'mental_health'
  | 'legal'
  | 'beginner'
  | 'gear'
  | 'organizer'
  | 'presenter'
  | 'platform'

export type EducationLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels'

export type EducationContentLane = 'library' | 'resource' | 'platform_update'

export type PublicPresenterPreview = {
  slug: string
  name: string
  role?: string
  avatarUrl?: string
  topics?: string[]
  articleCount?: number
  profileUrl?: string
  followUrl?: string
}

export type PublicEducationItem = {
  id: string
  slug: string
  title: string
  subtitle?: string
  summary?: string
  body?: string

  contentType: EducationContentType
  topic: EducationTopic
  lane: EducationContentLane

  level?: EducationLevel
  readTimeMinutes?: number
  readTimeLabel?: string
  tags?: string[]
  contentWarnings?: string[]

  authorName?: string
  authorSlug?: string
  authorAvatarUrl?: string
  authorRole?: string

  presenterSlug?: string
  presenterProfileUrl?: string
  organizationSlug?: string
  organizationProfileUrl?: string

  heroImageUrl?: string

  relatedEvents?: PublicEventIndexItem[]
  relatedPresenters?: PublicPresenterPreview[]
  relatedVendors?: PublicVendorListing[]
  relatedPlaces?: PublicPlaceListing[]
  relatedArticles?: PublicEducationItem[]

  learningPathSlug?: string
  learningPathOrder?: number

  sourceUrl?: string
  canonicalUrl?: string
  externalSourceName?: string

  kinkSocialArticleUrl?: string
  kinkSocialAuthorUrl?: string
  saveUrl?: string
  followAuthorUrl?: string

  sourceSystem: 'ecke' | 'kink_social' | 'external'
  sourceId?: string
  sourceAttribution?: string
  lastSyncedAt?: string

  featured?: boolean
  publishDate?: string

  status: 'published' | 'archived'
}

export type LearningPathDefinition = {
  slug: string
  title: string
  promise: string
  level: EducationLevel
  topicHints: EducationTopic[]
  categories: string[]
  tagKeywords: string[]
  slugKeywords: string[]
}

export type PublicEducatorPreview = {
  slug: string
  name: string
  role?: string
  avatarUrl?: string
  topics: string[]
  articleCount: number
  profileUrl?: string
  followUrl?: string
}
