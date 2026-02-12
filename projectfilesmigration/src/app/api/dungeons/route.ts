import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const dungeonData = {
      id: Date.now(), // Generate unique ID
      slug: formData.get('slug') as string,
      name: formData.get('name') as string,
      location: {
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        address: formData.get('address') as string
      },
      excerpt: formData.get('excerpt') as string,
      logo: formData.get('logo') as string,
      images: (formData.get('images') as string).split(',').map(img => img.trim()),
      website: formData.get('website') as string,
      contact: {
        email: formData.get('email') as string,
        phone: formData.get('phone') as string
      },
      seo: {
        title: formData.get('seoTitle') as string,
        description: formData.get('seoDescription') as string,
        keywords: (formData.get('seoKeywords') as string).split(',').map(keyword => keyword.trim())
      }
    }

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
        .from('dungeons')
        .insert([{
          slug: dungeonData.slug,
          name: dungeonData.name,
          city: dungeonData.location.city,
          state: dungeonData.location.state,
          address: dungeonData.location.address,
          excerpt: dungeonData.excerpt,
          logo: dungeonData.logo,
          images: dungeonData.images,
          website: dungeonData.website,
          email: dungeonData.contact.email,
          phone: dungeonData.contact.phone,
          seo_title: dungeonData.seo.title,
          seo_description: dungeonData.seo.description,
          seo_keywords: dungeonData.seo.keywords,
          status: 'published',
          created_at: new Date().toISOString(),
          created_by: 'admin'
        }])
        .select()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to save dungeon to database' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Dungeon created and published successfully!',
        dungeonId: data[0]?.id 
      })
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error processing dungeon submission:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process dungeon submission', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

