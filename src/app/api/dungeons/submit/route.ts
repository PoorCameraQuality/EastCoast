import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'dungeonName',
      'dungeonLocation',
      'ownerName',
      'ownerEmail',
      'dungeonDescription',
      'dungeonCategory'
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
    if (!emailRegex.test(body.ownerEmail)) {
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
          dungeon_name: body.dungeonName,
          dungeon_location: body.dungeonLocation,
          dungeon_website: body.dungeonWebsite || null,
          author_name: body.ownerName,
          author_email: body.ownerEmail,
          author_credentials: null, // No phone number needed
          author_bio: body.dungeonDescription,
          article_title: body.dungeonName,
          article_excerpt: body.dungeonDescription,
          article_content: body.dungeonDescription,
          article_category: body.dungeonCategory,
          article_tags: body.dungeonTags || null,
          submission_type: 'dungeon',
          status: 'pending',
          word_count: body.dungeonDescription.split(/\s+/).length,
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
      message: 'Dungeon submitted successfully',
      submissionId: data?.[0]?.id
    })
  } catch (error) {
    console.error('Dungeon submit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
