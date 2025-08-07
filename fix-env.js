const fs = require('fs');

const envContent = `NEXT_PUBLIC_SUPABASE_URL=https://affiefoslsewiwfqahhk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZmllZm9zbHNld2l3ZnFhaGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTEzOTgsImV4cCI6MjA3MDA4NzM5OH0.3vI-XmR2Giqf6cXTuEwaGHDyM37bl5w0LC0Ce3W90mo
SUPABASE_SERVICE_ROLE_KEY=sb_secret_OrYFLjulCg7teQvR_TT4aA_6xOBDlYv`;

// Write without BOM
fs.writeFileSync('.env.local', envContent, { encoding: 'utf8' });
console.log('✅ .env.local file recreated without BOM!');
