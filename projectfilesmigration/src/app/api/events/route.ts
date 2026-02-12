import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, sanitizeInput } from '@/lib/validation'
import { isAdmin } from '@/lib/auth'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'
import { supabase } from '@/lib/supabase'

// Missing logo files that need to be created:
// - ohiosmart.png (Ohio SMART Fetish Flea)
// - kinkycon.png (KinkyCon)
// - whipsandwine.png (Whips and Wine) 
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for form submissions
    const rateLimitResponse = await withRateLimit(request, rateLimiters.forms)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    const formData = await request.formData()
    
    // Extract and sanitize form data
    const eventData = {
      title: sanitizeInput(formData.get('title') as string || ''),
      shortTitle: sanitizeInput(formData.get('shortTitle') as string || ''),
      slug: sanitizeInput(formData.get('slug') as string || ''),
      startDate: sanitizeInput(formData.get('startDate') as string || ''),
      endDate: sanitizeInput(formData.get('endDate') as string || ''),
      displayDate: sanitizeInput(formData.get('displayDate') as string || ''),
      city: sanitizeInput(formData.get('city') as string || ''),
      state: sanitizeInput(formData.get('state') as string || ''),
      venue: sanitizeInput(formData.get('venue') as string || ''),
      shortDescription: sanitizeInput(formData.get('shortDescription') as string || ''),
      longDescription: sanitizeInput(formData.get('longDescription') as string || ''),
      seoDescription: sanitizeInput(formData.get('seoDescription') as string || ''),
      category: sanitizeInput(formData.get('category') as string || ''),
      tags: sanitizeInput(formData.get('tags') as string || ''),
      logo: sanitizeInput(formData.get('logo') as string || ''),
      images: sanitizeInput(formData.get('images') as string || ''),
      website: sanitizeInput(formData.get('website') as string || ''),
      organizer: sanitizeInput(formData.get('organizer') as string || ''),
      email: sanitizeInput(formData.get('email') as string || ''),
      phone: sanitizeInput(formData.get('phone') as string || ''),
      organizerWebsite: sanitizeInput(formData.get('organizerWebsite') as string || ''),
      earlyBirdPrice: sanitizeInput(formData.get('earlyBirdPrice') as string || ''),
      regularPrice: sanitizeInput(formData.get('regularPrice') as string || ''),
      atDoorPrice: sanitizeInput(formData.get('atDoorPrice') as string || ''),
      includes: sanitizeInput(formData.get('includes') as string || ''),
      features: sanitizeInput(formData.get('features') as string || ''),
      seoTitle: sanitizeInput(formData.get('seoTitle') as string || ''),
      seoKeywords: sanitizeInput(formData.get('seoKeywords') as string || '')
    }

    // Validate the data
    const validationResult = validateEvent(eventData)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    // Check if user is admin (for admin submissions)
    const isAdminUser = await isAdmin()
    
    // Save to database
    const client = supabase
    if (!client) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    try {
      const { data, error } = await client
        .from('events')
        .insert([{
          title: eventData.title,
          short_title: eventData.shortTitle,
          slug: eventData.slug,
          start_date: eventData.startDate,
          end_date: eventData.endDate,
          display_date: eventData.displayDate,
          city: eventData.city,
          state: eventData.state,
          venue: eventData.venue,
          short_description: eventData.shortDescription,
          long_description: eventData.longDescription,
          seo_description: eventData.seoDescription,
          category: eventData.category,
          tags: eventData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          logo: eventData.logo,
          images: eventData.images.split(',').map(img => img.trim()).filter(img => img),
          website: eventData.website,
          organizer: eventData.organizer,
          email: eventData.email,
          phone: eventData.phone,
          organizer_website: eventData.organizerWebsite,
          early_bird_price: eventData.earlyBirdPrice,
          regular_price: eventData.regularPrice,
          at_door_price: eventData.atDoorPrice,
          includes: eventData.includes,
          features: eventData.features,
          seo_title: eventData.seoTitle,
          seo_keywords: eventData.seoKeywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword),
          status: isAdminUser ? 'published' : 'pending',
          created_at: new Date().toISOString(),
          created_by: 'admin' // You might want to get this from the session
        }])
        .select()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to save event to database' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: isAdminUser ? 'Event created and published successfully!' : 'Event submission received. We will review and add it to the site.',
        eventSlug: eventData.slug,
        requiresApproval: !isAdminUser,
        eventId: data[0]?.id
      })
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error processing event submission:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process event submission', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

