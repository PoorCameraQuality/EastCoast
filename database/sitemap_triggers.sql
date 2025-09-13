-- =====================================================
-- SUPABASE DATABASE TRIGGERS FOR SITEMAP PINGING
-- =====================================================
-- These triggers will automatically ping search engines
-- when content is added/updated directly in the database

-- =====================================================
-- 1. CREATE EDGE FUNCTION FOR HTTP REQUESTS
-- =====================================================
-- First, create this Edge Function in Supabase Dashboard:
-- Function name: ping-sitemap
-- Code:

/*
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    // Your site's webhook URL
    const webhookUrl = 'https://eastcoastkinkevents.com/api/sitemap/ping'
    
    // Optional: Add authentication token
    const token = Deno.env.get('SITEMAP_WEBHOOK_TOKEN')
    
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Supabase-Trigger/1.0'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // Ping your sitemap endpoint
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        source: 'supabase_trigger',
        contentType: 'database_insert',
        timestamp: new Date().toISOString()
      })
    })
    
    console.log('Sitemap ping response:', response.status)
    
    return new Response(
      JSON.stringify({ success: true, status: response.status }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Sitemap ping error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
*/

-- =====================================================
-- 2. CREATE TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION notify_sitemap_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for published content
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') THEN
    
    -- Call the Edge Function (replace 'your-project-ref' with your actual project reference)
    PERFORM net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/ping-sitemap',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
      ),
      body := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', NOW()
      )
    );
    
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CREATE TRIGGERS FOR CONTENT TABLES
-- =====================================================

-- Trigger for articles table
DROP TRIGGER IF EXISTS articles_sitemap_trigger ON articles;
CREATE TRIGGER articles_sitemap_trigger
  AFTER INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION notify_sitemap_update();

-- Trigger for events table (if you have one)
DROP TRIGGER IF EXISTS events_sitemap_trigger ON events;
CREATE TRIGGER events_sitemap_trigger
  AFTER INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION notify_sitemap_update();

-- Trigger for dungeons table (if you have one)
DROP TRIGGER IF EXISTS dungeons_sitemap_trigger ON dungeons;
CREATE TRIGGER dungeons_sitemap_trigger
  AFTER INSERT OR UPDATE ON dungeons
  FOR EACH ROW
  EXECUTE FUNCTION notify_sitemap_update();

-- =====================================================
-- 4. ALTERNATIVE: SIMPLE HTTP TRIGGER (No Edge Function)
-- =====================================================
-- If you prefer not to use Edge Functions, use this simpler version:

CREATE OR REPLACE FUNCTION simple_sitemap_ping()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for published content
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') THEN
    
    -- Direct HTTP call to your API (requires pg_net extension)
    PERFORM net.http_post(
      url := 'https://eastcoastkinkevents.com/api/sitemap/ping',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'source', 'database_trigger',
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'contentType', 'published_content'
      )
    );
    
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Replace the triggers with the simple version
DROP TRIGGER IF EXISTS articles_sitemap_trigger ON articles;
CREATE TRIGGER articles_sitemap_trigger
  AFTER INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION simple_sitemap_ping();

-- =====================================================
-- 5. MANUAL PING FUNCTION
-- =====================================================
-- Create a function you can call manually for bulk operations

CREATE OR REPLACE FUNCTION manual_sitemap_ping()
RETURNS json AS $$
BEGIN
  -- Ping the sitemap endpoint
  PERFORM net.http_post(
    url := 'https://eastcoastkinkevents.com/api/sitemap/ping',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'source', 'manual_sql',
      'contentType', 'bulk_operation',
      'timestamp', NOW()
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Sitemap ping initiated',
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT manual_sitemap_ping();

-- =====================================================
-- 6. SETUP INSTRUCTIONS
-- =====================================================

/*
SETUP STEPS:

1. Enable pg_net extension (if not already enabled):
   - Go to Supabase Dashboard > Database > Extensions
   - Enable "pg_net" extension

2. Run this SQL script in your Supabase SQL Editor

3. Test the manual function:
   SELECT manual_sitemap_ping();

4. For bulk operations, call the manual function after your inserts:
   INSERT INTO articles (...) VALUES (...);
   SELECT manual_sitemap_ping();

5. Optional: Set up environment variable for webhook token:
   - Add SITEMAP_WEBHOOK_TOKEN to your Vercel environment variables
   - This adds security to the webhook endpoint

TESTING:
- Insert a test article with status = 'published'
- Check your server logs for sitemap ping activity
- Verify the webhook endpoint works: GET https://eastcoastkinkevents.com/api/sitemap/ping
*/
