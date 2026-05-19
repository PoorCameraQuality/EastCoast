import { z } from 'zod'

export const attendeeGroupTypeSchema = z.enum(['tent_city', 'hotel_block', 'cabin', 'other'])
export const attendeeGroupVisibilitySchema = z.enum(['public', 'unlisted'])
export const attendeeGroupJoinModeSchema = z.enum(['open', 'apply', 'invite_only'])
export const attendeeGroupRecruitmentSchema = z.enum(['open', 'seeking', 'full', 'closed'])
export const attendeeGroupMemberRoleSchema = z.enum(['owner', 'admin', 'member'])
export const attendeeGroupQuestionKindSchema = z.enum(['short_text', 'long_text', 'single_choice', 'yes_no'])

export const createAttendeeGroupSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(4000).optional(),
  groupType: attendeeGroupTypeSchema.optional(),
  visibility: attendeeGroupVisibilitySchema.optional(),
  joinMode: attendeeGroupJoinModeSchema.optional(),
  recruitmentStatus: attendeeGroupRecruitmentSchema.optional(),
  capacityMin: z.number().int().min(0).nullable().optional(),
  capacityMax: z.number().int().min(1).nullable().optional(),
  expectationsMd: z.string().max(8000).optional(),
  externalDiscordUrl: z.string().max(2000).nullable().optional(),
  externalSheetUrl: z.string().max(2000).nullable().optional(),
})

export const patchAttendeeGroupSchema = createAttendeeGroupSchema.partial().extend({
  status: z.enum(['active', 'archived']).optional(),
  regenerateInviteToken: z.boolean().optional(),
})

export const joinAttendeeGroupSchema = z.object({
  message: z.string().max(1000).optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        value: z.string().max(4000),
      }),
    )
    .max(10)
    .optional(),
})

export const respondJoinRequestSchema = z.object({
  action: z.enum(['accept', 'decline']),
})

export const transferOwnerSchema = z.object({
  accountId: z.string().uuid(),
})

export const joinByTokenSchema = z.object({
  token: z.string().min(8).max(128),
})

export const attendeeGroupQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  prompt: z.string().min(1).max(500),
  kind: attendeeGroupQuestionKindSchema,
  options: z.array(z.string().max(120)).max(20).optional(),
  required: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const putQuestionsSchema = z.object({
  questions: z.array(attendeeGroupQuestionSchema).max(10),
})

export const choreSchema = z.object({
  title: z.string().min(1).max(200),
  assignedAccountId: z.string().uuid().nullable().optional(),
  done: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  slotsNeeded: z.number().int().min(1).max(30).optional(),
  scheduleLabel: z.string().max(80).optional(),
})

export const patchChoreSchema = choreSchema.partial().extend({
  signUp: z.boolean().optional(),
})

export const bringItemSchema = z.object({
  itemLabel: z.string().min(1).max(200),
  quantity: z.number().int().min(1).nullable().optional(),
  notes: z.string().max(500).optional(),
  slotsNeeded: z.number().int().min(1).max(30).optional(),
  scheduleLabel: z.string().max(80).optional(),
})

export const patchBringItemSchema = z.object({
  itemLabel: z.string().min(1).max(200).optional(),
  quantity: z.number().int().min(1).nullable().optional(),
  notes: z.string().max(500).optional(),
  claimedByAccountId: z.string().uuid().nullable().optional(),
  claim: z.boolean().optional(),
  slotsNeeded: z.number().int().min(1).max(30).optional(),
  scheduleLabel: z.string().max(80).optional(),
})

export const announcementSchema = z.object({
  body: z.string().min(1).max(2000),
  pinned: z.boolean().optional(),
})

export const reportGroupSchema = z.object({
  reason: z.string().min(1).max(2000),
})
