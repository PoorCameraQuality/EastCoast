# Environment Variables Setup

## 📋 **Required Environment Variables**

Create a `.env.local` file in your project root with these variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Analytics (Optional but Recommended)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🔧 **How to Get These Values**

### **Supabase Values:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Google Analytics Value:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use existing one
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

## ✅ **Verification**

After adding the variables:
1. Restart your development server: `npm run dev`
2. Check that the site loads without errors
3. Test admin functionality (if Supabase is configured)
4. Check browser console for Google Analytics requests (if GA is configured)

## 🚀 **For Production**

When deploying to Vercel/Netlify, add these same environment variables in your hosting platform's dashboard.
