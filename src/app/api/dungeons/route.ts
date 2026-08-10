import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForOrganizer, isUserSiteAdmin } from '@/lib/dancecard/organizerAuth'

/**
 * Legacy admin form POST. Requires a signed-in site admin.
 * Public dungeon submissions use `/api/dungeons/submit` (pending review).
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.json(
        { error: 'Expected multipart/form-data or application/x-www-form-urlencoded body.' },
        { status: 415 },
      )
    }

    const supabaseServer = createSupabaseServerClientForOrganizer()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()
    if (!user || !(await isUserSiteAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const slug = String(formData.get('slug') || '').trim()
    const name = String(formData.get('name') || '').trim()
    if (!slug || !name) {
      return NextResponse.json({ error: 'slug and name are required' }, { status: 400 })
    }

    // Intentionally not auto-publishing from this legacy endpoint.
    return NextResponse.json(
      {
        error:
          'Direct dungeon publish is disabled. Use /api/dungeons/submit for public submissions or the admin review queue.',
      },
      { status: 410 },
    )
  } catch (error) {
    console.error('Error processing dungeon submission:', error)
    return NextResponse.json({ error: 'Failed to process dungeon submission' }, { status: 500 })
  }
}
