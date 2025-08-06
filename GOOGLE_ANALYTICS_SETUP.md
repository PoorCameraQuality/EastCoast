# Google Analytics Setup Guide

## Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Follow the setup wizard to create your account
4. Create a new property for your website
5. Choose "Web" as your data stream type
6. Enter your website URL: `https://eastcoastkinkevents.com`
7. Give your data stream a name (e.g., "East Coast Kink Events")
8. Copy your **Measurement ID** (format: G-XXXXXXXXXX)

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Measurement ID:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

## Step 3: Verify Installation

1. Start your development server: `npm run dev`
2. Open your website in a browser
3. Open Developer Tools (F12)
4. Go to the Network tab
5. Look for requests to `googletagmanager.com` - this confirms GA is loading

## Step 4: Test Tracking

1. Visit different pages on your site
2. Click on events and dungeons
3. Submit the contact form
4. Check your Google Analytics dashboard to see the data

## What's Being Tracked

### Automatic Tracking:
- **Page Views**: Every page visit is automatically tracked
- **User Sessions**: Session duration and user engagement
- **Traffic Sources**: Where visitors come from (Google, social media, etc.)
- **Device Information**: Mobile vs desktop usage

### Custom Event Tracking:
- **Event Clicks**: When users click on specific events
- **Dungeon Clicks**: When users click on dungeon listings
- **Discord Clicks**: When users click Discord links
- **Contact Form Submissions**: When users submit contact forms

## Google Analytics Dashboard

Once set up, you can view:

### Real-Time Reports:
- **Active Users**: See who's on your site right now
- **Top Pages**: Most visited pages in real-time
- **Traffic Sources**: Where current visitors came from

### Standard Reports:
- **Audience**: Demographics, interests, behavior
- **Acquisition**: How users find your site
- **Behavior**: What users do on your site
- **Conversions**: Goal completions (if set up)

## Privacy Considerations

- Google Analytics respects user privacy settings
- Users can opt out via browser settings
- Consider adding a privacy policy mentioning analytics
- Data is anonymized by default

## Troubleshooting

### If tracking isn't working:
1. Check that your Measurement ID is correct
2. Ensure `.env.local` file exists in project root
3. Restart your development server
4. Check browser console for errors
5. Verify the GA script is loading in Network tab

### Common Issues:
- **No data appearing**: Wait 24-48 hours for data to populate
- **Script not loading**: Check internet connection and firewall settings
- **Wrong Measurement ID**: Double-check the ID format (G-XXXXXXXXXX)

## Advanced Configuration

### Custom Events
You can add more tracking by using the `useGoogleAnalytics` hook:

```typescript
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'

const { trackEvent } = useGoogleAnalytics()

// Track custom events
trackEvent('download', 'resource', 'event_pdf', 1)
```

### Enhanced Ecommerce (Optional)
If you plan to add paid events later, you can enable ecommerce tracking in your GA property settings.

## Support

For Google Analytics help:
- [Google Analytics Help Center](https://support.google.com/analytics/)
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
