-- Simple verification script to check admin status
-- Run this to see the current state without making changes

-- Check if user exists in auth.users
SELECT 
  'auth.users' as table_name,
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'sh.kinney@hotmail.com';

-- Check if user exists in profiles and their role
SELECT 
  'profiles' as table_name,
  id,
  email,
  role,
  created_at,
  updated_at
FROM profiles 
WHERE email = 'sh.kinney@hotmail.com';

-- Check if user has admin role
SELECT 
  CASE 
    WHEN p.role = 'admin' THEN 'ADMIN ACCESS GRANTED'
    WHEN p.role IS NOT NULL THEN 'USER EXISTS BUT NOT ADMIN'
    ELSE 'USER NOT FOUND IN PROFILES'
  END as status,
  p.role,
  p.email
FROM profiles p
WHERE p.email = 'sh.kinney@hotmail.com';
