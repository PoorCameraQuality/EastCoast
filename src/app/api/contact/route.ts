import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      contactType, 
      name, 
      email, 
      subject, 
      message, 
      eventName,
      eventDate,
      eventLocation,
      eventWebsite,
      dungeonName,
      dungeonLocation,
      dungeonWebsite,
      contactMethod,
      contactMethodDetails
    } = body

    // Validate required fields
    if (!name || !email || !contactType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare submission data for database
    const submissionData = {
      submission_type: 'contact',
      author_name: name,
      author_email: email,
      author_credentials: null,
      author_bio: 'Contact form submission',
      article_title: subject || contactType,
      article_excerpt: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
      article_content: message,
      article_category: 'contact',
      article_tags: contactType,
      contact_name: name,
      contact_email: email,
      contact_type: contactType,
      contact_method: contactMethod,
      contact_method_details: contactMethodDetails,
      event_name: eventName,
      event_date: eventDate,
      event_location: eventLocation,
      event_website: eventWebsite,
      dungeon_name: dungeonName,
      dungeon_location: dungeonLocation,
      dungeon_website: dungeonWebsite,
      status: 'pending',
      word_count: message.split(' ').length
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert([submissionData])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    console.log('Contact form submission saved:', data)

    return NextResponse.json(
      { 
        message: 'Contact form submitted successfully',
        submissionId: data?.[0]?.id 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
