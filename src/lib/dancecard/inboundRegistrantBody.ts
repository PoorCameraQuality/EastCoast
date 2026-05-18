import { ZodError, z } from 'zod'
import { organizerRegistrantImportSchema } from '@/lib/dancecard/organizerSchemas'
import { eventbriteAttendeeToImportRow } from '@/lib/dancecard/eventbriteRegistrants'

/**
 * Normalize public webhook / adapter payloads to `{ rows }` for `runRegistrantImportBatch`.
 * Supports the organizer import shape or `{ "eventbrite": <attendee object> }`.
 */
export function parseInboundRegistrantPayload(raw: unknown): z.infer<typeof organizerRegistrantImportSchema> {
  if (raw === null || typeof raw !== 'object') {
    throw new ZodError([
      { code: 'custom', path: [], message: 'Body must be a JSON object' },
    ])
  }
  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.rows)) {
    return organizerRegistrantImportSchema.parse(raw)
  }
  if (obj.eventbrite && typeof obj.eventbrite === 'object') {
    const row = eventbriteAttendeeToImportRow(obj.eventbrite as Record<string, unknown>)
    return {
      rows: [
        {
          sceneDisplayName: row.sceneDisplayName,
          categoryName: row.categoryName,
          categoryId: row.categoryId,
          email: row.email,
          legalName: row.legalName,
          status: 'imported',
          externalSource: row.externalSource,
          externalId: row.externalId,
        },
      ],
    }
  }
  throw new ZodError([
    {
      code: 'custom',
      path: [],
      message: 'Expected { rows: [...] } or { eventbrite: <attendee> }',
    },
  ])
}
