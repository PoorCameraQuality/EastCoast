import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const submissionId = params.id
    
    // Update submission status to rejected
    const { error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({ 
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewer_notes: body.reviewerNotes || 'Content does not meet our guidelines'
      })
      .eq('id', submissionId)
    
    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      )
    }
    
    console.log('Submission rejected:', {
      submissionId,
      reviewerNotes: body.reviewerNotes,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Submission rejected successfully',
        submissionId
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error rejecting submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
