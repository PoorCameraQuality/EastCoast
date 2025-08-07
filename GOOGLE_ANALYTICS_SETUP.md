# Google Analytics Setup Guide

## 🎯 **Current Status**
Your website has Google Analytics integration ready, but the Measurement ID needs to be configured.

## 📋 **Step 1: Create Google Analytics Account**

1. **Go to [Google Analytics](https://analytics.google.com/)**
2. **Click "Start measuring"**
3. **Follow the setup wizard:**
   - Account name: "East Coast Kink Events"
   - Property name: "East Coast Kink Events"
   - Reporting time zone: Your timezone
   - Currency: USD
4. **Choose "Web" as your data stream type**
5. **Enter your website URL:** `https://eastcoastkinkevents.com`
6. **Give your data stream a name:** "East Coast Kink Events"
7. **Copy your Measurement ID** (format: G-XXXXXXXXXX)

## 🔧 **Step 2: Configure Environment Variables**

### **For Development:**
1. **Open your `.env.local` file**
2. **Add your Measurement ID:**

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### **For Production Deployment:**
When you deploy to your hosting platform (Vercel, Netlify, etc.), add this environment variable in your hosting dashboard.

## ✅ **Step 3: Verify Installation**

1. **Start your development server:** `npm run dev`
2. **Open your website in a browser**
3. **Open Developer Tools (F12)**
4. **Go to the Network tab**
5. **Look for requests to `googletagmanager.com`** - this confirms GA is loading
6. **Check the Console tab** for any GA-related errors

## 📊 **What's Being Tracked**

### **Automatic Tracking:**
- ✅ **Page Views**: Every page visit is automatically tracked
- ✅ **User Sessions**: Session duration and user engagement
- ✅ **Traffic Sources**: Where visitors come from (Google, social media, etc.)
- ✅ **Device Information**: Mobile vs desktop usage
- ✅ **Geographic Data**: Where your visitors are located

### **Custom Event Tracking:**
- ✅ **Event Clicks**: When users click on specific events
- ✅ **Dungeon Clicks**: When users click on dungeon listings
- ✅ **Contact Form Submissions**: When users submit contact forms
- ✅ **Education Article Views**: When users read education content
- ✅ **Admin Actions**: When administrators use admin tools

## 🎯 **Google Analytics Dashboard**

Once set up, you can view:

### **Real-Time Reports:**
- **Active Users**: See who's on your site right now
- **Top Pages**: Most visited pages in real-time
- **Traffic Sources**: Where current visitors came from

### **Standard Reports:**
- **Audience**: Demographics, interests, behavior
- **Acquisition**: How users find your site
- **Behavior**: What users do on your site
- **Conversions**: Goal completions (if set up)

## 🔍 **SEO Integration**

Your Google Analytics will work with:
- ✅ **Google Search Console** (for SEO monitoring)
- ✅ **Google Ads** (if you run ads later)
- ✅ **Google Tag Manager** (for advanced tracking)

## 🛡️ **Privacy Considerations**

- Google Analytics respects user privacy settings
- Users can opt out via browser settings
- Data is anonymized by default
- Consider adding a privacy policy mentioning analytics

## 🚀 **Deployment Checklist**

### **Before Going Live:**
1. ✅ **Set up Google Analytics account**
2. ✅ **Configure Measurement ID in environment variables**
3. ✅ **Test tracking in development**
4. ✅ **Verify data is appearing in GA dashboard**
5. ✅ **Set up Google Search Console**
6. ✅ **Configure goals and conversions**

### **After Going Live:**
1. ✅ **Monitor real-time data**
2. ✅ **Set up custom reports**
3. ✅ **Configure alerts for important metrics**
4. ✅ **Regular review of analytics data**

## 🔧 **Troubleshooting**

### **If tracking isn't working:**
1. **Check that your Measurement ID is correct**
2. **Ensure environment variable is set correctly**
3. **Restart your development server**
4. **Check browser console for errors**
5. **Verify the GA script is loading in Network tab**

### **Common Issues:**
- **No data appearing**: Wait 24-48 hours for data to populate
- **Script not loading**: Check internet connection and firewall settings
- **Wrong Measurement ID**: Double-check the ID format (G-XXXXXXXXXX)

## 📈 **Advanced Configuration**

### **Custom Events**
You can add more tracking by using the `useGoogleAnalytics` hook:

```typescript
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'

const { trackEvent } = useGoogleAnalytics()

// Track custom events
trackEvent('download', 'resource', 'event_pdf', 1)
```

### **Enhanced Ecommerce (Optional)**
If you plan to add paid events later, you can enable ecommerce tracking in your GA property settings.

## 🎯 **Success Metrics**

### **Key Metrics to Monitor:**
- **Page Views**: Total site traffic
- **Unique Visitors**: Individual user count
- **Session Duration**: How long users stay
- **Bounce Rate**: Single-page visits
- **Traffic Sources**: Where users come from
- **Top Pages**: Most popular content

### **Goals to Set:**
- **Event Page Views**: Track interest in specific events
- **Contact Form Submissions**: Measure user engagement
- **Education Article Reads**: Track educational content usage
- **Admin Panel Usage**: Monitor administrative activity

## 📞 **Support**

For Google Analytics help:
- [Google Analytics Help Center](https://support.google.com/analytics/)
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)

---

**Your website is ready for Google Analytics! Just add your Measurement ID to get started.**
