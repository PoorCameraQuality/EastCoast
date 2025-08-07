import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'authorName',
      'authorEmail', 
      'authorBio',
      'articleTitle',
      'articleExcerpt',
      'articleContent',
      'articleCategory',
      'agreeToTerms'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Validate word count (minimum 500 words, no maximum)
    const wordCount = body.articleContent.split(/\s+/).filter((word: string) => word.length > 0).length
    if (wordCount < 500) {
      return NextResponse.json(
        { error: 'Article must be at least 500 words' },
        { status: 400 }
      )
    }
    
    // Validate terms agreement
    if (!body.agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 }
      )
    }
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          author_name: body.authorName,
          author_email: body.authorEmail,
          author_credentials: body.authorCredentials || '',
          author_bio: body.authorBio,
          article_title: body.articleTitle,
          article_excerpt: body.articleExcerpt,
          article_content: body.articleContent,
          article_category: body.articleCategory,
          article_tags: body.articleTags || '',
          contact_method: body.contactMethod || '',
          word_count: wordCount,
          status: 'pending'
        }
      ])
      .select()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }
    
    console.log('Article submission saved to database:', {
      id: data[0].id,
      authorName: body.authorName,
      articleTitle: body.articleTitle,
      category: body.articleCategory,
      wordCount,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Article submitted successfully for review',
        submissionId: data[0].id
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error processing article submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
