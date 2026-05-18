import { NextResponse } from 'next/server'

/** Minimal OpenAPI 3.0 surface for external Dancecard HTTP modules (Phase 7). */
export async function GET() {
  const doc = {
    openapi: '3.0.3',
    info: {
      title: 'Dancecard external API (subset)',
      version: '1.0.0',
      description: 'Bearer API keys (`dk_…`) scoped per event. Replace `{eventSlug}` with the event slug.',
    },
    servers: [{ url: '/' }],
    paths: {
      '/api/external/dancecard/{eventSlug}/program-slots': {
        get: {
          summary: 'Published program slots',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventSlug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'JSON program payload' }, '401': { description: 'Missing/invalid key' } },
        },
      },
      '/api/external/dancecard/{eventSlug}/registrants/import': {
        post: {
          summary: 'Upsert registrants (requires write:registrants)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventSlug', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
          },
          responses: { '200': { description: 'Import summary' }, '403': { description: 'Missing scope' } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'dk_<secret>' },
      },
    },
  }
  return NextResponse.json(doc, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
