# 🔧 ENVIRONMENT VARIABLES FOR VERCEL

## 📋 **REQUIRED VARIABLES**

Copy these from your `.env.local` file to your Vercel project settings:

### **Supabase Configuration**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **Google Analytics**
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_google_analytics_measurement_id
```

## 🚀 **HOW TO ADD TO VERCEL**

1. Go to your Vercel project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Add each variable with the exact name and value
5. Click **"Save"**

## ✅ **VERIFICATION**

After adding variables, redeploy your project to ensure they're loaded correctly.

## 📞 **SUPPORT**

If you need help finding these values:
- **Supabase**: Check your Supabase project settings
- **Google Analytics**: Check your GA4 property settings
