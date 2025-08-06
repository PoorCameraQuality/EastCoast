import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const submissionId = params.id
    
    // Update submission status to approved
    const { error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewer_notes: body.reviewerNotes || 'Approved for publication'
      })
      .eq('id', submissionId)
    
    if (updateError) {
      console.error('Error updating submission:', updateError)
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      )
    }
    
    // Get the submission data to create article
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()
    
    if (fetchError || !submission) {
      console.error('Error fetching submission:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch submission data' },
        { status: 500 }
      )
    }
    
    // Create slug from title
    const slug = submission.article_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    // Create published article
    const { error: articleError } = await supabaseAdmin
      .from('articles')
      .insert([
        {
          submission_id: submissionId,
          slug: slug,
          title: submission.article_title,
          excerpt: submission.article_excerpt,
          content: submission.article_content,
          author_name: submission.author_name,
          author_credentials: submission.author_credentials,
          author_bio: submission.author_bio,
          category: submission.article_category,
          tags: submission.article_tags ? submission.article_tags.split(',').map((tag: string) => tag.trim()) : [],
          status: 'published',
          read_time: `${Math.ceil(submission.word_count / 200)} min read`
        }
      ])
    
    if (articleError) {
      console.error('Error creating article:', articleError)
      // Don't fail the approval if article creation fails
      console.log('Approval succeeded but article creation failed')
    }
    
    console.log('Submission approved and article created:', {
      submissionId,
      reviewerNotes: body.reviewerNotes,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Submission approved successfully',
        submissionId
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error approving submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
