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
          type: 'contact_form'
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
    
    console.log('Email notification sent for contact form')
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
        { error: 'Contact form is not available' },
        { status: 503 }
      )
    }

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

    // Send email notification
    const emailSubject = `New Contact Form Submission: ${contactType}`
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Type:</strong> ${contactType}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
      <p><strong>Message:</strong></p>
      <div style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${message}
      </div>
      
      ${eventName ? `<p><strong>Event Name:</strong> ${eventName}</p>` : ''}
      ${eventDate ? `<p><strong>Event Date:</strong> ${eventDate}</p>` : ''}
      ${eventLocation ? `<p><strong>Event Location:</strong> ${eventLocation}</p>` : ''}
      ${eventWebsite ? `<p><strong>Event Website:</strong> ${eventWebsite}</p>` : ''}
      
      ${dungeonName ? `<p><strong>Dungeon Name:</strong> ${dungeonName}</p>` : ''}
      ${dungeonLocation ? `<p><strong>Dungeon Location:</strong> ${dungeonLocation}</p>` : ''}
      ${dungeonWebsite ? `<p><strong>Dungeon Website:</strong> ${dungeonWebsite}</p>` : ''}
      
      ${contactMethod ? `<p><strong>Preferred Contact Method:</strong> ${contactMethod}</p>` : ''}
      ${contactMethodDetails ? `<p><strong>Contact Details:</strong> ${contactMethodDetails}</p>` : ''}
      
      <p><strong>Submission ID:</strong> ${data?.[0]?.id}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p><em>This is an automated notification from the East Coast Kink Events contact form.</em></p>
    `

    await sendEmailNotification(emailSubject, emailContent)

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
