# Email Forwarding Setup Guide

## Overview
Contact forms and article submissions will now forward to `admin@eastcoastkinkevents.com` via email notifications.

## Setup Options

### Option 1: Webhook Service (Recommended - Easiest)

#### Using Zapier:
1. **Create a Zapier account** (free tier available)
2. **Create a new Zap** with "Webhook" as trigger
3. **Copy the webhook URL** provided by Zapier
4. **Add to your environment variables:**
   ```env
   EMAIL_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-url
   ```
5. **Set up email action** in Zapier to send to `admin@eastcoastkinkevents.com`

#### Using Make.com (formerly Integromat):
1. **Create a Make.com account**
2. **Create a new scenario** with "Webhook" trigger
3. **Copy the webhook URL**
4. **Add to environment variables** as above
5. **Connect to email service** (Gmail, Outlook, etc.)

### Option 2: Resend Email Service

#### Setup Steps:
1. **Sign up for Resend** (https://resend.com)
2. **Get your API key** from Resend dashboard
3. **Add to environment variables:**
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```
4. **Verify your domain** in Resend (optional but recommended)

### Option 3: Simple SMTP (Alternative)

If you prefer a simple SMTP solution, you can use services like:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **Postmark** (paid but reliable)

## Environment Variables

Add these to your deployment platform (Vercel/Netlify/etc.):

```env
# Option 1: Webhook URL
EMAIL_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-url

# Option 2: Resend API Key
RESEND_API_KEY=re_your_api_key_here
```

## What Gets Forwarded

### Contact Form Submissions:
- **Subject:** "New Contact Form Submission: [Type]"
- **Content:** All form fields including name, email, message, event details, dungeon details
- **Submission ID** for reference

### Article Submissions:
- **Subject:** "New Article Submission: [Title]"
- **Content:** Author info, article title, excerpt, full content, category, tags
- **Word count** and submission details

## Testing

### Test Contact Form:
1. Go to `/contact` on your site
2. Fill out and submit the form
3. Check `admin@eastcoastkinkevents.com` for the email

### Test Article Submission:
1. Go to `/education/submit` on your site
2. Fill out and submit an article
3. Check `admin@eastcoastkinkevents.com` for the email

## Troubleshooting

### If emails aren't arriving:
1. **Check environment variables** are set correctly
2. **Check webhook/API logs** for errors
3. **Verify email address** is correct
4. **Check spam folder** for test emails

### If forms aren't working:
1. **Check browser console** for errors
2. **Verify API routes** are deployed
3. **Check Supabase connection** is working

## Benefits

✅ **No admin panel needed** - All submissions come directly to email
✅ **Immediate notifications** - Get notified instantly when someone submits
✅ **Full content included** - All form data is in the email
✅ **Easy to manage** - Reply directly from email
✅ **Backup in database** - Submissions still saved to Supabase

## Next Steps

1. **Choose your email service** (Zapier webhook recommended)
2. **Set up environment variables** on your deployment platform
3. **Test the forms** to ensure emails are working
4. **Monitor your email** for new submissions

## Support

If you need help setting up:
1. **Zapier:** Their documentation is excellent
2. **Resend:** Simple API, good documentation
3. **Make.com:** More powerful but complex

The webhook approach (Option 1) is recommended for simplicity and reliability.
