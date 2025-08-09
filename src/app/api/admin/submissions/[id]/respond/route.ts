import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Get the Supabase admin client
    const client = getSupabaseAdminClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    // First, get the submission to log it
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

    // Update submission status to responded
    const { error: updateError } = await client
      .from('submissions')
      .update({
        status: 'responded',
        reviewed_at: new Date().toISOString(),
        reviewer_notes: body.reviewerNotes || `Responded on ${new Date().toLocaleDateString()}`
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json(
        { error: 'Failed to respond to submission: ' + updateError.message },
        { status: 500 }
      )
    }

    // Log the response in moderation_logs
    if (submission) {
      const { error: logError } = await client
        .from('moderation_logs')
        .insert({
          action: 'responded',
          article_title: submission.article_title || submission.contact_name || 'Unknown',
          article_id: submission.id,
          admin_name: 'Admin',
          notes: body.reviewerNotes || 'Contact form responded to via email'
        })

      if (logError) {
        console.error('Error logging response:', logError)
        // Don't fail the request if logging fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in respond submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
