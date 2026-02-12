import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Prepare submission data
    const submissionData = {
      submission_type: 'contact',
      author_name: name,
      author_email: email,
      author_bio: '',
      article_title: subject,
      article_excerpt: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
      article_content: message,
      article_category: 'Contact',
      article_tags: '',
      contact_name: name,
      contact_email: email,
      contact_type: subject,
      contact_method: 'Website Contact Form',
      contact_method_details: 'Submitted via website contact form',
      word_count: message.split(' ').length,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }

    // Get Supabase client
    const client = supabase
    if (!client) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Insert into Supabase
    const { data, error } = await client
      .from('submissions')
      .insert([submissionData])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('Contact route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
