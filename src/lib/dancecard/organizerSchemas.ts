import { z } from 'zod'
import { agreementsConfigSchema } from '@/lib/dancecard/agreementsConfig'
import { attendeeGuideJsonSchema } from '@/lib/dancecard/attendeeGuideJson'
import { attendeeProfileConfigSchema } from '@/lib/dancecard/attendeeProfile'

const isoLike = z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid ISO datetime')
const isoLikeNullable = z.union([isoLike, z.null()])

export const organizerPatchEventSchema = z.object({
  productTitle: z.string().min(1).max(200).optional(),
  eventTitle: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(500).nullable().optional(),
  timezone: z.string().min(1).max(80).optional(),
  windowStartsAt: isoLike.optional(),
  windowEndsAt: isoLike.optional(),
  sharedByLabel: z.string().min(1).max(120).optional(),
  sharedByDetail: z.string().max(500).nullable().optional(),
  logoUrl: z.union([z.string().max(2000), z.literal('')]).nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
  staffAccessCode: z.string().max(200).nullable().optional(),
  registrationAccessCode: z.string().max(200).nullable().optional(),
  badgeLayoutJson: z.record(z.string(), z.unknown()).optional(),
  themeConfig: z
    .object({
      accent: z.string().max(32).optional(),
      surface: z.string().max(32).optional(),
      elevated: z.string().max(32).optional(),
      slotPublished: z.string().max(32).optional(),
      hallwayModeDefault: z.boolean().optional(),
    })
    .optional(),
  eventProfile: z.enum(['camp', 'hotel', 'party', 'conference']).optional(),
  attendeeGuideJson: attendeeGuideJsonSchema.optional(),
  agreementsConfig: agreementsConfigSchema.optional(),
  attendeeProfileConfig: attendeeProfileConfigSchema.optional(),
})

const visibilityEnum = z.enum(['public', 'staff_only', 'secret'])

export const organizerProgramSlotCreateSchema = z
  .object({
    startsAt: isoLikeNullable.optional(),
    endsAt: isoLikeNullable.optional(),
    title: z.string().min(1).max(500),
  track: z.string().max(200).nullable().optional(),
  trackId: z.string().uuid().nullable().optional(),
  room: z.string().max(200).nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  isPublished: z.boolean().optional(),
  visibility: visibilityEnum.optional(),
  isFrozen: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const hasStart = data.startsAt != null
    const hasEnd = data.endsAt != null
    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide both start and end times, or omit both to keep the item unscheduled',
        path: ['startsAt'],
      })
    }
  })

export const organizerProgramSlotPatchSchema = z
  .object({
  startsAt: isoLikeNullable.optional(),
  endsAt: isoLikeNullable.optional(),
  title: z.string().min(1).max(500).optional(),
  track: z.string().max(200).nullable().optional(),
  trackId: z.string().uuid().nullable().optional(),
  room: z.string().max(200).nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  isPublished: z.boolean().optional(),
  visibility: visibilityEnum.optional(),
  isFrozen: z.boolean().optional(),
  photoPolicy: z.enum(['allowed', 'restricted', 'none']).optional(),
  organizerNotesInternal: z.string().max(8000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startsAt === undefined && data.endsAt === undefined) return
    const hasStart = data.startsAt != null
    const hasEnd = data.endsAt != null
    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide both start and end times, or set both to null to unschedule',
        path: ['startsAt'],
      })
    }
  })

const uuidList = z.array(z.string().uuid()).min(1).max(500)

export const organizerProgramSlotsBulkSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('publish'), ids: uuidList }),
  z.object({ op: z.literal('unpublish'), ids: uuidList }),
  z.object({ op: z.literal('setVisibility'), ids: uuidList, visibility: visibilityEnum }),
  z.object({ op: z.literal('freeze'), ids: uuidList }),
  z.object({ op: z.literal('unfreeze'), ids: uuidList }),
  z.object({ op: z.literal('delete'), ids: uuidList }),
  z.object({ op: z.literal('duplicate'), ids: uuidList }),
  z.object({ op: z.literal('tagAdd'), ids: uuidList, tagIds: z.array(z.string().uuid()).min(1).max(50) }),
  z.object({ op: z.literal('tagRemove'), ids: uuidList, tagIds: z.array(z.string().uuid()).min(1).max(50) }),
])

export const organizerTrackCreateSchema = z.object({
  name: z.string().min(1).max(200),
  color: z.string().max(32).optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
})

export const organizerTrackPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  color: z.string().max(32).optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
})

export const organizerTagCreateSchema = z.object({
  name: z.string().min(1).max(120),
  scope: z.enum(['session', 'person', 'registrant', 'location']).optional(),
})

export const organizerTagPatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  scope: z.enum(['session', 'person', 'registrant', 'location']).optional(),
})

const staffShiftStatusEnum = z.enum(['draft', 'open', 'assigned', 'dropped'])

export const organizerStaffShiftCreateSchema = z.object({
  personName: z.string().min(1).max(200),
  personId: z.string().uuid().nullable().optional(),
  role: z.string().min(1).max(120),
  locationId: z.string().uuid().nullable().optional(),
  startsAt: isoLike,
  endsAt: isoLike,
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  shiftStatus: staffShiftStatusEnum.optional(),
  organizerNotesStaffOnly: z.string().max(4000).nullable().optional(),
})

export const organizerStaffShiftPatchSchema = z.object({
  personName: z.string().min(1).max(200).optional(),
  personId: z.string().uuid().nullable().optional(),
  role: z.string().min(1).max(120).optional(),
  locationId: z.string().uuid().nullable().optional(),
  startsAt: isoLike.optional(),
  endsAt: isoLike.optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  shiftStatus: staffShiftStatusEnum.optional(),
  organizerNotesStaffOnly: z.string().max(4000).nullable().optional(),
  droppedAt: isoLike.nullable().optional(),
  clearClaimedBy: z.boolean().optional(),
})

const slotPersonRoleEnum = z.enum([
  'lead_presenter',
  'co_presenter',
  'moderator',
  'photographer',
  'dm',
  'volunteer',
  'staff',
])

export const organizerSlotPeoplePutSchema = z.object({
  assignments: z.array(
    z.object({
      personId: z.string().uuid(),
      role: slotPersonRoleEnum,
      sortOrder: z.number().int().min(0).max(1_000_000).optional(),
      isPublicOnSchedule: z.boolean().optional(),
    }),
  ),
})

export const organizerPersonCreateSchema = z.object({
  sceneName: z.string().min(1).max(200),
  legalName: z.string().max(200).nullable().optional(),
  pronouns: z.string().max(120).nullable().optional(),
  email: z.union([z.string().email().max(320), z.literal('')]).optional(),
  phone: z.string().max(40).nullable().optional(),
  publicBio: z.string().max(4000).nullable().optional(),
  internalNotes: z.string().max(4000).nullable().optional(),
  photoUrl: z.string().max(2000).nullable().optional(),
  showLegalNameOnPublic: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).max(200).optional(),
})

export const organizerPersonPatchSchema = z.object({
  sceneName: z.string().min(1).max(200).optional(),
  legalName: z.string().max(200).nullable().optional(),
  pronouns: z.string().max(120).nullable().optional(),
  email: z.union([z.string().email().max(320), z.literal('')]).optional(),
  phone: z.string().max(40).nullable().optional(),
  publicBio: z.string().max(4000).nullable().optional(),
  internalNotes: z.string().max(4000).nullable().optional(),
  photoUrl: z.string().max(2000).nullable().optional(),
  showLegalNameOnPublic: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).max(200).optional(),
})

const registrationRoleKindEnum = z.enum([
  'attendee',
  'staff',
  'volunteer',
  'presenter',
  'photographer',
  'vendor',
  'comp',
  'other',
])

const calendarDateYmd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional()

export const organizerRegistrationCategoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  roleKind: registrationRoleKindEnum.optional(),
  expectedHours: z.number().min(0).nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  accessCode: z.string().max(200).nullable().optional(),
  grantsStaffAccess: z.boolean().optional(),
  externalSourceRef: z.string().max(500).nullable().optional(),
  importedPaymentStatus: z.string().max(200).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  checkInValidFrom: calendarDateYmd,
  checkInValidThrough: calendarDateYmd,
})

export const organizerRegistrationCategoryPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  roleKind: registrationRoleKindEnum.optional(),
  expectedHours: z.number().min(0).nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  accessCode: z.string().max(200).nullable().optional(),
  grantsStaffAccess: z.boolean().optional(),
  externalSourceRef: z.string().max(500).nullable().optional(),
  importedPaymentStatus: z.string().max(200).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  checkInValidFrom: calendarDateYmd,
  checkInValidThrough: calendarDateYmd,
})

const questionTypeEnum = z.enum([
  'text',
  'long_text',
  'email',
  'phone',
  'single_choice',
  'multi_choice',
  'dropdown',
  'date',
  'file_upload',
  'emergency_contact',
  'pronouns',
  'consent_matrix',
])

export const organizerRegistrationFormPutSchema = z.object({
  status: z.enum(['draft', 'published']).optional(),
  introText: z.string().max(50_000).optional(),
  confirmationText: z.string().max(50_000).optional(),
  questions: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        type: questionTypeEnum,
        label: z.string().min(1).max(500),
        required: z.boolean().optional(),
        sortOrder: z.number().int().min(0).max(1_000_000).optional(),
        optionsJson: z.unknown().optional(),
        visibilityRulesJson: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .optional(),
})

export const organizerRegistrantCreateSchema = z.object({
  categoryId: z.string().uuid(),
  personId: z.string().uuid().nullable().optional(),
  sceneDisplayName: z.string().min(1).max(200),
  legalName: z.string().max(200).nullable().optional(),
  email: z.union([z.string().email().max(320), z.literal('')]).optional(),
  phone: z.string().max(40).nullable().optional(),
  internalNotes: z.string().max(4000).nullable().optional(),
  status: z.enum(['imported', 'pending', 'confirmed', 'cancelled', 'waitlisted', 'checked_in']).optional(),
  consentWaiverAckAt: isoLike.nullable().optional(),
  consentPhotoAckAt: isoLike.nullable().optional(),
  importedPaymentStatus: z.string().max(200).nullable().optional(),
  externalSourceRef: z.string().max(500).nullable().optional(),
  tagIds: z.array(z.string().uuid()).max(200).optional(),
  answers: z.record(z.string().uuid(), z.unknown()).optional(),
})

export const organizerRegistrantPatchSchema = z.object({
  categoryId: z.string().uuid().optional(),
  personId: z.string().uuid().nullable().optional(),
  sceneDisplayName: z.string().min(1).max(200).optional(),
  legalName: z.string().max(200).nullable().optional(),
  email: z.union([z.string().email().max(320), z.literal('')]).optional(),
  phone: z.string().max(40).nullable().optional(),
  internalNotes: z.string().max(4000).nullable().optional(),
  status: z.enum(['imported', 'pending', 'confirmed', 'cancelled', 'waitlisted', 'checked_in']).optional(),
  consentWaiverAckAt: isoLike.nullable().optional(),
  consentPhotoAckAt: isoLike.nullable().optional(),
  importedPaymentStatus: z.string().max(200).nullable().optional(),
  externalSourceRef: z.string().max(500).nullable().optional(),
  pronouns: z.string().max(120).nullable().optional(),
  vettingStatus: z.enum(['none', 'pending', 'approved', 'rejected', 'hold']).optional(),
  vettingSafetyNotes: z.string().max(8000).nullable().optional(),
  tagIds: z.array(z.string().uuid()).max(200).optional(),
  answers: z.record(z.string().uuid(), z.unknown()).optional(),
  policyDocumentIds: z.array(z.string().uuid()).max(50).optional(),
  rabbitsignStatus: z.enum(['pending', 'signed', 'declined']).nullable().optional(),
  earlyCheckInOverride: z.boolean().optional(),
})

export const organizerRegistrantImportSchema = z.object({
  rows: z
    .array(
      z
        .object({
          sceneDisplayName: z.string().min(1).max(200),
          categoryId: z.string().uuid().optional(),
          categoryName: z.string().min(1).max(200).optional(),
          email: z.union([z.string().email().max(320), z.literal('')]).optional(),
          legalName: z.string().max(200).nullable().optional(),
          status: z.enum(['imported', 'pending', 'confirmed', 'cancelled', 'waitlisted', 'checked_in']).optional(),
          externalSource: z.string().min(1).max(64).optional(),
          externalId: z.string().min(1).max(256).optional(),
        })
        .refine((r) => Boolean(r.categoryId || r.categoryName), {
          message: 'Each row needs categoryId or categoryName',
        }),
    )
    .min(1)
    .max(2000),
})

export type OrganizerRegistrantImportRow = z.infer<typeof organizerRegistrantImportSchema>['rows'][number]

export const organizerPolicyDocumentCreateSchema = z.object({
  kind: z.enum(['coc', 'waiver', 'photo', 'marketing']),
  version: z.number().int().min(1).max(999).optional(),
  title: z.string().min(1).max(200),
  bodyMarkdown: z.string().max(100_000).optional(),
  publishedAt: isoLike.nullable().optional(),
})

export const organizerPolicyDocumentPatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  bodyMarkdown: z.string().max(100_000).optional(),
  publishedAt: isoLike.nullable().optional(),
})

export const organizerPolicyAcceptanceRecordSchema = z.object({
  registrantId: z.string().uuid(),
  policyDocumentId: z.string().uuid(),
})

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const organizerCreateEventSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(64)
    .refine((s) => slugRegex.test(s), 'Slug must be lowercase letters, numbers, hyphens'),
  productTitle: z.string().min(1).max(200),
  eventTitle: z.string().min(1).max(200),
  timezone: z.string().min(1).max(80),
  windowStartsAt: isoLike,
  windowEndsAt: isoLike,
  sharedByLabel: z.string().min(1).max(120).optional(),
  sharedByDetail: z.string().max(500).nullable().optional(),
})

export const organizerCloneEventSchema = z.object({
  sourceSlug: z.string().min(1).max(64),
  newSlug: z
    .string()
    .min(2)
    .max(64)
    .refine((s) => slugRegex.test(s), 'Slug must be lowercase letters, numbers, hyphens'),
  newEventTitle: z.string().min(1).max(200),
  productTitle: z.string().min(1).max(200).optional(),
  anchorSourceStartsAt: isoLike,
  anchorTargetStartsAt: isoLike,
  domains: z.object({
    settings: z.boolean(),
    locations: z.boolean(),
    tracksTags: z.boolean(),
    program: z.boolean(),
    staffShifts: z.boolean(),
    dmRequirements: z.boolean(),
    messageTemplates: z.boolean(),
    policyDocuments: z.boolean(),
  }),
})

const trustedRoleQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  type: questionTypeEnum,
  label: z.string().min(1).max(500),
  required: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  optionsJson: z.unknown().optional(),
  visibilityRulesJson: z.record(z.string(), z.unknown()).optional(),
})

export const organizerTrustedRoleCreateSchema = z.object({
  name: z.string().min(1).max(200),
  applySlug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
  introText: z.string().max(50_000).optional(),
  confirmationText: z.string().max(50_000).optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  questions: z.array(trustedRoleQuestionSchema).optional(),
})

export const organizerTrustedRolePatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  applySlug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
  introText: z.string().max(50_000).optional(),
  confirmationText: z.string().max(50_000).optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  questions: z.array(trustedRoleQuestionSchema).optional(),
})
