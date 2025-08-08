-- SQL script to update user role to admin
-- Run this in your Supabase SQL Editor
-- This version includes transaction handling for safety

BEGIN;

-- First, let's check if the profiles table exists and see current users
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles 
WHERE email = 'sh.kinney@hotmail.com';

-- Check if user exists in auth.users first
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'sh.kinney@hotmail.com';

-- Update the user's role to admin (if user exists in profiles)
UPDATE profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'sh.kinney@hotmail.com'
AND EXISTS (
  SELECT 1 FROM profiles p WHERE p.email = 'sh.kinney@hotmail.com'
);

-- If the user doesn't exist in profiles table, create the profile
INSERT INTO profiles (id, email, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  'admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'sh.kinney@hotmail.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Verify the update worked
SELECT 
  id,
  email,
  role,
  created_at,
  updated_at
FROM profiles 
WHERE email = 'sh.kinney@hotmail.com';

COMMIT;

