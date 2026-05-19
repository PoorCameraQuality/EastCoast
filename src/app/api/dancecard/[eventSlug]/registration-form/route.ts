import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
} from '@/lib/dancecard/routeCommon'
import {
  loadPublicRegistrationCategories,
  loadPublishedRegistrationForm,
} from '@/lib/dancecard/registrationSubmitCore'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [form, categories] = await Promise.all([
      loadPublishedRegistrationForm(admin, event.id),
      loadPublicRegistrationCategories(admin, event.id),
    ])

    if (!form) {
      return NextResponse.json({ error: 'Registration is not open', form: null, categories: [] }, { status: 404 })
    }

    const regGate = String((event as { registration_access_code?: string }).registration_access_code ?? '').trim()

    return NextResponse.json({
      eventTitle: event.event_title,
      requiresEventAccessCode: Boolean(regGate),
      form: {
        introText: form.introText,
        confirmationText: form.confirmationText,
        questions: form.questions.map((q) => ({
          id: q.id,
          type: q.type,
          label: q.label,
          required: q.required,
          requiredForCategoryIds: q.requiredForCategoryIds ?? [],
          sortOrder: q.sortOrder,
          optionsJson: q.optionsJson,
          visibilityRulesJson: q.visibilityRulesJson ?? {},
        })),
      },
      categories,
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-registration-form')
  }
}
