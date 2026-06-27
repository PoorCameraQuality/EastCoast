import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

const contactBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(1).max(300),
  message: z.string().trim().min(1).max(8000),
})

export async function POST(request: NextRequest) {
  const limited = await withRateLimit(request, rateLimiters.forms)
  if (limited) return limited

  try {
    let json: unknown
    try {
      json = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = contactBodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'All fields are required and must be valid' }, { status: 400 })
    }

    const { name, email, subject, message } = parsed.data

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
      word_count: message.split(/\s+/).filter(Boolean).length,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }

    const client = getSupabaseAdminClient()
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { error } = await client.from('submissions').insert([submissionData])

    if (error) {
      console.error('[contact] Database error:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error) {
    console.error('[contact] Route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
