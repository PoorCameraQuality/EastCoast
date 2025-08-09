import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'eventName',
      'eventDate',
      'eventLocation',
      'organizerName',
      'organizerEmail',
      'eventDescription',
      'eventCategory',
      'eventType'
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
    if (!emailRegex.test(body.organizerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

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
          event_name: body.eventName,
          event_date: body.eventDate,
          event_location: body.eventLocation,
          event_website: body.eventWebsite || null,
          author_name: body.organizerName,
          author_email: body.organizerEmail,
          author_credentials: body.eventType || null, // Store eventType in author_credentials field
          author_bio: body.eventDescription,
          article_title: body.eventName,
          article_excerpt: body.eventDescription,
          article_content: body.eventDescription,
          article_category: body.eventCategory,
          article_tags: body.eventTags || null,
          submission_type: 'event',
          status: 'pending',
          word_count: body.eventDescription.split(/\s+/).length,
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

    return NextResponse.json({
      success: true,
      message: 'Event submitted successfully',
      submissionId: data?.[0]?.id
    })
  } catch (error) {
    console.error('Event submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
