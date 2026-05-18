import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { requireSiteAdmin, siteAdminAuthErrorResponse } from '@/lib/security/apiAuth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSiteAdmin()
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

    // Update submission status to rejected
    const { error: updateError } = await client
      .from('submissions')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewer_notes: body.reviewerNotes || `Rejected on ${new Date().toLocaleDateString()}`
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json(
        { error: 'Failed to reject submission: ' + updateError.message },
        { status: 500 }
      )
    }

    // Log the rejection in moderation_logs
    if (submission) {
      const { error: logError } = await client
        .from('moderation_logs')
        .insert({
          action: 'rejected',
          article_title: submission.article_title || submission.contact_name || 'Unknown',
          article_id: submission.id,
          admin_name: 'Admin',
          notes: body.reviewerNotes || 'Rejected by admin'
        })

      if (logError) {
        console.error('Error logging rejection:', logError)
        // Don't fail the request if logging fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const authResp = siteAdminAuthErrorResponse(error)
    if (authResp) return authResp
    console.error('Error in reject submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
