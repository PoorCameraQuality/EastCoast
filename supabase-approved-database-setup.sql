-- COMPLETE DATABASE WIPE AND SETUP
-- This will completely clean everything and start fresh

-- ===========================================
-- STEP 1: DROP ALL POLICIES (IF THEY EXIST)
-- ===========================================

-- Drop policies for submissions
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON submissions;
DROP POLICY IF EXISTS "Enable select for admin" ON submissions;

-- Drop policies for articles
DROP POLICY IF EXISTS "Allow all operations on articles" ON articles;

-- Drop policies for moderation_logs
DROP POLICY IF EXISTS "Allow all operations for moderation_logs" ON moderation_logs;

-- Drop policies for profiles
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- ===========================================
-- STEP 2: DROP ALL TABLES
-- ===========================================

-- Drop tables
DROP TABLE IF EXISTS moderation_logs CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;

-- ===========================================
-- STEP 3: CREATE ALL TABLES FRESH
-- ===========================================

-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_type TEXT DEFAULT 'article',
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_credentials TEXT,
  author_bio TEXT NOT NULL,
  article_title TEXT NOT NULL,
  article_excerpt TEXT NOT NULL,
  article_content TEXT NOT NULL,
  article_category TEXT NOT NULL,
  article_tags TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_type TEXT,
  contact_method TEXT,
  contact_method_details TEXT,
  event_name TEXT,
  event_date TEXT,
  event_location TEXT,
  event_website TEXT,
  dungeon_name TEXT,
  dungeon_location TEXT,
  dungeon_website TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  word_count INTEGER NOT NULL
);

-- Create articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_credentials TEXT,
  author_bio TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'published',
  read_time TEXT,
  featured BOOLEAN DEFAULT FALSE
);

-- Create moderation_logs table
CREATE TABLE moderation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  article_title VARCHAR(255) NOT NULL,
  article_id UUID NOT NULL,
  admin_name VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STEP 4: ENABLE RLS (EXCEPT PROFILES)
-- ===========================================

-- Enable RLS for all tables
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 5: CREATE POLICIES
-- ===========================================

-- Policies for submissions
CREATE POLICY "Allow insert for authenticated users" ON submissions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable select for admin" ON submissions
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policies for articles
CREATE POLICY "Allow read articles" ON articles 
FOR SELECT USING (true);

CREATE POLICY "Allow admin operations on articles" ON articles 
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policies for moderation_logs
CREATE POLICY "Allow admin operations for moderation_logs" ON moderation_logs
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policies for profiles
CREATE POLICY "Users can manage own profile" ON public.profiles
FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ===========================================
-- STEP 6: CREATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_moderation_logs_action ON moderation_logs(action);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_timestamp ON moderation_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_article_id ON moderation_logs(article_id);

-- ===========================================
-- STEP 7: CREATE SUPPORTING FUNCTIONS
-- ===========================================

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls the handle_new_user function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- STEP 8: INSERT INITIAL ADMIN ACCOUNT
-- ===========================================

-- Note: This should be done through Supabase Auth, not directly in the database
-- The UUID should match the actual user ID from authentication
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
VALUES (
  'f221db70-4fad-4664-ac6b-fc1146629252',
  'sh.kinney@hotmail.com',
  'Admin',
  'admin',
  NOW(),
  NOW()
);

-- ===========================================
-- STEP 9: VERIFY SETUP
-- ===========================================

-- Verify all tables exist
SELECT 'submissions' as table_name, COUNT(*) as row_count FROM submissions
UNION ALL
SELECT 'articles' as table_name, COUNT(*) as row_count FROM articles
UNION ALL
SELECT 'moderation_logs' as table_name, COUNT(*) as row_count FROM moderation_logs
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM public.profiles;
