import { NextRequest, NextResponse } from 'next/server'

// All contact form submissions should be emailed to: sh.kinney@hotmail.com

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactType, name, email, subject, message, eventType, website, location, contactMethod } = body

    // Validate required fields
    if (!name || !email || !contactType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email content based on contact type
    let emailContent = `
Name: ${name}
Email: ${email}
Contact Type: ${contactType}
Subject: ${subject}

Message:
${message}
`

    // Add additional fields for event/dungeon submissions
    if (contactType === 'add-event' || contactType === 'add-dungeon') {
      emailContent += `
Additional Information:
- Location Type: ${eventType}
- Website: ${website}
- Location: ${location}
- Contact Method: ${contactMethod}
`
    }

    // Here you would typically send the email using a service like:
    // - Nodemailer
    // - SendGrid
    // - AWS SES
    // - Resend
    // For now, we'll just log it
    console.log('Contact form submission:', {
      contactType,
      name,
      email,
      subject,
      message,
      eventType,
      website,
      location,
      contactMethod
    })

    // TODO: Implement actual email sending
    // Example with a hypothetical email service:
    // await sendEmail({
    //   to: 'sh.kinney@hotmail.com', // Intended recipient for all contact forms
    //   subject: `Contact Form: ${subject}`,
    //   text: emailContent
    // })

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
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
