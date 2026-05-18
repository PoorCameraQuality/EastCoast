import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { requireSiteAdmin, siteAdminAuthErrorResponse } from '@/lib/security/apiAuth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSiteAdmin()
    const { id } = params

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

    // Log the deletion in moderation_logs
    if (submission) {
      const { error: logError } = await client
        .from('moderation_logs')
        .insert({
          action: 'deleted',
          article_title: submission.article_title || submission.contact_name || 'Unknown',
          article_id: submission.id,
          admin_name: 'Admin',
          notes: 'Permanently deleted by admin'
        })

      if (logError) {
        console.error('Error logging deletion:', logError)
        // Don't fail the request if logging fails
      }
    }

    // Delete the submission
    const { error: deleteError } = await client
      .from('submissions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting submission:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete submission: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const authResp = siteAdminAuthErrorResponse(error)
    if (authResp) return authResp
    console.error('Error in delete submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
