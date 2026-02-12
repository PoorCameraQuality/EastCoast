import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { debouncedSitemapPing } from '@/lib/sitemapPing'

// Simple email function using fetch to a webhook or email service
async function sendEmailNotification(subject: string, content: string) {
  try {
    // Option 1: Use a webhook service like Zapier or Make.com
    const webhookUrl = process.env.EMAIL_WEBHOOK_URL
    
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'admin@eastcoastkinkevents.com', // This forwards to sheldonkinneymmo.tm@gmail.com
          subject: subject,
          content: content,
          type: 'article_submission'
        })
      })
    }
    
    // Option 2: Use Resend (if configured)
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@eastcoastkinkevents.com',
          to: 'admin@eastcoastkinkevents.com', // This forwards to sheldonkinneymmo.tm@gmail.com
          subject: subject,
          html: content
        })
      })
    }
    
    console.log('Email notification sent for article submission')
  } catch (error) {
    console.error('Failed to send email notification:', error)
    // Don't fail the request if email fails
  }
}

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
      'articleCategory'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.authorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Calculate word count
    const wordCount = body.articleContent.split(/\s+/).length

    // Get Supabase client
    const client = supabase
    if (!client) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Save to Supabase submissions table
    const { data, error } = await client
      .from('submissions')
      .insert([
        {
          author_name: body.authorName,
          author_email: body.authorEmail,
          author_credentials: body.authorCredentials || null,
          author_bio: body.authorBio,
          article_title: body.articleTitle,
          article_excerpt: body.articleExcerpt,
          article_content: body.articleContent,
          article_category: body.articleCategory,
          article_tags: body.articleTags || null,
          submission_type: 'article',
          status: 'pending',
          word_count: wordCount,
          // submitted_at will be automatically set by the database default
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save submission: ' + error.message },
        { status: 500 }
      )
    }

    // Ping search engines about potential new content
    // (Articles need approval first, but this ensures quick indexing when approved)
    debouncedSitemapPing()

    return NextResponse.json({
      success: true,
      message: 'Article submitted successfully',
      submissionId: data?.[0]?.id
    })
  } catch (error) {
    console.error('Education submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
