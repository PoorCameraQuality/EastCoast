import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: 'Article submission is not available' },
        { status: 503 }
      )
    }

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
    
    // Send email notification
    const emailSubject = `New Article Submission: ${body.articleTitle}`
    const emailContent = `
      <h2>New Article Submission</h2>
      <p><strong>Title:</strong> ${body.articleTitle}</p>
      <p><strong>Author:</strong> ${body.authorName}</p>
      <p><strong>Author Email:</strong> ${body.authorEmail}</p>
      <p><strong>Category:</strong> ${body.articleCategory}</p>
      <p><strong>Word Count:</strong> ${wordCount}</p>
      
      <h3>Author Bio:</h3>
      <div style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${body.authorBio}
      </div>
      
      <h3>Article Excerpt:</h3>
      <div style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${body.articleExcerpt}
      </div>
      
      <h3>Article Content:</h3>
      <div style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; max-height: 400px; overflow-y: auto;">
        ${body.articleContent}
      </div>
      
      ${body.authorCredentials ? `<p><strong>Author Credentials:</strong> ${body.authorCredentials}</p>` : ''}
      ${body.articleTags ? `<p><strong>Tags:</strong> ${body.articleTags}</p>` : ''}
      ${body.contactMethod ? `<p><strong>Preferred Contact Method:</strong> ${body.contactMethod}</p>` : ''}
      
      <p><strong>Submission ID:</strong> ${data[0].id}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This is an automated notification from the East Coast Kink Events article submission form.</em></p>
    `

    await sendEmailNotification(emailSubject, emailContent)
    
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
