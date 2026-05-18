import { NextResponse } from 'next/server'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function isMissingMessagingTable(msg: string) {
  return /dancecard_message_campaigns|dancecard_message_templates|relation .* does not exist/i.test(msg)
}

/** Published event news from sent organizer announcement campaigns. */
export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: campaigns, error: cErr } = await admin
      .from('dancecard_message_campaigns')
      .select('id, template_id, sent_at, created_at')
      .eq('event_id', event.id)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(20)

    if (cErr) {
      if (isMissingMessagingTable(cErr.message ?? '')) {
        return NextResponse.json({ announcements: [], needsMigration: true })
      }
      throw cErr
    }

    const templateIds = Array.from(new Set((campaigns ?? []).map((c) => c.template_id as string)))
    const templatesById = new Map<string, { subject: string; bodyText: string }>()
    if (templateIds.length) {
      const { data: templates, error: tErr } = await admin
        .from('dancecard_message_templates')
        .select('id, subject, body_text')
        .eq('event_id', event.id)
        .in('id', templateIds)
      if (tErr) throw tErr
      for (const t of templates ?? []) {
        templatesById.set(t.id as string, {
          subject: String(t.subject ?? 'Announcement'),
          bodyText: String(t.body_text ?? ''),
        })
      }
    }

    const announcements = (campaigns ?? [])
      .map((c) => {
        const tpl = templatesById.get(c.template_id as string)
        if (!tpl) return null
        return {
          id: c.id as string,
          subject: tpl.subject,
          bodyText: tpl.bodyText,
          sentAt: (c.sent_at as string | null) ?? (c.created_at as string),
        }
      })
      .filter((a): a is NonNullable<typeof a> => a != null)

    return NextResponse.json({ announcements })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (isMissingMessagingTable(msg)) {
      return NextResponse.json({ announcements: [], needsMigration: true })
    }
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-announcements')
  }
}
