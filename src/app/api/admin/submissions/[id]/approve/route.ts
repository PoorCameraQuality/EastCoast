import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get the Supabase admin client
    const client = getSupabaseAdminClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    // First, get the submission
    const { data: submission, error: fetchError } = await client
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching submission:', fetchError)
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Update submission status to approved
    const { error: updateError } = await client
      .from('submissions')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewer_notes: 'Approved and published'
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve submission: ' + updateError.message },
        { status: 500 }
      )
    }

    // If it's an article submission, create the article
    if (submission.submission_type === 'article') {
      // Generate slug from title
      const slug = submission.article_title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { error: articleError } = await client
        .from('articles')
        .insert({
          title: submission.article_title,
          slug: slug,
          excerpt: submission.article_excerpt,
          content: submission.article_content,
          author_name: submission.author_name,
          author_credentials: submission.author_credentials || null,
          author_bio: submission.author_bio,
          category: submission.article_category,
          tags: submission.article_tags ? submission.article_tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : null,
          featured: false,
          status: 'published',
          submission_id: submission.id
        })

      if (articleError) {
        console.error('Error creating article:', articleError)
        return NextResponse.json(
          { error: 'Failed to create article: ' + articleError.message },
          { status: 500 }
        )
      }
    }

    // If it's an event submission, create the event
    if (submission.submission_type === 'event') {
      // Generate slug from title
      const slug = submission.event_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { error: eventError } = await client
        .from('events')
        .insert({
          title: submission.event_name,
          slug: slug,
          start_date: submission.event_date,
          end_date: submission.event_date,
          display_date: submission.event_date,
          city: submission.event_location?.split(',')[0]?.trim() || '',
          state: submission.event_location?.split(',')[1]?.trim() || '',
          venue: submission.event_location || '',
          short_description: submission.article_excerpt || submission.event_name,
          long_description: submission.article_content || submission.article_excerpt || submission.event_name,
          category: submission.article_category || 'Event',
          tags: submission.article_tags || null,
          website: submission.event_website || null,
          organizer: submission.author_name,
          email: submission.author_email,
          phone: submission.author_credentials || null,
          status: 'published',
          submission_id: submission.id
        })

      if (eventError) {
        console.error('Error creating event:', eventError)
        return NextResponse.json(
          { error: 'Failed to create event: ' + eventError.message },
          { status: 500 }
        )
      }
    }

    // If it's a dungeon submission, create the dungeon
    if (submission.submission_type === 'dungeon') {
      // Generate slug from title
      const slug = submission.dungeon_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { error: dungeonError } = await client
        .from('dungeons')
        .insert({
          name: submission.dungeon_name,
          slug: slug,
          city: submission.dungeon_location?.split(',')[0]?.trim() || '',
          state: submission.dungeon_location?.split(',')[1]?.trim() || '',
          address: submission.dungeon_location || '',
          excerpt: submission.article_excerpt || submission.dungeon_name,
          website: submission.dungeon_website || null,
          email: submission.author_email,
          phone: submission.author_credentials || null,
          status: 'published',
          submission_id: submission.id
        })

      if (dungeonError) {
        console.error('Error creating dungeon:', dungeonError)
        return NextResponse.json(
          { error: 'Failed to create dungeon: ' + dungeonError.message },
          { status: 500 }
        )
      }
    }

    // Log the approval in moderation_logs
    const { error: logError } = await client
      .from('moderation_logs')
      .insert({
        action: 'approved',
        article_title: submission.article_title || submission.event_name || submission.dungeon_name || submission.contact_name || 'Unknown',
        article_id: submission.id,
        admin_name: 'Admin',
        notes: `Approved and published ${submission.submission_type} submission`
      })

    if (logError) {
      console.error('Error logging approval:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in approve submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
